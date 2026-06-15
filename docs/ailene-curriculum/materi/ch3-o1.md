# Materi Chapter 3, O1: Bangun asisten kerja pertamamu

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi O1.1 · coverage=true · depth=baik -->

## Konteks dan Project

Pernahkah Anda menjelaskan panjang lebar sebuah kasus kepada Claude, lalu membuka chat baru keesokan harinya dan mendapati Claude seolah tidak mengenal Anda sama sekali? Itu bukan kerusakan, melainkan cara kerja AI yang normal. Materi ini menjelaskan mengapa hal itu terjadi (konsep context window) dan memberi Anda solusi praktis yang langsung dapat dipakai, yaitu membangun satu Project Claude lengkap dengan custom instructions agar Claude konsisten mengikuti konteks, tone, dan aturan kerja Anda.

### Kenapa AI lupa konteks

Setiap kali Anda mengetik di Claude, model membaca seluruh teks percakapan yang sedang berlangsung sebelum menyusun jawaban. Ruang baca inilah yang disebut **context window**. Menurut dokumentasi resmi Anthropic, context window adalah "all the text a language model can reference when generating a response", yaitu seluruh teks yang dapat dirujuk model saat menjawab, termasuk jawabannya sendiri. Anggap saja ini sebagai "working memory" atau memori kerja Claude.

Teks di dalam context window diukur dalam satuan **token**. Satu token kira-kira sepotong kata atau bagian dari kata. Setiap pesan Anda dan setiap balasan Claude menumpuk dan memakan jatah token. Kapasitas ini besar (model terbaru dapat mencapai ratusan ribu sampai jutaan token), tetapi tetap ada batasnya.

Poin terpenting bagi pemula: **setiap chat baru dimulai dari nol.** Context window tidak berpindah antar percakapan. Begitu Anda membuka chat baru, memori kerja Claude kosong kembali. Claude tidak "mengingat" obrolan kemarin kecuali Anda menyalin ulang konteksnya. Inilah sebab AI terasa "lupa".

> Bayangkan Claude sebagai konsultan cerdas yang setiap pagi datang dengan papan tulis yang baru dibersihkan. Ia sangat pintar, tetapi papan tulisnya kosong. Apa pun yang Anda tulis di papan itulah satu-satunya yang ia lihat hari ini. Tutup ruangan, buka lagi besok, papannya bersih lagi.

Konsekuensi praktis: **konteks mengubah output.** Pertanyaan yang sama dapat menghasilkan jawaban berbeda tergantung apa yang ada di papan tulis. Jika Anda menulis "Buatkan balasan untuk karyawan yang mengajukan cuti", Claude akan menebak-nebak. Tetapi jika papan tulis sudah berisi SOP cuti perusahaan Anda, jawabannya akan akurat dan sesuai aturan.

Catatan teknis yang baik diketahui: menumpuk terlalu banyak teks juga tidak otomatis lebih baik. Dokumentasi Anthropic menyebut bahwa seiring jumlah token bertambah, akurasi dan kemampuan model mengingat informasi justru dapat menurun, fenomena yang disebut *context rot*. Jadi yang penting bukan hanya seberapa banyak konteks, melainkan seberapa relevan konteks yang Anda berikan.

### Bangun Project dan custom instructions

Menyalin ulang konteks setiap membuka chat tentu melelahkan. Di sinilah fitur **Projects** menjadi solusi. Project adalah ruang kerja mandiri di Claude yang memiliki riwayat chat sendiri, basis pengetahuan (knowledge base) sendiri, dan satu set instruksi tetap. Semua chat di dalam satu Project berbagi konteks yang sama.

Dua komponen utama Project:

- **Project knowledge base:** tempat Anda meng-upload dokumen, file teks, kode, atau potongan informasi. Menurut Help Center Claude, Claude akan menggunakan informasi ini untuk memahami konteks dan latar belakang chat Anda di dalam Project tersebut, dan apa pun yang Anda upload ke ruang ini akan dipakai di seluruh chat dalam Project itu. Penting dipahami: konteks tidak otomatis dibagikan antar chat kecuali informasinya dimasukkan ke knowledge base.
- **Project instructions (custom instructions):** instruksi tetap tentang bagaimana Claude harus berperilaku dan menjawab. Help Center menyatakan bahwa Claude akan menggunakan project instructions untuk semua chat di dalam Project tersebut. Inilah yang membuat Claude konsisten dalam tone, peran, dan aturan tanpa perlu Anda ulang setiap kali. Instruksi yang baik mencakup empat hal: peran dan organisasi Anda, tujuan spesifik Project, tone dan format yang Anda harapkan, serta aturan yang selalu berlaku.

> Jika context window adalah papan tulis harian, maka Project adalah ruang rapat permanen milik tim Anda. Dindingnya sudah tertempel SOP, aturan main, dan dokumen referensi. Siapa pun yang masuk ke ruang itu langsung berada dalam konteks yang sama, setiap hari.

#### Contoh konkret: Project "Asisten HR Ops"

Misalkan tim HR sering menjawab pertanyaan karyawan soal cuti dan kebijakan kantor. Daripada menjelaskan ulang aturan setiap kali, buatlah satu Project khusus.

Langkah membangunnya:

1. Buka sidebar kiri Claude, klik bagian **Projects**.
2. Klik **New Project**, lalu beri nama, misalnya "Asisten HR Ops", dan deskripsi singkat.
3. Pada knowledge base di sisi kanan halaman Project, klik tombol **+** untuk meng-upload dokumen SOP cuti dan file kebijakan kantor (misalnya PDF "Kebijakan Cuti 2026" dan "Tata Tertib Karyawan").
4. Buka pengaturan instruksi Project, tuliskan custom instructions, lalu simpan.

Contoh isi custom instructions untuk Project ini:

- "Kamu adalah Asisten HR Operasional. Jawab pertanyaan hanya berdasarkan SOP dan kebijakan yang ada di knowledge base Project ini."
- "Gunakan bahasa Indonesia baku, sopan, dan ringkas. Tujukan jawaban kepada karyawan biasa, hindari istilah hukum yang rumit."
- "Jika informasi tidak ada dalam dokumen, katakan terus terang dan sarankan menghubungi tim HR. Jangan mengarang aturan."
- "Selalu cantumkan nama dokumen sumber jika menjawab soal kuota cuti atau prosedur."

Setelah ini, setiap chat baru di dalam Project "Asisten HR Ops" sudah otomatis "tahu" aturannya. Anda dapat langsung bertanya "Berapa sisa kuota cuti tahunan jika sudah diambil 5 hari?" dan Claude menjawab konsisten sesuai SOP, tanpa perlu Anda jelaskan ulang.

Catatan ketersediaan: Project dapat dibuat semua pengguna, termasuk akun gratis (dengan batas maksimal lima Project untuk pengguna gratis). Kemampuan knowledge base yang lebih besar dan canggih (menggunakan RAG) tersedia pada paket berbayar, yaitu Pro, Max, Team, dan Enterprise.

### Poin Kunci

- **Context window** adalah memori kerja Claude untuk satu percakapan, diukur dalam **token**.
- **Setiap chat baru mulai dari nol**, Claude tidak ingat obrolan sebelumnya kecuali konteksnya diberikan lagi.
- **Konteks mengubah output**, pertanyaan sama dengan konteks berbeda akan menghasilkan jawaban berbeda.
- Konteks yang terlalu padat dapat menurunkan akurasi (*context rot*), jadi relevansi lebih penting daripada kuantitas.
- **Project** menyimpan konteks secara permanen melalui **knowledge base** (dokumen) dan **custom instructions** (aturan tetap).
- Custom instructions berlaku untuk **semua chat di dalam Project**, sehingga Claude konsisten dalam tone, peran, dan aturan.
- Konsep ini transferable, GPT dan Gemini juga memiliki padanan fitur instruksi tetap dan ruang kerja serupa.

### Cek Pemahaman

1. Mengapa Claude tampak "lupa" diskusi kemarin saat Anda membuka chat baru, dan apa hubungannya dengan context window?
2. Apa perbedaan peran antara **knowledge base** dan **custom instructions** di dalam sebuah Project?
3. Coba rancang satu kalimat custom instructions untuk Project di unit kerja Anda sendiri. Peran apa yang Anda berikan kepada Claude, dan aturan apa yang wajib ia patuhi?

<!-- Materi O1.2 · coverage=true · depth=baik -->

## Knowledge base aman dan RAG

Pada materi sebelumnya Anda sudah mengenal Project di Claude sebagai ruang kerja yang dapat menyimpan dokumen pendukung. Materi ini membahas dua hal yang saling berkaitan, yaitu bagaimana memilih dokumen yang aman untuk dimasukkan ke knowledge base sebuah Project, dan bagaimana mengatur Claude agar menjawab berdasarkan dokumen tersebut, bukan mengarang sendiri. Kemampuan ini sangat berguna untuk tim HR dan operasional yang sering ditanya hal berulang, misalnya isi peraturan perusahaan, prosedur cuti, atau panduan onboarding.

### Apa itu knowledge base pada Project Claude

Setiap Project memiliki ruang penyimpanan dokumen yang disebut knowledge base. Dokumen yang Anda upload ke ruang ini akan dipakai sebagai konteks di semua chat di dalam Project tersebut, sehingga Anda tidak perlu meng-upload ulang berkas yang sama untuk percakapan berbeda. Anda dapat menambahkan dokumen, teks, atau berkas lain melalui tombol tambah (+) pada halaman utama Project. Perlu diingat, konteks tidak otomatis dibagi antar-chat dalam satu Project kecuali informasinya memang dimasukkan ke knowledge base.

> Analogi: knowledge base seperti lemari arsip khusus di satu meja kerja. Setiap kali Anda duduk di meja itu (membuka chat di Project), semua arsip di lemari sudah ada di dekat Anda. Namun arsip itu hanya untuk meja tersebut, tidak otomatis pindah ke meja lain.

### Kurasi knowledge base yang aman

Karena dokumen di knowledge base akan dibaca oleh Claude, Anda harus memilih dengan teliti dokumen mana yang boleh masuk dan mana yang tidak. Di sinilah konsep Traffic Light dari materi sebelumnya berlaku langsung.

- **HIJAU (aman di-upload):** dokumen yang sudah boleh beredar internal atau publik, misalnya panduan onboarding, FAQ kebijakan cuti, template surat, materi pelatihan, dan SOP umum.
- **KUNING (pertimbangkan, samarkan terlebih dahulu):** dokumen yang mengandung sebagian informasi sensitif. Hapus atau samarkan bagian sensitif (nama, nomor identitas, nominal gaji) sebelum di-upload.
- **MERAH (jangan di-upload):** data yang dilarang keluar dari sistem resmi, misalnya data pribadi karyawan lengkap (NIK, nomor rekening, data kesehatan), data gaji individual, rahasia dagang, dan dokumen hukum yang masih rahasia.

> Aturan kunci: jangan pernah meng-upload data MERAH ke knowledge base. Setelah dokumen masuk, isinya menjadi konteks yang dapat muncul di jawaban. Lebih aman mencegah daripada menarik kembali.

Contoh kasus HR: Tim People Operations ingin membuat asisten yang menjawab pertanyaan karyawan soal kebijakan cuti dan reimbursement. Yang di-upload cukup buku panduan kebijakan dan daftar FAQ (HIJAU). File rekap pengajuan cuti per karyawan beserta alasan medisnya termasuk MERAH, jadi tidak boleh masuk. Jika perlu contoh kasus, gunakan data yang sudah disamarkan, misalnya "Karyawan A divisi Operasional".

Tips kurasi agar pencarian Claude akurat:

- Gunakan nama berkas yang jelas dan deskriptif, contohnya `Kebijakan-Cuti-2026.pdf`, bukan `dok1.pdf`.
- Kelompokkan dokumen yang berkaitan dalam satu Project agar konteksnya tidak tercampur dengan urusan lain.
- Upload versi paling baru, dan hapus versi lama agar Claude tidak menjawab dari aturan yang sudah kedaluwarsa.

### Menjawab dari dokumen, bukan mengarang (RAG)

RAG adalah singkatan dari Retrieval Augmented Generation. Secara sederhana, RAG adalah teknik yang membuat Claude mencari (retrieval) informasi yang relevan dari dokumen yang Anda upload, lalu menyusun jawaban (generation) berdasarkan informasi tersebut. Jadi jawaban tidak murni dari ingatan model, melainkan ditopang oleh isi dokumen Anda.

> Analogi: tanpa RAG, Claude seperti karyawan yang menjawab dari ingatan. Dengan RAG, karyawan itu membuka lemari arsip terlebih dahulu, mencari halaman yang relevan, lalu menjawab sambil merujuk halaman tersebut. Jawaban menjadi lebih akurat dan dapat ditelusuri.

Cara kerja RAG di Project Claude menurut dokumentasi resmi:

- RAG aktif secara otomatis ketika isi knowledge base mendekati atau melebihi batas context window Project. Tidak ada pengaturan manual yang perlu Anda nyalakan.
- Saat aktif, Claude menggunakan project knowledge search tool untuk mencari dan mengambil hanya bagian dokumen yang paling relevan dengan pertanyaan, bukan memuat seluruh dokumen sekaligus.
- Kapasitas penyimpanan Project dapat naik sampai 10 kali lipat dengan kualitas jawaban yang tetap terjaga.
- Akan muncul indikator visual yang menandakan Project sedang berstatus RAG-enabled. Jika isi knowledge base kembali turun di bawah batas, Claude dapat kembali ke pemrosesan berbasis konteks biasa.

Langkah praktik agar Claude menjawab dari dokumen, bukan mengarang:

1. Upload dokumen sumber yang sudah dikurasi (semua HIJAU) ke knowledge base Project.
2. Isi project instructions (project custom instructions) dengan aturan tegas, contohnya: "Jawab hanya berdasarkan dokumen di knowledge base. Jika informasi tidak ada di dokumen, katakan 'Informasi tidak ditemukan dalam dokumen' dan jangan mengarang."
3. Saat bertanya, sebut nama dokumen yang relevan agar pencarian lebih terarah, misalnya "Menurut Kebijakan-Cuti-2026, berapa hari cuti tahunan?"
4. Minta Claude mencantumkan rujukan, contohnya "Sebutkan bagian atau judul dokumen sumber jawabanmu."
5. Verifikasi jawaban penting dengan membuka dokumen aslinya, terutama untuk angka dan tanggal.

### Poin Kunci

- Knowledge base Project berlaku untuk semua chat di dalam Project itu, jadi dokumen yang di-upload menjadi konteks tetap.
- Terapkan Traffic Light saat kurasi: hanya dokumen HIJAU yang aman, samarkan KUNING, dan jangan pernah upload data MERAH.
- RAG membuat Claude mengambil jawaban dari dokumen Anda, sehingga jawaban lebih akurat dan dapat ditelusuri.
- RAG aktif otomatis saat knowledge base besar, menambah kapasitas sampai 10 kali lipat, dan ditandai indikator RAG-enabled.
- Project instructions yang tegas ditambah permintaan rujukan adalah cara utama mencegah Claude mengarang.

### Cek Pemahaman

1. Anda diminta membuat asisten FAQ kepegawaian. Dari daftar berikut, mana yang boleh di-upload dan mana yang tidak: buku panduan cuti, daftar gaji per karyawan, template surat keterangan kerja?
2. Dengan kata-kata Anda sendiri, apa perbedaan jawaban Claude yang menggunakan RAG dengan jawaban dari ingatan model saja?
3. Kalimat instruksi seperti apa yang akan Anda tulis di project instructions agar Claude tidak mengarang ketika informasi tidak ada di dokumen?

<!-- Materi O1.3 · coverage=true · depth=baik -->

## Produksi output & asisten kedua

Setelah Anda terbiasa berbincang dengan Claude, langkah berikutnya adalah membuat asisten Anda menghasilkan sesuatu yang sungguhan dipakai, yaitu file rapi yang dapat langsung diunduh, dibuka, dan dikirim. Pada materi ini Anda akan belajar menghasilkan output dalam beragam format, menguji asisten dengan satu tugas kantor nyata sampai menjadi file kepakai, lalu memahami kapan Anda perlu membuka "asisten kedua" (workstream baru) dan bagaimana fitur Project serta memory saling melengkapi.

### Produksi output: satu permintaan, beragam format

Claude dapat membuat dan menyunting file langsung di dalam percakapan, yaitu dokumen Word (.docx), spreadsheet Excel (.xlsx), presentasi PowerPoint (.pptx), dan PDF. Anda cukup meminta dengan bahasa sehari-hari, lalu mengunduh hasilnya dari percakapan. Fitur ini bernama "Code execution and file creation" dan tersedia untuk semua paket (Free, Pro, Max, Team, dan Enterprise) di web, aplikasi desktop, serta aplikasi mobile. Pada paket Free, Pro, dan Max, Anda perlu mengaktifkannya terlebih dahulu di Settings, lalu Capabilities, dengan menyalakan "Code execution and file creation". Pada paket Team dan Enterprise, fitur ini umumnya sudah aktif secara bawaan. Catatan penting: batas ukuran file adalah 30MB per file, baik untuk upload maupun download.

> Anggap Claude sebagai staf serbabisa yang dapat menyerahkan pekerjaan dalam map yang Anda minta: kadang Anda butuh surat resmi (Word), kadang tabel hitung-hitungan (Excel), kadang bahan rapat (PowerPoint), kadang dokumen final yang tidak boleh diubah (PDF).

Rumus sederhana memilih format:

| Kebutuhan Anda | Format yang dipilih |
| --- | --- |
| Naskah yang masih akan disunting (surat, kebijakan, notula) | Word (.docx) |
| Angka, daftar, perhitungan, atau data yang perlu difilter | Excel (.xlsx) |
| Bahan presentasi atau rapat | PowerPoint (.pptx) |
| Dokumen final untuk dibagikan dan tidak boleh diubah | PDF |

Anda dapat meminta beberapa format sekaligus dalam satu permintaan, misalnya: "Buatkan ringkasan ini dalam Word untuk saya sunting, dan versi PDF untuk dibagikan ke tim."

### Win L1: uji asisten dengan tugas nyata sampai jadi file kepakai

Cara tercepat memercayai sebuah asisten adalah memberinya satu tugas sungguhan sampai tuntas menjadi file yang benar-benar dipakai. Ini disebut quick win, yaitu kemenangan kecil yang terasa nyata. Pilih satu tugas yang berulang dan memakan waktu, lalu biarkan Claude menyelesaikannya.

Contoh untuk tim HR, terkait payroll: bayangkan banyak karyawan bertanya tentang aturan komponen gaji dan potongan (misalnya tunjangan transport, potongan keterlambatan, atau iuran BPJS). Daripada menjawab satu per satu, Anda dapat meminta Claude merapikan aturan tersebut menjadi satu dokumen panduan.

Penting soal keamanan data: gunakan dokumen aturan atau kebijakan, BUKAN data gaji karyawan sungguhan. Uji ini berfokus pada aturan, bukan angka pribadi siapa pun.

Langkah praktik:

- Siapkan dokumen sumber, yaitu file kebijakan kompensasi atau peraturan perusahaan tentang komponen dan potongan gaji.
- Upload dokumen tersebut ke percakapan Claude.
- Berikan permintaan jelas, misalnya: "Berdasarkan dokumen aturan ini, buatkan satu panduan ringkas berisi daftar komponen gaji, daftar potongan, beserta penjelasan singkat tiap poin dalam bahasa yang mudah dipahami karyawan. Hasilkan dalam format Word agar dapat saya sunting."
- Periksa hasilnya terhadap dokumen sumber. Jika ada poin yang kurang, minta perbaikan ("Tambahkan bagian potongan keterlambatan dan rapikan menjadi tabel").
- Setelah benar, minta versi final PDF untuk dibagikan.

Hasil akhirnya satu dokumen panduan rapi yang langsung dapat Anda edarkan. Itulah arti "file kepakai".

### Asisten kedua & peran memory

Saat satu percakapan sudah berfokus pada satu topik (misalnya panduan payroll tadi), dan Anda mulai mengerjakan hal lain yang tidak berkaitan (misalnya menyusun materi onboarding karyawan baru), sebaiknya Anda membuka percakapan baru. Percakapan baru ini ibarat "asisten kedua" yang menangani workstream berbeda, sehingga konteksnya tidak tercampur.

Kapan cukup chat biasa, dan kapan perlu Project?

- Chat biasa cukup untuk tugas sekali jalan, pertanyaan singkat, atau output cepat yang tidak membutuhkan konteks berlanjut.
- Project cocok untuk pekerjaan yang menumpuk konteks dari waktu ke waktu, misalnya proyek rekrutmen besar atau penyusunan kebijakan yang berlangsung berminggu-minggu. Dalam Project, Anda dapat mengunggah dokumen ke project knowledge agar tersedia sebagai konteks di semua percakapan dalam project itu, dan menetapkan project instructions agar gaya jawaban Claude konsisten. Bila project knowledge mendekati batas context window, pada paket berbayar Claude otomatis mengaktifkan mode RAG untuk memperluas kapasitas.

Bagaimana memory melengkapi semua ini? Claude memiliki fitur memory yang secara otomatis meringkas percakapan Anda dan menyusun intisari konteks profesional Anda (peran, preferensi gaya komunikasi, cara kerja), diperbarui setiap 24 jam. Memory inilah yang membuat asisten "mengenal" Anda lintas percakapan, sehingga Anda tidak perlu mengulang konteks dari nol setiap kali. Yang perlu dicatat: setiap Project memiliki ruang memory terpisah, sehingga konteks antar-proyek tetap fokus dan tidak bercampur. Anda dapat melihat serta menyunting ringkasan memory di Settings, lalu Capabilities. Bila ingin percakapan yang tidak disimpan ke memory, gunakan incognito chat (ikon hantu di pojok kanan atas).

> Bayangkan chat biasa sebagai meja kerja sekali pakai, Project sebagai map proyek khusus dengan arsipnya sendiri, dan memory sebagai catatan kepegawaian yang membuat asisten ingat siapa Anda dan bagaimana Anda suka bekerja.

### Poin Kunci

- Claude dapat membuat file Word, Excel, PowerPoint, dan PDF langsung di percakapan; aktifkan "Code execution and file creation" di Settings, lalu Capabilities (batas 30MB per file). Pada Team dan Enterprise umumnya sudah aktif bawaan.
- Pilih format sesuai kebutuhan: Word untuk naskah yang disunting, Excel untuk angka, PowerPoint untuk presentasi, PDF untuk dokumen final.
- Raih quick win dengan menyelesaikan satu tugas nyata sampai menjadi file kepakai; untuk uji payroll, gunakan dokumen aturan, BUKAN data gaji.
- Buka percakapan baru sebagai "asisten kedua" untuk workstream berbeda agar konteks tidak tercampur.
- Chat biasa untuk tugas sekali jalan; Project untuk pekerjaan yang menumpuk konteks; memory melengkapi dengan mengingat konteks profesional Anda lintas percakapan, dan setiap Project memiliki memory terpisah.

### Cek Pemahaman

1. Anda menyusun kebijakan cuti yang masih akan direvisi atasan, lalu ingin versi final yang dibagikan ke semua karyawan. Format apa yang Anda minta untuk masing-masing kebutuhan?
2. Mengapa untuk menguji asisten pada urusan payroll Anda sebaiknya menggunakan dokumen aturan dan bukan data gaji karyawan?
3. Anda mengerjakan satu kampanye rekrutmen besar selama sebulan dengan banyak dokumen rujukan. Lebih tepat menggunakan chat biasa atau Project? Jelaskan alasannya.
