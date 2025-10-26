
import React from 'react';

const FilmStripIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
        <line x1="7" y1="2" x2="7" y2="22"></line>
        <line x1="17" y1="2" x2="17" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <line x1="2" y1="7" x2="7" y2="7"></line>
        <line x1="2" y1="17" x2="7" y2="17"></line>
        <line x1="17" y1="17" x2="22" y2="17"></line>
        <line x1="17" y1="7" x2="22" y2="7"></line>
    </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4">
                 <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <FilmStripIcon className="text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        AI Product Studio
                    </span>
                </h1>
            </div>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Turn one product photo into an entire campaign. Generate stunning images and viral video reels for your online store.
            </p>
        </header>
    );
};
