# Materi Chapter 1, F1: Paham AI & pakai dengan benar

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-f1`). Tiap Materi = field `content` untuk item Materi di platform.


---

<!-- Materi F1.1 · coverage=true · depth=baik -->

# F1.1 Orientasi dan Tetapkan Target

Selamat datang di program adopsi AI. Materi pertama ini bukan tentang teori berat atau istilah rumit. Tujuannya sederhana: Anda melihat gambaran hasil akhir program, merasa bahwa ini relevan dengan pekerjaan Anda, dan menetapkan satu target pribadi yang akan menjadi "proyek" Anda sepanjang kelas. Tidak perlu latar belakang teknis. Banyak peserta program ini berasal dari HR dan operasional, dan justru di sanalah AI sering memberi dampak paling terasa.

Sepanjang program, tool utama yang dipelajari adalah Claude dari Anthropic. Konsep yang Anda pelajari tetap berlaku jika nanti Anda menggunakan model lain seperti GPT atau Gemini, karena cara berpikir dan cara memberi instruksi (prompt) pada dasarnya serupa.

## Pembukaan dan Sneak Peek: Membayangkan Hasil Akhir

Sebelum belajar caranya, mari lihat terlebih dahulu hasilnya. Bayangkan di akhir program, Anda dapat menghasilkan dokumen kerja yang biasanya memakan waktu berjam-jam, hanya dalam hitungan menit, lalu Anda rapikan secara manual.

> Analogi: AI itu seperti asisten magang yang sangat cepat membaca dan menulis, tetapi tetap membutuhkan arahan jelas dari Anda dan tetap perlu Anda periksa hasilnya. Asisten ini tidak menggantikan keputusan Anda, melainkan mempercepat pekerjaan kasarnya.

Berikut tiga contoh hasil ("artifact") yang realistis untuk pemula. Claude memiliki fitur **Artifacts**, yaitu panel terpisah tempat Claude menampilkan dokumen jadi yang dapat Anda baca, sunting, dan bagikan. Fitur ini tersedia di semua paket Claude, termasuk paket gratis.

1. **Draf deskripsi pekerjaan (job description).** Anda memberi poin-poin singkat tentang posisi yang dibuka, lalu meminta draf lengkap dengan struktur rapi (ringkasan peran, tanggung jawab, kualifikasi). Anda tinggal menyesuaikan agar sesuai kebutuhan perusahaan.
2. **Ringkasan dokumen panjang.** Anda dapat mengunggah (upload) file, termasuk PDF, lalu meminta ringkasan poin penting. Sebagai catatan jujur soal batasan resmi pada aplikasi Claude.ai: Claude dapat menganalisis teks dan elemen visual pada PDF di bawah 100 halaman, dengan ukuran sampai 30 MB per file, dan Anda dapat melampirkan sampai 20 file dalam satu percakapan.
3. **Draf email atau pengumuman internal.** Misalnya pengumuman kebijakan cuti baru atau email undangan rapat. Anda beri konteks dan nada yang diinginkan, lalu Claude menyusun drafnya.

Perhatikan kata "draf" yang berulang. Itu kunci yang jujur: AI menghasilkan draf yang baik dengan cepat, bukan hasil final yang sempurna tanpa periksa. Anda tetap pemilik keputusan akhir.

> Catatan singkat tanpa perlu dihafal: "Claude" sebenarnya nama keluarga model, bukan satu produk tunggal. Saat ini ada beberapa pilihan, misalnya Claude Opus (paling cakap untuk tugas rumit), Claude Sonnet (seimbang antara cepat dan pintar), dan Claude Haiku (paling cepat). Untuk pemula, Anda tidak perlu pusing memilih. Cukup pakai yang disediakan, lalu fokus pada cara memberi instruksi yang jelas.

## Jenis Tugas Kantor yang Umumnya Dapat Dipercepat

Untuk pemula non-teknis, tugas yang paling mudah dipercepat AI biasanya berbentuk teks dan berulang. Tabel berikut memberi gambaran jujur, tanpa melebih-lebihkan.

| Jenis tugas | Contoh nyata di kantor | Catatan jujur |
| --- | --- | --- |
| Menulis draf | Job description, email, pengumuman, SOP sederhana | Draf cepat, tetap perlu disunting |
| Meringkas | Notula rapat, laporan panjang, kebijakan | Selalu periksa apakah poin penting tertangkap |
| Menyusun ulang | Mengubah catatan kasar menjadi paragraf rapi | Sangat membantu, risiko kecil |
| Membandingkan | Menyandingkan dua dokumen atau kebijakan | Verifikasi detail angka secara manual |

Tugas yang menuntut keputusan sensitif (misalnya penilaian kinerja final, keputusan rekrutmen, atau data pribadi karyawan) tetap memerlukan pertimbangan manusia. AI membantu menyiapkan bahan, bukan mengambil alih tanggung jawab.

## Friction Point Kamu: Menetapkan Satu Target Pribadi

Bagian inti dari materi ini adalah menetapkan satu target. Yang dimaksud "friction point" adalah satu tugas rutin yang paling makan waktu, paling membosankan, atau paling sering Anda tunda. Tugas inilah yang akan Anda jadikan studi kasus pribadi sepanjang kelas.

> Analogi: anggap program ini seperti pergi ke gym dengan satu target kebugaran. Kalau target Anda jelas (misalnya "kuat berjalan jauh"), setiap latihan menjadi terarah. Begitu pula di sini: dengan satu target tugas yang jelas, setiap materi terasa langsung berguna.

### Contoh konkret bernuansa HR

Bu Sari, staf HR di sebuah perusahaan, setiap awal bulan menghabiskan kira-kira tiga jam untuk merangkum hasil exit interview karyawan yang resign menjadi satu laporan ringkas untuk manajer. Tugas ini berulang, berbasis teks, dan menyita waktu. Inilah friction point yang ideal untuk dijadikan target. Sepanjang kelas, Bu Sari akan belajar mempercepat tugas ini langkah demi langkah.

### Langkah praktik menetapkan target

1. **Daftar tiga tugas rutin** yang Anda kerjakan minggu ini yang berbasis teks (menulis, meringkas, atau menyusun ulang).
2. **Perkirakan waktunya.** Tulis berapa lama masing-masing biasanya selesai.
3. **Pilih satu** yang paling makan waktu sekaligus paling sering berulang.
4. **Tulis dalam satu kalimat.** Format: "Tugas saya adalah [apa], biasanya memakan waktu [berapa lama], setiap [kapan]."
5. **Simpan kalimat itu.** Anda akan merujuknya kembali di materi-materi berikutnya.

## Poin Kunci

- Program ini ditujukan untuk pemula non-teknis. Tidak ada syarat latar belakang teknis.
- Tool utama adalah Claude, tetapi konsepnya transferable ke GPT dan Gemini.
- AI menghasilkan **draf cepat yang berkualitas baik**, bukan hasil final tanpa periksa. Anda tetap pemegang keputusan.
- Fitur **Artifacts** menampilkan dokumen jadi dan tersedia di semua paket Claude, termasuk paket gratis.
- Pada aplikasi Claude.ai, Claude dapat menganalisis **PDF di bawah 100 halaman**, sampai **30 MB per file**, dan **20 file** dalam satu percakapan.
- "Claude" adalah keluarga model (misalnya Opus, Sonnet, Haiku). Untuk pemula, cukup gunakan yang disediakan dan fokus pada instruksi yang jelas.
- Tugas berbasis teks dan berulang (menulis, meringkas, menyusun ulang) adalah titik awal paling mudah.
- Hasil akhir materi ini: satu kalimat target tugas pribadi yang paling makan waktu.

## Cek Pemahaman

1. Sebutkan satu tugas rutin Anda yang berbasis teks dan paling sering memakan waktu. Mengapa tugas itu cocok dijadikan target?
2. Mengapa hasil dari AI sebaiknya selalu disebut "draf" dan tetap Anda periksa sebelum digunakan?
3. Dari tiga contoh artifact di awal materi (job description, ringkasan dokumen, draf email), mana yang paling dekat dengan kebutuhan pekerjaan Anda, dan apa alasannya?

---

<!-- Materi F1.2 · coverage=true · depth=baik -->

## Materi F1.2 - Cara Kerja AI (LLM, Token, Model)

Di materi sebelumnya, Anda sudah mengenal AI sebagai rekan kerja digital. Sekarang kita masuk ke "cara kerjanya" agar Anda dapat menggunakannya dengan percaya diri dan tahu kapan harus berhati-hati. Anda tidak perlu menjadi orang teknis. Tujuannya sederhana, yaitu memahami bahwa AI adalah mesin penebak kata, mengenal batas ingatannya, tahu cara memilih model yang tepat, serta paham apa yang AI jago dan apa yang masih lemah. Materi ini menggunakan Claude (Anthropic) sebagai contoh utama, tetapi konsepnya sama untuk GPT dan Gemini.

---

### Lesson 3: AI Itu Apa dan LLM Itu Apa

AI yang Anda gunakan sehari-hari (seperti Claude) ditenagai oleh **LLM (Large Language Model)**, yaitu model bahasa AI dengan sangat banyak parameter yang dilatih pada teks dalam jumlah besar, sehingga dapat menghasilkan tulisan mirip manusia, menjawab pertanyaan, dan merangkum informasi.

Inti cara kerjanya: model ini dilatih untuk **menebak kata (token) berikutnya** berdasarkan teks sebelumnya. Jadi, LLM pada dasarnya adalah **mesin pola**, yakni mesin yang sangat ahli menebak kelanjutan yang paling masuk akal dari sebuah kalimat.

> Bayangkan fitur "predictive text" di keyboard ponsel Anda. Ketika Anda mengetik "Selamat pagi, semoga harimu...", keyboard menebak "menyenangkan". LLM adalah versi raksasa dari mekanisme itu, dilatih dengan teks yang jauh lebih banyak, sehingga tebakannya jauh lebih panjang, rapi, dan nyambung.

Konsekuensi penting: **lancar belum tentu benar.** Karena AI hanya menebak kelanjutan kata yang paling mungkin, ia dapat menyusun kalimat yang terdengar meyakinkan tetapi isinya keliru. Ia dapat tampil percaya diri tetapi salah, karena tugasnya bukan "mengingat fakta", melainkan "membentuk pola kalimat yang mulus". Inilah yang sering disebut halusinasi.

**Contoh kantor:** Seorang staf HR meminta AI menuliskan ringkasan aturan cuti melahirkan menurut undang-undang. AI dapat menjawab dengan rapi dan terdengar resmi, lengkap dengan angka hari. Namun, jika tidak diberi dokumen sumber, angka itu dapat saja tebakan yang salah. Karena itu, untuk hal faktual atau berisiko, selalu lampirkan sumbernya dan verifikasi hasilnya.

---

### Lesson 4: Token dan Context Window

AI tidak membaca teks per kata seperti manusia. Ia memecah teks menjadi **token**, yaitu unit terkecil yang dibaca model. Token dapat berupa kata, potongan kata, karakter, atau tanda baca. Sebagai gambaran kasar, satu token kira-kira setara 3 sampai 4 karakter teks bahasa Inggris (angka ini bervariasi tergantung bahasa dan jenis teksnya).

Lalu ada **context window**, yaitu seluruh teks yang dapat "dilihat" dan diacu model saat menyusun jawaban, termasuk jawaban yang sedang dibuat. Anthropic menyebutnya sebagai **"working memory" (ingatan kerja)** model. Penting dipahami: context window berbeda dari data pelatihan. Ini adalah ingatan jangka pendek untuk percakapan yang sedang berlangsung, bukan seluruh pengetahuan yang dipelajari model saat dilatih.

> Anggap context window seperti meja kerja. Semua dokumen yang sedang dibahas harus muat di atas meja itu. Kalau meja penuh dan Anda terus menaruh kertas baru, kertas yang lama tergeser dan tidak lagi terlihat jelas.

Mengapa chat yang panjang dapat melenceng? Anthropic menjelaskan fenomena bernama **context rot**, yaitu semakin banyak token menumpuk, akurasi dan daya ingat model justru dapat menurun. Jadi, "lebih panjang" tidak otomatis "lebih baik". Dalam percakapan yang sangat panjang dan bercabang, model dapat kehilangan fokus pada permintaan awal Anda.

**Kapan memulai chat baru:**

- Saat topik berganti total (misalnya dari membahas draf email ke menganalisis data absensi).
- Saat jawaban mulai melenceng atau mengulang kesalahan yang sama.
- Saat percakapan sudah sangat panjang dan terasa "tersesat".

**Langkah praktik:** Buka chat baru untuk setiap tugas besar yang berbeda. Pada awal chat, sampaikan konteks penting secara ringkas (misalnya "Saya staf HR, sedang menyusun surat teguran formal"), lalu fokus pada satu tujuan. Ini menjaga "meja kerja" tetap rapi.

---

### Lesson 5: Pilih Otak yang Tepat

Claude tersedia dalam beberapa model bertingkat. Logika yang sama berlaku di GPT dan Gemini: ada model yang lebih kuat tetapi lebih lambat, dan ada yang lebih cepat tetapi lebih ringan. Berdasarkan dokumentasi resmi Anthropic per Juni 2026, berikut gambarannya.

| Model | Posisi | Cocok untuk |
|---|---|---|
| **Claude Opus** (Opus 4.8) | Model Opus paling kuat untuk penalaran kompleks, dengan kecepatan sedang. Context window sampai 1 juta token. | Penalaran kompleks, analisis mendalam, tugas yang butuh ketelitian tinggi. |
| **Claude Sonnet** (Sonnet 4.6) | Keseimbangan terbaik antara kecepatan dan kecerdasan, tergolong cepat. Context window sampai 1 juta token. | Pekerjaan sehari-hari: menulis, merangkum, menyusun draf, menjawab pertanyaan. |
| **Claude Haiku** (Haiku 4.5) | Model tercepat dengan kecerdasan mendekati frontier. Context window 200 ribu token. | Tugas ringan dan cepat: jawaban singkat, klasifikasi sederhana, balasan kilat. |

> Analogi: ini seperti memilih kendaraan. Opus adalah truk besar yang kuat untuk muatan berat. Sonnet adalah mobil serbaguna untuk kebutuhan harian. Haiku adalah sepeda motor yang lincah untuk antar cepat. Anda tidak menggunakan truk untuk membeli kopi di seberang jalan.

**Langkah praktik:** Mulailah dari Sonnet untuk mayoritas pekerjaan kantor. Naik ke Opus saat tugas sungguh rumit dan butuh ketelitian (misalnya menganalisis kebijakan panjang). Gunakan Haiku saat Anda hanya butuh jawaban singkat secepat mungkin. Jangan otomatis memilih model paling kuat untuk semua hal, karena yang paling kuat belum tentu paling cepat dan paling hemat.

---

### Lesson 6: AI Bisa dan TIDAK Bisa

Memasang ekspektasi yang realistis sejak awal akan mencegah kekecewaan. Berikut gambaran jujurnya.

**AI jago dalam:**

- Menyusun dan merapikan draf (email, pengumuman, deskripsi pekerjaan).
- Merangkum dokumen panjang menjadi poin singkat.
- Menerjemahkan dan menyesuaikan nada bahasa (formal atau santai).
- Membuat banyak variasi ide dengan cepat (misalnya beberapa versi judul lowongan).
- Mengubah format teks (mengubah catatan rapat menjadi daftar tindak lanjut).

**AI masih lemah dalam:**

- Memberikan fakta atau angka mutakhir tanpa diberi sumber (dapat menebak salah).
- Mengingat percakapan lama yang sudah lewat dari context window.
- Menghitung angka rumit dengan presisi penuh tanpa bantuan alat.
- Mengetahui kejadian terbaru setelah batas pengetahuannya (knowledge cutoff).
- Mengambil keputusan final yang sensitif (rekrutmen, sanksi karyawan). Keputusan tetap milik manusia.

**Contoh kantor:** Untuk menyusun draf pengumuman libur bersama, AI sangat membantu dan cepat. Namun, untuk memastikan tanggal libur nasional resmi tahun ini, jangan percaya tebakan AI; lampirkan kalender resmi atau verifikasi sendiri. Gunakan AI sebagai asisten draf, bukan sebagai sumber kebenaran final.

---

### Poin Kunci

- LLM adalah **mesin penebak token**, yaitu menebak kata berikutnya berdasarkan pola, sehingga **lancar belum tentu benar**.
- AI membaca teks dalam bentuk **token**, dan ingatannya terbatas pada **context window** (working memory). Percakapan terlalu panjang dapat melenceng karena **context rot**.
- **Mulai chat baru** saat ganti topik atau saat jawaban mulai melenceng.
- Pilih model sesuai kebutuhan: **Opus** (kuat), **Sonnet** (seimbang, untuk harian), **Haiku** (cepat dan ringan). Logika sama di GPT dan Gemini.
- AI jago **menyusun, merangkum, dan mengolah teks**, tetapi lemah dalam **fakta mutakhir, ingatan jangka panjang, dan keputusan final**. Verifikasi selalu.

---

### Cek Pemahaman

1. Jika AI memberi jawaban yang terdengar sangat meyakinkan tentang sebuah angka regulasi, langkah apa yang sebaiknya Anda lakukan sebelum menggunakannya?
2. Anda sudah membahas tiga topik berbeda dalam satu chat yang sangat panjang, dan jawaban AI mulai melenceng. Mengapa hal ini terjadi, dan apa solusinya?
3. Untuk tugas merapikan satu email singkat, model mana yang paling masuk akal Anda pilih, dan mengapa Anda tidak perlu langsung menggunakan model paling kuat?

---

<!-- Materi F1.3 · coverage=true · depth=baik -->

## Materi F1.3: Aman & Verifikasi

Sampai di sini, Anda sudah dapat menulis prompt yang menghasilkan output yang berguna. Sebelum hasil itu Anda kirim ke atasan, masukkan ke surat resmi, atau bagikan ke tim, ada dua keterampilan keselamatan yang wajib Anda kuasai, yaitu menentukan **data mana yang aman dimasukkan ke AI** dan **memverifikasi apakah jawabannya benar**. Materi ini membekali Anda dengan dua alat praktis, yakni kerangka **Traffic Light** dan **protokol cek cepat**, ditambah lampiran lima prompt siap tempel.

---

### Lesson 7: Aman & Etis dengan Kerangka Traffic Light

Saat Anda mengetik sesuatu ke AI publik (Claude versi web, ChatGPT, atau Gemini), teks itu dikirim ke server penyedia. Anthropic menyatakan bahwa pada akun konsumen (Free, Pro, dan Max), pengaturan default menyimpan percakapan selama 30 hari, dan percakapan tidak digunakan untuk melatih model kecuali Anda menyalakan sendiri pilihan tersebut. Jika pilihan itu diaktifkan, masa penyimpanan data menjadi lima tahun. Meski demikian, prinsip yang paling aman tetap sederhana: **hindari memasukkan detail sensitif, dan gunakan data anonim atau dummy bila memungkinkan.** Alasannya, pengaturan setiap akun dapat berbeda, dan begitu data sensitif terkirim, Anda kehilangan kendali penuh atasnya.

Untuk membuat keputusan ini cepat, gunakan kerangka **Traffic Light**. Bayangkan lampu lalu lintas.

> Sama seperti di jalan: hijau jalan terus, kuning hati-hati dan perlambat, merah berhenti total. Sebelum menempel teks ke AI, tanyakan: "Ini lampu warna apa?"

| Warna | Jenis Data | Tindakan |
|-------|-----------|----------|
| **Hijau** | Informasi publik atau umum: draf tulisan tanpa nama, materi yang sudah dipublikasi, pertanyaan konsep, teks fiktif | Aman dimasukkan |
| **Kuning** | Data internal yang tidak terlalu rahasia: notula rapat biasa, draf kebijakan, dokumen kerja | Boleh, tetapi samarkan nama, angka, dan identitas terlebih dahulu |
| **Merah** | Data pribadi dan rahasia: NIK, gaji, data kesehatan, nomor rekening, kontrak, password, data karyawan yang dapat diidentifikasi | **Jangan pernah** dimasukkan ke AI publik |

**Contoh kantor Indonesia:** Seorang staf HR ingin AI membantu merapikan surat peringatan untuk seorang karyawan. Yang termasuk **merah**: nama lengkap karyawan, NIK, jabatan spesifik, dan kronologi yang membuat orangnya mudah dikenali. Yang termasuk **hijau atau kuning**: struktur dan bahasa surat secara umum. Solusinya, ganti identitas dengan placeholder, misalnya tulis "[NAMA KARYAWAN]" dan "[TANGGAL]". Prompt menjadi: *"Bantu rapikan struktur surat peringatan formal. Gunakan placeholder [NAMA], [TANGGAL], [PELANGGARAN]. Bahasa formal HRD."* Hasilnya tetap berguna, tetapi data pribadi tidak pernah keluar dari kantor Anda.

**Langkah praktik anonimisasi:**

- Ganti nama orang dengan [NAMA] atau inisial.
- Ganti angka sensitif (gaji, NIK, nomor rekening) dengan [ANGKA] atau contoh palsu.
- Hapus nama perusahaan atau klien bila tidak diperlukan.
- Setelah output jadi, baru masukkan kembali data asli secara manual di dokumen Anda.

---

### Lesson 8: Baca & Verifikasi Output (Halusinasi)

AI terkadang menghasilkan jawaban yang terdengar meyakinkan tetapi **salah**. Hal ini disebut **halusinasi**. Penting dipahami bahwa ini bukan kebohongan yang disengaja, melainkan konsekuensi dari cara kerja model.

**Mengapa AI berhalusinasi?** Riset Anthropic berjudul "Tracing the Thoughts of a Large Language Model" menjelaskan bahwa di dalam Claude terdapat dua "sirkuit" yang saling bersaing. Secara default ada sirkuit "tidak tahu" yang aktif dan membuat model menyatakan bahwa informasinya tidak cukup untuk menjawab. Ketika model mengenali suatu nama atau topik yang benar-benar dikuasainya, sirkuit "entitas dikenal" menyala dan menekan sirkuit "tidak tahu" tadi. Masalah muncul saat sirkuit "entitas dikenal" salah menyala, misalnya model mengenali sebuah nama tetapi sebenarnya tidak tahu detail apa pun tentangnya. Akibatnya, model tetap memaksakan diri menjawab dan mengarang detail yang terdengar masuk akal. Secara lebih luas, model cenderung berhalusinasi karena proses pelatihan dan evaluasi sering **menghargai tebakan daripada pengakuan ketidaktahuan**.

> Anggap AI seperti karyawan magang yang sangat percaya diri dan ingin selalu membantu. Ia jarang berkata "saya tidak tahu". Tugas Anda sebagai supervisor adalah memeriksa hasilnya, bukan menelannya mentah-mentah.

**Protokol Cek Cepat sebelum hasil dipakai:**

- **Periksa angka dan tanggal.** Setiap statistik, persentase, tanggal, atau nominal harus dianggap perlu diverifikasi sampai terbukti benar.
- **Periksa nama dan kutipan.** Nama orang, judul aturan, pasal, nomor undang-undang, atau referensi sangat rawan dikarang. Jangan percaya tanpa sumber.
- **Minta sumber.** Tambahkan ke prompt: *"Sebutkan dari mana informasi ini dan tandai bagian yang kamu tidak yakin."*
- **Bandingkan dengan yang Anda ketahui.** Jika jawaban bertentangan dengan pengetahuan atau dokumen internal Anda, percayai data Anda.
- **Cocokkan pada satu sumber resmi** untuk hal penting (situs pemerintah, dokumen perusahaan, atau orang yang berwenang).

**Contoh kantor:** AI menulis pengumuman cuti bersama dan mencantumkan "berdasarkan SE Menaker Nomor 5 Tahun 2024". Sebelum menyebarkannya ke seluruh staf, nomor surat edaran itu **wajib diperiksa** ke situs resmi Kemnaker. Salah satu penyebab kesalahan kantor yang paling umum adalah menyebarkan nomor aturan hasil halusinasi.

---

## Poin Kunci

- Gunakan **Traffic Light** sebelum menempel teks: Hijau aman, Kuning samarkan terlebih dahulu, Merah jangan pernah dimasukkan ke AI publik.
- Data Merah meliputi NIK, gaji, data kesehatan, nomor rekening, password, dan identitas karyawan yang dapat dikenali.
- Anonimkan dengan placeholder ([NAMA], [ANGKA]), lalu masukkan data asli secara manual setelah output jadi.
- Pada akun konsumen Anthropic, default penyimpanan adalah 30 hari dan percakapan tidak dipakai melatih model kecuali Anda mengaktifkan sendiri pilihannya, tetapi prinsip teraman tetap tidak memasukkan data sensitif.
- AI berhalusinasi karena cenderung memaksakan jawaban daripada mengaku tidak tahu, sehingga output bukan kebenaran final.
- Selalu verifikasi angka, tanggal, nama, dan referensi hukum sebelum hasil dipakai resmi.
- Perlakukan AI seperti magang pintar yang hasilnya selalu Anda periksa.

## Cek Pemahaman

1. Rekan Anda ingin meminta AI meringkas daftar gaji karyawan satu divisi. Termasuk lampu warna apa data ini, dan apa yang sebaiknya dilakukan terlebih dahulu?
2. AI memberi Anda jawaban lengkap dengan nomor peraturan dan persentase yang terdengar meyakinkan. Tiga hal apa yang Anda periksa sebelum membagikannya?
3. Dengan kata-kata Anda sendiri, mengapa AI dapat memberi jawaban salah dengan nada sangat percaya diri?

---

## Lampiran: Starter Prompt Pack (5 Prompt Siap Tempel)

Salin, tempel ke Claude, lalu ganti bagian dalam tanda kurung siku dengan isi Anda. Ingat aturan Traffic Light: samarkan data sensitif terlebih dahulu.

**1. Rapikan email**
> Rapikan email berikut agar jelas, sopan, dan profesional dalam Bahasa Indonesia formal. Pertahankan maksud asli, perbaiki struktur dan tata bahasa, serta buat ringkas. Tampilkan hasil akhirnya saja.
> Email: [TEMPEL EMAIL ANDA DI SINI]

**2. Ringkas dokumen**
> Ringkas dokumen berikut menjadi 5 poin utama dalam Bahasa Indonesia, lalu tambahkan 1 kalimat kesimpulan. Tandai angka atau tanggal penting agar saya dapat memverifikasinya. Jangan menambahkan informasi yang tidak ada di teks.
> Dokumen: [TEMPEL TEKS DOKUMEN DI SINI]

**3. Ide / brainstorming**
> Saya membutuhkan 10 ide untuk [TOPIK, misalnya: acara gathering karyawan akhir tahun dengan anggaran terbatas]. Untuk setiap ide, beri 1 kalimat penjelasan dan perkiraan tingkat kesulitan (mudah / sedang / sulit). Urutkan dari yang paling mudah dijalankan.

**4. Balasan pesan**
> Bantu saya menyusun balasan yang sopan dan profesional untuk pesan berikut. Nada: [pilih: ramah / netral / tegas]. Bahasa Indonesia formal, ringkas, maksimal 1 paragraf. Beri saya 2 versi alternatif.
> Pesan yang perlu dibalas: [TEMPEL PESAN DI SINI]

**5. Rapikan tulisan**
> Perbaiki tulisan berikut: koreksi tata bahasa dan ejaan, perjelas kalimat yang berbelit, dan buat alurnya lebih rapi. Jangan mengubah makna atau menambah fakta baru. Tampilkan versi yang sudah dirapikan, lalu sebutkan singkat perubahan utama yang Anda lakukan.
> Tulisan: [TEMPEL TULISAN ANDA DI SINI]

Konsep ini transferable. Prompt yang sama dapat Anda gunakan di GPT maupun Gemini, dan kerangka Traffic Light berlaku untuk semua AI publik.
