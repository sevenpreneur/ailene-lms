# Materi Chapter 5, O3: Riset yang bisa dipercaya

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi O3.1 · coverage=true · depth=baik -->

## Riset & sumber

Salah satu kekeliruan umum pemula adalah menganggap semua jawaban Claude berasal dari "internet langsung". Padahal sebagian besar percakapan biasa dijawab dari pengetahuan internal model (yang memiliki batas waktu data), bukan dari web terkini. Materi ini membantu Anda mengenali kapan cukup chat biasa, kapan perlu mengaktifkan web search, dan kapan sebuah pertanyaan layak diserahkan ke mode Research. Anda juga akan belajar membaca dokumen dan gambar yang di-upload, sehingga pekerjaan kantor sehari-hari menjadi lebih cepat dan lebih mudah diverifikasi.

### Kapan cukup chat biasa, kapan butuh web search

Chat biasa sudah memadai untuk hal yang sifatnya konseptual, tidak bergantung waktu, atau berbasis materi yang sudah Anda berikan. Contohnya: menyusun draf email, merapikan kalimat kebijakan cuti, atau menjelaskan konsep umum tentang rekrutmen.

Web search diperlukan ketika jawaban bergantung pada informasi terkini atau fakta yang dapat berubah, misalnya peraturan ketenagakerjaan terbaru, besaran upah minimum tahun berjalan, harga vendor, atau tren pasar. Saat fitur ini aktif, Claude mengambil konten dari web secara langsung untuk mendasari jawabannya dan menyertakan kutipan beserta tautan sumber sehingga dapat Anda periksa kembali.

> Analogi: chat biasa seperti bertanya kepada rekan senior yang berpengalaman, tetapi pengetahuannya berhenti di tanggal tertentu. Web search seperti meminta rekan itu membuka browser dan memeriksa situs resmi terlebih dahulu sebelum menjawab.

Cara mengaktifkan di Claude.com: klik tombol "+" di pojok kiri bawah kolom chat, lalu pilih "Web search". Pada plan Team atau Enterprise, fitur ini perlu diaktifkan terlebih dahulu di tingkat workspace oleh Owner melalui Admin settings, tepatnya bagian Capabilities. Tersedia fitur pendamping bernama web fetch: jika Anda menempelkan URL spesifik saat web search aktif, Claude dapat membaca isi halaman tersebut secara langsung.

### Kapan butuh Research (riset mendalam)

Research adalah mode yang lebih kuat daripada satu kali web search. Claude bekerja secara agentik, yaitu merencanakan proses riset, menjalankan beberapa pencarian yang saling membangun, lalu menelusuri berbagai sudut pertanyaan secara sistematis. Hasilnya berupa jawaban menyeluruh dalam hitungan menit, lengkap dengan kutipan yang mudah diperiksa.

Beberapa fakta penting yang perlu Anda ketahui:

- Research tersedia pada plan berbayar (Pro, Max, Team, atau Enterprise) di web, desktop, maupun aplikasi mobile.
- Web search harus aktif agar Research dapat berjalan.
- Selain web, Research dapat menelusuri konteks internal Anda jika connector diaktifkan, misalnya Gmail, Google Calendar, dan Google Docs.
- Research memakai batas penggunaan yang sama dengan percakapan biasa, tetapi menghabiskannya lebih cepat karena mengambil banyak sumber.

Gunakan Research untuk pertanyaan berlapis yang membutuhkan perbandingan banyak sumber, bukan untuk pertanyaan sederhana. Jika ragu, mulailah dengan web search, lalu naikkan ke Research saat satu pencarian terasa tidak cukup.

Cara mengaktifkan: klik tombol "+" di pojok kiri bawah kolom chat lalu pilih "Research". Indikator biru akan muncul di bagian bawah jendela chat saat mode aktif, dan mengkliknya kembali akan menonaktifkan fitur. Jika Claude belum otomatis meriset, Anda dapat memintanya langsung, contohnya: "Claude, tolong gunakan tool research untuk...".

### Membaca dokumen dan gambar yang di-upload (vision)

Claude dapat membaca berkas yang Anda upload, bukan hanya teks yang diketik. Kemampuan ini sangat berguna untuk pekerjaan HR dan operasional.

Hal-hal yang perlu diketahui (sesuai dokumentasi resmi):

- Tipe dokumen yang didukung antara lain PDF, DOCX, CSV, TXT, HTML, ODT, RTF, EPUB, JSON, dan XLSX. Catatan: berkas XLSX diproses bila fitur code execution aktif.
- Tipe gambar yang didukung yaitu JPEG, PNG, GIF, dan WebP, dengan dimensi sampai 8000x8000 piksel.
- Batas upload pada chat yaitu 500MB per berkas dan sampai 20 berkas per chat.
- Untuk PDF di bawah 100 halaman, Claude membaca teks sekaligus elemen visual seperti tabel, grafik, dan gambar. Untuk PDF yang sangat panjang (di atas 1000 halaman), hanya teks yang diproses.
- Pada dokumen non-PDF (misalnya DOCX), Claude hanya membaca teksnya. Gambar yang tertanam di dalamnya tidak diinterpretasikan.
- Untuk gambar, gunakan resolusi 1000x1000 piksel atau lebih besar dan hindari gambar kecil atau beresolusi rendah agar hasil pembacaan optimal.

### Contoh konkret bernuansa HR

Tim HR menerima 18 berkas lamaran dalam format PDF dan beberapa foto sertifikat. Anda dapat upload beberapa CV sekaligus (ingat batas 20 berkas per chat), lalu meminta: "Bandingkan kandidat ini berdasarkan pengalaman dan pendidikan, buat tabel ringkasannya." Untuk foto sertifikat pelatihan, Claude dapat membaca nama peserta dan tanggal yang tertera. Setelah itu, untuk menyusun struktur gaji yang adil, Anda mengaktifkan web search dan meminta data upah minimum provinsi terbaru, lalu memeriksa tautan sumber yang diberikan sebelum memakainya di laporan. Jika Anda perlu membandingkan kebijakan cuti beberapa perusahaan sejenis dari banyak sumber sekaligus, naikkan ke mode Research.

### Langkah praktik

- Tentukan jenis pertanyaan: konseptual (chat biasa), butuh data terkini (web search), atau berlapis dan multi-sumber (Research).
- Aktifkan fitur yang sesuai melalui tombol "+" di pojok kiri bawah kolom chat.
- Untuk dokumen atau gambar, upload berkas dan sebutkan secara spesifik tugas yang Anda inginkan.
- Selalu periksa kutipan dan tautan sumber sebelum menggunakan hasilnya untuk keputusan resmi.

### Poin Kunci

- Chat biasa menjawab dari pengetahuan internal model yang memiliki batas waktu. Gunakan web search saat butuh informasi terkini atau fakta yang dapat berubah.
- Web search menyertakan kutipan dan tautan sumber yang dapat Anda verifikasi. Web fetch membaca isi URL spesifik saat web search aktif.
- Research adalah riset multi-langkah agentik untuk pertanyaan berlapis, tersedia di plan berbayar (Pro, Max, Team, Enterprise), dan mensyaratkan web search aktif.
- Claude dapat membaca PDF (termasuk tabel dan grafik untuk PDF di bawah 100 halaman) serta gambar. Batas chat yaitu 500MB per berkas dan 20 berkas per chat.
- Verifikasi sumber tetap menjadi tanggung jawab Anda sebelum dipakai untuk keputusan resmi.

### Cek Pemahaman

1. Anda diminta menyusun ringkasan aturan upah minimum yang berlaku tahun ini. Apakah cukup chat biasa, atau perlu web search? Jelaskan alasannya.
2. Apa perbedaan utama antara satu kali web search dan mode Research, dan kapan Anda memilih yang kedua?
3. Mengapa memeriksa kutipan dan tautan sumber tetap penting, walaupun jawaban Claude terlihat meyakinkan?

<!-- Materi O3.2 · coverage=true · depth=baik -->

## Olah data & verifikasi

Sampai titik ini, Anda sudah terbiasa meminta Claude membuat ringkasan, draf, atau ide. Materi ini naik satu tingkat: bagaimana menggunakan Claude untuk benar-benar mengolah angka, memverifikasi fakta ke sumber resmi, dan menilai seberapa aman sebuah output digunakan. Tiga keterampilan ini penting bagi tim HR dan operasional karena pekerjaan Anda sering bertumpu pada data karyawan, peraturan yang berubah, dan keputusan yang harus dapat dipertanggungjawabkan.

### Code execution: Claude menjalankan kode, bukan sekadar menebak

Secara bawaan, sebuah model bahasa seperti Claude menjawab dengan cara memperkirakan kata yang paling masuk akal. Untuk teks, ini bagus. Untuk angka, ini berisiko, karena model dapat "kira-kira" saat menjumlah atau menghitung rata-rata.

Anthropic mengatasi hal ini dengan kemampuan menjalankan kode di dalam sandbox (lingkungan terisolasi yang aman). Di Claude.ai, fitur ini awalnya dikenal sebagai analysis tool yang menjalankan kode JavaScript, dan kini dikembangkan menjadi kemampuan code execution yang lebih lengkap. Inti gagasannya sama: Claude menulis dan menjalankan kode sungguhan untuk mengolah data Anda, sehingga hasilnya, menurut Anthropic, "mathematically precise and reproducible" (akurat secara matematis dan dapat direproduksi). Di sisi API untuk developer, ada code execution tool yang menjalankan Python dan bash di dalam container terisolasi, lengkap dengan library analisis data seperti pandas dan numpy, untuk menganalisis data, membuat visualisasi, melakukan perhitungan, dan memproses file yang Anda upload.

> Bayangkan perbedaan antara karyawan yang menjawab "kira-kira total lemburnya sekitar 40 juta" hanya dengan melihat sekilas, dengan karyawan yang membuka kalkulator, menjumlah baris demi baris, lalu menunjukkan hasilnya. Code execution membuat Claude menjadi tipe kedua.

Inilah bedanya dengan sekadar ekspor file. Mengekspor berarti Claude memberi Anda file mentah untuk Anda olah sendiri. Code execution berarti Claude yang menjalankan perhitungan terhadap data tersebut, lalu menunjukkan hasil dan langkahnya. Anda tidak menerima data mentah saja, tetapi jawaban yang sudah dihitung.

### Quick win: riset nyata lalu verifikasi ke sumber primer

Keterampilan kedua adalah menggabungkan kemampuan riset Claude dengan kebiasaan memverifikasi. Claude dapat mencari informasi di web, namun sebagai pemula Anda harus menanamkan satu prinsip: selalu kembalikan ke sumber primer (sumber resmi), jangan berhenti di rangkuman.

Contoh konkret untuk HR di Indonesia: Anda perlu memastikan aturan iuran BPJS Kesehatan atau BPJS Ketenagakerjaan yang berlaku, atau melakukan benchmark gaji pasar untuk satu posisi. Langkah praktiknya:

- Minta Claude meriset terlebih dahulu, misalnya: "Carikan ketentuan terbaru iuran BPJS Kesehatan untuk pekerja penerima upah, dan sebutkan sumbernya."
- Minta Claude mencantumkan tautan ke sumber resmi, yaitu situs lembaga terkait (bpjs-kesehatan.go.id, bpjsketenagakerjaan.go.id) atau peraturan pemerintah, bukan blog atau forum.
- Buka sendiri tautan tersebut dan cocokkan angkanya. Sumber primer adalah lembaga yang menerbitkan aturan, bukan pihak yang sekadar menulis ulang.
- Untuk benchmark gaji, Anda dapat memberi Claude data survei gaji yang sah lalu memintanya menghitung median per posisi menggunakan code execution, sehingga angkanya berasal dari data Anda, bukan tebakan model.

> Anggap Claude sebagai asisten riset yang cekatan, tetapi Anda tetap kepala bagian yang menandatangani laporan. Asisten boleh mengumpulkan bahan, namun tanda tangan Anda menuntut Anda memeriksa sumbernya terlebih dahulu.

### Klasifikasi risiko output: kapan pakai langsung, verifikasi, atau tulis ulang

Tidak semua output Claude memiliki tingkat risiko yang sama. Membiasakan diri mengklasifikasi output akan membuat Anda cepat dan tetap aman. Ada tiga jenis output:

| Jenis output | Contoh | Tindakan yang disarankan |
| --- | --- | --- |
| Generatif | Draf email, ide judul acara, brainstorming | Gunakan langsung, lalu sunting sesuai selera |
| Faktual | Angka iuran BPJS, pasal UU, tanggal, nama lembaga | Verifikasi terlebih dahulu ke sumber primer sebelum digunakan |
| Analitik | Hitungan total gaji, rata-rata turnover, grafik | Tulis ulang atau periksa hitungannya, pastikan menggunakan code execution dan datanya benar |

Cara membaca tabel ini sederhana. Untuk output generatif, risiko rendah karena tidak ada klaim kebenaran mutlak, sehingga aman digunakan langsung dengan sedikit penyuntingan. Untuk output faktual, risiko tinggi karena satu angka salah dapat berdampak pada kepatuhan hukum, sehingga wajib diverifikasi. Untuk output analitik, risikonya ada pada metode dan data, sehingga Anda perlu memastikan Claude benar-benar menjalankan perhitungan (bukan menebak) dan data masukannya tepat.

Contoh kantor: jika Claude membuat draf pengumuman cuti bersama, itu generatif, langsung gunakan. Jika Claude menyebut "tunjangan hari raya wajib dibayar paling lambat tujuh hari sebelum hari raya", itu faktual, periksa ke peraturan resmi terlebih dahulu. Jika Claude menyajikan "rata-rata masa kerja karyawan 4,2 tahun", itu analitik, pastikan angkanya berasal dari data Anda yang diolah dengan code execution.

### Langkah praktik singkat

- Saat meminta perhitungan, sertakan instruksi seperti: "Jalankan kodenya, jangan dikira-kira, dan tunjukkan langkahnya."
- Untuk klaim fakta, selalu minta sumber resmi dan buka sendiri tautannya.
- Sebelum meneruskan output ke atasan, beri label dalam hati: ini generatif, faktual, atau analitik, lalu pilih tindakannya.

### Poin Kunci

- Code execution (analysis tool di Claude.ai, code execution tool di API) membuat Claude menjalankan kode sungguhan untuk mengolah data, sehingga hasilnya akurat dan dapat direproduksi, berbeda dari sekadar memberi file ekspor.
- Untuk output faktual, verifikasi selalu ke sumber primer (lembaga atau peraturan resmi), bukan rangkuman pihak ketiga.
- Klasifikasikan setiap output menjadi generatif, faktual, atau analitik, lalu tentukan: gunakan langsung, verifikasi terlebih dahulu, atau tulis ulang dan periksa hitungannya.
- Anda tetap penanggung jawab akhir. Claude mempercepat pekerjaan, tetapi keputusan dan tanda tangan ada di tangan Anda.

### Cek Pemahaman

1. Apa perbedaan mendasar antara Claude yang "menjalankan kode untuk menghitung total gaji" dengan Claude yang "memberi Anda file Excel untuk dihitung sendiri"?
2. Anda menerima jawaban Claude berisi angka iuran BPJS terbaru. Termasuk jenis output apa ini, dan langkah apa yang wajib Anda lakukan sebelum menggunakannya?
3. Sebutkan satu contoh output generatif, satu faktual, dan satu analitik dari pekerjaan harian Anda, lalu tentukan tindakan yang tepat untuk masing-masing.
