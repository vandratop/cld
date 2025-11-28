
import React from 'react';
import { CloseIcon, ChevronRightIcon, ChevronLeftIcon } from './Icons';

interface InfoModalProps {
    title: string;
    content: React.ReactNode;
    isList?: boolean;
    onClose: () => void;
    onBack?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, content, isList = false, onClose, onBack }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center pt-28 sm:pt-36 z-50 fade-in overflow-y-auto" onClick={onClose}>
            <div 
                className="main-container cyber-border rounded-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col relative mx-4 mb-8" 
                onClick={(e) => e.stopPropagation()}
            >
                {onBack && (
                    <button onClick={onBack} className="absolute top-3 left-3 p-1 z-10 bg-black/20 rounded-full hover:bg-black/40">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={onClose} className="absolute top-3 right-3 p-1 z-10 bg-black/20 rounded-full hover:bg-red-900/40"><CloseIcon /></button>
                <h3 className="font-bold text-xl mb-4 neon-text text-center border-b border-[var(--border-color)]/20 pb-3 px-8">
                    {title}
                </h3>
                {isList ? (
                     <div className="overflow-y-auto pr-2 text-sm">
                        <ul className="space-y-2">
                           {content}
                        </ul>
                    </div>
                ) : (
                    <div className="overflow-y-auto pr-2 text-sm reading-mode-content">
                        {content}
                    </div>
                )}
            </div>
        </div>
    );
};

export const InfoListItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <li>
        <button onClick={onClick} className="w-full flex justify-between items-center text-left p-3 rounded-lg hover:bg-[var(--border-color)]/20 transition-colors">
            <span>{children}</span>
            <ChevronRightIcon />
        </button>
    </li>
);
