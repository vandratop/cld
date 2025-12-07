
import React, { useState, useEffect } from 'react';
import type { Location } from '../types';
import { CloseIcon, MapIcon, ChevronLeftIcon } from './Icons';

interface QiblaCompassProps {
    isOpen: boolean;
    onClose: () => void;
    location: Location;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ isOpen, onClose, location }) => {
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [compassHeading, setCompassHeading] = useState(0);
    const [loading, setLoading] = useState(true);

    // Initial permission check for non-iOS devices
    useEffect(() => {
        if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
            setPermissionGranted(true);
        }
    }, []);

    const fetchQiblaDirection = async (lat: number, lon: number) => {
        if (lat === 0 && lon === 0) return; // Wait for valid location
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data arah kiblat.');
            }
            const data = await response.json();
            if (data.code === 200 && data.data) {
                setQiblaDirection(data.data.direction);
            }
        } catch (err) {
            console.error(err);
            // Fallback direction if API fails (approximate direction to Makkah from Indonesia)
            setQiblaDirection(295); 
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPermission = () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission()
                .then((permissionState: string) => {
                    if (permissionState === 'granted') {
                        setPermissionGranted(true);
                    } else {
                        setError('Izin akses orientasi ditolak.');
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                    setError('Gagal meminta izin orientasi.');
                });
        }
    };
    
    useEffect(() => {
        if (isOpen && location && (location.latitude !== 0 || location.longitude !== 0)) {
            fetchQiblaDirection(location.latitude, location.longitude);
        } else if (isOpen) {
             setLoading(true);
             // Timeout to stop loading state if location takes too long
             const timer = setTimeout(() => {
                 if (location.latitude === 0 && location.longitude === 0) {
                     setError("Menunggu lokasi GPS...");
                     setLoading(false);
                 }
             }, 5000);
             return () => clearTimeout(timer);
        }
    }, [isOpen, location]);

    useEffect(() => {
        if (!isOpen || !permissionGranted) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            let heading = event.alpha;
            // iOS specific handling
            if (typeof (event as any).webkitCompassHeading !== 'undefined') {
                heading = (event as any).webkitCompassHeading;
            }
            
            if (heading !== null) {
                // Smoothing factor
                setCompassHeading(prev => {
                    const diff = heading! - prev;
                    // Handle wrap-around 0/360
                    if (diff > 180) return prev + (diff - 360) * 0.1;
                    if (diff < -180) return prev + (diff + 360) * 0.1;
                    return prev + diff * 0.1;
                });
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [isOpen, permissionGranted]);
    
    if (!isOpen) return null;

    // Calculate rotation:
    // We rotate the COMPASS DISK opposite to the heading so "North" on disk points North.
    // The Qibla Marker is fixed on the disk at the Qibla Angle.
    const dialRotation = -compassHeading;

    const openMap = () => {
        const lat = location?.latitude || 0;
        const lon = location?.longitude || 0;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=21.422487,39.826206&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#002b25] text-white font-jannah animate-fade-in h-[100dvh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#00594C] shadow-lg z-20 shrink-0">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition-colors flex items-center gap-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                    <span className="hidden sm:inline font-bold">Kembali</span>
                </button>
                <h2 className="text-lg font-bold tracking-wider font-amiri">Arah Kiblat</h2>
                <div className="w-10"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden">
                
                {/* Background Decor */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')` }}>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center animate-pulse space-y-4">
                        <div className="w-40 h-40 rounded-full border-4 border-[#00ffdf]/30 bg-[#00352e]"></div>
                        <p className="text-cyan-400">Mencari lokasi & data kiblat...</p>
                    </div>
                ) : !permissionGranted ? (
                    <div className="text-center px-6 max-w-sm">
                        <div className="w-20 h-20 bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapIcon className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Izin Sensor Diperlukan</h3>
                        <p className="text-sm text-gray-300 mb-6">Aplikasi memerlukan izin akses sensor kompas untuk menunjukkan arah Ka'bah secara real-time.</p>
                        <button onClick={handleRequestPermission} className="w-full py-3 bg-[#00ffdf] hover:bg-cyan-400 text-[#002b25] rounded-xl font-bold shadow-lg transition-transform active:scale-95">
                            Berikan Izin Akses
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Status Text */}
                        <div className="text-center mb-8 z-10 relative">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Arah Perangkat</p>
                            <div className="text-4xl font-clock font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {Math.round(compassHeading)}°
                            </div>
                            <div className="mt-2 inline-block px-3 py-1 bg-[#00594C]/80 rounded-full border border-[#00ffdf]/30">
                                <p className="text-xs text-[#00ffdf]">Target Kiblat: <b>{qiblaDirection.toFixed(1)}°</b></p>
                            </div>
                        </div>

                        {/* Compass Visual */}
                        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
                            
                            {/* Outer Static Ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00ffdf]/20"></div>
                            
                            {/* Rotating Dial */}
                            <div 
                                className="w-full h-full rounded-full border-4 border-[#00ffdf]/50 bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(0,255,223,0.1)] relative transition-transform duration-300 ease-out will-change-transform"
                                style={{ transform: `rotate(${dialRotation}deg)` }}
                            >
                                {/* North Marker */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <span className="text-red-500 font-bold text-lg drop-shadow-md">N</span>
                                    <div className="w-1 h-3 bg-red-500 rounded-full"></div>
                                </div>

                                {/* South/East/West Ticks */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 font-bold text-xs">S</div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">E</div>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">W</div>

                                {/* Degree Ticks */}
                                {[...Array(12)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute top-0 left-1/2 w-0.5 h-2 bg-gray-600 origin-bottom"
                                        style={{ transform: `rotate(${i * 30}deg) translateY(10px) translateX(-50%)`, transformOrigin: '50% 150px' }}
                                    />
                                ))}

                                {/* THE KAABA MARKER (Fixed on the dial at Qibla Angle) */}
                                <div 
                                    className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 origin-center pointer-events-none"
                                    style={{ transform: `rotate(${qiblaDirection}deg)` }}
                                >
                                    {/* Line to Kaaba */}
                                    <div className="absolute top-4 left-1/2 w-0.5 h-[50%] bg-gradient-to-b from-[#00ffdf] to-transparent -translate-x-1/2"></div>
                                    
                                    {/* Icon */}
                                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-[#00ffdf]/20 rounded-full blur-md animate-pulse"></div>
                                            <span className="text-4xl relative z-10 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">🕋</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center User Point */}
                            <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] z-30 border-2 border-gray-300"></div>
                            
                            {/* Device Heading Indicator (Fixed Top) */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-white z-40 filter drop-shadow-md"></div>
                        </div>

                        {/* Footer / Map Button */}
                        <div className="mt-8 z-10 w-full max-w-xs">
                            <button 
                                onClick={openMap}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#00594C]/80 hover:bg-[#00594C] border border-[#00ffdf]/30 rounded-xl transition-all active:scale-95 text-sm font-bold backdrop-blur-md text-[#00ffdf]"
                            >
                                <MapIcon className="w-5 h-5"/>
                                Buka di Google Maps
                            </button>
                            <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                                *Pastikan GPS aktif dan jauhkan perangkat dari magnet.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
