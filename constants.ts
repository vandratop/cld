

import type { PrayerMethod } from './types';

export const SPECIAL_DAYS_COLORS = {
    NATIONAL_HOLIDAY: '#800080', // Purple for national holidays
    ISLAMIC_HOLIDAY: '#FF3131',
    RAMADAN: '#009688',
    AYYAMUL_BIDH: '#0D00FF',
    MONDAY_THURSDAY: '#21DEC4',
    OTHER_SUNNAH: '#1FCB0A',
    TODAY_BG: '#FFFFFF',
    TODAY_TEXT: '#00594C'
};

export const ALADHAN_API_BASE_URL = 'https://api.aladhan.com/v1';

export const PRAYER_METHODS: PrayerMethod[] = [
    { id: 20, name: 'Kemenag (Indonesia)' },
    { id: 3, name: 'Muslim World League' },
    { id: 2, name: 'ISNA (North America)' },
    { id: 4, name: 'Umm Al-Qura, Makkah' },
    { id: 5, name: 'Egyptian General Authority' },
    { id: 1, name: 'University of Islamic Sciences, Karachi' },
    { id: 8, name: 'Gulf Region' },
    { id: 10, name: 'Kuwait' },
    { id: 12, name: 'Qatar' },
    { id: 15, name: 'Majlis Ugama Islam Singapura' },
];

export const WEEKDAY_MAP: { [key:string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
};

export const COUNTRIES = [
    { code: 'ID', name: 'Indonesia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'BN', name: 'Brunei Darussalam' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'Uni Emirat Arab' },
    { code: 'TR', name: 'Turki' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'EG', name: 'Mesir' },
    { code: 'US', name: 'Amerika Serikat' },
    { code: 'GB', name: 'Inggris' },
    { code: 'JP', name: 'Jepang' },
    { code: 'KR', name: 'Korea Selatan' },
    { code: 'CN', name: 'China' },
    { code: 'RU', name: 'Rusia' },
    { code: 'DE', name: 'Jerman' },
    { code: 'FR', name: 'Perancis' },
];

export const LANGUAGES = [
    { code: 'id', name: 'Indonesia' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russia' },
    { code: 'ms', name: 'Melayu' },
    { code: 'fa', name: 'Persia' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ur', name: 'Urdu (Pakistan)' },
    { code: 'bn', name: 'Bengali (Bangladesh)' },
    { code: 'ps', name: 'Pashto (Afghanistan)' },
    { code: 'uz', name: 'Uzbekistan' },
    { code: 'az', name: 'Azerbaijan' },
    { code: 'ky', name: 'Kirgistan' },
    { code: 'tk', name: 'Turkmenistan' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ne', name: 'Nepali' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'sv', name: 'Swedish' },
    { code: 'pl', name: 'Polish' },
    { code: 'hy', name: 'Armenian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'sq', name: 'Albanian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'sw', name: 'Swahili (Africa)' },
    { code: 'so', name: 'Somali' },
];
