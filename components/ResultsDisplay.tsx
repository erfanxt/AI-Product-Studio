
import React from 'react';
import { GenerationResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { dataUrlToFile } from '../utils/helpers';

interface ResultsDisplayProps {
  results: GenerationResult[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  videoGenerationStep: 'idle' | 'approving' | 'generating';
  frameForApproval: string | null;
  onApproveFrame: () => void;
  onRegenerateFrame: () => void;
}

const PlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 4.186m0-4.186c.524.263 1.023.633 1.43 1.065C9.48 12.59 10 13.783 10 15c0 1.217-.52 2.41-1.353 3.445A2.25 2.25 0 009.647 19.5h4.706a2.25 2.25 0 001.983-1.445c.833-1.035 1.353-2.228 1.353-3.445 0-1.217-.52-2.41-1.353-3.445a2.25 2.25 0 00-1.983-1.445H9.647a2.25 2.25 0 00-1.983 1.445z" />
    </svg>
);


const ResultCard: React.FC<{result: GenerationResult, index: number}> = ({result, index}) => {
  if (result.error) {
    return (
      <div className="aspect-square flex flex-col items-center justify-center text-center bg-slate-900 border border-red-500 rounded-lg p-4">
        <span className="text-3xl">⚠️</span>
        <h3 className="mt-3 text-md font-bold text-red-400">بررسی کیفیت ناموفق بود</h3>
        <p className="mt-1 text-xs text-red-300">{result.error}</p>
      </div>
    );
  }

  switch(result.type) {
    case 'photo':
      return (
        <div className="group relative overflow-hidden rounded-lg shadow-lg bg-slate-800 w-full aspect-square">
          <img src={result.data} alt={`Generated product ${index + 1}`} className="w-full h-full object-cover" />
           <a
            href={result.data}
            download={`ai-product-photo-${Date.now()}.png`}
            className="absolute bottom-3 right-3 bg-black bg-opacity-40 text-white rounded-full p-2 hover:bg-opacity-60 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            aria-label="دانلود عکس"
            title="دانلود عکس"
          >
            <DownloadIcon className="h-5 w-5" />
          </a>
        </div>
      );
    case 'video':
      return (
        <div className="group relative overflow-hidden rounded-lg shadow-lg bg-slate-800 w-full aspect-[9/16] sm:aspect-video">
          <video src={result.data} controls autoPlay loop muted className="w-full h-full object-cover">
            مرورگر شما از تگ ویدیو پشتیبانی نمی‌کند.
          </video>
           <a
            href={result.data}
            download={`ai-product-video-${Date.now()}.mp4`}
            className="absolute bottom-3 right-3 bg-black bg-opacity-40 text-white rounded-full p-2 hover:bg-opacity-60 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            aria-label="دانلود ویدیو"
            title="دانلود ویدیو"
          >
            <DownloadIcon className="h-5 w-5" />
          </a>
        </div>
      );
    case 'text':
      return (
        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 h-full">
            <h4 className="font-bold text-purple-400">{result.title}</h4>
            <p className="mt-2 text-slate-300 whitespace-pre-wrap font-sans">{result.data}</p>
        </div>
      );
    default:
      return null;
  }
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, loadingMessage, error, videoGenerationStep, frameForApproval, onApproveFrame, onRegenerateFrame }) => {

  const handleShare = async (imageBase64: string, captionText: string) => {
    if (!navigator.share) {
        alert("API اشتراک‌گذاری وب در مرورگر شما پشتیبانی نمی‌شود. لطفاً متن را کپی کرده و تصویر را به صورت دستی دانلود کنید.");
        return;
    }

    try {
        const imageFile = await dataUrlToFile(imageBase64, `ai-product-photo-${Date.now()}.png`);
        
        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
                title: 'پست محصول ساخته شده با هوش مصنوعی',
                text: captionText,
                files: [imageFile],
            });
        } else {
             await navigator.share({
                title: 'پست محصول ساخته شده با هوش مصنوعی',
                text: captionText,
            });
        }
    } catch (error) {
        console.error('Error sharing:', error);
        if ((error as Error).name !== 'AbortError') {
             alert('خطایی هنگام اشتراک‌گذاری رخ داد.');
        }
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-slate-300 animate-pulse">{loadingMessage}</p>
        </div>
      );
    }
    
    if (videoGenerationStep === 'approving' && frameForApproval) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-slate-200 mb-4">فریم شروع ویدیو را تایید می‌کنید؟</h2>
                <p className="text-slate-400 mb-4">این تصویر، فریم شروع و پایان ویدیوی شما خواهد بود. برای ادامه تایید کنید یا برای دریافت یک فریم جدید، دوباره بسازید.</p>
                <img src={frameForApproval} alt="Video start frame for approval" className="rounded-lg shadow-lg w-full" />
                <div className="flex gap-4 mt-6 w-full">
                    <button onClick={onRegenerateFrame} className="w-full flex items-center justify-center gap-2 p-3 font-semibold text-white bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                        🔄 ساخت مجدد فریم
                    </button>
                    <button onClick={onApproveFrame} className="w-full flex items-center justify-center gap-2 p-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                        ✅ تایید و ساخت ویدیو
                    </button>
                </div>
            </div>
        );
    }


    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 border border-red-500 rounded-lg p-6">
          <span className="text-4xl">😞</span>
          <h3 className="mt-4 text-xl font-bold text-red-400">ساخت با شکست مواجه شد</h3>
          <p className="mt-2 text-red-300">{error}</p>
        </div>
      );
    }
    
    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <PlaceholderIcon />
          <h3 className="mt-4 text-xl font-bold text-slate-400">خروجی‌های شما اینجا نمایش داده می‌شوند</h3>
          <p className="mt-1 text-slate-500">یک تصویر بارگذاری کنید و روی «همین حالا بساز» کلیک کنید تا جادو اتفاق بیفتد.</p>
        </div>
      );
    }

    const isCampaign = results.length > 2 && results.some(r => r.type === 'text');
    const isSocialPost = results.length === 2 && results.some(r => r.type === 'photo') && results.some(r => r.type === 'text');
    const isSingleVideo = results.length === 1 && results[0].type === 'video';
    
    if (isSingleVideo) {
       return (
         <div className="w-full max-w-md mx-auto">
           <h2 className="text-2xl font-bold text-slate-200 border-b-2 border-slate-700 pb-2 mb-4">ریلز ویدیویی ساخته شده توسط هوش مصنوعی</h2>
            <ResultCard result={results[0]} index={0} />
         </div>
       )
    }

    if (isCampaign) {
      const photos = results.filter(r => r.type === 'photo');
      const texts = results.filter(r => r.type === 'text');
      const primaryPhoto = photos[0];

      return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-200 border-b-2 border-slate-700 pb-2 mb-4">کمپین ساخته شده توسط هوش مصنوعی شما</h2>
            </div>
            <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-4">عکس‌های محصول</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photos.map((p, i) => <ResultCard key={`photo-${i}`} result={p} index={i} />)}
                </div>
            </section>
            <section>
                <h3 className="text-xl font-semibold text-teal-400 mb-4">کپشن‌های شبکه اجتماعی</h3>
                <div className="space-y-4">
                  {texts.map((t, i) => (
                    <div key={`text-container-${i}`} className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                      <h4 className="font-bold text-purple-400">{t.title}</h4>
                      <p className="mt-2 text-slate-300 whitespace-pre-wrap font-sans">{t.data}</p>
                      {primaryPhoto?.data && (
                        <button 
                          onClick={() => handleShare(primaryPhoto.data, t.data)}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
                          disabled={!navigator.share}
                          title={!navigator.share ? "اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود" : `اشتراک‌گذاری با کپشن ${t.title}`}
                        >
                          <ShareIcon className="w-5 h-5" />
                          اشتراک‌گذاری پست
                        </button>
                      )}
                    </div>
                  ))}
                </div>
            </section>
        </div>
      );
    }

    if (isSocialPost) {
        const photo = results.find(r => r.type === 'photo')!;
        const caption = results.find(r => r.type === 'text')!;
        return (
            <div className="w-full space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-200 border-b-2 border-slate-700 pb-2 mb-4">پست شبکه اجتماعی ساخته شده توسط هوش مصنوعی شما</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <ResultCard key="social-photo" result={photo} index={0} />
                    <div>
                        <ResultCard key="social-caption" result={caption} index={1} />
                        <button 
                            onClick={() => handleShare(photo.data, caption.data)}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
                            disabled={!navigator.share}
                             title={!navigator.share ? "اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود" : "اشتراک‌گذاری پست"}
                        >
                             <ShareIcon className="w-5 h-5" />
                            اشتراک‌گذاری در شبکه‌های اجتماعی
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const containerClasses = results.length > 1 && results.every(r => r.type === 'photo')
      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
      : "flex justify-center items-center w-full";

    return (
      <div className={containerClasses}>
        {results.map((result, index) => <ResultCard key={index} result={result} index={index} />)}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 w-full min-h-[500px] flex items-start justify-center">
      {renderContent()}
    </div>
  );
};
