
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CloseIcon, VolumeUpIcon, VolumeOffIcon } from './Icons';

interface VoiceAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

type VoiceOption = { name: string; id: string; accent: string };

const VOICE_OPTIONS: VoiceOption[] = [
    { name: 'Pria - USA', id: 'Puck', accent: 'en-US' },
    { name: 'Wanita - USA', id: 'Kore', accent: 'en-US' },
    { name: 'Pria - Arab', id: 'Fenrir', accent: 'ar-SA' },
    { name: 'Wanita - Indonesia', id: 'Zephyr', accent: 'id-ID' },
];

interface AudioBlob {
    data: string;
    mimeType: string;
}

function createBlob(data: Float32Array): AudioBlob {
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

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
    const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
    const [volume, setVolume] = useState(1.0);
    const [transcription, setTranscription] = useState('');
    const [audioLevels, setAudioLevels] = useState<number[]>(new Array(5).fill(10));
    const [chatLog, setChatLog] = useState<{role: 'user'|'model', text: string}[]>([]);

    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionRef = useRef<any>(null);
    const inputCtxRef = useRef<AudioContext | null>(null);
    const outputCtxRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        if (isOpen) {
            // Play greeting TTS immediately
            if (synth) {
                synth.cancel();
                const utterance = new SpeechSynthesisUtterance("Assalamualaikum warahmatullahi wabarakatuh");
                utterance.lang = 'id-ID';
                synth.speak(utterance);
            }
            startSession();
        } else {
            stopSession();
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
                            updateAudioLevels(50 + Math.random() * 30);
                            
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

                        // Handle text updates if available or turn complete events to update chat log
                        // Note: The audio-only model might not send text back unless configured. 
                        // We will simulate log updates based on status changes for visual feedback if actual text is missing.
                        if (msg.serverContent?.turnComplete) {
                             setChatLog(prev => [...prev, {role: 'model', text: '(Selesai berbicara)'}]);
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

    const handleSaveTranscript = () => {
        // Since we don't have full text from audio stream easily, we save a placeholder log
        const textContent = chatLog.map(entry => `${entry.role.toUpperCase()}: ${entry.text}`).join('\n') || "Percakapan Audio (Transkrip tidak tersedia penuh).";
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `percakapan_ai_hijr_${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 fade-in">
            <div className="absolute top-4 right-4">
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><CloseIcon /></button>
            </div>

            <div className="w-full max-w-md p-6 text-center flex flex-col h-full max-h-[90vh]">
                <div className="flex-shrink-0 mb-4 relative">
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

                <p className="text-gray-300 mb-4 min-h-[1.5rem] text-sm px-4 italic flex-shrink-0">
                    "{transcription}"
                </p>

                {/* Chat Log Area */}
                <div className="flex-1 bg-black/40 border border-gray-700 rounded-lg p-2 mb-4 overflow-y-auto text-left text-xs text-gray-300 space-y-1">
                    <p className="text-center text-gray-500 italic">Riwayat Percakapan (Log)</p>
                    {chatLog.map((log, idx) => (
                        <div key={idx} className={log.role === 'user' ? 'text-green-400' : 'text-cyan-400'}>
                            <span className="font-bold">{log.role === 'user' ? 'Anda' : 'AI'}:</span> {log.text}
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 flex-shrink-0">
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

                        <div className="text-center">
                            <button 
                                onClick={handleSaveTranscript}
                                className="text-xs px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-bold w-full"
                            >
                                Save & Share
                            </button>
                            <p className="text-[10px] text-gray-500 mt-1">klik tombol save, jika ingin merekam dan menyimpan hasil live percakapan</p>
                        </div>

                        <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-left">
                             <p className="text-[10px] text-yellow-500">
                                <strong>Disclaimer:</strong> Jawaban yang diberikan oleh AI Assistant bertujuan untuk memberikan informasi dan tidak boleh dianggap sebagai fatwa. Untuk masalah Fiqih, silakan berkonsultasi dengan ulama atau ahli agama yang terpercaya.
                             </p>
                        </div>
                    </div>
                </div>
                
                <p className="text-[10px] text-gray-500 mt-2">
                    Topik terbatas pada: Islam, Quran, Hadist, Sejarah Nabi, & Ibadah.
                </p>
            </div>
        </div>
    );
};
