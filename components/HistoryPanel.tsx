
import React from 'react';
import { HistoryItem, GenerationType } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (id: string) => void;
  onClearHistory: () => void;
}

const getHistoryItemTitle = (item: HistoryItem): string => {
    switch (item.generationType) {
        case GenerationType.Photo:
            const photoCount = item.results.filter(r => r.type === 'photo' && !r.error).length;
            return `${photoCount} عکس`;
        case GenerationType.Video:
            return 'ریلز ویدیویی';
        case GenerationType.Campaign:
            return 'کمپین کامل';
        case GenerationType.SocialPost:
            return 'پست شبکه اجتماعی';
        case GenerationType.MagicEdit:
            return 'ویرایش جادویی';
        default:
            return 'خروجی';
    }
}

const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} ثانیه پیش`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    
    return past.toLocaleDateString('fa-IR');
};


export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClearHistory }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sticky top-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200">تاریخچه ساخت</h2>
        {history.length > 0 && (
            <button 
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
                پاک کردن همه
            </button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-3">
        {history.length === 0 ? (
          <div className="text-center text-slate-500 pt-16">
            <p>خروجی‌های قبلی شما اینجا نمایش داده می‌شوند.</p>
          </div>
        ) : (
          history.map(item => (
            <button 
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="w-full flex items-center gap-4 p-3 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all text-left"
            >
              <div className="w-16 h-16 rounded-md bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.preview ? (
                  <img src={item.preview} alt="Generation preview" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-slate-200">{getHistoryItemTitle(item)}</p>
                <p className="text-xs text-slate-400">{formatTimestamp(item.timestamp)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
