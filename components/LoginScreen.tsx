
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginScreenProps {
    onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        // Simulate Google Auth Delay
        setTimeout(() => {
            const mockUser: UserProfile = {
                name: "Pengguna AI-HIJR",
                email: "user@example.com",
                photoUrl: "https://raw.githubusercontent.com/vandratop/Yuk/3ca087bbe1dfa3822dc66f60ba3f8c2cdf0772b0/AI-HIJR_Chatbot.gif",
                isGuest: false
            };
            try {
                localStorage.setItem('hijri_user', JSON.stringify(mockUser));
            } catch (e) {}
            onLogin(mockUser);
            setIsLoading(false);
        }, 3000);
    };

    const handleGuestAccess = () => {
        const guestUser: UserProfile = {
            name: "Tamu",
            email: "",
            isGuest: true
        };
        onLogin(guestUser);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#002b25] text-white z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00ffdf] mb-6"></div>
                <p className="text-lg font-bold animate-pulse">⏳ Please wait, authentication progress...</p>
                <p className="text-sm text-gray-400 mt-2">Menghubungkan ke Google Account</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#002b25] text-white z-50 p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')` }}>
            </div>

            <div className="z-10 w-full max-w-md bg-black/40 backdrop-blur-md p-8 rounded-2xl cyber-border text-center">
                <img src="/logo.svg" alt="Logo" className="w-24 h-24 mx-auto mb-6 drop-shadow-[0_0_15px_#00ffdf]" />
                <h1 className="text-3xl font-bold mb-2 neon-text">AI-HIJR</h1>
                <p className="text-gray-300 mb-8 text-sm">Digital Kalender Hijriah & Asisten Islami</p>

                <div className="space-y-4">
                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full py-3 bg-white text-gray-800 font-bold rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Masuk dengan Google
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#002b25] px-2 text-gray-400">atau</span></div>
                    </div>

                    <button 
                        onClick={handleGuestAccess}
                        className="w-full py-3 bg-transparent border border-[#00ffdf] text-[#00ffdf] font-bold rounded-lg hover:bg-[#00ffdf]/10 transition-all neon-button"
                    >
                        Lanjutkan Tanpa Login
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2">*Akses terbatas untuk mode tamu.</p>
                </div>
            </div>
        </div>
    );
};
