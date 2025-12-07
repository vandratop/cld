
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CloseIcon, VolumeUpIcon, VolumeOffIcon, SendIcon, AlarmIcon } from './Icons';
import type { VoiceAssistantProps, AlarmSettings } from '../types';

type VoiceOption = { name: string; id: string; accent: string };

const VOICE_OPTIONS: VoiceOption[] = [
    { name: 'Pria - USA', id: 'Puck', accent: 'en-US' },
    { name: 'Wanita - USA', id: 'Kore', accent: 'en-US' },
    { name: 'Pria - Arab', id: 'Fenrir', accent: 'ar-SA' }, 
    { name: 'Wanita - Indonesia', id: 'Zephyr', accent: 'id-ID' },
];

// Define a local interface for the data structure since Blob is not exported
interface GeminiAudioData {
    data: string;
    mimeType: string;
}

function createBlob(data: Float32Array): GeminiAudioData {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const AlarmToggle: React.FC<{ label: string, isOn: boolean, onToggle: () => void }> = ({ label, isOn, onToggle }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
        <span className="text-xs text-gray-300">{label}</span>
        <button 
            onClick={onToggle}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all ${isOn ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
            {isOn ? '🔔 ON' : '🔕 OFF'}
        </button>
    </div>
);

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose, alarms, onToggleAlarm }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
    const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
    const [volume, setVolume] = useState(1.0);
    const [transcription, setTranscription] = useState('');
    const [audioLevels, setAudioLevels] = useState<number[]>(new Array(5).fill(10));
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);

    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionRef = useRef<any>(null);
    const inputCtxRef = useRef<AudioContext | null>(null);
    const outputCtxRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        if (isOpen) {
            // TTS Greeting
            const greeting = "Assalamualaikum warahmatullahi wabarakatuh";
            const utterance = new SpeechSynthesisUtterance(greeting);
            utterance.lang = 'id-ID';
            utterance.volume = 1.0;
            synthRef.current.cancel();
            synthRef.current.speak(utterance);
            
            // Start session after a slight delay to allow greeting to start
            setTimeout(() => {
                startSession();
            }, 2000);
        } else {
            stopSession();
            synthRef.current.cancel();
            setChatHistory([]);
        }
        return () => stopSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedVoice]);

    const startSession = async () => {
        setStatus('connecting');
        setTranscription('Menghubungkan ke AI-HIJR Voice...');
        
        try {
            if (!process.env.API_KEY) throw new Error("API Key missing");
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            inputCtxRef.current = new AudioContextClass({ sampleRate: 16000 });
            outputCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (inputCtxRef.current.state === 'suspended') {
                await inputCtxRef.current.resume();
            }

            const source = inputCtxRef.current.createMediaStreamSource(streamRef.current);
            scriptProcessorRef.current = inputCtxRef.current.createScriptProcessor(4096, 1, 1);

            const sessionPromise = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        setTranscription('AI-HIJR mendengarkan... Silakan bicara.');
                        
                        if (scriptProcessorRef.current) {
                            scriptProcessorRef.current.onaudioprocess = (e) => {
                                const inputData = e.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                
                                // Update visualization
                                let sum = 0;
                                for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
                                const avg = sum / (inputData.length / 100);
                                updateAudioLevels(avg * 500);

                                sessionPromise.then(session => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            source.connect(scriptProcessorRef.current);
                            if (inputCtxRef.current) {
                                scriptProcessorRef.current.connect(inputCtxRef.current.destination);
                            }
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioStr = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioStr) {
                            setStatus('speaking');
                            updateAudioLevels(50 + Math.random() * 30); // Fake output levels
                            
                            if (outputCtxRef.current && outputCtxRef.current.state !== 'closed') {
                                if (outputCtxRef.current.state === 'suspended') {
                                    await outputCtxRef.current.resume();
                                }
                                
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtxRef.current.currentTime);
                                const audioBuffer = await decodeAudioData(decode(audioStr), outputCtxRef.current, 24000, 1);
                                const sourceNode = outputCtxRef.current.createBufferSource();
                                sourceNode.buffer = audioBuffer;
                                
                                const gainNode = outputCtxRef.current.createGain();
                                gainNode.gain.value = volume;
                                sourceNode.connect(gainNode);
                                gainNode.connect(outputCtxRef.current.destination);
                                
                                sourceNode.addEventListener('ended', () => {
                                    sourcesRef.current.delete(sourceNode);
                                    if (sourcesRef.current.size === 0) setStatus('listening');
                                });
                                
                                sourceNode.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(sourceNode);
                            }
                        }
                        
                         // Capture transcription for text history
                        if (msg.serverContent?.outputTranscription?.text) {
                            const text = msg.serverContent.outputTranscription.text;
                             setChatHistory(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === 'model') {
                                    return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                                }
                                return [...prev, { role: 'model', text }];
                            });
                        }
                         if (msg.serverContent?.inputTranscription?.text) {
                             // Note: Input transcription comes in chunks too, simplification for demo
                             const text = msg.serverContent.inputTranscription.text;
                              setChatHistory(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === 'user') {
                                     return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                                }
                                return [...prev, { role: 'user', text }];
                             });
                        }

                        if (msg.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => {
                                try { s.stop(); } catch (e) {}
                            });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setStatus('listening');
                        }
                    },
                    onclose: () => setStatus('idle'),
                    onerror: (e) => { 
                        console.error(e); 
                        setStatus('idle'); 
                        setTranscription('Koneksi terputus.'); 
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
                    },
                    // Enable transcription for history
                    outputAudioTranscription: {}, 
                    inputAudioTranscription: {},
                    systemInstruction: `You are AI-HIJR, a polite and knowledgeable Islamic assistant. 
                    Your voice should be calm, clear, and respectful.
                    
                    STRICT TOPIC RESTRICTION:
                    You MUST ONLY discuss topics related to Islam, including:
                    - Tauhid, Rukun Iman, Rukun Islam
                    - Fiqih, Quran, Hadith, Tafsir
                    - Islamic History (Sirah), Prophets, Companions
                    - Prayer Times, Fasting, Mosques
                    
                    If the user asks about anything else (politics, entertainment, general science unrelated to faith, etc.), politely decline and steer the conversation back to Islam. Say something like: "Maaf, saya hanya dapat membantu seputar pertanyaan keislaman. Apakah ada hal lain tentang agama yang ingin Anda tanyakan?"
                    
                    Language: Respond in the language the user speaks (mostly Indonesian), but maintain Islamic terminology properly (full honorifics for Allah and Prophets).`
                }
            }).catch(e => {
                console.error("Connect failed:", e);
                setTranscription("Gagal terhubung ke layanan AI. Coba lagi nanti.");
                setStatus('idle');
            });
            
            sessionPromise.then(sess => {
                sessionRef.current = sess;
            });

        } catch (e: any) {
            console.error("Failed to start voice session", e);
            if (e.name === 'NotAllowedError' || e.message?.includes('Permission denied')) {
                setTranscription("Izin mikrofon ditolak. Mohon izinkan akses mikrofon di pengaturan browser Anda.");
            } else {
                setTranscription("Gagal memulai sesi suara. Silakan coba lagi.");
            }
            stopSession(); // Ensure cleanup on error
            setStatus('idle');
        }
    };

    const stopSession = () => {
        if (sessionRef.current) {
            try {
                sessionRef.current.close();
            } catch(e) {
                console.warn("Error closing session", e);
            }
            sessionRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        
        // Safely close audio contexts
        if (inputCtxRef.current && inputCtxRef.current.state !== 'closed') {
            inputCtxRef.current.close().catch(e => console.warn("Error closing input context", e));
        }
        inputCtxRef.current = null;

        if (outputCtxRef.current && outputCtxRef.current.state !== 'closed') {
            outputCtxRef.current.close().catch(e => console.warn("Error closing output context", e));
        }
        outputCtxRef.current = null;
        
        sourcesRef.current.forEach(s => {
            try { s.stop(); } catch (e) {}
        });
        sourcesRef.current.clear();
        
        setStatus('idle');
    };

    const updateAudioLevels = (level: number) => {
        setAudioLevels(prev => {
            const newLevels = [...prev.slice(1), Math.min(100, Math.max(10, level))];
            return newLevels;
        });
    };
    
    const handleSaveAndShare = () => {
        const text = chatHistory.map(m => `${m.role === 'user' ? 'User' : 'AI-HIJR'}: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-hijr-conversation-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Save to Local Storage as requested
        try {
            const savedConvos = JSON.parse(localStorage.getItem('savedVoiceConversations') || '[]');
            savedConvos.push({
                date: new Date().toISOString(),
                content: text
            });
            localStorage.setItem('savedVoiceConversations', JSON.stringify(savedConvos));
            alert('Percakapan disimpan di penyimpanan lokal dan diunduh.');
        } catch (e) {
            console.error("Storage limit reached", e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 fade-in overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 pointer-events-auto">
                    <CloseIcon />
                </button>
            </div>

            <div className="w-full max-w-md p-6 text-center h-full flex flex-col justify-center">
                <div className="mb-4 relative shrink-0">
                    <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300 ${status === 'speaking' ? 'border-cyan-400 shadow-[0_0_30px_#22d3ee]' : (status === 'listening' ? 'border-green-400 shadow-[0_0_20px_#4ade80]' : 'border-gray-600')}`}>
                        <div className="flex items-center justify-center gap-1 h-16">
                            {audioLevels.map((h, i) => (
                                <div 
                                    key={i} 
                                    className={`w-2 rounded-full transition-all duration-100 ${status === 'speaking' ? 'bg-cyan-400' : 'bg-green-400'}`} 
                                    style={{ height: `${h}%` }} 
                                />
                            ))}
                        </div>
                    </div>
                    <p className="mt-4 text-xl font-bold text-white animate-pulse">
                        {status === 'listening' ? "Mendengarkan..." : (status === 'speaking' ? "Berbicara..." : (status === 'connecting' ? "Menghubungkan..." : "Siap"))}
                    </p>
                </div>

                {/* Text Chat History */}
                <div className="flex-grow overflow-y-auto mb-4 bg-gray-900/50 rounded-lg p-3 text-left space-y-3 border border-gray-700 max-h-[25vh]">
                     {chatHistory.length === 0 && <p className="text-gray-500 text-center italic text-xs">Percakapan akan muncul di sini...</p>}
                     {chatHistory.map((msg, idx) => (
                         <div key={idx} className={`p-2 rounded text-sm ${msg.role === 'user' ? 'bg-cyan-900/40 ml-4' : 'bg-gray-800/60 mr-4'}`}>
                             <p className="font-bold text-xs mb-1 text-gray-400">{msg.role === 'user' ? 'Anda' : 'AI-HIJR'}</p>
                             <p className="text-gray-200">{msg.text}</p>
                         </div>
                     ))}
                </div>

                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs uppercase text-gray-400 font-bold">Pengaturan Suara</span>
                        <VolumeUpIcon className="w-4 h-4 text-gray-400"/>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1 text-left">Pilih Suara AI:</label>
                            <div className="grid grid-cols-2 gap-2">
                                {VOICE_OPTIONS.map(v => (
                                    <button 
                                        key={v.id}
                                        onClick={() => setSelectedVoice(v.id)}
                                        className={`text-xs p-2 rounded border ${selectedVoice === v.id ? 'bg-cyan-900/50 border-cyan-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs text-gray-400 block mb-1 text-left">Volume:</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* New Alarm Settings Section */}
                        <div className="border-t border-gray-700 pt-3 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlarmIcon className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs font-bold text-cyan-400">PENGATURAN ALARM</span>
                            </div>
                            <div className="h-32 overflow-y-auto pr-1 custom-scrollbar space-y-1 bg-black/20 p-2 rounded-lg border border-gray-700/50">
                                <AlarmToggle label="Tidur" isOn={alarms.tidur.isOn} onToggle={() => onToggleAlarm('tidur', !alarms.tidur.isOn)} />
                                <AlarmToggle label="Tahajud" isOn={alarms.tahajud.isOn} onToggle={() => onToggleAlarm('tahajud', !alarms.tahajud.isOn)} />
                                <AlarmToggle label="Sahur" isOn={alarms.sahur.isOn} onToggle={() => onToggleAlarm('sahur', !alarms.sahur.isOn)} />
                                <AlarmToggle label="Dhuha" isOn={alarms.dhuha.isOn} onToggle={() => onToggleAlarm('dhuha', !alarms.dhuha.isOn)} />
                                <AlarmToggle label="Shalat 5-Waktu" isOn={alarms.shalat5Waktu.isOn} onToggle={() => onToggleAlarm('shalat5Waktu', !alarms.shalat5Waktu.isOn)} />
                                <AlarmToggle label="Shalat Jum'at" isOn={alarms.jumat.isOn} onToggle={() => onToggleAlarm('jumat', !alarms.jumat.isOn)} />
                                <AlarmToggle label="Dzikir Pagi" isOn={alarms.dzikirPagi.isOn} onToggle={() => onToggleAlarm('dzikirPagi', !alarms.dzikirPagi.isOn)} />
                                <AlarmToggle label="Dzikir Petang" isOn={alarms.dzikirPetang.isOn} onToggle={() => onToggleAlarm('dzikirPetang', !alarms.dzikirPetang.isOn)} />
                                <AlarmToggle label="Doa Jum'at Petang" isOn={alarms.doaJumat.isOn} onToggle={() => onToggleAlarm('doaJumat', !alarms.doaJumat.isOn)} />
                            </div>
                        </div>
                        
                         <button 
                            onClick={handleSaveAndShare}
                            className="w-full py-2 bg-green-700 hover:bg-green-600 rounded text-xs font-bold text-white flex items-center justify-center gap-2 mt-2"
                        >
                            <SendIcon /> Save & Share
                        </button>
                        <p className="text-[10px] text-gray-500 italic">Klik tombol save, jika ingin merekam dan menyimpan hasil live percakapan.</p>
                    </div>
                </div>
                
                <div className="mt-4 text-[10px] text-gray-500">
                    <p>Topik terbatas pada: Islam, Quran, Hadist, Sejarah Nabi, Ibadah, peristiwa sejarah di kalender hijriah.</p>
                    <p className="mt-1 text-red-400/80">Jawaban yang diberikan oleh AI Assistant bertujuan untuk memberikan informasi dan tidak boleh dianggap sebagai fatwa. Untuk masalah Fiqih, silakan berkonsultasi dengan ulama atau ahli agama yang terpercaya.</p>
                </div>
            </div>
        </div>
    );
};
