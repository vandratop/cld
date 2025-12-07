
import React from 'react';
import { ShareIcon, InfoIcon, ContactIcon, WhatsAppIcon, InstagramIcon, FacebookIcon, YouTubeIcon, TelegramIcon, TikTokIcon, WebsiteIcon, LoginIcon, LogoutIcon } from './Icons';

interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: (action: string) => void;
    isLoggedIn?: boolean;
    isGuest?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, onAction, isLoggedIn, isGuest }) => {
    if (!isOpen) return null;

    const handleAction = (action: string) => {
        onAction(action);
        onClose();
    };

    // Explicit background to avoid transparency issues
    const isLightTheme = document.body.className.includes('light');
    const bgColor = isLightTheme ? 'bg-white' : 'bg-[#002b25]';
    const textColor = isLightTheme ? 'text-gray-900' : 'text-white';

    return (
        <div className={`absolute top-12 right-2 w-56 main-container cyber-border rounded-lg p-2 z-40 fade-in ${bgColor} ${textColor}`}
             onMouseLeave={onClose}
        >
            <ul className="space-y-1">
                <li>
                    <button onClick={() => handleAction('share')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                        <ShareIcon className="w-5 h-5" />
                        <span>Bagikan & Cetak</span>
                    </button>
                </li>
                 <div className="border-t border-[var(--border-color)]/20 my-1"></div>
                <li>
                    <button onClick={() => handleAction('info-puasa')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                        <InfoIcon />
                        <span>Info Puasa</span>
                    </button>
                </li>
                <li>
                    <button onClick={() => handleAction('info-hari-raya')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                         <InfoIcon />
                        <span>Info Hari Raya</span>
                    </button>
                </li>
                 <div className="border-t border-[var(--border-color)]/20 my-1"></div>
                 <li>
                    <button onClick={() => handleAction('cara-penggunaan')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                         <InfoIcon />
                        <span>Cara Penggunaan</span>
                    </button>
                </li>
                 <li>
                    <button onClick={() => handleAction('ketentuan')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                         <InfoIcon />
                        <span>Ketentuan & Kebijakan</span>
                    </button>
                </li>
                <li>
                    <button onClick={() => handleAction('faq')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                         <InfoIcon />
                        <span>FAQ (Tanya Jawab)</span>
                    </button>
                </li>
                 <div className="border-t border-[var(--border-color)]/20 my-1"></div>
                 <li>
                    <button onClick={() => handleAction('contact-us')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20">
                         <ContactIcon />
                        <span>Hubungi Kami</span>
                    </button>
                </li>
                 <div className="border-t border-[var(--border-color)]/20 my-1"></div>
                 
                 {/* Login / Logout Section */}
                 <li>
                    <button onClick={() => handleAction('auth')} className="w-full flex items-center space-x-3 p-2 text-sm rounded hover:bg-[var(--border-color)]/20 text-yellow-400">
                         {isLoggedIn && !isGuest ? <LogoutIcon /> : <LoginIcon />}
                        <span>{isLoggedIn && !isGuest ? "Logout" : "Login"}</span>
                    </button>
                </li>

                 <div className="border-t border-[var(--border-color)]/20 my-1"></div>
                 <li className="px-2 pt-1 pb-2 text-xs text-gray-400">Find us</li>
                 <li className="flex justify-around items-center px-2">
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="WhatsApp"><WhatsAppIcon className="w-6 h-6"/></a>
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="Instagram"><InstagramIcon className="w-6 h-6"/></a>
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon className="w-6 h-6"/></a>
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="YouTube"><YouTubeIcon className="w-6 h-6"/></a>
                 </li>
                  <li className="flex justify-around items-center px-2 mt-2">
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="Telegram"><TelegramIcon className="w-6 h-6"/></a>
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="TikTok"><TikTokIcon className="w-5 h-5"/></a>
                    <a href="https://hijria.netlify.app" target="_blank" rel="noopener noreferrer" title="Website"><WebsiteIcon className="w-5 h-5"/></a>
                 </li>
            </ul>
        </div>
    );
};
