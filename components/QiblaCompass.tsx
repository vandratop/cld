import React, { useState, useEffect } from 'react';
import type { Location } from '../types';
import { CloseIcon, MapIcon } from './Icons';

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

    const fetchQiblaDirection = async (lat: number, lon: number) => {
        setError(null);
        try {
            const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data arah kiblat dari server.');
            }
            const data = await response.json();
            if (data.code === 200 && data.data && typeof data.data.direction === 'number') {
                setQiblaDirection(data.data.direction);
            } else {
                throw new Error('Format data kiblat tidak valid.');
            }
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
        }
    };

    const handleRequestPermission = () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission()
                .then((permissionState: string) => {
                    if (permissionState === 'granted') {
                        setPermissionGranted(true);
                    } else {
                        setError('Izin untuk mengakses orientasi perangkat ditolak.');
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                    setError('Gagal meminta izin orientasi perangkat.');
                });
        } else {
            // For non-iOS 13+ browsers
            setPermissionGranted(true);
        }
    };
    
    useEffect(() => {
        if (isOpen && location) {
            fetchQiblaDirection(location.latitude, location.longitude);
        }
    }, [isOpen, location]);

    useEffect(() => {
        if (!isOpen || !permissionGranted) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            let heading = event.alpha;
            // For iOS
            if (typeof (event as any).webkitCompassHeading !== 'undefined') {
                heading = (event as any).webkitCompassHeading;
            }
            if (heading !== null) {
                setCompassHeading(heading);
            } else {
                 setError('Tidak dapat membaca data kompas dari perangkat.');
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [isOpen, permissionGranted]);
    
    if (!isOpen) return null;

    const needleRotation = 360 - compassHeading + qiblaDirection;

    const openMap = () => {
        if (location) {
            // Kaaba coordinates: 21.4225° N, 39.8262° E
            const kaabaLat = 21.422487;
            const kaabaLon = 39.826206;
            const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${kaabaLat},${kaabaLon}`;
            window.open(url, '_blank');
        } else {
            setError("Lokasi Anda tidak tersedia untuk menampilkan peta.");
        }
    };

    // Explicit background to avoid transparency issues
    const isLightTheme = document.body.className.includes('light');
    const bgColor = isLightTheme ? 'bg-white' : 'bg-[#002b25]';
    const textColor = isLightTheme ? 'text-gray-900' : 'text-white';

    const renderContent = () => {
        if (!permissionGranted) {
            return (
                 <div className="text-center">
                    <p className="mb-4">Untuk menggunakan kompas, kami memerlukan izin untuk mengakses sensor orientasi perangkat Anda.</p>
                    <button onClick={handleRequestPermission} className="w-full p-2 bg-cyan-600 rounded neon-button text-white">
                        Berikan Izin
                    </button>
                 </div>
            );
        }
        
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="relative w-64 h-64">
                    {/* Compass Rose - Styled with rounded-full and neon effect */}
                    <div className="w-full h-full rounded-full shadow-[0_0_15px_var(--border-color),inset_0_0_10px_var(--border-color)] flex items-center justify-center bg-transparent overflow-hidden">
                        <img src="https://raw.githubusercontent.com/vandratop/Yuk/e4e4a8572bc82f134d2e62e24331d5d915edc3a4/Kabah_lingkar_NESW.png?raw=true" alt="Compass" className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                    </div>

                    {/* Qibla Needle */}
                    <div className="absolute inset-0 flex justify-center items-center transition-transform duration-500" style={{ transform: `rotate(${needleRotation}deg)`}}>
                         <img src="https://raw.githubusercontent.com/vandratop/Yuk/b7eca3cfcc1e3a41fba1b96e4c9fcb7b4edbf1d2/jarumredslvkpms.png?raw=true" alt="Qibla direction" className="h-full" style={{filter: 'drop-shadow(0 0 5px #fff)'}}/>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="font-bold text-lg neon-text">Arah Kiblat</p>
                    <p className="font-clock text-2xl">{qiblaDirection.toFixed(2)}°</p>
                    <button onClick={openMap} className="mt-3 inline-flex items-center gap-2 text-sm px-4 py-2 bg-gray-600 rounded-md neon-button text-white">
                        <MapIcon className="w-4 h-4"/>
                        Tampilkan di Peta
                    </button>
                    <p className="text-xs text-gray-400 mt-4">Untuk menampilkan arah Kiblat yang akurat, pastikan meletakkan device di permukaan (alas) yang rata, tidak bergelombang, posisi diam tidak bergerak, tidak bergetar. Pastikan ujung jarum jam warna silver bergerak (berputar) mencari arah Kiblat. Jika jarum kompas tidak berfungsi atau tidak akurat, silahkan refresh (close) ulangi kembali</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center pt-28 sm:pt-36 z-50 fade-in overflow-y-auto" onClick={onClose}>
            <div className={`main-container cyber-border rounded-lg p-6 w-full max-w-sm relative mb-8 ${bgColor} ${textColor}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-1"><CloseIcon /></button>
                <h3 className="font-bold text-lg mb-4 neon-text text-center">Kompas Kiblat</h3>
                {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
                {renderContent()}
            </div>
        </div>
    );
};