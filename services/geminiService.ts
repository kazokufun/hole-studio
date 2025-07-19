import { GoogleGenAI, Type } from "@google/genai";
import type { PromptHistoryEntry, PromptBGOptions } from '../types';

/**
 * A helper function to run a Gemini request with a list of API keys, providing automatic fallback.
 * It will try the keys in the provided order. If a request fails, it automatically retries with the next key.
 * @param apiKeys An array of API keys to try in order.
 * @param requestFn The function that makes the actual API call. It receives an initialized `GoogleGenAI` client.
 * @returns The result of the successful API call.
 * @throws An error if all API keys fail.
 */
async function runRequestWithFallback<T>(
    apiKeys: string[],
    requestFn: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
    if (!apiKeys || apiKeys.length === 0) {
        throw new Error("No API keys were provided for the request.");
    }

    let lastError: unknown = null;

    for (const key of apiKeys) {
        // Skip any keys that are empty strings
        if (!key) continue;

        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const result = await requestFn(ai);
            // On success, return the result immediately
            return result;
        } catch (error) {
            console.warn(`API request failed with one key, trying next. Error:`, error);
            lastError = error;
        }
    }

    // If the loop completes, it means all keys have failed.
    console.error("All API keys failed to execute the request.", lastError);
    if (lastError) {
        throw lastError; // Re-throw the last error we caught
    }
    
    throw new Error("All provided API keys failed to execute the request.");
}


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (
    imageFile: File,
    apiKeys: string[],
): Promise<string> => {
    if (!apiKeys || apiKeys.length === 0) {
      return "Error: API key is not configured. Please set an API key in the settings.";
    }
    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const imagePart = await fileToGenerativePart(imageFile);
            const fullPrompt = `Analyze the provided image and generate a structured description based on the following template. Provide the response in Indonesian.

Nama Gambar: [A creative and fitting title for the image]
Gaya Gambar: [Identify the artistic style, e.g., Photorealistic, Anime, Watercolor, 3D Render, etc.]
Detail Objek: [List the main objects and key details present in the image]
Prompt Gambar: [A detailed text-to-image prompt that could be used to generate a similar image, including subject, action, setting, and style.]`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: fullPrompt }] },
                config: {
                    temperature: 0.4,
                    topP: 1,
                    topK: 32,
                }
            });
            return response.text.trim();
        });
        return result;
    } catch (error) {
        console.error("Error analyzing image with Gemini after all retries:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}. Please check your API keys and network connection.`;
        }
        return "An unknown error occurred while analyzing the image.";
    }
};

export const generatePromptsFromText = async (
    userRequest: string,
    tags: string[],
    apiKeys: string[],
): Promise<Pick<PromptHistoryEntry, 'title' | 'prompt'>[]> => {
    if (!apiKeys || apiKeys.length === 0) {
      console.error("Error: API key is not provided.");
      return [];
    }
    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const tagInstructions = tags.length > 0 ? `Incorporate these styles: ${tags.join(', ')}.` : '';
            const fullPrompt = `
                You are an expert prompt engineer for advanced text-to-image AI models.
                Based on the user's request, generate a list of 10 unique, detailed, and creative image generation prompts.
                For each prompt, also create a short, descriptive title (5-7 words max).
                The prompts should be structured, evocative, and specify elements like subject, style, lighting, and composition.
                
                User Request: "${userRequest}"
                ${tagInstructions}

                Return your response as a JSON array of objects, where each object has a "title" and a "prompt" key.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {
                                    type: Type.STRING,
                                    description: "A short, descriptive title for the prompt (5-7 words max)."
                                },
                                prompt: {
                                    type: Type.STRING,
                                    description: "A detailed and creative text-to-image prompt."
                                }
                            },
                            required: ["title", "prompt"]
                        }
                    }
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            if(Array.isArray(jsonResponse) && jsonResponse.every(item => typeof item === 'object' && item !== null && 'title' in item && 'prompt' in item && typeof item.title === 'string' && typeof item.prompt === 'string')) {
                return jsonResponse;
            }
            console.error("Unexpected JSON response format for prompts:", jsonResponse);
            // Throw an error to allow fallback to the next key
            throw new Error("Invalid JSON response format.");
        });
        return result;

    } catch (error) {
        console.error("Error generating prompts from Gemini after all retries:", error);
        return [];
    }
};

export const generateTagsFromText = async (
    userRequest: string,
    apiKeys: string[],
): Promise<string[]> => {
    if (!apiKeys || apiKeys.length === 0) {
      console.error("Error: API key is not provided.");
      return [];
    }
    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const fullPrompt = `
                Based on the following user request for an image prompt, suggest 5 relevant artistic styles that would be a good fit.
                The styles should be single-word or short phrases.
                Examples: Photorealistic, Anime, Steampunk, Watercolor, Impressionism, Cyberpunk, Art Deco.
                User request: "${userRequest}"
                Return the result as a JSON array of 5 strings representing the styles.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                            description: "A short, relevant artistic style for image generation."
                        }
                    }
                }
            });

            const jsonResponse = JSON.parse(response.text);
            if(Array.isArray(jsonResponse) && jsonResponse.every(item => typeof item === 'string')) {
                return jsonResponse;
            }
            console.error("Unexpected JSON response format for tags:", jsonResponse);
            throw new Error("Invalid JSON response format.");
        });
        return result;
    } catch(error) {
        console.error("Error generating tags from Gemini after all retries:", error);
        return [];
    }
}

export const generateMultipleBackgroundPrompts = async (
    userRequest: string,
    options: PromptBGOptions,
    apiKeys: string[],
): Promise<Pick<PromptHistoryEntry, 'title' | 'prompt'>[]> => {
    if (!apiKeys || apiKeys.length === 0) {
      console.error("Error: API key is not provided.");
      return [];
    }
    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const specialInstruction = options.special ? `Special Consideration: ${options.special}.` : '';

            const fullPrompt = `
                You are an expert prompt engineer specializing in creating text-to-image prompts for high-quality backgrounds. 
                Your task is to generate a list of 10 unique and varied background prompts based on the user's request and their stylistic choices.
                For each prompt, also create a very short, descriptive title (3-5 words max).

                User's core idea: "${userRequest}"
                
                Chosen characteristics:
                - Style: ${options.style}
                - Type: ${options.type}
                ${specialInstruction}

                Generate 10 different variations. They should explore different angles, compositions, and interpretations of the core idea while adhering to the chosen characteristics.

                **VERY IMPORTANT RULES TO FOLLOW:**
                - DO NOT include any specific artist names (e.g., "by Greg Rutkowski").
                - DO NOT include copyrighted style names (e.g., "in the style of Disney").
                - DO NOT include any company logos or trademarked brand names.
                - Focus exclusively on descriptive language that conveys the visual and technical qualities of the desired background image.

                Return your response as a JSON array of objects, where each object has a "title" and a "prompt" key.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {
                                    type: Type.STRING,
                                    description: "A very short, descriptive title for the background prompt (3-5 words max)."
                                },
                                prompt: {
                                    type: Type.STRING,
                                    description: "A detailed and creative text-to-image prompt for a background."
                                }
                            },
                            required: ["title", "prompt"]
                        }
                    },
                    temperature: 0.8,
                    topP: 1,
                    topK: 40,
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            if(Array.isArray(jsonResponse) && jsonResponse.every(item => typeof item === 'object' && item !== null && 'title' in item && 'prompt' in item && typeof item.title === 'string' && typeof item.prompt === 'string')) {
                return jsonResponse;
            }
            console.error("Unexpected JSON response format for background prompts:", jsonResponse);
            throw new Error("Invalid JSON response format.");
        });
        return result;

    } catch (error) {
        console.error("Error generating multiple background prompts from Gemini after all retries:", error);
        return [];
    }
};
