# Materi Chapter 7, O5: Kemas keahlianmu jadi Skill

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi O5.1 · coverage=true · depth=baik -->

## Bikin & pasang Skill

Pada materi sebelumnya Anda sudah mengenal Project sebagai tempat menyimpan konteks. Sekarang kita naik satu tingkat, yaitu Skill. Bayangkan Anda memiliki satu jenis tugas yang berulang setiap minggu, misalnya membuat surat HR dengan format yang itu-itu saja. Daripada menjelaskan ulang format dan aturannya setiap kali kepada Claude, Anda dapat mengemasnya menjadi sebuah Skill yang dipanggil otomatis saat dibutuhkan. Materi ini membahas apa itu Skill, cara membuat satu Skill sendiri, dan cara memasang Skill yang sudah jadi dari directory.

### Apa itu Skill dan kapan dipakai

Skill adalah paket instruksi yang dapat dipakai berulang (reusable), berisi panduan, contoh, dan kadang skrip pendukung, yang dimuat Claude secara otomatis ketika menemui jenis tugas tertentu. Secara teknis, sebuah Skill adalah satu folder berisi file `SKILL.md` (instruksi utama dalam format Markdown) ditambah file pendukung bila perlu.

Yang membuat Skill efisien adalah cara kerjanya, yaitu progressive disclosure. Claude tidak langsung membaca seluruh isi Skill. Mula-mula Claude hanya membaca metadata singkat (nama dan deskripsi). Dari deskripsi itulah Claude menilai apakah Skill relevan dengan permintaan Anda. Jika relevan, barulah isi lengkap pada badan `SKILL.md` dimuat, dan file pendukung lain dibuka hanya bila benar-benar diperlukan. Dengan begitu, context window tidak penuh oleh hal yang tidak diperlukan.

> Analogi: Skill itu seperti map prosedur standar (SOP) di lemari arsip HR. Sampul map bertuliskan judul singkat, misalnya "Prosedur Pembuatan SK". Anda tidak membaca semua map sekaligus. Ketika ada tugas membuat SK, Anda mengambil map yang judulnya cocok, lalu mengikuti langkah di dalamnya. Claude melakukan hal yang sama secara otomatis.

Kapan Skill dipakai? Saat sebuah tugas sering berulang, memiliki format atau aturan tetap, dan Anda ingin hasilnya konsisten setiap kali. Claude sudah menyediakan beberapa Skill bawaan dari Anthropic, misalnya untuk membuat dokumen Excel, Word, PowerPoint, dan PDF, yang aktif otomatis saat relevan.

### Membuat Skill sendiri (quick win)

Cara tercepat memperoleh manfaat adalah mengemas satu tugas berulang Anda menjadi Skill. Mari ambil contoh nyata di HR, yaitu Skill "Surat HR Standar" untuk membuat SK, kontrak, dan surat teguran dengan format serta klausul yang sudah baku.

Sebuah Skill membutuhkan minimal dua hal pada bagian metadata (frontmatter YAML di awal file `SKILL.md`):

| Field | Penjelasan | Batas |
|-------|------------|-------|
| `name` | Nama Skill yang mudah dikenali | Maksimal 64 karakter |
| `description` | Penjelasan apa yang dilakukan Skill dan kapan dipakai. Inilah yang dibaca Claude untuk memutuskan kapan memanggil Skill | Maksimal 200 karakter |

Deskripsi adalah bagian paling penting. Tulislah sejelas mungkin, mencakup apa yang dilakukan Skill sekaligus kapan dipakai, agar Claude tahu kapan harus memanggilnya. Contoh: "Membuat surat HR resmi (SK, kontrak, teguran) dengan format perusahaan dan klausul baku."

Langkah praktik membuat Skill "Surat HR Standar":

- Aktifkan terlebih dahulu fitur "Code execution and file creation" di Settings > Capabilities (untuk akun Free, Pro, atau Max). Skill membutuhkan kemampuan ini.
- Siapkan satu folder, lalu buat file `SKILL.md` di dalamnya.
- Isi bagian metadata dengan `name` dan `description` seperti contoh di atas.
- Pada badan Markdown, tuliskan instruksinya: struktur surat (kop, nomor surat, pembuka, isi, penutup, tanda tangan), klausul tetap yang wajib ada, gaya bahasa formal, dan contoh kalimat baku untuk masing-masing jenis surat.
- Bila ada lampiran pendukung, misalnya daftar nomor surat atau template, tambahkan sebagai file terpisah di folder yang sama.
- Kemas folder tersebut menjadi satu file ZIP, dengan folder Skill sebagai akar (root) ZIP, bukan di dalam subfolder.
- Di claude.ai, masuk ke Customize > Skills, klik tombol "+", pilih opsi unggah Skill, lalu unggah file ZIP Anda.
- Uji dengan perintah yang seharusnya memicu Skill, contohnya: "Buatkan surat teguran untuk karyawan yang terlambat tiga kali." Periksa apakah Claude memakai Skill tersebut, lalu perbaiki deskripsi bila belum terpanggil.

Tips: Claude juga menyediakan "skill-creator", yaitu Skill yang membantu Anda membuat Skill secara interaktif. Claude akan bertanya tentang alur kerja Anda, lalu membuatkan struktur folder dan file `SKILL.md` secara otomatis sehingga Anda tidak perlu menyusun file secara manual.

### Memasang Skill yang sudah ada (quick win)

Anda tidak selalu harus membuat dari nol. Banyak Skill sudah tersedia, baik dari directory maupun yang dibagikan rekan kerja. Contoh yang berguna untuk HR adalah Skill perapih dokumen, yang membantu merapikan format laporan atau notula agar konsisten.

Langkah memasang Skill dari directory:

- Buka Customize di sidebar kiri, lalu klik tombol "+" untuk membuka directory.
- Pilih tab Skills, cari Skill yang Anda butuhkan (misalnya perapih dokumen).
- Klik "Install", lalu pastikan Skill aktif (toggle menyala) di Customize > Skills.

Sebelum memasang, ada satu langkah keamanan yang tidak boleh dilewati, yaitu membaca isi keamanannya terlebih dahulu. Anthropic menyarankan hanya memasang Skill dari sumber tepercaya. Jika sumbernya kurang tepercaya, termasuk yang dibagikan kolega, periksa isi filenya terlebih dahulu.

- Baca isi `SKILL.md` dan semua file pendukung, terutama jika ada skrip, dependensi kode, atau berkas seperti gambar.
- Waspadai instruksi yang mengarahkan Claude ke sumber eksternal yang tidak dikenal.
- Risiko utamanya adalah prompt injection (instruksi tersembunyi yang memanipulasi Claude untuk melakukan tindakan tak diinginkan) dan data exfiltration (kebocoran data). Bila ragu, jangan dipasang.

> Analogi: memasang Skill dari luar sama seperti menerima template dokumen dari pihak ketiga. Sebelum dipakai untuk surat resmi perusahaan, Anda membacanya terlebih dahulu untuk memastikan tidak ada klausul aneh yang terselip.

### Poin Kunci

- Skill adalah paket instruksi reusable berupa folder berisi `SKILL.md`, dimuat otomatis untuk jenis tugas tertentu.
- Cara kerjanya progressive disclosure: Claude membaca deskripsi singkat terlebih dahulu, baru memuat isi lengkap bila relevan, dan file pendukung hanya saat diperlukan.
- Field wajib adalah `name` (maksimal 64 karakter) dan `description` (maksimal 200 karakter). Deskripsi menentukan kapan Skill terpanggil.
- Membuat Skill sendiri: aktifkan code execution, susun `SKILL.md`, kemas ZIP (folder sebagai root), unggah di Customize > Skills, lalu uji.
- Memasang Skill jadi: cari di directory, klik Install, dan selalu baca keamanannya. Hanya pasang dari sumber tepercaya.

### Cek Pemahaman

1. Mengapa deskripsi (`description`) menjadi bagian terpenting saat membuat Skill, dan apa yang terjadi jika deskripsinya tidak jelas?
2. Sebutkan satu tugas berulang di pekerjaan Anda yang layak dikemas menjadi Skill, dan apa saja aturan tetap yang akan Anda tuliskan di dalamnya.
3. Sebelum memasang Skill dari rekan kerja, langkah keamanan apa yang wajib Anda lakukan dan mengapa hal itu penting?

<!-- Materi O5.2 · coverage=true · depth=baik -->

## Keamanan skill & styles

Skill membuat Claude lebih cakap untuk tugas tertentu, dan styles membuat hasil Claude terdengar seperti gaya Anda. Keduanya sangat membantu, tetapi keduanya juga menyentuh hal yang sensitif: skill dapat menjalankan instruksi dan kode, sedangkan styles mengubah cara Claude menulis untuk Anda. Pada materi ini Anda akan mempelajari dua keterampilan praktis, yaitu menilai apakah sebuah skill aman sebelum dipasang, dan mengatur gaya serta format hanya sekali agar berlaku konsisten di semua percakapan.

### Mengapa skill perlu diwaspadai

Skill pada dasarnya adalah paket berisi instruksi (dan kadang kode atau berkas pendukung) yang memberi tahu Claude cara mengerjakan sesuatu. Karena isinya dapat berupa instruksi dan kode, skill dari sumber yang tidak tepercaya menimbulkan dua risiko utama yang disebut dalam dokumentasi resmi Anthropic:

- **Prompt injection**, yaitu instruksi tersembunyi di dalam skill yang memanipulasi Claude agar melakukan tindakan yang tidak Anda inginkan.
- **Data exfiltration** (kebocoran data), yaitu kode jahat atau data yang sudah disusupi instruksi diam-diam mengirim informasi Anda ke pihak luar.

Skill juga dapat berisi, atau menyuruh Claude memasang, paket dan perangkat lunak pihak ketiga. Selain itu, skill dapat memuat instruksi yang menyuruh Claude terhubung ke sumber jaringan eksternal yang belum tentu aman. Inilah sebabnya memasang skill sembarangan sama berisikonya dengan menjalankan program asing di komputer kantor.

> Bayangkan skill seperti staf magang yang datang membawa map berisi prosedur kerja. Magang dari agensi resmi yang Anda kenal jelas aman. Tetapi kalau ada orang asing menyodorkan map dan berkata "ikuti saja semua langkah di dalam ini", Anda tentu membaca isinya terlebih dahulu sebelum menjalankan, apalagi jika salah satu langkahnya berbunyi "salin data karyawan dan kirim ke alamat ini".

### Aman vs bahaya: cara menilai sebelum memasang

Anjuran resmi Anthropic sederhana tetapi penting: hanya pasang skill dari sumber tepercaya. Jika sebuah skill berasal dari sumber yang kurang tepercaya, termasuk skill yang dibagikan oleh rekan kerja, tinjau terlebih dahulu sebelum mengaktifkannya. Langkah peninjauan yang disarankan:

- Baca semua berkas yang ada di dalam skill untuk memahami apa yang dikerjakannya.
- Perhatikan dependensi kode dan berkas pendukung seperti gambar atau script.
- Cermati instruksi atau kode yang menyuruh Claude terhubung ke sumber jaringan eksternal yang tidak Anda kenal.

Tanda skill yang patut dicurigai antara lain: meminta akses ke data yang tidak relevan dengan fungsinya, menyuruh memasang perangkat lunak tambahan tanpa alasan jelas, atau memuat instruksi yang meminta Claude mengirim sesuatu ke alamat luar.

**Contoh kantor Indonesia.** Seorang staf HR menemukan skill bernama "Rekap Cuti Otomatis" yang dibagikan lewat grup WhatsApp komunitas. Sebelum memasang, ia membuka isi berkasnya dan menemukan satu baris instruksi yang menyuruh "kirim daftar nama dan nomor karyawan ke sebuah alamat web". Fungsi merekap cuti seharusnya tidak perlu mengirim data ke luar. Karena itu staf tersebut tidak memasangnya dan memilih skill resmi dari katalog Claude. Inilah penilaian aman vs bahaya yang benar.

### Styles & preferences: atur sekali, berlaku di semua percakapan

Daripada mengetik ulang "tolong jawab singkat dan formal" pada setiap percakapan, Anda dapat mengatur gaya dan format hanya sekali. Ada dua cara di Claude:

1. **Instructions (Settings)**, yaitu pengaturan tingkat akun. Pada dokumentasi disebut sebagai pengaturan yang berlaku untuk semua percakapan. Cara mengaksesnya: klik inisial Anda di pojok kiri bawah, pilih Settings, lalu isi bagian Instructions for Claude. Di sinilah tempat menulis preferensi tetap, misalnya "Saya bekerja di HR, gunakan Bahasa Indonesia baku, hindari jargon teknis".
2. **Styles**, yaitu gaya komunikasi Claude. Perlu dicatat bahwa fitur styles sedang dialihkan menjadi skills (styles are moving to skills) dan menu styles pada akhirnya akan dihapus dari Claude. Gaya preset seperti Concise, Explanatory, dan Formal tidak lagi tersedia setelah migrasi, sedangkan gaya Learning tetap tersedia sebagai skill di marketplace. Custom styles yang pernah Anda buat akan otomatis dimigrasikan menjadi skill di akun Anda (dalam keadaan nonaktif, sehingga perlu diaktifkan melalui Customize lalu Skills). Setelah migrasi, gaya tersebut dapat dipanggil melalui slash command dengan format `/{nama-style}-style`, misalnya style bernama "concise pirate" menjadi `/concise-pirate-style`.

> Anggap Instructions seperti memo permanen yang Anda tempel di meja Claude: "Selalu balas dengan sopan, singkat, dan dalam Bahasa Indonesia." Claude membacanya setiap kali bekerja, sehingga Anda tidak perlu mengingatkan berulang kali.

**Langkah praktik mengatur preferensi sekali untuk semua percakapan:**

- Klik inisial Anda di pojok kiri bawah, lalu pilih Settings.
- Buka bagian Instructions for Claude.
- Tuliskan preferensi tetap Anda, contoh: bahasa, panjang jawaban (singkat atau rinci), nada (formal atau santai), dan format yang disukai (poin atau paragraf).
- Simpan. Mulai percakapan baru dan perhatikan Claude sudah mengikuti gaya tersebut tanpa Anda minta lagi.
- Untuk kebutuhan satu proyek tertentu (misalnya rekrutmen), gunakan Project instructions yang hanya berlaku di chat dalam proyek itu.

Catatan penting tentang cakupan: Instructions berlaku untuk semua percakapan, sedangkan Project instructions hanya berlaku di dalam proyek terkait. Pahami perbedaan ini agar preferensi diterapkan di tempat yang tepat. Karena gaya kini juga dapat dituliskan sebagai instructions, banyak preferensi gaya yang dahulu memerlukan styles dapat Anda gantikan cukup dengan menulis di Instructions.

### Poin Kunci

- Skill dapat berisi instruksi dan kode, sehingga skill dari sumber tidak tepercaya berisiko prompt injection dan kebocoran data (data exfiltration).
- Hanya pasang skill dari sumber tepercaya. Skill dari rekan kerja sekalipun sebaiknya ditinjau terlebih dahulu.
- Tinjau dengan membaca semua berkas, memperhatikan dependensi dan paket pihak ketiga, serta mencermati instruksi yang terhubung ke jaringan luar.
- Curigai skill yang meminta data tidak relevan atau menyuruh mengirim data ke alamat luar.
- Gunakan Instructions di Settings untuk mengatur gaya dan format sekali agar berlaku di semua percakapan.
- Styles sedang dialihkan menjadi skills; gaya preset Concise, Explanatory, dan Formal tidak lagi tersedia setelah migrasi, sementara custom styles dimigrasikan otomatis dan dapat dipanggil lewat slash command.
- Instructions berlaku akun (semua percakapan), Project instructions hanya berlaku dalam proyek tertentu.

### Cek Pemahaman

1. Seorang rekan membagikan sebuah skill lewat chat dan berkata "langsung pasang saja, praktis". Langkah apa yang sebaiknya Anda lakukan terlebih dahulu, dan apa saja yang Anda cari saat meninjau isinya?
2. Anda lelah mengetik "jawab singkat dan dalam Bahasa Indonesia baku" di setiap percakapan. Di mana Anda mengatur preferensi ini agar berlaku otomatis untuk semua percakapan?
3. Apa perbedaan cakupan antara Instructions di Settings dan Project instructions, dan kapan Anda menggunakan masing-masing?
