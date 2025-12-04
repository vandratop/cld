

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

export const ALARM_MESSAGES: any = {
    id: {
        tidur: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder tiba waktunya untuk istirahat malam ini. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        tahajud: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu Qiyamullail untuk hari ini. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        sahur: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu Sahur untuk hari ini. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        dhuha: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu Shalat Dhuha untuk hari ini. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        jumat: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu shalat Jum'at akan segera tiba, mari persiapkan diri di awal waktu. Semoga Anda dalam keadaan Sehat Walafiat.",
        dzikirPagi: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu untuk Dzikir Pagi. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        dzikirPetang: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu untuk Dzikir Petang. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        doaJumat: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder untuk Doa Mustajab di Jum'at Petang. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.",
        shalat5Waktu: (name: string) => `Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu shalat ${name} akan segera tiba, mari persiapkan diri di awal waktu. Dan sempurnakan shalat wajib dengan shalat Sunnah rawatib. Semoga Anda dan keluarga dalam keadaan Sehat Walafiat.`
    },
    en: {
        tidur: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder it is time to rest tonight. May you and your family be in good health.",
        tahajud: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder it is time for Qiyamullail today. May you and your family be in good health.",
        sahur: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder it is time for Suhoor today. May you and your family be in good health.",
        dhuha: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder it is time for Duha prayer today. May you and your family be in good health.",
        jumat: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder Friday prayer time will arrive soon, let's prepare early. May you be in good health.",
        dzikirPagi: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder time for Morning Dhikr. May you and your family be in good health.",
        dzikirPetang: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder time for Evening Dhikr. May you and your family be in good health.",
        doaJumat: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder for Mustajab Prayer on Friday Evening. May you and your family be in good health.",
        shalat5Waktu: (name: string) => `Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder ${name} prayer time will arrive soon, let's prepare early. And perfect the obligatory prayer with Sunnah rawatib. May you and your family be in good health.`
    },
    ar: {
        tidur: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت الراحة لهذه الليلة. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        tahajud: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت قيام الليل لهذا اليوم. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        sahur: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت السحور لهذا اليوم. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        dhuha: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت صلاة الضحى لهذا اليوم. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        jumat: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، وقت صلاة الجمعة سيحين قريباً، فلنستعد مبكراً. أتمنى لك دوام الصحة والعافية.",
        dzikirPagi: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت أذكار الصباح. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        dzikirPetang: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت أذكار المساء. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        doaJumat: "السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، حان وقت الدعاء المستجاب في عشية الجمعة. أتمنى لك ولعائلتك دوام الصحة والعافية.",
        shalat5Waktu: (name: string) => `السلام عليكم ورحمة الله وبركاته، تذكير من AI-HIJR، وقت صلاة ${name} سيحين قريباً، فلنستعد مبكراً. وأتمم الصلاة المفروضة بالسنن الرواتب. أتمنى لك ولعائلتك دوام الصحة والعافية.`
    }
};

export const PRAYER_NAMES_TRANSLATION: any = {
    id: { Fajr: 'Subuh', Sunrise: 'Syuruk', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya' },
    en: { Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
    ar: { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' }
};

export const getLanguageFromCookie = (): 'id' | 'en' | 'ar' => {
    // Basic check for googtrans cookie set by Google Translate Widget or our Settings
    const match = document.cookie.match(/googtrans=\/id\/([a-z]{2})/);
    const lang = match ? match[1] : 'id';
    return (['id', 'en', 'ar'].includes(lang) ? lang : 'id') as 'id' | 'en' | 'ar';
};
