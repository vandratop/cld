
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Location, PrayerTimes } from '../types';
import { streamChat, getGroundedResponse, getComplexResponse } from '../services/geminiService';
import { BotIcon, SendIcon, CloseIcon, SearchIcon, MapIcon, SparklesIcon, ShareIcon, VolumeUpIcon, VolumeOffIcon, SettingsIcon, PaletteIcon, MicIcon } from './Icons';

type ChatMode = 'chat' | 'search' | 'maps' | 'complex';

const predefinedPrompts = [
    'Lokasi Masjid terdekat',
    'Doa setelah shalat',
    'Keutamaan puasa Senin Kamis',
    'Sejarah Tahun Baru Hijriah',
    'Tafsir dan Lafaz QS 1:5'
];

interface ChatBotProps {
    location: Location;
    prayerTimes: PrayerTimes | null;
    sahurPopupText: string | null;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialMessage: string | null;
    onOpenVoiceAssistant?: () => void;
}

const sanitizeResponse = (text: string): string => {
    if (!text) return '';
    let sanitizedText = text;
    sanitizedText = sanitizedText.replace(/\bSWT\.?\b/gi, "Subhanahu wa Ta’ala ﷻ");
    sanitizedText = sanitizedText.replace(/\bSAW\.?\b/gi, "Shallallahu ‘Alaihi wa Sallam ﷺ");
    sanitizedText = sanitizedText.replace(/\bAS\.?\b/gi, "Alaihis Salam");
    sanitizedText = sanitizedText.replace(/\bRA\.?\b/gi, "radhiyallahu ‘anhu");
    return sanitizedText;
};

const AVATARS = [
    { id: 'default', url: 'https://raw.githubusercontent.com/vandratop/Yuk/3ca087bbe1dfa3822dc66f60ba3f8c2cdf0772b0/AI-HIJR_Chatbot.gif', name: 'Default' },
    { id: 'robot', url: 'https://raw.githubusercontent.com/vandratop/Yuk/a23684b00bae730abaf5ec3837aacea3f83a9f22/AI-Chatbot_rbt.png', name: 'Robot' },
    { id: 'art', url: 'https://raw.githubusercontent.com/vandratop/Yuk/a23684b00bae730abaf5ec3837aacea3f83a9f22/Yellow_star.png', name: 'Art' },
];

const BUBBLE_STYLES = [
    { id: 'bubble-default', name: 'Default' },
    { id: 'bubble-rounded', name: 'Sangat Bulat' },
    { id: 'bubble-sharp', name: 'Kotak' },
];

const BG_COLORS = [
    { id: 'default', value: `rgba(var(--chatbot-bg-rgb), var(--chatbot-bg-opacity))` },
    { id: 'deep-blue', value: 'rgba(10, 25, 47, 0.95)' },
    { id: 'soft-green', value: 'rgba(20, 38, 35, 0.95)' },
    { id: 'dark-grey', value: 'rgba(30, 30, 30, 0.95)' },
];

interface ChatSettings {
    avatarId: string;
    bubbleStyleId: string;
    bgColorId: string;
}

const defaultChatSettings: ChatSettings = {
    avatarId: 'default',
    bubbleStyleId: 'bubble-default',
    bgColorId: 'default',
};

const ChatSettingsPanel: React.FC<{
    settings: ChatSettings;
    onSettingsChange: (newSettings: ChatSettings) => void;
    onClose: () => void;
}> = ({ settings, onSettingsChange, onClose }) => (
    <div className="absolute top-0 left-0 w-full h-full bg-[rgba(var(--chatbot-bg-rgb),0.98)] z-50 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">Personalisasi Chat</h3>
             <button onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="overflow-y-auto space-y-4 pr-2">
            <div>
                <h4 className="font-bold text-sm mb-2">Avatar AI</h4>
                <div className="flex space-x-2">
                    {AVATARS.map(avatar => (
                        <button key={avatar.id} onClick={() => onSettingsChange({ ...settings, avatarId: avatar.id })} className={`p-1 rounded-full border-2 ${settings.avatarId === avatar.id ? 'border-[var(--text-color-secondary)]' : 'border-transparent'}`}>
                            <img src={avatar.url} alt={avatar.name} className="w-12 h-12 rounded-full bg-black/20" />
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-bold text-sm mb-2">Gaya Balon Obrolan</h4>
                 <div className="flex flex-col space-y-2 text-sm">
                    {BUBBLE_STYLES.map(style => (
                        <label key={style.id} className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="bubble-style" value={style.id} checked={settings.bubbleStyleId === style.id} onChange={() => onSettingsChange({ ...settings, bubbleStyleId: style.id })} />
                            <span>{style.name}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-bold text-sm mb-2">Warna Latar</h4>
                 <div className="flex space-x-2">
                     {BG_COLORS.map(color => (
                        <button key={color.id} onClick={() => onSettingsChange({ ...settings, bgColorId: color.id })} className={`w-10 h-10 rounded-full border-2 ${settings.bgColorId === color.id ? 'border-[var(--text-color-secondary)]' : 'border-gray-500'}`} style={{ backgroundColor: color.value }}></button>
                     ))}
                </div>
            </div>
        </div>
    </div>
);


export const ChatBot: React.FC<ChatBotProps> = ({ location, prayerTimes, sahurPopupText, isOpen, setIsOpen, initialMessage, onOpenVoiceAssistant }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const storedHistory = localStorage.getItem('hijriChatHistory');
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (e) {
            console.error("Failed to load chat history from localStorage", e);
            return [];
        }
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>('complex');
    const [isTtsEnabled, setIsTtsEnabled] = useState(true); // Default ON
    const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
    const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
        try {
            const stored = localStorage.getItem('hijriChatSettings');
            return stored ? JSON.parse(stored) : defaultChatSettings;
        } catch {
            return defaultChatSettings;
        }
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevSahurPopupText = useRef<string | null>(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        try {
            if (messages.length > 0) {
                localStorage.setItem('hijriChatHistory', JSON.stringify(messages));
            }
        } catch (e) {
            console.error("Failed to save chat history to localStorage", e);
        }
    }, [messages]);
    
    useEffect(() => {
        try {
            localStorage.setItem('hijriChatSettings', JSON.stringify(chatSettings));
        } catch (e) {
             console.error("Failed to save chat settings to localStorage", e);
        }
    }, [chatSettings]);


    useEffect(() => {
        if (isOpen && sahurPopupText && sahurPopupText !== prevSahurPopupText.current) {
            const sahurMessage: ChatMessage = {
                id: `sahur-${Date.now()}`,
                role: 'system', 
                text: sahurPopupText
            };
            setMessages(prev => [...prev, sahurMessage]);
            prevSahurPopupText.current = sahurPopupText;
        }
    }, [sahurPopupText, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            synth.cancel();
        }
    }, [isOpen, synth]);

    useEffect(() => {
        if (initialMessage) {
            handleSend(initialMessage);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMessage]);

    const speak = (text: string) => {
        if (!isTtsEnabled || !text || !synth) return;
        synth.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.volume = 1.0; // Max volume
        synth.speak(utterance);
    };


    const handleSend = async (messageOverride?: string) => {
        const currentInput = messageOverride || input;
        if (!currentInput.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: currentInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: '', grounding: [] };
        
        const currentDate = new Date().toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
        let finalInput = currentInput;
        
        const prayerKeywords = ['shalat', 'sholat', 'prayer', 'waktu', 'jadwal', 'subuh', 'syuruk', 'sunrise', 'dzuhur', 'ashar', 'maghrib', 'isya', 'imsak'];
        const isPrayerQuery = prayerKeywords.some(k => currentInput.toLowerCase().includes(k));
        
        if (isPrayerQuery && prayerTimes) {
            const prayerTimesList = [
                prayerTimes.Imsak && `Imsak: ${prayerTimes.Imsak}`,
                prayerTimes.Fajr && `Subuh: ${prayerTimes.Fajr}`,
                prayerTimes.Sunrise && `Syuruk: ${prayerTimes.Sunrise}`,
                prayerTimes.Dhuhr && `Dzuhur: ${prayerTimes.Dhuhr}`,
                prayerTimes.Asr && `Ashar: ${prayerTimes.Asr}`,
                prayerTimes.Maghrib && `Maghrib: ${prayerTimes.Maghrib}`,
                prayerTimes.Isha && `Isya: ${prayerTimes.Isha}`,
            ].filter(Boolean).join(', ');

            finalInput = `My location has these prayer times for today: ${prayerTimesList}. Now, please answer my question: "${currentInput}"`;
        }
        
        const disclaimer = "\n\nJawaban yang diberikan oleh AI Assistant bertujuan untuk memberikan informasi dan tidak boleh dianggap sebagai fatwa atau nasihat hukum keagamaan. Untuk masalah Fiqih, silakan berkonsultasi dengan ulama atau ahli agama yang terpercaya.";

        try {
            let responseText = '';
            if (mode === 'search') {
                // Search mode prompt: Ask for citations
                const searchPrompt = `Current date is ${currentDate}. Perform a Google Search to answer: ${finalInput}. Provide detailed citations from trusted Islamic websites or encyclopedias. Include source links.`;
                const { text, grounding } = await getGroundedResponse(searchPrompt, 'search', location);
                responseText = text;
                modelMessage.text = sanitizeResponse(text) + disclaimer;
                modelMessage.grounding = grounding;
                setMessages(prev => [...prev, modelMessage]);
            } else if (mode === 'maps') {
                // Maps mode prompt: Ask for places
                const mapPrompt = `Current date is ${currentDate}. Using Google Maps, find: ${finalInput}. Provide details about the place.`;
                const { text, grounding } = await getGroundedResponse(mapPrompt, 'maps', location);
                responseText = text;
                modelMessage.text = sanitizeResponse(text) + disclaimer;
                modelMessage.grounding = grounding;
                setMessages(prev => [...prev, modelMessage]);
            } else if (mode === 'complex') {
                 // Complex mode: Use thinking model
                 const complexPrompt = `Current date is ${currentDate}. Answer this question comprehensively: ${finalInput}. Focus on Islamic perspective, depth, and accuracy.`;
                 responseText = await getComplexResponse(complexPrompt);
                 modelMessage.text = sanitizeResponse(responseText) + disclaimer;
                 setMessages(prev => [...prev, modelMessage]);
            } else {
                // Default Chat Mode (Stream)
                setMessages(prev => [...prev, modelMessage]); // Add empty placeholder
                let accumulatedText = "";
                for await (const chunk of streamChat(messages.concat(userMessage), finalInput)) {
                     accumulatedText += chunk;
                     const sanitizedChunk = sanitizeResponse(accumulatedText);
                     
                     setMessages(prev => {
                        const newHistory = [...prev];
                        const lastMsg = newHistory[newHistory.length - 1];
                        if (lastMsg.role === 'model') {
                            lastMsg.text = sanitizedChunk;
                        }
                        return newHistory;
                     });
                }
                responseText = accumulatedText;
                
                // Append disclaimer after streaming finishes
                setMessages(prev => {
                     const newHistory = [...prev];
                     const lastMsg = newHistory[newHistory.length - 1];
                     if (lastMsg.role === 'model') {
                         lastMsg.text = lastMsg.text + disclaimer;
                     }
                     return newHistory;
                });
            }
            speak(responseText);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = { id: (Date.now() + 1).toString(), role: 'model' as const, text: "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi." };
             setMessages(prev => {
                // If model message was added but failed, replace/update it
                 if (prev[prev.length -1].role === 'model' && prev[prev.length -1].text === '') {
                     const newHistory = [...prev];
                     newHistory[newHistory.length - 1] = errorMessage;
                     return newHistory;
                 }
                 return [...prev, errorMessage];
             });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentAvatar = AVATARS.find(a => a.id === chatSettings.avatarId) || AVATARS[0];
    const currentBg = BG_COLORS.find(c => c.id === chatSettings.bgColorId) || BG_COLORS[0];
    const bubbleStyleClass = chatSettings.bubbleStyleId === 'bubble-rounded' ? 'rounded-3xl' : (chatSettings.bubbleStyleId === 'bubble-sharp' ? 'rounded-md' : 'rounded-lg');

    return (
        <div className="fixed inset-0 z-40 flex flex-col pt-16 sm:pt-20 px-4 pb-4">
             {/* Chat Container */}
            <div 
                className="main-container cyber-border rounded-lg flex flex-col w-full h-full max-w-3xl mx-auto overflow-hidden relative fade-in"
                style={{ backgroundColor: currentBg.value }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-3 border-b border-[var(--border-color)]/20 bg-black/20">
                     <div className="flex items-center space-x-2">
                        <div className="relative">
                            <img src={currentAvatar.url} alt="AI Avatar" className="w-10 h-10 rounded-full border border-[var(--border-color)] p-0.5 bg-black/30 object-cover" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm neon-text">AI-HIJR Assistant</h3>
                            <p className="text-[10px] text-gray-400 flex items-center">
                                <span className="mr-1">Powered by Gemini 2.0</span>
                                <SparklesIcon className="w-3 h-3 text-yellow-400" />
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => setIsTtsEnabled(!isTtsEnabled)} 
                            className={`p-2 rounded-full hover:bg-white/10 ${isTtsEnabled ? 'text-cyan-400' : 'text-gray-500'}`}
                            title={isTtsEnabled ? "Matikan Suara" : "Hidupkan Suara"}
                        >
                            {isTtsEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                        </button>
                        <button onClick={() => setIsChatSettingsOpen(true)} className="p-2 rounded-full hover:bg-white/10"><PaletteIcon className="w-5 h-5"/></button>
                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400"><CloseIcon /></button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            <BotIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">Assalamu'alaikum! Saya AI-HIJR.</p>
                            <p className="text-xs mt-2">Silakan pilih topik atau ketik pertanyaan Anda.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md mx-auto">
                                {predefinedPrompts.map((prompt, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleSend(prompt)}
                                        className="text-xs p-2 bg-black/20 border border-[var(--border-color)]/20 rounded hover:bg-[var(--border-color)]/20 text-left transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {msg.role === 'model' && (
                                <img src={currentAvatar.url} alt="Bot" className="w-8 h-8 rounded-full mr-2 self-end mb-1 border border-gray-600 bg-black" />
                            )}
                            <div 
                                className={`max-w-[85%] p-3 text-sm leading-relaxed ${bubbleStyleClass} ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-700 text-white rounded-br-none' 
                                    : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
                                }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                {msg.grounding && msg.grounding.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-600">
                                        <p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center"><SearchIcon className="w-3 h-3 mr-1"/> Sumber:</p>
                                        <ul className="space-y-1">
                                            {msg.grounding.map((g, i) => (
                                                <li key={i}>
                                                    <a href={g.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline truncate block max-w-[200px]">
                                                        {g.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <img src={currentAvatar.url} alt="Bot" className="w-8 h-8 rounded-full mr-2 self-end mb-1 border border-gray-600 bg-black" />
                            <div className={`bg-gray-800 p-3 ${bubbleStyleClass} rounded-bl-none border border-gray-700 flex space-x-1 items-center`}>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-black/30 border-t border-[var(--border-color)]/20">
                     {/* Mode Selector */}
                    <div className="flex space-x-2 mb-2 overflow-x-auto pb-1 mode-selector">
                        <button 
                            onClick={() => setMode('chat')}
                            className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap transition-colors ${mode === 'chat' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Chat
                        </button>
                         <button 
                            onClick={() => setMode('complex')}
                            className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center ${mode === 'complex' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            Deep Think
                        </button>
                        <button 
                            onClick={() => setMode('search')}
                            className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center ${mode === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <SearchIcon className="w-3 h-3 mr-1" />
                            Search
                        </button>
                        <button 
                            onClick={() => setMode('maps')}
                            className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center ${mode === 'maps' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <MapIcon className="w-3 h-3 mr-1" />
                            Maps
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                         {onOpenVoiceAssistant && (
                            <button
                                onClick={onOpenVoiceAssistant}
                                className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"
                                title="Buka Voice Assistant"
                            >
                                <MicIcon className="w-5 h-5" />
                            </button>
                        )}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={mode === 'search' ? "Cari informasi terkini..." : (mode === 'maps' ? "Cari lokasi..." : "Ketik pesan...")}
                            className="flex-1 bg-gray-800 border border-gray-600 text-white text-sm rounded-full px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-gray-500"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={() => handleSend()} 
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-cyan-600 rounded-full text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 neon-button"
                        >
                            <SendIcon />
                        </button>
                    </div>
                     <p className="text-[9px] text-center mt-2 text-gray-500">
                        AI dapat membuat kesalahan. Mohon verifikasi informasi penting.
                    </p>
                </div>

                {isChatSettingsOpen && (
                    <ChatSettingsPanel 
                        settings={chatSettings} 
                        onSettingsChange={setChatSettings} 
                        onClose={() => setIsChatSettingsOpen(false)} 
                    />
                )}
            </div>
        </div>
    );
};
