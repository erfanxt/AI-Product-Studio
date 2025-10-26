
import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { GenerationType, GenerationResult, AspectRatio, StylePreset, HistoryItem, GenerativeModel } from './types';
import { generateProductPhoto, generateCreativeConcept, validateGeneratedImage, generateCampaignStrategy, generateAndValidateCaption, validateGeneratedText, regenerateInvalidCaption, editProductPhoto } from './services/geminiService';
// FIX: Correctly import fileToBase64 as an exported member from './utils/helpers'.
import { fileToBase64 } from './utils/helpers';
import { HistoryPanel } from './components/HistoryPanel';

const stylePresets: StylePreset[] = [
  { key: 'cinematic', label: 'Cinematic', keywords: ', cinematic lighting, high contrast, dramatic shadows, film grain' },
  { key: 'minimalist', label: 'Minimalist', keywords: ', clean background, simple composition, neutral color palette, soft lighting' },
  { key: 'vibrant', label: 'Vibrant & Playful', keywords: ', bold colors, dynamic composition, bright and fun, pop art style' },
  { key: 'luxury', label: 'Luxury Dark', keywords: ', dark and moody, elegant, high-end, sophisticated, rich textures, low-key lighting' },
  { key: 'studio', label: 'Studio', keywords: ', professional studio shot, clean plain background, product photography, softbox lighting' },
];


function App() {
  const [selectedModel, setSelectedModel] = useState<GenerativeModel>('gemini-2.5-flash-image');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>(JSON.stringify({
    "scene_description": "A lifestyle shot of the product on a marble countertop, with soft morning light.",
    "lighting": "Soft, natural morning light",
    "mood": "Elegant and clean",
    "props": "A sprig of eucalyptus"
  }, null, 2));
  const [isPromptValid, setIsPromptValid] = useState<boolean>(true);
  const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.Photo);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [activePresetKey, setActivePresetKey] = useState<string | null>(null);
  const [placeInContext, setPlaceInContext] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);
  
  const [productHint, setProductHint] = useState<string>('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // FIX: Removed API key management from UI. The API key will be sourced from environment variables in the service layer.
  
  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('generationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);
  
  // FIX: Removed API key management from UI.

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch(e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  useEffect(() => {
    if (generationType === GenerationType.Campaign) {
      setNumberOfImages(1);
      setAspectRatio('1:1');
      setPlaceInContext(false);
      setReferenceFile(null);
    } else if (generationType === GenerationType.SocialPost) {
      setNumberOfImages(1);
      setAspectRatio('1:1');
      setPlaceInContext(true);
      setReferenceFile(null);
    } else if (generationType === GenerationType.Photo) {
      setAspectRatio('1:1');
    } else if (generationType === GenerationType.MagicEdit) {
      try {
        JSON.parse(prompt);
        setPrompt('Change the background to a marble countertop.');
      } catch(e) {
        // Prompt is already a string, do nothing
      }
      setIsPromptValid(true);
    }
  }, [generationType]);

  const handleFileChange = async (file: File | null) => {
    setUploadedFile(file);
    setResults([]);
    setError(null);
  };

  const handleReferenceFileChange = (file: File | null) => {
    setReferenceFile(file);
  };
  
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    if (generationType === GenerationType.MagicEdit) {
      setIsPromptValid(true);
      return;
    }
    try {
      JSON.parse(newPrompt);
      setIsPromptValid(true);
    } catch {
      setIsPromptValid(false);
    }
  };
  
  const handleGeneratePrompt = useCallback(async () => {
    // FIX: Removed API key check. The key is now handled in the service layer.
    if (!uploadedFile) {
      setError("Please upload a product image first to generate a prompt.");
      return;
    }

    setIsGeneratingPrompt(true);
    setError(null);
    setActivePresetKey(null);

    try {
      const base64String = await fileToBase64(uploadedFile);
      const base64Data = base64String.split(',')[1];
      let generatedPrompt = '';

      if (generationType === GenerationType.Campaign) {
          // FIX: Removed apiKey from service call.
          const strategy = await generateCampaignStrategy(selectedModel, base64Data, uploadedFile.type, productHint);
          generatedPrompt = JSON.stringify(strategy, null, 2);
      } else {
         generatedPrompt = await generateCreativeConcept(
            // FIX: Removed apiKey from service call.
            selectedModel,
            base64Data,
            uploadedFile.type,
            productHint,
            generationType as GenerationType.Photo | GenerationType.SocialPost
          );
      }
      
      setPrompt(generatedPrompt);
      setIsPromptValid(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the prompt.");
    } finally {
      setIsGeneratingPrompt(false);
    }
    // FIX: Removed apiKey from dependency array.
  }, [selectedModel, uploadedFile, productHint, generationType]);
  
  const handlePresetChange = (preset: StylePreset) => {
    const isDeselecting = activePresetKey === preset.key;

    try {
        const promptJson = JSON.parse(prompt);
        if (typeof promptJson.scene_description !== 'string') {
            // Preset can't be applied to this prompt structure
            setActivePresetKey(isDeselecting ? null : preset.key);
            return;
        }

        let baseScene = promptJson.scene_description;

        // Remove all known preset keywords first to avoid duplication
        stylePresets.forEach(p => {
            baseScene = baseScene.replace(new RegExp(p.keywords.replace(/, /g, ",\\s*"), "g"), '');
        });

        // Clean up any mess left behind
        baseScene = baseScene.replace(/,\s*$/, '').trim().replace(/^\s*,/, '').trim().replace(/\s\s+/g, ' ');

        if (isDeselecting) {
            setActivePresetKey(null);
            promptJson.scene_description = baseScene;
        } else {
            setActivePresetKey(preset.key);
            promptJson.scene_description = baseScene ? `${baseScene}${preset.keywords}` : preset.keywords.substring(2);
        }

        setPrompt(JSON.stringify(promptJson, null, 2));
        setIsPromptValid(true);

    } catch (e) {
        console.error("Invalid JSON in prompt, cannot apply preset.", e);
        setError("Your prompt is not valid JSON. Please fix it before applying a style preset.");
    }
  };

  const generateAndValidatePhoto = async (
    // FIX: Removed apiKey from parameters.
    currentModel: GenerativeModel,
    base64Data: string, 
    fileType: string, 
    photoPrompt: string, 
    photoAspectRatio: AspectRatio,
    referenceBase64Data?: string | null
    ): Promise<GenerationResult> => {
        const MAX_RETRIES = 2;
        let lastReason = "Generation failed.";
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                // FIX: Removed apiKey from service call.
                const generatedImage = await generateProductPhoto(base64Data, fileType, photoPrompt, photoAspectRatio, referenceBase64Data);
                setLoadingMessage(`Verifying photo quality (Attempt ${i + 1})...`);
                // FIX: Removed apiKey from service call.
                const validation = await validateGeneratedImage(currentModel, base64Data, fileType, generatedImage);

                if (validation.isValid) {
                    return { type: 'photo', data: `data:image/png;base64,${generatedImage}` };
                } else {
                    lastReason = validation.reason;
                    console.warn(`Image validation failed (Attempt ${i + 1}/${MAX_RETRIES}): ${lastReason}`);
                }
            } catch (err) {
                console.error(`Generation attempt ${i+1} failed`, err);
                if (err instanceof Error) lastReason = err.message;
            }
        }
        return { type: 'photo', data: '', error: `Failed to create a valid image. Last reason: ${lastReason}` };
    };

  const handleGenerate = useCallback(async () => {
    // FIX: Removed API key check.
    if (!uploadedFile) {
      setError("Please upload a product image first.");
      return;
    }
     if (!isPromptValid) {
      setError("Please fix the invalid JSON in your prompt before generating.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    let finalResults: GenerationResult[] = [];

    try {
      const base64String = await fileToBase64(uploadedFile);
      const base64Data = base64String.split(',')[1];
      
      let referenceBase64Data: string | null = null;
      if (referenceFile) {
        const referenceBase64String = await fileToBase64(referenceFile);
        referenceBase64Data = referenceBase64String.split(',')[1];
      }

      const contextualizationInstruction = "Intelligently place the product in a relevant, photorealistic context. For wearable items (like clothing or accessories), show them in a tasteful, real-world setting as they would be worn. For objects, place them in an appropriate environment (e.g., kitchenware in a kitchen). The overall aesthetic must be cohesive and professional.";
      
      let finalPromptString = prompt;
      if (generationType !== GenerationType.Campaign && generationType !== GenerationType.MagicEdit) {
          try {
              const promptJson = JSON.parse(prompt);
              finalPromptString = Object.entries(promptJson)
                  .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
                  .join('. ');
          } catch(e) {
              console.warn("Prompt is not valid JSON, using as raw text.");
              finalPromptString = prompt; // Fallback to raw text if parsing fails
          }
      }

      if (generationType === GenerationType.Campaign) {
          setLoadingMessage("Parsing campaign strategy...");
          const strategy = JSON.parse(prompt);

          const photoPrompts = strategy.photo_concepts.map((concept: any) => 
              `Scene: ${concept.scene_description}. Lighting: ${concept.lighting}. Mood: ${concept.mood}. Props: ${concept.props}.`
          );
          
          setLoadingMessage("Creating and validating campaign assets...");
          
          const photoPromises = [
              // FIX: Removed apiKey from calls.
              generateAndValidatePhoto(selectedModel, base64Data, uploadedFile.type, photoPrompts[0], '1:1'),
              generateAndValidatePhoto(selectedModel, base64Data, uploadedFile.type, photoPrompts[1], '3:4'),
              generateAndValidatePhoto(selectedModel, base64Data, uploadedFile.type, photoPrompts[2], '16:9'),
          ];

          const captionValidationPromises = strategy.social_captions.map(async (sc: any) => {
              setLoadingMessage(`Validating caption for ${sc.platform}...`);
              // FIX: Removed apiKey from service call.
              const validation = await validateGeneratedText(selectedModel, base64Data, uploadedFile.type, sc.caption);
              if (validation.isValid) {
                  return { type: 'text', title: sc.platform, data: sc.caption };
              }
              console.warn(`Caption for ${sc.platform} failed validation: ${validation.reason}. Regenerating...`);
              setLoadingMessage(`Correction: AI is rewriting caption for ${sc.platform}...`);
              // FIX: Removed apiKey from service call.
              const regeneratedCaption = await regenerateInvalidCaption(selectedModel, base64Data, uploadedFile.type, productHint, sc.caption, validation.reason);
              return { type: 'text', title: sc.platform, data: regeneratedCaption };
          });

          const [photoResult1, photoResult2, photoResult3, ...captionResults] = await Promise.all([
              ...photoPromises,
              ...captionValidationPromises
          ]);
          
          finalResults = [
              photoResult1,
              photoResult2,
              photoResult3,
              ...captionResults,
          ];
          setResults(finalResults);

      } else if (generationType === GenerationType.Photo) {
        setLoadingMessage(`Generating ${numberOfImages} photo(s)...`);
        const finalPrompt = placeInContext ? contextualizationInstruction + finalPromptString : finalPromptString;
        // FIX: Removed apiKey from service call.
        const generationPromises = Array.from({ length: numberOfImages }, () => generateAndValidatePhoto(selectedModel, base64Data, uploadedFile.type, finalPrompt, aspectRatio, referenceBase64Data));
        finalResults = await Promise.all(generationPromises);
        setResults(finalResults);

      } else if (generationType === GenerationType.SocialPost) {
        setLoadingMessage("Generating your social post...");
        const finalPrompt = placeInContext ? contextualizationInstruction + finalPromptString : finalPromptString;

        // FIX: Removed apiKey from service calls.
        const photoPromise = generateAndValidatePhoto(selectedModel, base64Data, uploadedFile.type, finalPrompt, aspectRatio);
        const captionPromise = generateAndValidateCaption(selectedModel, base64Data, uploadedFile.type, productHint);

        const [photoResult, captionResult] = await Promise.all([photoPromise, captionPromise]);

        finalResults = [
          photoResult,
          { type: 'text', title: 'Optimized Instagram Caption', data: captionResult },
        ];
        setResults(finalResults);
      } else if (generationType === GenerationType.MagicEdit) {
        setLoadingMessage("Applying your magic edit...");
        // FIX: Removed apiKey from service call.
        const editedPhoto = await editProductPhoto(base64Data, uploadedFile.type, prompt, referenceBase64Data);
        finalResults = [{ type: 'photo', data: `data:image/png;base64,${editedPhoto}` }];
        setResults(finalResults);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (finalResults.length > 0 && !finalResults.some(r => r.error)) {
        const firstVisual = finalResults.find(r => r.type === 'photo');
        const newHistoryItem: HistoryItem = {
          id: `gen_${Date.now()}`,
          timestamp: new Date().toISOString(),
          generationType,
          preview: firstVisual?.data ?? '',
          results: finalResults,
          prompt: prompt,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    }
    // FIX: Removed apiKey from dependency array.
  }, [selectedModel, uploadedFile, referenceFile, prompt, generationType, aspectRatio, numberOfImages, productHint, placeInContext, isPromptValid]);

  const handleSelectHistoryItem = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setError(null);
      setResults(item.results);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire generation history? This cannot be undone.")) {
      setHistory([]);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-screen-2xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <ControlPanel
              uploadedFile={uploadedFile}
              onFileChange={handleFileChange}
              referenceFile={referenceFile}
              onReferenceFileChange={handleReferenceFileChange}
              prompt={prompt}
              onPromptChange={handlePromptChange}
              isPromptValid={isPromptValid}
              generationType={generationType}
              onGenerationTypeChange={setGenerationType}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              numberOfImages={numberOfImages}
              onNumberOfImagesChange={setNumberOfImages}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              productHint={productHint}
              onProductHintChange={setProductHint}
              onGeneratePrompt={handleGeneratePrompt}
              isGeneratingPrompt={isGeneratingPrompt}
              stylePresets={stylePresets}
              activePresetKey={activePresetKey}
              onPresetChange={handlePresetChange}
              placeInContext={placeInContext}
              onPlaceInContextChange={setPlaceInContext}
              // FIX: Removed apiKey and onApiKeyChange props.
              selectedModel={selectedModel}
              onSelectedModelChange={setSelectedModel}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-6">
            <ResultsDisplay
              results={results}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
            />
          </div>
          <div className="lg:col-span-12 xl:col-span-3">
             <HistoryPanel
              history={history}
              onSelectItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
