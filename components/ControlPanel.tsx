
import React from 'react';
import { GenerationType, AspectRatio, aspectRatios, GenerativeModel, generativeModels } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  model: GenerativeModel;
  setModel: (model: GenerativeModel) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isGenerateDisabled: boolean;
  photoCount: number;
  setPhotoCount: (count: number) => void;
}

const GenerationTypeOption: React.FC<{ value: GenerationType, label: string, icon: string, current: GenerationType, onChange: (value: GenerationType) => void }> = ({ value, label, icon, current, onChange }) => (
  <label className={`flex flex-col items-center justify-center p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${current === value ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-slate-600 bg-slate-900 hover:border-slate-500'}`}>
    <input type="radio" name="generationType" value={value} checked={current === value} onChange={() => onChange(value)} className="sr-only" />
    <span className="text-3xl">{icon}</span>
    <span className="mt-2 text-sm font-semibold">{label}</span>
  </label>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ prompt, setPrompt, generationType, setGenerationType, aspectRatio, setAspectRatio, model, setModel, onGenerate, isLoading, isGenerateDisabled, photoCount, setPhotoCount }) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">۱. محصول و صحنه را توصیف کنید</label>
        <textarea
          id="prompt"
          rows={3}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="مثال: یک بطری عطر روی یک میز مرمری در کنار گل‌های تازه"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div>
        <h3 className="block text-sm font-medium text-slate-300 mb-2">۲. نوع خروجی را انتخاب کنید</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <GenerationTypeOption value={GenerationType.Photo} label="عکس" icon="📸" current={generationType} onChange={setGenerationType} />
          <GenerationTypeOption value={GenerationType.Video} label="ویدیو" icon="🎬" current={generationType} onChange={setGenerationType} />
          <GenerationTypeOption value={GenerationType.Campaign} label="کمپین" icon="🚀" current={generationType} onChange={setGenerationType} />
          <GenerationTypeOption value={GenerationType.SocialPost} label="پست" icon="✍️" current={generationType} onChange={setGenerationType} />
          <GenerationTypeOption value={GenerationType.MagicEdit} label="ویرایش" icon="✨" current={generationType} onChange={setGenerationType} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {generationType === GenerationType.Photo && (
            <div>
              <label htmlFor="photo-count" className="block text-sm font-medium text-slate-300 mb-2">تعداد عکس</label>
              <select id="photo-count" value={photoCount} onChange={(e) => setPhotoCount(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
        )}
        {(generationType === GenerationType.Photo || generationType === GenerationType.MagicEdit || generationType === GenerationType.SocialPost || generationType === GenerationType.Video) && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">نسبت تصویر</label>
              <div className="flex gap-2">
                {aspectRatios.map(({ key, label }) => (
                  <button key={key} onClick={() => setAspectRatio(key)} className={`flex-1 p-2 text-xs rounded-md transition-colors ${aspectRatio === key ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
        )}
      </div>

       <div>
          <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-2">مغز هوش مصنوعی (اختیاری)</label>
          <select id="model-select" value={model} onChange={(e) => setModel(e.target.value as GenerativeModel)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
              {generativeModels.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
              ))}
          </select>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || isGenerateDisabled}
        className="w-full flex items-center justify-center gap-2 p-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <LoadingSpinner /> : '🚀'}
        {isLoading ? 'در حال ساخت...' : 'همین حالا بساز'}
      </button>
    </div>
  );
};
