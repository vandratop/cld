
import React from 'react';
import { ChevronLeftIcon } from './Icons';

export const DoaDzikirPage: React.FC<{onBack: () => void}> = ({onBack}) => {
    const list = [
        "Dzikir Pagi", "Dzikir Petang", "Doa Berwudhu", "Doa Setelah Shalat", 
        "Doa Dimudahkan Urusan", "Doa Mohon Hidayah", "Doa Keselamatan"
    ];

    const handleClick = (item: string) => {
        alert(`Menu ${item} coming soon...`);
    };

    return (
        <div className="p-4 text-white">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-full"><ChevronLeftIcon /></button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤲🏼</span>
                    <h2 className="text-xl font-bold">Doa & Dzikir</h2>
                </div>
            </div>
            <div className="grid gap-3">
                {list.map((item, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => handleClick(item)}
                        className="p-4 bg-gray-800/50 rounded-lg text-left hover:bg-gray-700 border border-gray-700 flex justify-between items-center transition-colors"
                    >
                        <span>{item}</span>
                        <span className="text-xs text-cyan-400">Buka &gt;</span>
                    </button>
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-8">Database powered by Gemini 3.0 (Coming Soon)</p>
        </div>
    );
};
