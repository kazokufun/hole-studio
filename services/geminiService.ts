

import { GoogleGenAI, Type } from "@google/genai";
import type { PromptHistoryEntry, PromptBGOptions, VectorBGOptions, VariationOptions } from '../types';

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
            const fullPrompt = `Analyze the provided image and generate a structured description.
Follow this template exactly. The main language for the description MUST be Indonesian, but the "Prompt Gambar" section MUST be in English.

Nama Gambar: [Judul yang kreatif dan pas untuk gambar dalam Bahasa Indonesia]
Gaya Gambar: [Identifikasi gaya artistik dalam Bahasa Indonesia, cth., Fotorealistik, Anime, Cat Air, Render 3D, dll.]
Detail Objek: [Daftar objek utama dan detail penting yang ada di gambar dalam Bahasa Indonesia]
Prompt Gambar: [A detailed, high-quality text-to-image prompt in ENGLISH ONLY that could be used to generate a similar image. This part must be in English.]`;

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

                **VERY IMPORTANT RULE:** Each individual "prompt" you generate in the JSON response MUST be a maximum of 800 characters long.

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
                                    description: "A detailed and creative text-to-image prompt, under 800 characters."
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

export const generatePhotographyPrompts = async (
    userRequest: string,
    theme: string,
    apiKeys: string[],
): Promise<Pick<PromptHistoryEntry, 'title' | 'prompt'>[]> => {
    if (!apiKeys || apiKeys.length === 0) {
      console.error("Error: API key is not provided.");
      return [];
    }
    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const fullPrompt = `
                You are a world-class photography prompt engineer for advanced text-to-image AI models. Your specialty is creating prompts that emulate professional photography.
                Based on the user's request and the selected theme, generate a list of 10 unique, highly-detailed, and creative image generation prompts.
                For each prompt, also create a short, descriptive title (5-7 words max).

                User Request: "${userRequest}"
                Photography Theme: "${theme}"

                **VERY IMPORTANT INSTRUCTIONS:**
                - **Length Constraint:** Each individual "prompt" in the JSON response MUST NOT exceed 800 characters.
                - Each prompt must be extremely detailed and structured for a professional photographic look.
                - Include specific camera settings (e.g., aperture like f/1.8, shutter speed like 1/1000s, ISO like 100).
                - Specify lens types (e.g., 85mm prime lens, 24-70mm zoom, macro lens).
                - Describe the lighting in detail (e.g., golden hour, soft diffused light, dramatic backlighting, studio three-point lighting).
                - Mention composition techniques (e.g., rule of thirds, leading lines, depth of field).
                - The final output should feel like a recipe for a professional photographer to capture a stunning image.
                - DO NOT include artist names.
                - **Generate Unique Prompts:** Each time this request is made, even with the same input, you must generate a completely new and different set of 10 prompts. Avoid repeating previous suggestions.

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
                                    description: "A short, descriptive title for the photography prompt (5-7 words max)."
                                },
                                prompt: {
                                    type: Type.STRING,
                                    description: "A detailed and creative text-to-image prompt for professional photography, under 800 characters, including camera settings and lighting."
                                }
                            },
                            required: ["title", "prompt"]
                        }
                    },
                    temperature: 0.8,
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            if(Array.isArray(jsonResponse) && jsonResponse.every(item => typeof item === 'object' && item !== null && 'title' in item && 'prompt' in item && typeof item.title === 'string' && typeof item.prompt === 'string')) {
                return jsonResponse;
            }
            console.error("Unexpected JSON response format for photography prompts:", jsonResponse);
            throw new Error("Invalid JSON response format.");
        });
        return result;

    } catch (error) {
        console.error("Error generating photography prompts from Gemini after all retries:", error);
        return [];
    }
};

export const generatePromptVariations = async (
    basePrompt: string,
    options: VariationOptions,
    apiKeys: string[],
): Promise<Pick<PromptHistoryEntry, 'title' | 'prompt'>[]> => {
    if (!apiKeys || apiKeys.length === 0) {
      console.error("Error: API key is not provided.");
      return [];
    }

    // Build dynamic instructions based on user's choices
    const modifications: string[] = [];
    if (options.object) modifications.push('the core subject/object');
    if (options.pattern) modifications.push('patterns and textures');
    if (options.shape) modifications.push('the overall shapes and forms');
    if (options.color) modifications.push('the color palette and lighting');
    
    let variationInstructions = '';
    if (modifications.length > 0) {
        variationInstructions = `Your main goal is to creatively change **only** the following aspects: **${modifications.join(', ')}**.`;
    } else {
        variationInstructions = 'Your main goal is to create imaginative and diverse variations of the base prompt.';
    }

    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const fullPrompt = `
                You are a creative assistant for AI image generation. Your task is to take a base prompt and generate 10 unique variations based on specific instructions.
                For each variation, create a short, descriptive title (5-7 words max).

                **Base Prompt:**
                "${basePrompt}"

                **VERY IMPORTANT INSTRUCTIONS:**
                1.  **Length Constraint:** Each individual "prompt" you generate in the JSON response MUST be a maximum of 800 characters long.
                2.  **Maintain the Artistic Style:** The core artistic style of the base prompt (e.g., 'photorealistic', 'anime', 'watercolor', '3D render') MUST be preserved in all variations. This is the most critical rule.
                3.  **Follow Variation Rules:** ${variationInstructions} All other aspects of the prompt not mentioned for modification should remain as consistent as possible with the base prompt.
                4.  **Be Creative:** Within the given constraints, be highly creative and imaginative.
                5.  **No Forbidden Content:** Do not include artist names, copyrighted material, or trademarks.
                6.  **Unique Output:** This is a new request. Ensure the 10 variations are unique and completely different from any set you have generated before for this same base prompt.

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
                                    description: "A short, descriptive title for the prompt variation (5-7 words max)."
                                },
                                prompt: {
                                    type: Type.STRING,
                                    description: "A detailed and creative text-to-image prompt variation, under 800 characters."
                                }
                            },
                            required: ["title", "prompt"]
                        }
                    },
                    temperature: 0.9,
                }
            });

            const jsonResponse = JSON.parse(response.text);
            if(Array.isArray(jsonResponse) && jsonResponse.every(item => typeof item === 'object' && item !== null && 'title' in item && 'prompt' in item && typeof item.title === 'string' && typeof item.prompt === 'string')) {
                return jsonResponse;
            }
            console.error("Unexpected JSON response format for prompt variations:", jsonResponse);
            throw new Error("Invalid JSON response format.");
        });
        return result;

    } catch (error) {
        console.error("Error generating prompt variations from Gemini after all retries:", error);
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
                - **Length Constraint:** Each individual "prompt" in the JSON response MUST NOT exceed 800 characters.
                - DO NOT include any specific artist names (e.g., "by Greg Rutkowski").
                - DO NOT include copyrighted style names (e.g., "in the style of Disney").
                - DO NOT include any company logos or trademarked brand names.
                - Focus exclusively on descriptive language that conveys the visual and technical qualities of the desired background image.
                - **New Generation:** Every time you run this, generate a completely fresh and different set of 10 prompts, even for the same input idea.

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
                                    description: "A detailed and creative text-to-image prompt for a background, under 800 characters."
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

export const generateVectorPrompts = async (
    userRequest: string,
    options: VectorBGOptions,
    apiKeys: string[],
): Promise<Pick<PromptHistoryEntry, 'title' | 'prompt'>[]> => {
    if (!apiKeys || apiKeys.length === 0) {
      console.error("Error: API key is not provided.");
      return [];
    }
    try {
        const result = await runRequestWithFallback(apiKeys, async (ai) => {
            const promptInstructions = [];
            let collectionInstruction = '';
            
            if (options.design) {
                promptInstructions.push(`The primary focus is on vector **${options.design}** design.`);
            }
            if (options.iconDesign) {
                promptInstructions.push(`If creating icons, use the **${options.iconDesign}** style.`);
            }
            if (options.iconType) {
                 promptInstructions.push(`The output should be structured for an icon set of type: **${options.iconType}**.`);
                 if (options.iconType === '3x3 grid') {
                    collectionInstruction = `The user specifically requested a **3x3 grid collection**. Each prompt must describe a coherent set of exactly **9 icons** designed to be displayed together in a 3-row, 3-column grid. The prompt must explicitly ask for a "collection of 9 icons in a 3x3 grid".`;
                 } else if (options.iconType === '3x4 grid') {
                    collectionInstruction = `The user specifically requested a **3x4 grid collection**. Each prompt must describe a coherent set of exactly **12 icons** designed to be displayed together in a 3-row, 4-column grid. The prompt must explicitly ask for a "collection of 12 icons in a 3x4 grid".`;
                 }
            }
            const instructions = promptInstructions.length > 0 ? promptInstructions.join(' ') : 'Generate general vector art prompts.';

            const fullPrompt = `
                You are an expert prompt engineer specializing in creating prompts for vector graphic generation AI models.
                Your task is to generate a list of 10 unique, detailed, and creative vector art prompts.
                For each prompt, also create a very short, descriptive title (3-5 words max).

                User's core idea: "${userRequest}"
                
                Chosen characteristics:
                ${instructions}
                
                ${collectionInstruction ? `\n**VERY IMPORTANT SPECIAL INSTRUCTION:**\n${collectionInstruction}\n` : ''}

                **GENERAL RULES TO FOLLOW:**
                - **Length Constraint:** Each individual "prompt" in the JSON response MUST NOT exceed 800 characters.
                - Focus on creating prompts for **vector graphics**. This means clean lines, flat colors, gradients, and shapes. Avoid photorealistic details.
                - DO NOT include any specific artist names (e.g., "by Artgerm").
                - DO NOT include copyrighted logos, characters, or style names (e.g., "in the style of Disney", "Nike logo").
                - DO NOT include any company logos or trademarked brand names.
                - Focus exclusively on descriptive language that conveys the visual and technical qualities of the desired vector image.
                - **Unique Generation:** Every time this request is made, generate a completely new and different set of 10 prompts. Do not repeat prompts from previous requests for the same idea.

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
                                    description: "A very short, descriptive title for the vector prompt (3-5 words max)."
                                },
                                prompt: {
                                    type: Type.STRING,
                                    description: "A detailed and creative text-to-image prompt for a vector graphic or a collection of graphics, under 800 characters."
                                }
                            },
                            required: ["title", "prompt"]
                        }
                    },
                    temperature: 0.7,
                    topP: 1,
                    topK: 40,
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            if(Array.isArray(jsonResponse) && jsonResponse.every(item => typeof item === 'object' && item !== null && 'title' in item && 'prompt' in item && typeof item.title === 'string' && typeof item.prompt === 'string')) {
                return jsonResponse;
            }
            console.error("Unexpected JSON response format for vector prompts:", jsonResponse);
            throw new Error("Invalid JSON response format.");
        });
        return result;

    } catch (error) {
        console.error("Error generating vector prompts from Gemini after all retries:", error);
        return [];
    }
};
