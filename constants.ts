

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
    { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Aljazair' }, { code: 'US', name: 'Amerika Serikat' },
    { code: 'AU', name: 'Australia' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BA', name: 'Bosnia dan Herzegovina' },
    { code: 'BN', name: 'Brunei Darussalam' }, { code: 'BF', name: 'Burkina Faso' }, { code: 'CN', name: 'China' },
    { code: 'DJ', name: 'Djibouti' }, { code: 'PH', name: 'Filipina' }, { code: 'GM', name: 'Gambia' },
    { code: 'GN', name: 'Guinea' }, { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' },
    { code: 'GB', name: 'Inggris' }, { code: 'IQ', name: 'Irak' }, { code: 'IR', name: 'Iran' },
    { code: 'JP', name: 'Jepang' }, { code: 'DE', name: 'Jerman' }, { code: 'CA', name: 'Kanada' },
    { code: 'KG', name: 'Kirgistan' }, { code: 'KM', name: 'Komoro' }, { code: 'KR', name: 'Korea' },
    { code: 'XK', name: 'Kosovo' }, { code: 'LY', name: 'Libya' }, { code: 'MK', name: 'Macedonia' },
    { code: 'MY', name: 'Malaysia' }, { code: 'MV', name: 'Maldives' }, { code: 'ML', name: 'Mali' },
    { code: 'MA', name: 'Maroko' }, { code: 'MR', name: 'Mauritania' }, { code: 'EG', name: 'Mesir' },
    { code: 'ME', name: 'Montenegro' }, { code: 'NG', name: 'Nigeria' }, { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' }, { code: 'PS', name: 'Palestina' }, { code: 'FR', name: 'Perancis' },
    { code: 'QA', name: 'Qatar' }, { code: 'RU', name: 'Rusia' }, { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SG', name: 'Singapore' },
    { code: 'SO', name: 'Somalia' }, { code: 'SD', name: 'Sudan' }, { code: 'SR', name: 'Suriname' },
    { code: 'SY', name: 'Suriah' }, { code: 'TJ', name: 'Tajikistan' }, { code: 'TH', name: 'Thailand' },
    { code: 'TN', name: 'Tunisia' }, { code: 'TM', name: 'Turkmenistan' }, { code: 'AE', name: 'Uni Emirat Arab' }
].sort((a, b) => a.name.localeCompare(b.name));