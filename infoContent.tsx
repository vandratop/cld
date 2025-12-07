
import React from 'react';

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="font-bold text-lg mb-1 text-[var(--text-color-secondary)]">{title}</h4>
        <div className="space-y-2 text-justify">{children}</div>
    </div>
);

const Prayer: React.FC<{ title: string; arabic: string; latin: string; translation: string;}> = ({title, arabic, latin, translation}) => (
    <div className="my-3 p-3 border-l-4 border-[var(--text-color-secondary)] bg-black/20 rounded-r-lg">
        <p className="font-bold text-sm mb-2">{title}</p>
        <p className="text-right font-amiri text-xl mb-2">{arabic}</p>
        <p className="italic text-sm mb-1">{latin}</p>
        <p className="text-xs text-gray-300">Artinya: "{translation}"</p>
    </div>
);


const PUASA_SUB_PAGES = [
    { key: 'puasa-ramadhan', title: "Puasa Ramadhan" },
    { key: 'puasa-senin-kamis', title: "Puasa Sunnah Senin & Kamis" },
    { key: 'puasa-ayyamul-bidh', title: "Puasa Sunnah Ayyamul Bidh" },
    { key: 'puasa-syawal', title: "Puasa Sunnah Syawal" },
    { key: 'puasa-arafah', title: "Puasa Sunnah Arafah" },
    { key: 'puasa-awal-dzulhijjah', title: "Puasa Sunnah Awal Dzulhijjah" },
    { key: 'puasa-tasua', title: "Puasa Sunnah Tasu'a" },
    { key: 'puasa-asyura', title: "Puasa Sunnah Asyura" },
    { key: 'puasa-syaban', title: "Puasa Sunnah Sya'ban" },
    { key: 'puasa-daud', title: "Puasa Sunnah Daud" },
];

const HARI_RAYA_SUB_PAGES = [
    { key: 'hari-raya-tahun-baru', title: "Tahun Baru Hijriah" },
    { key: 'hari-raya-idul-fitri', title: "Hari Raya Idul Fitri" },
    { key: 'hari-raya-idul-adha', title: "Hari Raya Idul Adha" },
];

const FAQ_CONTENT = [
    { key: 'faq-akurasi', title: "Apakah tanggal Hijriah di aplikasi ini akurat?" },
    { key: 'faq-lokasi', title: "Mengapa jadwal shalat berbeda dengan masjid dekat rumah?" },
    { key: 'faq-notifikasi', title: "Mengapa notifikasi adzan tidak berbunyi?" },
    { key: 'faq-chatbot', title: "Apakah jawaban AI Chatbot bisa dijadikan rujukan hukum?" },
];

const INFO_DETAILS: { [key: string]: { title: string, content: React.ReactNode }} = {
    // --- PUASA ---
    'puasa-ramadhan': {
        title: "Panduan Puasa Ramadhan",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa di bulan Ramadhan adalah salah satu dari lima Rukun Islam. Hukumnya adalah Fardhu 'Ain (wajib) bagi setiap Muslim yang baligh, berakal, sehat, dan tidak sedang dalam perjalanan (musafir) atau halangan syar'i lainnya (seperti haid bagi wanita). Perintah ini tercantum jelas dalam Al-Quran:</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic">"Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa." (QS. Al-Baqarah: 183)</blockquote>
                </InfoSection>
                <InfoSection title="Tata Cara dan Waktu">
                    <p>Puasa dimulai dari terbit fajar (masuknya waktu Subuh) hingga terbenam matahari (masuknya waktu Maghrib). Selama waktu tersebut, seorang Muslim menahan diri dari makan, minum, dan segala sesuatu yang membatalkan puasa, disertai dengan niat yang tulus karena Allah Subhanahu wa Ta’ala ﷻ.</p>
                </InfoSection>
                <InfoSection title="Doa-Doa Terkait Puasa Ramadhan">
                     <Prayer 
                        title="Niat Puasa Ramadhan (dilakukan di malam hari)"
                        arabic="نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلّٰهِ تَعَالَى"
                        latin="Nawaitu shauma ghadin 'an adā'i fardhi syahri Ramadhāna hādzihis sanati lillāhi ta'ālā."
                        translation="Aku niat berpuasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini, karena Allah Ta'ala."
                    />
                    <Prayer 
                        title="Doa Berbuka Puasa (Umum)"
                        arabic="ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللهُ"
                        latin="Dzahabazh zhama'u wabtallatil 'uruqu, wa tsabatal ajru, insya Allah."
                        translation="Telah hilang dahaga, telah basah kerongkongan, dan semoga الْajr tetap, insya Allah."
                    />
                </InfoSection>
            </div>
        )
    },
     'puasa-senin-kamis': {
        title: "Panduan Puasa Senin & Kamis",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa pada hari Senin dan Kamis adalah puasa sunnah muakkadah, artinya sangat dianjurkan. Rasulullah ﷺ Shallallahu ‘Alaihi wa Sallam rutin melaksanakannya. Keutamaannya adalah karena pada dua hari ini, amal perbuatan manusia dilaporkan kepada Allah Subhanahu wa Ta’ala ﷻ.</p>
                     <blockquote className="border-l-4 border-gray-500 pl-4 italic">Dari Abu Hurairah Radhiyallahu ‘anhu, Rasulullah ﷺ bersabda, "Amal-amal perbuatan itu diajukan (kepada Allah) pada hari Senin dan Kamis, maka aku suka jika amal perbuatanku diajukan sedangkan aku dalam keadaan berpuasa." (HR. Tirmidzi).</blockquote>
                </InfoSection>
                <InfoSection title="Tata Cara dan Waktu">
                    <p>Tata caranya sama seperti puasa pada umumnya, yaitu menahan diri dari yang membatalkan puasa dari terbit fajar hingga terbenam matahari. Niat puasa sunnah Senin atau Kamis boleh dilakukan pada pagi hari selama belum melakukan hal-hal yang membatalkan puasa sejak fajar.</p>
                </InfoSection>
                 <InfoSection title="Doa-Doa Terkait Puasa Senin & Kamis">
                     <Prayer 
                        title="Niat Puasa Hari Senin"
                        arabic="نَوَيْتُ صَوْمَ يَوْمِ الِاثْنَيْنِ لِلّٰهِ تَعَالَى"
                        latin="Nawaitu sauma yaumal itsnaini lillahi ta'ala."
                        translation="Aku niat berpuasa hari Senin, karena Allah ta'ala."
                    />
                     <Prayer 
                        title="Niat Puasa Hari Kamis"
                        arabic="نَوَيْتُ صَوْمَ يَوْمِ الْخَمِيْسِ لِلّٰهِ تَعَالَى"
                        latin="Nawaitu sauma yaumal khomiisi lillahi ta'ala."
                        translation="Aku niat berpuasa hari Kamis, karena Allah ta'ala."
                    />
                </InfoSection>
            </div>
        )
    },
    'puasa-ayyamul-bidh': {
        title: "Panduan Puasa Ayyamul Bidh",
        content: (
             <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa Ayyamul Bidh atau "hari-hari putih" adalah puasa sunnah yang dilaksanakan pada tanggal 13, 14, dan 15 setiap bulan dalam kalender Hijriah. Disebut hari putih karena pada malam-malam tersebut, bulan purnama bersinar terang. Keutamaannya adalah seperti berpuasa sepanjang tahun.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic">Rasulullah ﷺ bersabda, "Puasa tiga hari setiap bulan, itu seperti puasa sepanjang tahun." (HR. Bukhari dan Muslim).</blockquote>
                </InfoSection>
                <InfoSection title="Tata Cara dan Waktu">
                     <p>Dilaksanakan pada pertengahan bulan Hijriah dengan menahan diri dari yang membatalkan puasa dari fajar hingga maghrib. Niat bisa dilakukan di malam hari atau di pagi hari sebelum tergelincir matahari, asalkan belum makan atau minum.</p>
                </InfoSection>
                <InfoSection title="Doa-Doa Terkait Puasa Ayyamul Bidh">
                     <Prayer 
                        title="Niat Puasa Ayyamul Bidh"
                        arabic="نَوَيْتُ صَوْمَ أَيَّامِ الْبِيْضِ لِلّٰهِ تَعَالَى"
                        latin="Nawaitu sauma ayyamil bidl lillahi ta'ala."
                        translation="Aku niat berpuasa Ayyamul Bidh, karena Allah ta'ala."
                    />
                </InfoSection>
            </div>
        )
    },
     'puasa-daud': {
        title: "Panduan Puasa Daud",
        content: (
             <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa Daud adalah puasa sunnah yang paling utama dan paling disukai oleh Allah Subhanahu wa Ta’ala ﷻ. Pola puasanya adalah selang-seling: sehari berpuasa, dan hari berikutnya tidak berpuasa. Puasa ini meneladani kebiasaan Nabi Daud Alaihis Salam.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic">Rasulullah ﷺ Shallallahu ‘Alaihi wa Sallam bersabda, "Puasa yang paling disukai di sisi Allah adalah puasa Daud... beliau berpuasa sehari dan berbuka sehari." (HR. Bukhari dan Muslim).</blockquote>
                </InfoSection>
                <InfoSection title="Tata Cara dan Waktu">
                     <p>Puasa ini dilakukan secara konsisten sepanjang tahun, kecuali pada hari-hari yang diharamkan untuk berpuasa (Hari Raya Idul Fitri, Idul Adha, dan hari Tasyrik). Niatnya cukup di dalam hati untuk melaksanakan puasa sunnah Daud karena Allah Subhanahu wa Ta’ala ﷻ.</p>
                </InfoSection>
                 <InfoSection title="Doa-Doa Terkait Puasa Daud">
                     <Prayer 
                        title="Niat Puasa Daud"
                        arabic="نَوَيْتُ صَوْمَ دَاوُدَ سُنَّةً لِلّٰهِ تَعَالَى"
                        latin="Nawaitu sauma dawuda sunnatal lillahi ta'ala."
                        translation="Aku niat puasa Daud, sunnah karena Allah ta'ala."
                    />
                </InfoSection>
            </div>
        )
    },
    'puasa-syawal': {
        title: "Puasa Sunnah Syawal",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa Syawal adalah puasa sunnah sebanyak enam hari yang dilakukan di bulan Syawal, setelah selesai menunaikan puasa Ramadhan. Keutamaannya sangat besar, yaitu seperti berpuasa sepanjang tahun.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">مَنْ صَامَ رَمَضَانَ. ثُمَّ أَتْبَعَهُ سِنًّا مِنْ شَوَّالِ. كَانَ كَصِيَامِ الدَّهْرِ</p>
                        <p>Dari Abu Ayyub Al-Anshory, Rasulullah ﷺ bersabda, "Barang siapa berpuasa Ramadhan, kemudian melanjutkan dengan berpuasa enam hari pada bulan Syawal, maka seperti ia berpuasa sepanjang tahun.” (HR. Muslim).</p>
                    </blockquote>
                </InfoSection>
                <InfoSection title="Catatan Penting">
                    <ul className="list-disc pl-5">
                        <li>Puasa Syawal tidak boleh dilakukan pada hari pertama Syawal (Hari Raya Idul Fitri) karena hari tersebut diharamkan untuk berpuasa.</li>
                        <li>Puasa ini tidak harus dilakukan secara berurutan, namun lebih utama untuk bersegera dalam mengerjakannya.</li>
                        <li>Jika memiliki utang puasa Ramadhan, dianjurkan untuk membayar utang puasa terlebih dahulu sebelum melaksanakan puasa Syawal.</li>
                    </ul>
                </InfoSection>
            </div>
        )
    },
    'puasa-arafah': {
        title: "Puasa Sunnah Arafah",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa Arafah adalah puasa sunnah yang dilaksanakan pada tanggal 9 Dzulhijjah, yaitu hari ketika para jamaah haji sedang melaksanakan wukuf di Padang Arafah. Puasa ini sangat dianjurkan bagi umat Islam yang tidak sedang menunaikan ibadah haji.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">صِيَامٍ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ. وَالسَّنَةَ الَّتِي بَعْدَهُ</p>
                        <p>Rasulullah ﷺ bersabda, "Puasa pada hari Arafah, aku berharap kepada Allah agar mengampuni dosa-dosa setahun yang telah lalu dan setahun yang akan datang.” (HR. Muslim).</p>
                    </blockquote>
                </InfoSection>
                <InfoSection title="Catatan Penting">
                    <p>Bagi orang yang sedang melaksanakan ibadah haji, lebih utama untuk tidak berpuasa pada hari Arafah agar memiliki kekuatan untuk beribadah dan berdoa, sebagaimana yang dicontohkan oleh Rasulullah ﷺ.</p>
                </InfoSection>
            </div>
        )
    },
    'puasa-awal-dzulhijjah': {
        title: "Puasa Sunnah Awal Dzulhijjah",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Amal sholeh yang dilakukan pada 10 hari pertama bulan Dzulhijjah sangat dicintai oleh Allah Subhanahu wa Ta’ala ﷻ, melebihi hari-hari lainnya. Di antara amalan yang sangat dianjurkan pada hari-hari ini adalah berpuasa, khususnya dari tanggal 1 hingga 9 Dzulhijjah.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">«مَا مِنْ أَيَّامٍ الْعَمَلُ الصَّالِحُ فِيهَا أَحَبُّ إِلَى اللَّهِ مِنْ هَذِهِ الْأَيَّامِ ». يَعْنِي أَيَّامَ الْعَشْرِ.</p>
                        <p>Dari Ibnu 'Abbas, Rasulullah ﷺ bersabda, “Tidak ada satu amal sholeh yang lebih dicintai oleh Allah melebihi amal sholeh yang dilakukan pada hari-hari ini (yaitu 10 hari pertama bulan Dzul Hijjah).” (HR. Abu Daud, Tirmidzi, Ibnu Majah, dan Ahmad. Shahih).</p>
                    </blockquote>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">كَانَ رَسُولُ اللَّهِ - صلى الله عليه وسلم - يَصُومُ تِسْعَ ذِي الْحِجَّةِ وَيَوْمَ عَاشُورَاءَ وَثَلَاثَةَ أَيَّامٍ مِنْ كُلِّ شَهْرٍ أَوَّلَ اثْنَيْنِ مِنَ الشَّهْرِ وَالْخَمِيسَ.</p>
                        <p>Dari Hunaidah bin Kholid, dari istrinya, beberapa istri Nabi ﷺ mengatakan, "Rasulullah ﷺ biasa berpuasa pada sembilan hari awal Dzulhijah, pada hari 'Asyura' (10 Muharram), berpuasa tiga hari setiap bulannya..." (HR. Abu Daud. Shahih).</p>
                    </blockquote>
                </InfoSection>
                <InfoSection title="Catatan Penting">
                    <p>Puasa ini mencakup puasa Arafah pada tanggal 9 Dzulhijjah, yang memiliki keutamaan menghapus dosa dua tahun. Umat Islam diharamkan berpuasa pada tanggal 10 Dzulhijjah (Hari Raya Idul Adha) dan hari-hari Tasyrik (11, 12, dan 13 Dzulhijjah).</p>
                </InfoSection>
            </div>
        )
    },
    'puasa-tasua': {
        title: "Puasa Sunnah Tasu'a",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa Tasu'a adalah puasa sunnah yang dilaksanakan pada tanggal 9 Muharram. Puasa ini dianjurkan untuk dikerjakan bersamaan dengan puasa Asyura (10 Muharram) untuk menyelisihi (membedakan diri dari) kebiasaan ibadah orang Yahudi yang hanya berpuasa pada tanggal 10 Muharram.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">لَئِنْ بَقِيْتُ إِلَى قَابِلٍ لَأَصُوْمَنَّ التَاسِعَ</p>
                        <p>Rasulullah ﷺ bersabda, “Sungguh jika aku masih hidup sampai tahun depan aku akan berpuasa pada hari yang kesembilan." (HR. Muslim). Namun, beliau wafat sebelum sempat melaksanakannya.</p>
                    </blockquote>
                </InfoSection>
                <InfoSection title="Catatan Penting">
                    <p>Imam Nawawi, Imam Syafi'i, dan ulama lainnya berpandangan bahwa disunnahkan untuk berpuasa pada tanggal 9 dan 10 Muharram sekaligus.</p>
                </InfoSection>
            </div>
        )
    },
    'puasa-asyura': {
        title: "Puasa Sunnah Asyura",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Puasa Asyura adalah puasa sunnah yang dilaksanakan pada tanggal 10 Muharram. Puasa ini memiliki keutamaan yang besar, yaitu dapat menghapus dosa-dosa setahun yang telah lalu.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">وَسُئِلَ عَنْ صَوْمِ يَوْمٍ عَاشُورَاءَ فَقَالَ « يُكَفِّرُ السَّنَةَ الْمَاضِيَةَ</p>
                        <p>Nabi ﷺ ditanya mengenai keistimewaan puasa 'Asyura? Beliau menjawab, "Puasa 'Asyura akan menghapus dosa setahun yang lalu.” (HR. Muslim).</p>
                    </blockquote>
                </InfoSection>
                <InfoSection title="Tata Cara Pelaksanaan">
                    <p>Ada beberapa tingkatan dalam menjalankan puasa Asyura:</p>
                    <ul className="list-decimal pl-5">
                        <li>Yang paling utama: Berpuasa tiga hari, yaitu tanggal 9, 10, dan 11 Muharram.</li>
                        <li>Tingkatan kedua: Berpuasa pada tanggal 9 dan 10 Muharram.</li>
                        <li>Tingkatan ketiga: Berpuasa hanya pada tanggal 10 Muharram.</li>
                    </ul>
                </InfoSection>
            </div>
        )
    },
    'puasa-syaban': {
        title: "Puasa Sunnah Sya'ban",
        content: (
            <div>
                <InfoSection title="Penjelasan, Hukum, dan Dalil">
                    <p>Bulan Sya'ban adalah bulan di mana Rasulullah ﷺ paling banyak melakukan puasa sunnah di luar Ramadhan. Ini adalah bulan persiapan spiritual sebelum memasuki bulan suci Ramadhan.</p>
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2">
                        <p className="font-amiri text-lg text-right">فَمَا رَأَيْتُ رَسُوْلَ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ اسْتَكْمَلَ صِيَامَ شَهْرٍ إِلَّا رَمَضَانَ، وَمَا رَأَيْتُهُ أَكْثَرَ صِيَامًا مِنْهُ فِي شَعْبَانَ</p>
                        <p>Dari 'Aisyah radhiyallahu ‘anha, beliau berkata, "Saya tidak pernah melihat Rasulullah ﷺ berpuasa sebulan penuh kecuali pada bulan Ramadhan, dan tidaklah saya melihat beliau memperbanyak puasa dalam suatu bulan seperti banyaknya beliau berpuasa pada bulan Sya'ban.” (HR. Bukhari).</p>
                    </blockquote>
                </InfoSection>
                <InfoSection title="Catatan Penting">
                    <ul className="list-disc pl-5">
                        <li>Tidak dianjurkan mengkhususkan puasa atau amalan lain pada pertengahan bulan Sya'ban (Nisfu Sya'ban), karena dalil-dalil yang ada sangat lemah atau palsu.</li>
                        <li>Hendaknya tidak berpuasa pada hari syak (hari yang meragukan, yaitu satu atau dua hari terakhir Sya'ban), kecuali bagi seseorang yang kebetulan bertepatan dengan puasa yang biasa dilakukannya (seperti puasa Daud atau Senin-Kamis).</li>
                    </ul>
                </InfoSection>
            </div>
        )
    },

    // --- HARI RAYA ---
    'hari-raya-tahun-baru': {
        title: "Panduan Tahun Baru Hijriah",
        content: (
            <div>
                <InfoSection title="Penjelasan dan Sejarah">
                    <p>Tahun Baru Islam diperingati setiap tanggal 1 Muharram. Ini bukanlah hari raya untuk perayaan berlebihan, melainkan momen penting untuk refleksi dan introspeksi. Tanggal ini menandai peristiwa hijrahnya Nabi Muhammad ﷺ Shallallahu ‘Alaihi wa Sallam dari Mekkah ke Madinah, yang menjadi tonggak berdirinya masyarakat Islam yang mandiri dan menyebarnya dakwah secara luas. Penetapan 1 Muharram sebagai awal kalender Hijriah dilakukan pada masa Khalifah Umar bin Khattab Radhiyallahu ‘anhu.</p>
                </InfoSection>
                 <InfoSection title="Ibadah dan Aktivitas Umum">
                     <p>Tidak ada ibadah khusus yang disyariatkan secara spesifik untuk menyambut tahun baru. Namun, momen ini sangat baik digunakan untuk:</p>
                     <ul className="list-disc pl-5">
                         <li>Muhasabah (introspeksi) diri atas amalan setahun yang telah berlalu.</li>
                         <li>Memperbarui tekad dan niat untuk menjadi lebih baik di tahun yang akan datang.</li>
                         <li>Memperbanyak doa, dzikir, dan istighfar.</li>
                         <li>Menyantuni anak yatim, terutama pada hari Asyura (10 Muharram).</li>
                     </ul>
                </InfoSection>
                <InfoSection title="Doa Awal dan Akhir Tahun">
                     <Prayer 
                        title="Doa Akhir Tahun (dibaca sebelum Maghrib 29/30 Dzulhijjah)"
                        arabic="اَللّٰهُمَّ مَا عَمِلْتُ مِنْ عَمَلٍ فِي هٰذِهِ السَّنَةِ مَا نَهَيْتَنِي عَنْهُ وَلَمْ أَتُبْ مِنْهُ وَحَلُمْتَ فِيْها عَلَيَّ بِفَضْلِكَ بَعْدَ قُدْرَتِكَ عَلَى عُقُوْبَتِيْ وَدَعَوْتَنِيْ إِلَى التَّوْبَةِ مِنْ بَعْدِ جَرَاءَتِيْ عَلَى مَعْصِيَتِكَ فَإِنِّي اسْتَغْفَرْتُكَ فَاغْفِرْلِيْ وَمَا عَمِلْتُ فِيْهَا مِمَّا تَرْضَى وَوَعَدْتَّنِي عَلَيْهِ الثَّوَابَ فَأَسْئَلُكَ أَنْ تَتَقَبَّلَ مِنِّيْ وَلَا تَقْطَعْ رَجَائِيْ مِنْكَ يَا كَرِيْمُ"
                        latin="Allâhumma mâ ‘amiltu min ‘amalin fî hâdzihis sanati mâ nahaitanî ‘anhu, wa lam atub minhu, wa hamalta fîhâ ‘alayya bi fadhlika ba‘da qudratika ‘alâ ‘uqûbatî, wa da‘autanî ilat taubati min ba‘di jarâ’atî ‘alâ ma‘shiyatik. Fa innî istaghfartuka, faghfirlî wa mâ ‘amiltu fîhâ mimmâ tardhâ, wa wa‘attanî ‘alaihits tsawâba, fa’as’aluka an tataqabbala minnî wa lâ taqtha‘ rajâ’î minka yâ karîm."
                        translation="Ya Allah, aku meminta ampun atas perbuatanku di tahun ini yang termasuk Kau larang-sementara aku belum sempat bertobat, perbuatanku yang Kau maklumi karena kemurahan-Mu-sementara Kau mampu menyiksaku, dan perbuatan (dosa) yang Kau perintahkan untuk tobat-sementara aku menerjangnya yang berarti mendurhakai-Mu. Karenanya aku memohon ampun kepada-Mu. Ampunilah aku. Ya Allah, aku berharap Kau menerima perbuatanku yang Kau ridhai di tahun ini dan perbuatanku yang terjanjikan pahala-Mu. Janganlah pupuskan harapanku. Wahai Tuhan Yang Maha Pemurah."
                    />
                     <Prayer 
                        title="Doa Awal Tahun (dibaca setelah Maghrib 1 Muharram)"
                        arabic="اَللّٰهُمَّ أَنْتَ الْأَبَدِيُّ الْقَدِيْمُ الْأَوَّلُ وَعَلَى فَضْلِكَ الْعَظِيْمِ وَكَرِيْمِ جُوْدِكَ الْمُعَوَّلُ، وَهٰذَا عَامٌ جَدِيْدٌ قَدْ أَقْبَلَ، أَسْأَلُكَ الْعِصْمَةَ فِيْهِ مِنَ الشَّيْطَانِ وَأَوْلِيَائِهِ، وَالْعَوْنَ عَلَى هٰذِهِ النَّفْسِ الْأَمَّارَةِ بِالسُّوْءِ، وَالْاِشْتِغَالَ بِمَا يُقَرِّبُنِيْ إِلَيْكَ زُلْفَى يَا ذَا الْجَلَالِ وَالْإِكْرَامِ"
                        latin="Allâhumma antal abadiyyul qadîmul awwal. Wa ‘alâ fadhlikal ‘azhîmi wa karîmi jûdikal mu‘awwal. Wa hâdzâ ‘âmun jadîdun qad aqbal. As’alukal ‘ishmata fîhi minas syaithâni wa auliyâ’ih, wal ‘auna ‘alâ hâdzihin nafsil ammârati bis sû’i, wal isytighâla bimâ yuqarribunî ilaika zulfâ, yâ dzal jalâli wal ikrâm."
                        translation="Ya Allah, Engkau yang Abadi, Qadim, dan Awal. Atas karunia-Mu yang besar dan kemurahan-Mu yang mulia, Engkau menjadi andalan. Tahun baru ini sudah tiba. Aku berlindung kepada-Mu dari bujukan Iblis dan para walinya di tahun ini. Aku pun mengharap pertolongan-Mu dalam mengatasi nafsu yang kerap mendorongku berlaku jahat. Kepada-Mu, aku memohon bimbingan agar aktivitas keseharian mendekatkanku pada-Mu. Wahai Tuhan Pemilik Kebesaran dan Kemuliaan."
                    />
                </InfoSection>
            </div>
        )
    },
    'hari-raya-idul-fitri': {
        title: "Panduan Idul Fitri",
        content: (
            <div>
                <InfoSection title="Penjelasan dan Makna">
                    <p>Idul Fitri, yang jatuh pada 1 Syawal, adalah hari raya kemenangan bagi umat Islam setelah sebulan penuh berpuasa di bulan Ramadhan. Disebut juga "Hari Kembali ke Fitrah" karena umat Islam yang telah berpuasa dan diampuni dosanya kembali suci seperti bayi yang baru lahir. Ini adalah hari syukur, kegembiraan, dan saling memaafkan.</p>
                </InfoSection>
                <InfoSection title="Amalan Sunnah di Hari Raya">
                    <ul className="list-disc pl-5">
                        <li><strong>Mandi dan Berpakaian Terbaik:</strong> Disunnahkan untuk mandi sebelum berangkat shalat Id dan memakai pakaian terbaik yang dimiliki.</li>
                        <li><strong>Makan Sebelum Shalat Id:</strong> Sunnah untuk makan beberapa butir kurma (dalam jumlah ganjil) atau makanan ringan lainnya sebelum berangkat shalat Idul Fitri, sebagai tanda bahwa hari itu tidak lagi berpuasa.</li>
                        <li><strong>Mengumandangkan Takbir:</strong> Memperbanyak takbir sejak terbenamnya matahari di malam terakhir Ramadhan hingga imam memulai shalat Id.</li>
                        <li><strong>Shalat Idul Fitri:</strong> Melaksanakan shalat Idul Fitri secara berjamaah di lapangan atau masjid.</li>
                        <li><strong>Mengambil Jalan yang Berbeda:</strong> Disunnahkan untuk mengambil rute yang berbeda saat pergi dan pulang dari tempat shalat Id.</li>
                        <li><strong>Saling Mengucapkan Selamat:</strong> Mengucapkan "Taqabbalallahu minna wa minkum" (Semoga Allah menerima amalku dan amal kalian).</li>
                    </ul>
                </InfoSection>
                <InfoSection title="Zakat Fitrah">
                    <p>Sebelum pelaksanaan shalat Idul Fitri, setiap Muslim yang mampu wajib menunaikan Zakat Fitrah. Zakat ini berfungsi untuk menyucikan orang yang berpuasa dari perbuatan sia-sia dan kata-kata kotor, serta sebagai makanan bagi orang-orang miskin agar mereka dapat ikut merasakan kegembiraan di hari raya.</p>
                </InfoSection>
            </div>
        )
    },
    'hari-raya-idul-adha': {
        title: "Panduan Idul Adha",
        content: (
            <div>
                <InfoSection title="Penjelasan dan Makna">
                    <p>Idul Adha, atau Hari Raya Kurban, diperingati setiap tanggal 10 Dzulhijjah. Hari raya ini merupakan puncak dari ibadah haji dan menandai peringatan atas ketaatan Nabi Ibrahim Alaihis Salam yang bersedia mengorbankan putranya, Ismail Alaihis Salam, atas perintah Allah Subhanahu wa Ta’ala ﷻ. Idul Adha mengajarkan makna pengorbanan, keikhlasan, dan kepedulian sosial.</p>
                </InfoSection>
                <InfoSection title="Ibadah Utama">
                    <ul className="list-disc pl-5">
                        <li><strong>Shalat Idul Adha:</strong> Dilaksanakan pada pagi hari tanggal 10 Dzulhijjah, mirip dengan shalat Idul Fitri. Disunnahkan untuk tidak makan sebelum melaksanakan shalat Idul Adha.</li>
                        <li><strong>Menyembelih Hewan Kurban (Udhiyah):</strong> Ibadah utama pada hari ini adalah menyembelih hewan kurban (seperti kambing, domba, sapi, atau unta) bagi yang mampu. Waktu penyembelihan dimulai setelah shalat Id hingga akhir hari Tasyrik (13 Dzulhijjah). Daging kurban kemudian dibagikan kepada keluarga, tetangga, dan terutama fakir miskin.</li>
                        <li><strong>Mengumandangkan Takbir:</strong> Takbir muqayyad (setelah shalat fardhu) dan takbir mursal (setiap saat) dikumandangkan mulai dari Subuh hari Arafah (9 Dzulhijjah) hingga akhir hari Tasyrik.</li>
                    </ul>
                </InfoSection>
                <InfoSection title="Hari Tasyrik">
                    <p>Tanggal 11, 12, dan 13 Dzulhijjah disebut sebagai hari Tasyrik. Pada hari-hari ini, umat Islam diharamkan untuk berpuasa dan dianjurkan untuk menikmati makanan dan minuman sebagai bentuk syukur kepada Allah Subhanahu wa Ta’ala ﷻ.</p>
                </InfoSection>
            </div>
        )
    },

    // --- FAQ ---
    'faq-akurasi': {
        title: "Apakah tanggal Hijriah di aplikasi ini akurat?",
        content: (
            <InfoSection title="Akurasi Kalender">
                <p>Aplikasi ini menggunakan metode perhitungan hisab (perhitungan astronomis) standar Umm Al-Qura dan Kemenag. Namun, penetapan awal bulan Ramadhan, Syawal, dan Dzulhijjah di Indonesia secara resmi dilakukan melalui sidang isbat oleh pemerintah. Oleh karena itu, mungkin terjadi perbedaan 1 hari antara perhitungan di aplikasi ini dengan ketetapan pemerintah. Kami sarankan untuk mengikuti keputusan resmi pemerintah setempat untuk hari-hari besar tersebut.</p>
            </InfoSection>
        )
    },
    'faq-lokasi': {
        title: "Mengapa jadwal shalat berbeda dengan masjid dekat rumah?",
        content: (
            <InfoSection title="Perbedaan Jadwal Shalat">
                <p>Jadwal shalat dihitung berdasarkan koordinat GPS perangkat Anda. Perbedaan waktu 1-3 menit wajar terjadi karena perbedaan metode perhitungan (sudut matahari, ihtiyat/pengaman waktu) yang digunakan oleh masjid setempat vs aplikasi. Pastikan GPS aktif dan metode perhitungan di pengaturan sudah sesuai (misal: Kemenag untuk Indonesia).</p>
            </InfoSection>
        )
    },
    'faq-notifikasi': {
        title: "Mengapa notifikasi adzan tidak berbunyi?",
        content: (
            <InfoSection title="Masalah Notifikasi">
                <p>Beberapa faktor yang mungkin menyebabkan notifikasi tidak berbunyi:</p>
                <ul className="list-disc pl-5">
                    <li>Izin notifikasi belum diberikan pada browser/perangkat.</li>
                    <li>Mode "Jangan Ganggu" (Do Not Disturb) aktif.</li>
                    <li>Browser membatasi pemutaran suara otomatis (autoplay policy). Cobalah berinteraksi dengan aplikasi (klik tombol apa saja) terlebih dahulu.</li>
                    <li>Aplikasi tertutup sepenuhnya (background process dimatikan oleh sistem hemat baterai HP).</li>
                </ul>
            </InfoSection>
        )
    },
    'faq-chatbot': {
        title: "Apakah jawaban AI Chatbot bisa dijadikan rujukan hukum?",
        content: (
            <InfoSection title="Penggunaan AI">
                <p><strong>TIDAK.</strong> Jawaban AI Assistant hanya bertujuan sebagai informasi umum dan edukasi awal. AI bisa melakukan kesalahan atau halusinasi. Untuk masalah hukum Fiqih yang spesifik dan fatwa, wajib berkonsultasi langsung dengan ustadz, kyai, atau ulama yang kompeten dan terpercaya.</p>
            </InfoSection>
        )
    },

    // --- Lainnya ---
    'cara-penggunaan': {
         title: 'Cara Penggunaan',
        content: (
             <div>
                <InfoSection title="Navigasi & Fitur Utama">
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Navigasi Kalender:</strong> Gunakan tombol "Berikutnya" dan "Sebelumnya" untuk berpindah antar bulan/minggu/tahun. Klik tanggal untuk melihat detail atau menambahkan catatan. Pilih format kalender (Hijriah/Masehi/Gabungan) sesuai kebutuhan.</li>
                        <li><strong>Pengaturan (Ikon Gerigi):</strong> Ubah tema (terang/gelap/Ramadhan), bahasa, perbesar tampilan (zoom), dan atur lokasi manual untuk jadwal shalat dan hari libur nasional.</li>
                        <li><strong>Alarm & Suara Adzan (Ikon Lonceng):</strong> Atur berbagai alarm sunnah seperti Tahajud, Dhuha, Dzikir Pagi/Petang, dan pengingat tidur. Pilih suara Adzan yang diinginkan (Makkah, Madinah, dll). Fitur TTS akan membacakan pengingat suara.</li>
                        <li><strong>Live Conversation:</strong> Gunakan fitur Voice Assistant untuk bertanya secara langsung menggunakan suara. Klik ikon mikrofon untuk memulai.</li>
                        <li><strong>Berbagi & Cetak:</strong> Klik ikon menu (tiga garis) lalu pilih "Bagikan & Cetak" untuk mengunduh kalender dalam format gambar atau mencetaknya langsung. Tersedia juga opsi QR Code.</li>
                        <li><strong>Al-Qur'an Digital:</strong> Akses fitur Al-Qur'an untuk membaca ayat suci, mendengarkan murottal, dan melihat terjemahan. Gunakan fitur pencarian untuk menemukan ayat tertentu.</li>
                        <li><strong>Arah Kiblat:</strong> Gunakan fitur kompas untuk menemukan arah Ka'bah. Pastikan GPS aktif dan kalibrasi kompas perangkat Anda.</li>
                    </ul>
                </InfoSection>
                <InfoSection title="Panduan Chatbot AI Assistant">
                    <p>AI Assistant kami dirancang untuk membantu Anda dengan berbagai kebutuhan informasi. Pilih mode yang tepat untuk hasil terbaik:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong><span className="text-purple-400">Complex Mode (Mode Kompleks):</span></strong> Mode default yang paling cerdas. Gunakan untuk pertanyaan yang memerlukan pemahaman mendalam, analisis, atau kreativitas.
                        </li>
                        <li>
                            <strong><span className="text-cyan-400">Chat Mode (Mode Percakapan):</span></strong> Gunakan untuk percakapan umum atau pertanyaan sederhana tentang Islam.
                        </li>
                        <li>
                            <strong><span className="text-blue-400">Search Mode (Mode Pencarian):</span></strong> Gunakan untuk topik yang membutuhkan informasi terkini atau berita.
                        </li>
                        <li>
                            <strong><span className="text-green-400">Maps Mode (Mode Peta):</span></strong> Gunakan untuk pertanyaan berbasis lokasi (misal: cari masjid terdekat).
                        </li>
                    </ul>
                </InfoSection>
                 <InfoSection title="Translate Bahasa">
                    <p>Gunakan menu ikon Globe/Bahasa di header untuk menerjemahkan antarmuka aplikasi ke berbagai bahasa dunia (Inggris, Arab, dll) menggunakan Google Translate.</p>
                </InfoSection>
            </div>
        )
    },
    'ketentuan': {
         title: 'Ketentuan & Kebijakan',
        content: (
            <div>
                <InfoSection title="Ketentuan Penggunaan & Disclaimer">
                    <p>Aplikasi Kalender Hijriah ini disediakan sebagai alat bantu untuk memudahkan umat Islam dalam menjalankan ibadah. Dengan menggunakan aplikasi ini, Anda setuju dengan ketentuan berikut:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Disclaimer Akurasi Data:</strong> Data kalender dan waktu shalat yang ditampilkan di aplikasi ini bersumber dari Al-Adhan API dan API pihak ketiga lainnya. Kami berusaha untuk menyajikan data seakurat mungkin sebagai panduan. Namun, karena perbedaan metode hisab dan rukyat, mungkin terdapat sedikit perbedaan dengan perhitungan yang digunakan oleh otoritas lokal Anda. <strong>Oleh karena itu, untuk penentuan tanggal-tanggal krusial dalam ibadah seperti awal Ramadhan, 1 Syawal (Idul Fitri), dan 10 Dzulhijjah (Idul Adha), pengguna diwajibkan untuk SELALU merujuk dan mengikuti pengumuman resmi dari pemerintah (misalnya, Kementerian Agama RI) atau lembaga keagamaan yang berwenang di wilayah masing-masing.</strong> Aplikasi ini tidak bertanggung jawab atas keputusan ibadah yang diambil hanya berdasarkan data di dalamnya.
                        </li>
                        <li>
                            <strong>Layanan Lokasi & Waktu Shalat:</strong> Akurasi waktu shalat sangat bergantung pada data lokasi (GPS) yang akurat dari perangkat Anda. Pastikan layanan lokasi diaktifkan untuk hasil terbaik.
                        </li>
                        <li>
                            <strong>Chatbot AI Assistant:</strong> Jawaban yang diberikan oleh AI Assistant dihasilkan oleh model bahasa dari Google Gemini dan bertujuan untuk memberikan informasi umum. <strong>Jawaban tersebut tidak boleh dianggap sebagai fatwa atau nasihat hukum keagamaan yang mutlak.</strong> Untuk masalah Fiqih yang kompleks dan personal, sangat disarankan untuk berkonsultasi langsung dengan ulama, ustadz, atau ahli agama yang terpercaya.
                        </li>
                         <li>
                            <strong>Hubungi Admin:</strong> Jika Anda menemukan kesalahan data atau memiliki saran, silakan hubungi kami melalui menu "Hubungi Kami" di sidebar atau email langsung ke admin.
                        </li>
                    </ul>
                </InfoSection>
                <InfoSection title="Kebijakan Privasi">
                    <p>Kami sangat menghargai privasi Anda. Aplikasi ini dirancang untuk melindungi data Anda:</p>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Penggunaan Data Lokasi:</strong> Aplikasi ini meminta akses ke lokasi (GPS) perangkat Anda dengan <strong>satu tujuan spesifik:</strong> untuk menghitung waktu shalat yang akurat sesuai posisi Anda.
                        </li>
                        <li>
                            <strong>Kebijakan Non-Penyimpanan:</strong> Data koordinat lokasi Anda <strong>TIDAK PERNAH DIKIRIM KE SERVER KAMI, TIDAK PERNAH DISIMPAN, DAN TIDAK PERNAH DIBAGIKAN</strong> ke pihak ketiga manapun.
                        </li>
                        <li>
                            <strong>Data Lokal:</strong> Catatan pribadi, pengingat, dan pengaturan Anda disimpan secara aman di penyimpanan lokal peramban (localStorage) pada perangkat Anda sendiri.
                        </li>
                    </ul>
                </InfoSection>
            </div>
        )
    }
};

const INFO_CONTENT = {
    caraPenggunaan: INFO_DETAILS['cara-penggunaan'].content,
    ketentuan: INFO_DETAILS['ketentuan'].content,
    puasa: <div />,
    hariRaya: <div />,
};

export { PUASA_SUB_PAGES, HARI_RAYA_SUB_PAGES, INFO_DETAILS, INFO_CONTENT, FAQ_CONTENT };
