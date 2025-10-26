
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { GenerationType, GenerationResult, AspectRatio, HistoryItem, GenerativeModel } from './types';
import { fileToBase64 } from './utils/helpers';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
    // Input state
    const [prompt, setPrompt] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.Photo);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [model, setModel] = useState<GenerativeModel>('gemini-2.5-flash');
    const [photoCount, setPhotoCount] = useState<number>(1);
    
    // Output state
    const [results, setResults] = useState<GenerationResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    // Video flow state
    const [videoGenerationStep, setVideoGenerationStep] = useState<'idle' | 'approving' | 'generating'>('idle');
    const [frameForApproval, setFrameForApproval] = useState<string | null>(null);

    // History state
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('ai-product-studio-history');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
        }
    }, []);

    const saveHistory = useCallback((newHistory: HistoryItem[]) => {
        try {
            setHistory(newHistory);
            localStorage.setItem('ai-product-studio-history', JSON.stringify(newHistory));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, []);

    const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newHistoryItem: HistoryItem = {
            ...item,
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
        };
        saveHistory([newHistoryItem, ...history]);
    }, [history, saveHistory]);

    const handleGenerate = async () => {
        if (!file || !prompt) {
            setError("لطفاً یک تصویر بارگذاری کرده و یک توضیح ارائه دهید.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);
        setFrameForApproval(null);
        setVideoGenerationStep('idle');

        const sourceImageBase64 = await fileToBase64(file);
        let finalResults: GenerationResult[] = [];

        try {
            switch (generationType) {
                case GenerationType.Photo:
                    setLoadingMessage(`در حال ساخت ${photoCount} عکس محصول...`);
                    const photoPromises = Array.from({ length: photoCount }, () => geminiService.generatePhoto(prompt, sourceImageBase64, model));
                    finalResults = await Promise.all(photoPromises);
                    break;
                case GenerationType.MagicEdit:
                     setLoadingMessage('در حال اعمال ویرایش جادویی...');
                     finalResults = [await geminiService.generatePhoto(prompt, sourceImageBase64, 'gemini-2.5-flash-image')];
                     break;
                case GenerationType.Video:
                    setVideoGenerationStep('approving');
                    setLoadingMessage('در حال ساخت فریم شروع ویدیو...');
                    const frame = await geminiService.generateVideoFrame(prompt, sourceImageBase64, model);
                    setFrameForApproval(frame);
                    // The flow will continue in onApproveFrame
                    setIsLoading(false); // Stop loading while waiting for approval
                    return; // Exit here
                case GenerationType.SocialPost:
                    setLoadingMessage('در حال ساخت عکس و کپشن پست...');
                    const [photoResult, textResult] = await Promise.all([
                        geminiService.generatePhoto(prompt, sourceImageBase64, 'gemini-2.5-flash-image'),
                        geminiService.generateSocialPostText(prompt, sourceImageBase64, 'gemini-2.5-pro')
                    ]);
                    finalResults = [photoResult, textResult];
                    break;
                case GenerationType.Campaign:
                    setLoadingMessage('در حال ساخت کمپین کامل...');
                    const [p1, p2, t1, t2] = await Promise.all([
                        geminiService.generatePhoto(`${prompt}, cinematic lighting`, sourceImageBase64, 'gemini-2.5-flash-image'),
                        geminiService.generatePhoto(`${prompt}, on a clean background`, sourceImageBase64, 'gemini-2.5-flash-image'),
                        geminiService.generateSocialPostText(prompt, sourceImageBase64, 'gemini-2.5-pro'),
                        geminiService.generateSocialPostText(`Write an alternative, more exciting version for this prompt: ${prompt}`, sourceImageBase64, 'gemini-2.5-pro'),
                    ]);
                    t2.title = "کپشن جایگزین";
                    finalResults = [p1, p2, t1, t2];
                    break;
            }
            setResults(finalResults);
            addToHistory({
                prompt,
                generationType,
                results: finalResults,
                preview: finalResults.find(r => r.type === 'photo')?.data || sourceImageBase64,
            });
        } catch (e) {
            setError((e as Error).message || "یک خطای ناشناخته رخ داد.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const onApproveFrame = async () => {
        if (!frameForApproval) return;
        
        setIsLoading(true);
        setVideoGenerationStep('generating');
        setLoadingMessage('ویدیو در حال ساخت است... (ممکن است چند دقیقه طول بکشد)');
        
        try {
            const videoResult = await geminiService.generateVideo(prompt, frameForApproval, aspectRatio);
            setResults([videoResult]);
             if (file) {
                addToHistory({
                    prompt,
                    generationType: GenerationType.Video,
                    results: [videoResult],
                    preview: frameForApproval,
                });
            }
        } catch (e) {
            setError((e as Error).message || "خطا در ساخت ویدیو.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setVideoGenerationStep('idle');
            setFrameForApproval(null);
        }
    };

    const onRegenerateFrame = async () => {
         if (!file) return;
         setIsLoading(true);
         setLoadingMessage('در حال ساخت یک فریم جدید...');
         try {
             const sourceImageBase64 = await fileToBase64(file);
             const frame = await geminiService.generateVideoFrame(prompt, sourceImageBase64, model);
             setFrameForApproval(frame);
         } catch(e) {
              setError((e as Error).message || "خطا در ساخت فریم.");
         } finally {
            setIsLoading(false);
         }
    };

    const onSelectHistoryItem = (id: string) => {
        const item = history.find(h => h.id === id);
        if (item) {
            setPrompt(item.prompt);
            setGenerationType(item.generationType);
            setResults(item.results);
            setError(null);
            setIsLoading(false);
            setVideoGenerationStep('idle');
            setFrameForApproval(null);
        }
    };

    const onClearHistory = () => {
        saveHistory([]);
    };
    
    const isGenerateDisabled = !prompt || !file;

    return (
        <div className="bg-slate-950 text-slate-200 min-h-screen font-sans">
            <main className="container mx-auto px-4 py-8">
                <Header />
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-slate-200">۱. عکس محصول خود را بارگذاری کنید</h2>
                            <ImageUploader file={file} onFileChange={setFile} />
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-slate-200 mb-4">۲. خروجی خود را سفارشی کنید</h2>
                            <ControlPanel
                                prompt={prompt}
                                setPrompt={setPrompt}
                                generationType={generationType}
                                setGenerationType={setGenerationType}
                                aspectRatio={aspectRatio}
                                setAspectRatio={setAspectRatio}
                                model={model}
                                setModel={setModel}
                                onGenerate={handleGenerate}
                                isLoading={isLoading && videoGenerationStep !== 'approving'}
                                isGenerateDisabled={isGenerateDisabled}
                                photoCount={photoCount}
                                setPhotoCount={setPhotoCount}
                            />
                        </div>
                        <ResultsDisplay
                            results={results}
                            isLoading={isLoading}
                            loadingMessage={loadingMessage}
                            error={error}
                            videoGenerationStep={videoGenerationStep}
                            frameForApproval={frameForApproval}
                            onApproveFrame={onApproveFrame}
                            onRegenerateFrame={onRegenerateFrame}
                        />
                    </div>
                    <div className="lg:col-span-1">
                         <HistoryPanel history={history} onSelectItem={onSelectHistoryItem} onClearHistory={onClearHistory} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
