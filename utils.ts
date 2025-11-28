

export const GREGORIAN_MONTHS_ID: { [key: string]: string } = {
    'January': 'Januari',
    'February': 'Februari',
    'March': 'Maret',
    'April': 'April',
    'May': 'Mei',
    'June': 'Juni',
    'July': 'Juli',
    'August': 'Agustus',
    'September': 'September',
    'October': 'Oktober',
    'November': 'November',
    'December': 'Desember'
};

// Keys are based on the exact string returned by the Al-Adhan API v1
// Values are updated to common Indonesian spellings for consistency.
export const HIJRI_MONTHS_ID: { [key: string]: string } = {
    'Muḥarram': 'Muharram',
    'Ṣafar': 'Safar',
    'Rabīʿ al-Awwal': "Rabiul Awal",
    'Rabīʿ al-awwal': "Rabiul Awal",
    'Rabi\'ul Awal': "Rabiul Awal",
    'Rabīʿ al-Ākhir': "Rabiul Akhir",
    'Rabīʿ al-thānī': "Rabiul Akhir",
    'Rabi\'ul Akhir': "Rabiul Akhir",
    'Jumādā al-Ūlā': 'Jumadil Awal',
    'Jumādá al-ūlá': 'Jumadil Awal',
    'Jumadil Awal': 'Jumadil Awal',
    'Jumādā al-Ākhirah': 'Jumadil Akhir',
    'Jumādá al-ākhirah': 'Jumadil Akhir',
    'Jumadil Akhir': 'Jumadil Akhir',
    'Rajab': 'Rajab',
    "Shaʿbān": "Sya'ban",
    'Sya\'ban': "Sya'ban",
    'Ramaḍān': 'Ramadhan',
    'Ramadhan': 'Ramadhan',
    'Shawwāl': 'Syawal',
    'Syawwal': 'Syawal',
    'Dhū al-Qaʿdah': "Dzulqa'dah",
    'Dzulqa\'dah': "Dzulqa'dah",
    'Dhū al-Ḥijjah': 'Dzulhijjah',
    'Dzulhijjah': 'Dzulhijjah'
};

export const WEEKDAYS_EN_ID: { [key: string]: string } = {
    'Sunday': 'Ahad',
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu'
};

export const translateToIndonesian = (apiName: string, type: 'hijri' | 'gregorian' | 'weekday'): string => {
    switch(type) {
        case 'hijri':
            return HIJRI_MONTHS_ID[apiName] || apiName;
        case 'gregorian':
            return GREGORIAN_MONTHS_ID[apiName] || apiName;
        case 'weekday':
            return WEEKDAYS_EN_ID[apiName] || apiName;
        default:
            // Fallback for safety, though typescript should prevent this.
            return apiName;
    }
};
