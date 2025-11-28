import React from 'react';
import { CloseIcon, ContactIcon } from './Icons';

interface ContactUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 fade-in" onClick={onClose}>
            <div className="main-container cyber-border rounded-lg p-6 w-full max-w-sm relative text-center" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-1"><CloseIcon /></button>
                <h3 className="font-bold text-lg mb-4 neon-text">Hubungi Kami</h3>
                <p className="text-sm text-gray-300 mb-6">
                    Punya pertanyaan, saran, atau laporan bug? Silakan kirimkan email kepada kami. Kami siap mendengar!
                </p>
                <a 
                    href="mailto:hijr.time@gmail.com"
                    className="w-full inline-flex items-center justify-center space-x-2 p-3 bg-cyan-600 rounded neon-button"
                >
                    <ContactIcon className="w-5 h-5" />
                    <span>Kirim Email</span>
                </a>
            </div>
        </div>
    );
};