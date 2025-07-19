import React, { useState, useCallback, useEffect } from 'react';
import type { PromptHistoryEntry, NotificationEntry, PromptBGOptions } from './types';
import { analyzeImage, generatePromptsFromText, generateTagsFromText, generateMultipleBackgroundPrompts } from './services/geminiService';
import { playAudio } from './services/audioService';
import { ImageAndResultCard } from './components/ImageAndResultCard';
import { PromptInputCard } from './components/PromptInputCard';
import { PromptRulesCard } from './components/PromptRulesCard';
import { PromptHistoryTable } from './components/PromptHistoryTable';
import BackgroundAnimations from './components/BackgroundAnimations';
import { SettingsCard } from './components/SettingsCard';
import { CostumeCard } from './components/CostumeCard';
import { PinCard } from './components/PinCard';
import { NotificationContainer } from './components/shared/Notification';
import { CORRECT_PIN } from './constants';
import { PromptBGCard } from './components/PromptBGCard';
import { VectorBGCard } from './components/VectorBGCard';
import { PromptBGModal } from './components/PromptBGModal';

const CUSTOM_PROMPTS_STORAGE_KEY = 'customUserPrompts';
const ANIMATION_ENABLED_STORAGE_KEY = 'isAnimationEnabled';

export default function App() {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState<boolean>(() => {
    try {
        const saved = localStorage.getItem(ANIMATION_ENABLED_STORAGE_KEY);
        return saved ? JSON.parse(saved) : true;
    } catch {
        return true;
    }
  });

  // State for PIN Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
        const storedPin = localStorage.getItem('authenticatedPin');
        // The user is authenticated if the stored PIN matches the current correct PIN.
        return storedPin === CORRECT_PIN;
    } catch (error) {
        console.error("Failed to read authenticated PIN from localStorage", error);
        return false;
    }
  });

  // State for Image Analysis Flow
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // State for Text-to-Prompts Flow
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // State for Tag Generation
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagLoading, setIsTagLoading] = useState<boolean>(false);
  
  // State for new cards
  const [promptBG, setPromptBG] = useState<string>('');
  const [isGeneratingBG, setIsGeneratingBG] = useState<boolean>(false);
  const [isPromptBGModalOpen, setIsPromptBGModalOpen] = useState(false);
  const [vectorBG, setVectorBG] = useState<string>('');
  const [isGeneratingVT, setIsGeneratingVT] = useState<boolean>(false);

  // State for Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // State for Notifications
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);


  // State for API Keys - managed with localStorage
  const [apiKeys, setApiKeys] = useState<{ key1: string; key2: string; key3: string; }>(() => {
    try {
        const saved = localStorage.getItem('userApiKeys');
        return saved ? JSON.parse(saved) : { key1: '', key2: '', key3: '' };
    } catch {
        return { key1: '', key2: '', key3: '' };
    }
  });

  // State for Custom Prompts (lifted from CostumeCard)
  const [customPrompts, setCustomPrompts] = useState<PromptHistoryEntry[]>(() => {
    try {
        const savedPrompts = localStorage.getItem(CUSTOM_PROMPTS_STORAGE_KEY);
        if (savedPrompts) {
            return JSON.parse(savedPrompts);
        }
    } catch (error) {
        console.error("Failed to parse custom prompts from localStorage", error);
    }
    // Fallback if nothing is saved or there's an error
    return [{ id: 1, title: 'My First Saved Prompt', prompt: 'A futuristic cityscape with flying cars, neon signs, and rainy streets, cinematic lighting, ultra-detailed.' }];
  });

  // Effect to save animation preference to localStorage
  useEffect(() => {
    try {
        localStorage.setItem(ANIMATION_ENABLED_STORAGE_KEY, JSON.stringify(isAnimationEnabled));
    } catch (error) {
        console.error("Failed to save animation setting to localStorage", error);
    }
  }, [isAnimationEnabled]);

  // Effect to save custom prompts to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem(CUSTOM_PROMPTS_STORAGE_KEY, JSON.stringify(customPrompts));
    } catch (error) {
        console.error("Failed to save custom prompts to localStorage", error);
    }
  }, [customPrompts]);

  // Effect to save API keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userApiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);
  
  const removeNotification = useCallback((id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string) => {
    const newNotification: NotificationEntry = { id: Date.now(), message };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Add to front, limit to 5 active notifications
  }, []);

  const getAvailableApiKeys = useCallback(() => {
    const userKeys = [apiKeys.key1, apiKeys.key2, apiKeys.key3].filter(key => !!key);
    const defaultKey = process.env.API_KEY || '';
    return [...userKeys, defaultKey].filter(key => !!key);
  }, [apiKeys]);

  const checkApiKey = useCallback(() => {
    const keys = getAvailableApiKeys();
    if (keys.length === 0) {
        addNotification("Error: No API key configured. Please set one in settings.");
        return false;
    }
    return true;
  }, [getAvailableApiKeys, addNotification]);

  const handleOpenPromptBGModal = useCallback(() => {
    if (!promptBG.trim()) return;
    playAudio('/tombol.mp3');
    setIsPromptBGModalOpen(true);
  }, [promptBG]);

  const handleGenerateBG = useCallback(async (options: PromptBGOptions) => {
    if (!promptBG.trim() || !checkApiKey()) return;

    setIsPromptBGModalOpen(false);
    setIsGeneratingBG(true);
    setIsGenerating(true); // Also set the main table loader
    setUserPrompt(promptBG); // Set user prompt for download consistency

    const availableKeys = getAvailableApiKeys();
    const generatedPrompts = await generateMultipleBackgroundPrompts(promptBG, options, availableKeys);

    if (generatedPrompts.length > 0) {
        const newEntries: PromptHistoryEntry[] = generatedPrompts.map((p, index) => ({
            id: Date.now() + index,
            title: p.title,
            prompt: p.prompt,
        }));
        setHistory(newEntries);
        setHasGenerated(true);
        addNotification(`Generated ${newEntries.length} new background prompts.`);
        playAudio('/notifikasi.mp3');
        setPromptBG(''); // Clear the input field
    } else {
        addNotification("Error: Could not generate background prompts.");
    }

    setIsGeneratingBG(false);
    setIsGenerating(false);
  }, [promptBG, checkApiKey, getAvailableApiKeys, addNotification, setUserPrompt, setHistory, setHasGenerated, setPromptBG]);

  const handleGenerateVT = useCallback(() => {
    if (!vectorBG.trim()) return;
    addNotification(`"Design VT" feature is not yet implemented.`);
  }, [vectorBG, addNotification]);

  // Handler for Image Analysis
  const handleAnalyzeImage = async () => {
    if (!imageFile || !checkApiKey()) return;
    const availableKeys = getAvailableApiKeys();

    setIsAnalyzing(true);
    setAnalysisResult('');
    const result = await analyzeImage(imageFile, availableKeys);
    setAnalysisResult(result);
    setIsAnalyzing(false);
    if (!result.startsWith("Error:")) {
      addNotification("Image analysis complete!");
      playAudio('/notifikasi.mp3');
    }
  };

  // Handlers for Tag Generation and Selection
  const handleGenerateTags = async () => {
    if (!userPrompt.trim() || !checkApiKey()) return;
    const availableKeys = getAvailableApiKeys();
    setIsTagLoading(true);
    const tags = await generateTagsFromText(userPrompt, availableKeys);
    setRecommendedTags(tags);
    setIsTagLoading(false);
  };

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => {
        const isSelected = prev.includes(tag);
        if(isSelected) {
            return prev.filter(t => t !== tag);
        } else {
            if(prev.length < 3) {
                return [...prev, tag];
            }
            return prev; // Limit to 3 tags
        }
    });
  }, []);

  const handlePromptChange = (newPrompt: string) => {
    setUserPrompt(newPrompt);
    setRecommendedTags([]);
    setSelectedTags([]);
    setHasGenerated(false);
  };


  // Handler for Text-to-Prompts Generation
  const handleGeneratePrompts = async () => {
    if (!userPrompt.trim() || !checkApiKey()) return;
    const availableKeys = getAvailableApiKeys();
    
    setIsGenerating(true);
    const generatedPrompts = await generatePromptsFromText(userPrompt, selectedTags, availableKeys);
    
    if (generatedPrompts.length > 0) {
        const newEntries: PromptHistoryEntry[] = generatedPrompts.map((p, index) => ({
            id: Date.now() + index,
            title: p.title,
            prompt: p.prompt,
        }));
        setHistory(newEntries);
        setHasGenerated(true);
        addNotification(`Generated ${newEntries.length} new prompts.`);
        playAudio('/notifikasi.mp3');
    } else {
        alert("Sorry, could not generate prompts. Please try a different request.");
    }
    
    setIsGenerating(false);
  };

  // Handler for saving a prompt from the history table to the custom list
  const handleSavePromptFromHistory = useCallback((data: { title: string; prompt: string }) => {
    const isDuplicate = customPrompts.some(p => p.prompt === data.prompt && p.title === data.title);
    if (!isDuplicate) {
        const newEntry: PromptHistoryEntry = {
            id: Date.now(),
            ...data,
        };
        setCustomPrompts(prev => [...prev, newEntry]);
    } else {
        alert("This prompt has already been saved.");
    }
  }, [customPrompts]);

  // Handler for adding a new prompt from the form in CostumeCard
  const handleAddNewCustomPrompt = useCallback((data: { title: string; prompt: string }) => {
    const newEntry: PromptHistoryEntry = {
        id: Date.now(),
        ...data,
    };
    setCustomPrompts(prev => [...prev, newEntry]);
  }, []);

  // Handler for deleting a prompt from the custom list
  const handleDeleteCustomPrompt = useCallback((idToDelete: number) => {
    setCustomPrompts(prev => prev.filter(p => p.id !== idToDelete));
  }, []);


  return (
    <div className={`min-h-screen w-full font-sans relative ${!isAnimationEnabled ? 'bg-gradient-to-br from-black to-[#071334]' : ''}`}>
      {isAnimationEnabled && <BackgroundAnimations />}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      
      {!isAuthenticated ? (
        <PinCard onSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <>
            <SettingsCard 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                apiKeys={apiKeys}
                setApiKeys={setApiKeys}
                isAnimationEnabled={isAnimationEnabled}
                setIsAnimationEnabled={setIsAnimationEnabled}
            />
            <PromptBGModal
                isOpen={isPromptBGModalOpen}
                onClose={() => setIsPromptBGModalOpen(false)}
                onSubmit={handleGenerateBG}
            />
            <div className="relative z-20 min-h-screen w-full p-4 md:p-8 flex items-center justify-center">
                <main className="w-full max-w-7xl mx-auto h-[90vh]">
                    <div className="bg-black/30 p-8 rounded-3xl shadow-2xl h-full">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                            
                            {/* Left Column */}
                            <div className="lg:col-span-1 h-full">
                                <ImageAndResultCard 
                                    onImageUpload={setImageFile} 
                                    resultPrompt={analysisResult}
                                    isAnalyzing={isAnalyzing}
                                    onAnalyze={handleAnalyzeImage}
                                    imageUploaded={!!imageFile}
                                    onOpenSettings={() => setIsSettingsOpen(true)}
                                />
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0">
                                <PromptInputCard 
                                    prompt={userPrompt}
                                    setPrompt={handlePromptChange}
                                    onGenerate={handleGeneratePrompts}
                                    isLoading={isGenerating}
                                    hasGenerated={hasGenerated}
                                />
                                <PromptRulesCard 
                                    userPrompt={userPrompt}
                                    onGenerateTags={handleGenerateTags}
                                    isTagLoading={isTagLoading}
                                    recommendedTags={recommendedTags}
                                    selectedTags={selectedTags}
                                    onTagSelect={handleTagSelect}
                                />
                                <PromptBGCard
                                    prompt={promptBG}
                                    setPrompt={setPromptBG}
                                    onGenerate={handleOpenPromptBGModal}
                                    isLoading={isGeneratingBG}
                                />
                                <VectorBGCard
                                    prompt={vectorBG}
                                    setPrompt={setVectorBG}
                                    onGenerate={handleGenerateVT}
                                    isLoading={isGeneratingVT}
                                />
                                </div>
                                <div className="flex-grow min-h-0 flex flex-col gap-6">
                                <div className="h-72 flex-shrink-0">
                                    <CostumeCard 
                                      customPrompts={customPrompts}
                                      onSaveNewPrompt={handleAddNewCustomPrompt}
                                      onDeletePrompt={handleDeleteCustomPrompt}
                                    />
                                </div>
                                <div className="flex-grow min-h-0">
                                    <PromptHistoryTable 
                                      history={history} 
                                      isLoading={isGenerating}
                                      onSave={handleSavePromptFromHistory}
                                      userPrompt={userPrompt}
                                    />
                                </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
      )}
    </div>
  );
}
