
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { GoogleIcon } from './Icons';

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
                <p className="text-lg font-bold animate-pulse">⏳ Mohon tunggu, sedang memproses...</p>
                <p className="text-sm text-gray-400 mt-2">Menghubungkan ke Akun Google</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#002b25] text-white z-50 p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')` }}>
            </div>

            <div className="z-10 w-full max-w-md bg-black/40 backdrop-blur-md p-8 rounded-2xl cyber-border text-center shadow-[0_0_30px_rgba(0,255,223,0.1)]">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-[#00ffdf] rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <img src="https://github.com/vandratop/Yuk/blob/6c9505dee3fb6ef3b17088152437b8e64a64c01b/icon_menu_kaldr_Hij.png?raw=true" alt="Kalender Digital Hijriah" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_#00ffdf]" />
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 neon-text font-amiri tracking-wide">
                    Kalender Digital Hijriah
                </h1>
                <p className="text-gray-300 mb-8 text-sm font-light">
                    Solusi Jadwal Shalat & Asisten Islami Terpadu
                </p>

                <div className="space-y-4">
                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full py-3 bg-white text-gray-800 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] active:scale-95"
                    >
                        <GoogleIcon className="w-5 h-5"/>
                        Masuk dengan Google
                    </button>

                    <div className="relative py-3">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600/50"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#002b25]/80 px-3 text-gray-400 backdrop-blur-sm rounded">atau</span></div>
                    </div>

                    <button 
                        onClick={handleGuestAccess}
                        className="w-full py-3 bg-transparent border border-[#00ffdf]/50 text-[#00ffdf] font-bold rounded-xl hover:bg-[#00ffdf]/10 transition-all neon-button"
                    >
                        Lanjutkan Tanpa Login
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2">*Akses terbatas untuk mode tamu.</p>
                </div>
            </div>
            
            <p className="absolute bottom-6 text-[10px] text-gray-500 opacity-50">
                &copy; {new Date().getFullYear()} Digital Kalender Hijriah
            </p>
        </div>
    );
};
