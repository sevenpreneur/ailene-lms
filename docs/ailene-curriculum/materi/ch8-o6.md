# Materi Chapter 8, O6: Delegasikan kerja multi-langkah (Cowork)

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi O6.1 · coverage=true · depth=baik -->

## Cowork & otomasi

Sampai titik ini Anda sudah terbiasa memberi satu perintah lalu menerima satu jawaban. Pada materi ini kita naik satu tingkat: bagaimana memberi Claude sebuah tujuan, lalu Claude merencanakan dan mengerjakan banyak langkah sekaligus, sementara Anda mengarahkan dan memeriksa hasilnya. Inilah yang di program ini kita sebut "Cowork", yaitu pola delegasi multi-langkah. Anthropic juga memiliki fitur produk bernama Claude Cowork yang bekerja persis seperti pola ini, sehingga kita dapat memakainya sebagai contoh nyata. Konsepnya transferable ke GPT atau Gemini, hanya nama dan tampilannya yang berbeda.

### Apa itu Cowork dan cara kerjanya

Cara biasa: Anda menyetir tiap belokan. Cara Cowork: Anda menyebut tujuan akhir, lalu AI yang menyusun rutenya. Menurut halaman resmi Anthropic, Claude Cowork "menangani tugas secara otonom. Beri ia tujuan, lalu Claude bekerja pada komputer, file lokal, dan aplikasi Anda untuk mengembalikan hasil yang sudah jadi."

Alur kerjanya konsisten:

- Anda memberi tujuan, misalnya "rapikan dan rangkum folder lamaran ini".
- Claude menganalisis permintaan dan menyusun rencana, memecah pekerjaan rumit menjadi beberapa subtugas bila perlu.
- Claude mengeksekusi langkah demi langkah, menjalankan kode bila diperlukan di dalam lingkungan virtual yang terisolasi pada komputer Anda, lalu menampilkan progress sehingga Anda dapat mengikuti.
- Anda mengarahkan dan review, yaitu menyetir saat penting, mengoreksi di tengah jalan, atau membiarkan Claude jalan sendiri.

Yang penting dipahami pemula: keputusan yang berkonsekuensi tetap di tangan manusia. Anthropic menyediakan dua mode izin, yaitu "Ask before acting" (Claude berhenti dan meminta persetujuan tiap langkah, yakni mode aman yang disarankan untuk pekerjaan sensitif atau file yang belum Anda kenal) dan "Act without asking" (Claude jalan tanpa jeda, lebih cepat tetapi lebih berisiko, sebaiknya hanya digunakan saat Anda mengawasi langsung dan bekerja dengan file serta sumber tepercaya). Apa pun modenya, Claude tetap akan meminta izin Anda sebelum menghapus file secara permanen.

> Bayangkan Cowork seperti staf magang yang cakap. Anda tidak menyuruhnya menekan tombol satu per satu. Anda berkata, "Tolong siapkan rekap lamaran minggu ini," lalu ia menyusun langkahnya sendiri. Anda tetap atasannya: memeriksa draf sebelum dikirim, dan ia wajib lapor sebelum melakukan hal yang sulit dibatalkan.

Catatan jujur soal kemampuan: Cowork berjalan di aplikasi Claude Desktop (macOS dan Windows) dan tersedia pada paket berbayar (Pro, Max, Team, atau Enterprise). Ia kuat untuk pekerjaan dokumen dan data, misalnya merapikan file, menyusun draf, merangkum riset dari banyak sumber, dan mengekstrak informasi dari dokumen padat ke format terstruktur.

### Otomasi dasar terjadwal sebagai quick win

Setelah memahami delegasi, langkah pemula yang aman adalah otomasi terjadwal, yaitu tugas berulang yang dijadwalkan tetapi tetap diawasi manusia. Targetnya tugas personal yang membosankan dan rutin, bukan keputusan penting.

Claude Cowork mendukung penjadwalan resmi. Anda dapat membuat tugas yang berjalan otomatis pada interval: hourly, daily, weekly, on weekdays, atau manual (dijalankan saat dibutuhkan). Dari halaman Scheduled tasks, Anda dapat melihat semua tugas, meninjau riwayat dan jadwal berikutnya, mengedit instruksi atau cadence, mem-pause atau melanjutkan, menghapus, dan menjalankan tugas sewaktu-waktu.

Dua batasan penting yang wajib Anda ingat:

- Tugas terjadwal hanya berjalan selama komputer menyala dan aplikasi Claude Desktop terbuka. Jika komputer tidur atau aplikasi tertutup saat jadwal tiba, tugas dilewati, lalu dijalankan otomatis begitu komputer bangun atau aplikasi dibuka kembali.
- Anthropic menyarankan untuk tidak menjadwalkan tugas yang mengakses file sensitif, mengirim pesan atas nama Anda, melakukan pembelian, atau tindakan lain yang sulit dibatalkan, sebab tugas terjadwal berjalan tanpa pengawasan langsung.

#### Contoh konkret HR: rekap mingguan lamaran masuk

Misalkan Anda staf rekrutmen. Setiap Jumat Anda menghabiskan satu jam membaca berkas lamaran yang masuk lalu membuat rekap untuk rapat tim. Ini kandidat sempurna untuk otomasi terjadwal dengan data dummy terlebih dahulu.

Langkah praktiknya:

1. Siapkan satu folder dummy berisi beberapa file lamaran palsu (misalnya 5 PDF berisi nama, posisi dilamar, dan tanggal masuk). Gunakan data dummy agar aman saat berlatih.
2. Di Claude Desktop, buka Cowork.
3. Ketik `/schedule` pada kolom chat, lalu tuliskan tujuannya, contoh: "Setiap Jumat pukul 16.00, baca semua lamaran di folder ini, lalu buat tabel rekap berisi nama pelamar, posisi, tanggal masuk, dan satu baris ringkasan kualifikasi." Tulis instruksi sejelas mungkin, sebab tugas terjadwal tidak dapat bertanya balik saat berjalan.
4. Jawab pertanyaan klarifikasi dari Claude, tentukan frequency menjadi weekly, lalu simpan jadwalnya.
5. Saat tugas berjalan, periksa hasilnya. Jangan kirim rekap ke siapa pun secara otomatis. Anda yang membaca, mengoreksi, lalu membagikannya. Inilah arti "tetap diawasi".

Mulai dari tugas yang risikonya rendah dan hasilnya mudah diperiksa. Setelah Anda percaya pada kualitasnya, barulah pertimbangkan data yang sungguhan.

### Poin Kunci

- Cowork adalah pola delegasi multi-langkah: Anda memberi tujuan, AI merencanakan dan mengeksekusi, Anda mengarahkan dan review.
- Keputusan berkonsekuensi tetap di tangan manusia. Gunakan mode "Ask before acting" untuk pekerjaan sensitif; Claude selalu meminta izin sebelum menghapus file permanen.
- Otomasi terjadwal (`/schedule`) mendukung interval hourly, daily, weekly, weekdays, atau manual, dan tersedia pada paket berbayar di Claude Desktop.
- Tugas terjadwal hanya jalan saat komputer menyala dan aplikasi terbuka; yang terlewat akan menyusul otomatis.
- Jangan menjadwalkan tugas yang sulit dibatalkan (mengirim pesan, membeli, menyentuh file sensitif). Mulai dengan data dummy dan hasil yang mudah diperiksa.

### Cek Pemahaman

1. Apa perbedaan inti antara memberi perintah satu per satu dan menggunakan pola Cowork? Di mana letak peran Anda sebagai manusia?
2. Anda ingin Claude menyiapkan rekap mingguan secara otomatis, tetapi rekap itu belum boleh dilihat orang lain sebelum Anda periksa. Bagaimana Anda merancang otomasi terjadwal agar tetap aman dan tetap diawasi?
3. Mengapa disarankan berlatih dengan data dummy terlebih dahulu, dan jenis tugas seperti apa yang sebaiknya tidak pernah dijadwalkan untuk berjalan tanpa pengawasan?

<!-- Materi O6.2 · coverage=true · depth=baik -->

## Tugas Cowork & efisiensi

Pada materi sebelumnya Anda sudah mengenal cara memberi instruksi kepada Claude. Sekarang saatnya menjalankan satu tugas nyata dari awal sampai selesai, lalu me-review hasilnya sebelum benar-benar digunakan. Di bagian kedua, Anda akan belajar menjaga context tetap ramping (lean) supaya respons tetap cepat, hemat token, dan hemat biaya, tanpa mengorbankan kualitas. Dua keterampilan ini adalah fondasi bekerja sama (cowork) dengan AI secara profesional di lingkungan kantor.

### Quick win: jalankan satu tugas multi-langkah lalu review

Tugas multi-langkah adalah pekerjaan yang terdiri dari beberapa tahap berurutan, bukan satu pertanyaan tunggal. Inilah jenis pekerjaan yang paling terasa manfaatnya ketika didelegasikan ke Claude. Namun prinsip utamanya satu: hasil AI selalu di-review oleh manusia sebelum dipakai. Menurut Anthropic, agent yang dapat memeriksa dan memvalidasi hasilnya sendiri jauh lebih andal karena kesalahan tertangkap sebelum menumpuk. Tetapi pada akhirnya manusia tetap berada di dalam loop pengambilan keputusan: hasil yang diusulkan AI tidak otomatis diterapkan begitu saja.

Anthropic menekankan bahwa cara review yang efektif adalah meminta Claude menunjukkan bukti, bukan sekadar mengklaim berhasil. Misalnya, minta Claude mengutip bagian dokumen yang menjadi dasar jawaban. Cara lain yang disarankan adalah memberi aturan yang jelas, lalu meminta penjelasan aturan mana yang sudah terpenuhi dan mana yang belum.

> Analogi: bekerja dengan Claude seperti mendelegasikan tugas ke staf magang yang cerdas dan cepat. Ia dapat menyelesaikan banyak hal, tetapi Anda tetap membaca hasilnya, mencocokkan dengan kebijakan perusahaan, dan menandatangani sebelum dokumen itu beredar.

Contoh konkret untuk tim HR: menyusun alur onboarding karyawan baru.

- **Langkah 1, beri konteks dan tugas.** "Saya HR di perusahaan ritel dengan 80 karyawan. Buatkan alur onboarding karyawan baru posisi staf toko untuk 7 hari pertama, dalam bentuk tabel: hari, aktivitas, penanggung jawab, dokumen yang dibutuhkan."
- **Langkah 2, minta Claude menjalankan seluruh tahap.** Claude menghasilkan tabel lengkap dari hari pertama (penyerahan kontrak, pengenalan tim) sampai hari ketujuh (evaluasi awal).
- **Langkah 3, review hasilnya.** Periksa apakah ada langkah wajib yang terlewat (misalnya pendaftaran BPJS atau penandatanganan tata tertib), apakah penanggung jawab sudah sesuai struktur tim Anda, dan apakah bahasanya pantas.
- **Langkah 4, minta perbaikan terarah.** "Tambahkan langkah pendaftaran BPJS Kesehatan dan Ketenagakerjaan di hari pertama. Pindahkan sesi orientasi budaya perusahaan ke hari kedua."
- **Langkah 5, finalisasi.** Setelah Anda yakin, barulah hasil dipakai dan dibagikan ke tim.

Inti quick win: pilih satu tugas berulang yang biasanya memakan waktu Anda, jalankan dengan Claude, review, lalu rasakan waktu yang dihemat.

### Hemat token & biaya: jaga context tetap lean

Setiap percakapan dengan Claude berjalan di dalam **context window**, yaitu seluruh teks yang dapat dirujuk model saat menyusun jawaban, termasuk jawaban itu sendiri. Anggap context window sebagai "memori kerja" model. Token adalah satuan potongan teks yang dihitung dan ditagih.

Hal penting yang ditegaskan dokumentasi Anthropic: lebih banyak context tidak otomatis lebih baik. Saat jumlah token bertambah, akurasi dan daya ingat model justru dapat menurun. Fenomena ini disebut **context rot**. Karena itu, menyeleksi isi context sama pentingnya dengan seberapa besar ruang yang tersedia. Anthropic merumuskan prinsipnya sebagai mencari "kumpulan token bersinyal tinggi yang sekecil mungkin" untuk mencapai hasil yang diinginkan. Model memiliki semacam "attention budget" yang terbatas, mirip memori kerja manusia.

> Analogi: context window seperti meja kerja. Jika seluruh meja penuh tumpukan berkas yang tidak relevan, Anda justru sulit menemukan dokumen penting. Meja yang rapi membuat pekerjaan lebih cepat dan akurat.

Praktik menjaga context tetap lean:

- **Context lean.** Berikan hanya informasi yang relevan untuk tugas saat ini. Jangan menempelkan seluruh dokumen 50 halaman jika hanya satu bab yang dibutuhkan.
- **Output ringkas.** Minta format yang padat secara eksplisit, misalnya "jawab dalam maksimal 5 poin" atau "buat tabel ringkas". Output yang lebih pendek berarti lebih sedikit token output yang ditagih.
- **Reset sesi.** Saat berpindah ke topik yang benar-benar baru, mulai percakapan baru. Percakapan lama yang terus dipanjangkan akan menumpuk token dari semua giliran sebelumnya, sehingga lebih boros dan lebih rentan context rot. Untuk konteks yang sering dipakai berulang, simpan di fitur Project agar tidak diketik ulang setiap kali. Konten yang tersimpan di Project juga di-cache, sehingga lebih efisien ketika dipakai kembali.

Untuk percakapan yang sangat panjang dan tidak terhindarkan, Anthropic memiliki mekanisme **compaction**, yaitu peringkasan otomatis di sisi server yang memadatkan percakapan ketika mendekati batas context window, lalu melanjutkannya dengan ringkasan tersebut. Bagi pengguna sehari-hari, kebiasaan paling sederhana tetap yang paling efektif: ringkas, relevan, dan mulai sesi baru saat topik berganti.

Yang perlu ditekankan: hemat bukan berarti mengorbankan kualitas. Justru context yang ramping membantu model lebih fokus, lebih cepat, dan lebih akurat.

### Poin Kunci

- Jalankan satu tugas multi-langkah nyata dari awal sampai selesai, lalu **review hasilnya sebelum dipakai**. Manusia tetap pemegang keputusan akhir.
- Cara review yang baik: minta Claude menunjukkan bukti atau dasar jawabannya, bukan sekadar klaim berhasil, dan berikan aturan yang jelas untuk diperiksa.
- **Context window** adalah memori kerja model. Lebih banyak context tidak otomatis lebih baik karena ada **context rot** (akurasi dapat menurun saat token bertambah).
- Jaga context tetap lean: berikan informasi relevan saja, minta output ringkas, dan reset sesi saat topik berganti.
- Hemat token berarti respons lebih cepat dan biaya lebih rendah, dan ini dapat dicapai tanpa mengorbankan kualitas.

### Cek Pemahaman

1. Anda baru saja meminta Claude menyusun surat penawaran kerja. Apa langkah konkret yang Anda lakukan sebelum surat itu dikirim ke kandidat?
2. Seorang rekan mengeluh jawaban Claude semakin lambat dan kurang akurat setelah percakapan berjalan sangat panjang membahas banyak topik berbeda. Berdasarkan konsep context rot, saran apa yang Anda berikan?
3. Mengapa meminta "jawab dalam maksimal 5 poin" dapat membantu menghemat biaya, dan apakah ini menurunkan kualitas? Jelaskan secara singkat.
