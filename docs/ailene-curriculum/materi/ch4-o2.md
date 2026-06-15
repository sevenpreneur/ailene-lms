# Materi Chapter 4, O2: Bikin alat bantu interaktif

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi O2.1 · coverage=true · depth=baik -->

## Artifacts & visualisasi

Sejauh ini Anda menggunakan Claude untuk menghasilkan teks, yaitu jawaban, ringkasan, dan draf. Materi ini memperkenalkan kemampuan lain yang sering membuat peserta non-teknis terkejut: Claude dapat membuat **artifact**, yakni hasil kerja yang berdiri sendiri dan tampil di panel terpisah di samping percakapan. Artifact dapat berupa dokumen, tetapi juga dapat berupa alat yang sungguhan dapat dipakai seperti kalkulator, tracker, atau dashboard kecil. Setelah itu kita bahas kapan sebuah visual lebih cepat dipahami daripada satu paragraf panjang. Tujuannya sederhana: Anda dapat menghasilkan sesuatu yang langsung berguna, bukan sekadar tulisan untuk dibaca.

### Apa itu Artifact

Menurut pusat bantuan resmi Claude, artifact muncul ketika hasilnya signifikan dan berdiri sendiri, biasanya lebih dari 15 baris, dan merupakan sesuatu yang ingin Anda ubah, kembangkan, atau gunakan kembali nanti. Artifact tampil di panel terpisah di sebelah kanan, sementara chat tetap di sebelah kiri. Jenis isi yang dapat dibuat sebagai artifact mencakup:

- Dokumen (teks biasa atau Markdown)
- Cuplikan kode (code snippet)
- Halaman web HTML satu halaman dan komponen React yang interaktif
- Elemen visual seperti gambar SVG, diagram, dan flowchart

Inilah letak perbedaan penting: **statis versus interaktif**.

> Bayangkan selisih antara selembar brosur cetak dan sebuah mesin ATM. Brosur (artifact statis) hanya dibaca, isinya tetap. ATM (artifact interaktif) menerima masukan Anda, lalu menghitung dan menampilkan hasil yang berbeda sesuai angka yang Anda masukkan.

Artifact statis contohnya draf surat atau tabel kebijakan cuti. Artifact interaktif contohnya kalkulator yang menerima angka, lalu menghitung otomatis.

### Quick win: membuat alat yang langsung dipakai

Yang membuat artifact menarik bagi tim HR dan operasional adalah Anda dapat membuat alat kecil tanpa menulis satu baris kode pun. Anda cukup menjelaskan kebutuhan, Claude yang menyusun kodenya, dan alatnya berjalan di panel artifact.

Contoh konkret bernuansa HR: **kalkulator simulasi take-home pay** untuk membantu calon karyawan memahami estimasi gaji bersih. Prompt yang dapat Anda gunakan:

> "Buatkan kalkulator simulasi take-home pay sederhana sebagai artifact interaktif. Masukannya: gaji pokok, tunjangan transport, dan persentase potongan BPJS. Tampilkan estimasi gaji bersih secara otomatis saat angka diubah. Gunakan angka dummy sebagai contoh awal: gaji pokok 8.000.000, transport 500.000, potongan 4 persen. Beri catatan bahwa ini hanya simulasi, bukan perhitungan resmi."

Penting: gunakan **angka dummy** untuk latihan dan demo internal. Jangan memasukkan data gaji karyawan yang sungguhan ke dalam contoh yang akan dibagikan luas.

Contoh artifact bermanfaat lain untuk pekerjaan kantor:

- **Tracker** sederhana untuk memantau status lamaran kandidat atau progres onboarding
- **Dashboard kecil** yang merangkum jumlah cuti terpakai per divisi dari data yang Anda tempelkan

### Mengedit di samping chat

Kekuatan artifact ada pada siklus perbaikannya. Setelah artifact muncul, Anda tidak perlu mengulang dari nol. Berdasarkan dokumentasi Claude, Anda dapat:

- Meminta perubahan lewat chat (misalnya "tambahkan kolom tunjangan makan")
- Menggunakan fitur **Edit with Claude** untuk menyunting bagian Markdown secara langsung dengan menyorot teks tertentu, lalu menuliskan permintaan Anda
- Berpindah antar **versi** menggunakan pemilih versi (version selector), sehingga Anda dapat kembali ke versi sebelumnya
- Melihat kode di baliknya, menyalin isi, atau mengunduh file

Langkah praktik singkat:

1. Mintalah Claude membuat alat sebagai artifact (sebutkan kata "artifact interaktif").
2. Coba alatnya di panel kanan dengan beberapa angka.
3. Minta penyesuaian lewat chat, lalu amati versi baru muncul.
4. Jika versi baru kurang tepat, kembali ke versi sebelumnya lewat pemilih versi.

### Batas yang perlu diketahui

Agar Anda tidak salah harap, berikut batas resminya:

- Batas penyimpanan satu artifact adalah 20 MB dan hanya menerima masukan berupa teks (tidak menyimpan gambar atau data biner di dalamnya).
- Fitur lanjutan seperti penyimpanan data permanen (persistent storage) dan integrasi MCP ke layanan luar (misalnya Asana, Google Calendar, dan Slack) memerlukan paket Pro, Max, Team, atau Enterprise.
- Jika artifact bermasalah, tersedia tombol **Try fixing with Claude** untuk mengirim detail error ke Claude. Tombol ini tidak menjamin selalu berhasil, sehingga kadang Anda perlu menjelaskan ulang.

### Visualisasi inline: kapan visual mengalahkan paragraf

Sub-topik kedua: Claude juga dapat membuat diagram, grafik, dan visual langsung di dalam jawaban (inline), seperti flowchart, diagram konsep, dan grafik dari data yang Anda tempelkan. Berbeda dengan artifact yang tersimpan di panel terpisah, visual inline ini bersifat sementara (ephemeral): ia muncul sebagai bagian dari jawaban dan tidak otomatis tersimpan ketika percakapan berlanjut, meskipun Anda dapat menyimpannya sebagai file SVG atau HTML. Pertanyaannya bukan "apakah bisa", melainkan "kapan sebaiknya".

> Coba jelaskan denah ruangan kantor hanya dengan kata-kata kepada rekan lewat telepon. Sulit. Satu gambar denah selesai dalam sekejap. Itulah inti visualisasi: untuk hubungan dan struktur, mata lebih cepat menangkap daripada membaca kalimat berurutan.

Gunakan visual ketika:

- Menjelaskan **alur proses** bertahap (misalnya alur rekrutmen dari lamaran sampai kontrak). Flowchart lebih cepat dipahami daripada paragraf "lalu, kemudian, setelah itu".
- Menunjukkan **perbandingan angka** antar kelompok (misalnya jumlah karyawan per divisi). Diagram batang langsung memperlihatkan mana yang terbesar.
- Memetakan **hubungan atau hierarki** (misalnya struktur organisasi).

Gunakan paragraf ketika pesannya bernuansa, memerlukan alasan, atau berisi pertimbangan yang tidak dapat diringkas menjadi kotak dan panah, misalnya penjelasan kebijakan yang sensitif.

Contoh prompt: "Buatkan flowchart alur proses onboarding karyawan baru dari hari pertama sampai akhir masa percobaan, tampilkan sebagai diagram."

### Poin Kunci

- Artifact adalah hasil kerja yang tampil di panel terpisah di samping chat, dapat statis (dibaca) atau interaktif (menerima masukan dan menghitung).
- Anda dapat membuat alat seperti kalkulator take-home pay, tracker, dan dashboard kecil tanpa menulis kode, cukup dengan menjelaskan kebutuhan.
- Selalu gunakan angka dummy untuk demo; lindungi data karyawan sungguhan.
- Artifact dapat diperbaiki lewat chat, disunting langsung dengan Edit with Claude, dan memiliki riwayat versi.
- Batas resmi: 20 MB per artifact, teks saja; fitur penyimpanan permanen dan MCP butuh paket berbayar.
- Visual inline bersifat sementara dan tidak otomatis tersimpan, berbeda dengan artifact.
- Pilih visual untuk alur, perbandingan, dan hubungan; pilih paragraf untuk nuansa dan pertimbangan.

### Cek Pemahaman

1. Apa perbedaan mendasar antara artifact statis dan artifact interaktif, dan berikan satu contoh masing-masing dari pekerjaan Anda sehari-hari.
2. Untuk menjelaskan alur proses persetujuan cuti kepada karyawan baru, mana yang lebih efektif: paragraf panjang atau flowchart? Mengapa?
3. Sebelum membagikan kalkulator take-home pay ke banyak orang, satu hal apa yang wajib Anda periksa terkait data?

<!-- Materi O2.2 · coverage=true · depth=baik -->

## Bikin & batas artifact

Pada materi sebelumnya Anda sudah mengenal apa itu artifact, yaitu jendela kerja terpisah di samping percakapan tempat Claude menampilkan hasil yang utuh dan dapat diedit. Sekarang kita masuk ke praktik nyata, yaitu membuat satu artifact untuk kebutuhan kerja Anda, lalu memahami sampai di mana sebuah artifact masih wajar disebut "alat bantu Operator" dan kapan ia mulai berubah menjadi "membuat aplikasi".

### Quick win: membuat satu artifact untuk kerja nyata

Claude akan membuat artifact ketika konten yang dihasilkan cukup besar dan berdiri sendiri. Menurut dokumentasi resmi Anthropic, artifact muncul ketika konten bersifat "significant and self-contained, typically over 15 lines", yaitu sesuatu yang kemungkinan akan Anda edit, gunakan ulang, atau rujuk kembali nanti. Jenis konten yang didukung sebagai artifact adalah:

- Dokumen (Markdown atau teks biasa)
- Potongan kode (code snippet)
- Website HTML satu halaman
- Gambar SVG
- Diagram dan flowchart
- Komponen React interaktif

> Analogi: artifact itu seperti papan tulis besar di ruang rapat. Percakapan dengan Claude adalah obrolan Anda di meja, sedangkan papan tulis menampung hasil jadi yang dapat dihapus, ditambah, dan difoto untuk dibawa pulang. Anda tidak perlu menulis ulang dari nol setiap kali ada revisi.

#### Contoh konkret: tracker kandidat sederhana untuk rekrutmen

Bayangkan Anda staf HR yang sedang membuka lowongan untuk beberapa posisi. Anda ingin satu halaman ringkas untuk memantau status kandidat tanpa harus membuka spreadsheet yang rumit. Prompt yang dapat Anda gunakan:

> "Buatkan saya artifact berupa halaman tracker kandidat rekrutmen sederhana. Tampilkan tabel berisi kolom: Nama, Posisi yang Dilamar, Tahap (Screening, Interview, Offer), dan Catatan. Isi dengan 5 data dummy. Tambahkan filter berdasarkan tahap dan penghitung jumlah kandidat per tahap. Tampilan harus rapi dan mudah dibaca."

Gunakan data dummy seperti "Sinta Wijaya, Staf Admin, Interview" dan "Budi Santoso, Sales, Screening". Jangan masukkan data kandidat sungguhan pada tahap latihan ini demi menjaga privasi.

Langkah praktik:

1. Buka Claude, lalu tempelkan prompt di atas.
2. Tunggu artifact muncul di panel sebelah kanan.
3. Minta revisi langsung, misalnya "Tambahkan kolom tanggal masuk lamaran" atau "Ubah warna tahap Offer menjadi hijau".
4. Setelah puas, gunakan tombol publish bila ingin membagikan tautannya ke rekan, atau salin isinya ke alat kerja Anda.

Dalam hitungan menit Anda mendapatkan alat bantu kerja yang nyata. Inilah quick win yang dimaksud, yaitu bukti bahwa Anda dapat menghasilkan sesuatu yang berguna tanpa kemampuan teknis.

### Batas artifact: kapan masih Operator, kapan mulai "membuat aplikasi"

Penting untuk memahami batas praktisnya supaya harapan Anda realistis. Sebagian artifact dapat memanfaatkan persistent storage, yaitu penyimpanan data yang bertahan antar sesi sehingga cocok untuk tracker atau jurnal sederhana. Berdasarkan dokumentasi resmi Claude, persistent storage memiliki beberapa batasan penting:

- Hanya tersedia untuk artifact yang sudah dipublish. Saat masih dalam tahap pengembangan dan pengujian, operasi penyimpanan tidak akan berhasil sampai artifact dipublish.
- Hanya tersedia pada paket berbayar (Pro, Max, Team, dan Enterprise) di Claude versi web dan desktop.
- Batas penyimpanan 20 MB per artifact, dan penyimpanan ini hanya menerima data teks, bukan gambar, file, atau data biner.
- Membatalkan publish (unpublish) akan menghapus permanen seluruh data penyimpanan yang terkait, dan artifact yang sama tidak dapat dipublish ulang.

Untuk artifact yang memanggil kemampuan Claude (AI-powered app), Anthropic menegaskan tidak perlu API key, tidak ada biaya per panggilan, dan tidak ada proses deployment. Ketika orang lain memakai app Claude buatan Anda, mereka login dengan akun Claude mereka sendiri, dan pemakaian dihitung ke langganan mereka, bukan langganan Anda. Namun Anthropic juga mengingatkan bahwa artifact paling cocok untuk "testing and demonstration", sehingga pada titik tertentu Anda akan menemui keterbatasan teknis di claude.ai.

> Analogi: artifact itu seperti membuat alat dari kardus dan lakban untuk satu kebutuhan spesifik di kantor. Sangat berguna, cepat, dan murah. Tetapi kalau Anda mulai butuh alat yang tahan dipakai ratusan orang, menyimpan data permanen yang besar, terhubung ke sistem HRIS perusahaan, dan punya hak akses berlapis, itu sudah bukan kardus lagi, melainkan pekerjaan membangun mesin sungguhan, yaitu membuat aplikasi.

Cara sederhana menilai apakah Anda masih dalam wilayah Operator atau sudah mendekati membuat aplikasi:

| Masih Operator (cukup artifact) | Mulai mendekati membuat aplikasi |
| --- | --- |
| Untuk diri sendiri atau tim kecil | Untuk banyak pengguna sekaligus, terus-menerus |
| Data dummy atau data kecil sementara | Butuh database permanen dan besar |
| Satu halaman, satu fungsi | Banyak halaman, banyak fitur saling terhubung |
| Terhubung hanya ke kemampuan Claude | Harus terhubung ke sistem internal perusahaan (HRIS, payroll, login karyawan) |
| Hidup di dalam Claude | Butuh server sendiri, domain, dan pemeliharaan rutin |

Ketika kebutuhan Anda bergeser ke kolom kanan, itu adalah sinyal untuk berhenti memaksakan artifact dan melibatkan tim IT atau developer. Tugas Operator yang baik bukan membangun semuanya sendiri, melainkan tahu kapan sebuah ide layak "dinaikkan kelas" menjadi proyek aplikasi sungguhan.

### Poin Kunci

- Claude membuat artifact untuk konten yang utuh dan dapat digunakan ulang, biasanya lebih dari 15 baris.
- Jenis yang didukung: dokumen, kode, website HTML satu halaman, SVG, diagram/flowchart, dan komponen React interaktif.
- Anda dapat membuat alat kerja nyata (misalnya tracker kandidat) dalam hitungan menit, cukup dengan menjelaskan kebutuhan. Gunakan data dummy untuk latihan.
- Batas persistent storage: hanya aktif setelah dipublish dan pada paket berbayar, maksimal 20 MB per artifact, serta hanya menerima data teks.
- Artifact paling cocok untuk testing dan demonstrasi. Untuk banyak pengguna, data permanen besar, atau integrasi ke sistem perusahaan, itu sudah masuk wilayah "membuat aplikasi" yang membutuhkan developer.

### Cek Pemahaman

1. Sebutkan satu kebutuhan kerja Anda yang dapat diselesaikan dengan satu artifact sederhana. Jenis artifact mana yang paling cocok?
2. Apa perbedaan utama antara artifact yang masih wajar dibuat Operator dan kebutuhan yang sudah mengarah pada "membuat aplikasi"?
3. Mengapa pada tahap latihan kita sebaiknya menggunakan data dummy, dan apa saja syarat serta batas persistent storage yang perlu Anda ingat saat artifact menyimpan data?
