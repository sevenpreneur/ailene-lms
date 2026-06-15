# Materi Chapter 6, O4: Sambungkan AI ke datamu (MCP)

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi O4.1 · coverage=true · depth=baik -->

## MCP & connector

Sampai titik ini Anda sudah belajar memberi konteks kepada Claude dengan cara mengetik atau meng-upload file secara manual. Pada materi ini kita melangkah lebih jauh, yaitu bagaimana caranya AI dapat menjangkau data dan sistem yang sudah Anda miliki (seperti folder Drive atau kotak masuk Gmail) tanpa Anda perlu menyalin-tempel satu per satu. Kuncinya ada pada dua istilah, yaitu MCP dan connector. Tujuan kita adalah memahami keduanya, mengerti mengapa penting, dan dapat menyambungkan AI secara read-only dengan aman setelah memeriksa governance.

### Apa itu MCP dan kenapa penting

**MCP (Model Context Protocol)** adalah standar terbuka (open standard) untuk menyambungkan aplikasi AI ke sistem eksternal, misalnya sumber data (file, database), tools (mesin pencari, kalkulator), dan workflow. MCP bersifat open-source dan tidak dimiliki satu perusahaan saja. Karena itu, satu hubungan yang dibangun dengan MCP dapat dipakai oleh banyak aplikasi AI yang berbeda. Inilah alasan MCP disebut paling transferable: keterampilan yang Anda pelajari di Claude akan relevan juga di aplikasi AI lain yang mendukung MCP, seperti ChatGPT atau editor kode seperti VS Code dan Cursor.

**Connector** adalah nama antarmukanya, yakni "colokan" siap pakai yang menghubungkan AI ke sebuah layanan tertentu. Jadi MCP adalah aturan main atau bahasanya, sedangkan connector adalah produk nyata yang Anda klik untuk menyambung.

> Bayangkan MCP seperti colokan USB-C. Dahulu setiap perangkat punya kabel berbeda, sehingga repot dan tidak cocok satu sama lain. USB-C membuat satu bentuk colokan yang berlaku untuk banyak perangkat. MCP melakukan hal serupa untuk AI, yaitu satu standar yang membuat AI dapat tersambung ke banyak sistem dengan cara yang seragam. Analogi USB-C ini dipakai langsung oleh dokumentasi resmi MCP.

Cara kerjanya secara sederhana melibatkan tiga peran:

- **MCP Host**: aplikasi AI yang Anda gunakan, misalnya Claude.
- **MCP Server**: program yang menyediakan data atau kemampuan dari sebuah layanan (misalnya server untuk Google Drive).
- **MCP Client**: penghubung di dalam Host yang menjaga sambungan ke satu Server.

Saat tersambung, AI dapat menemukan apa saja yang tersedia (daftar dokumen atau fungsi), lalu memintanya saat dibutuhkan. Bagi Anda sebagai pengguna non-teknis, detail teknis ini tidak perlu dihafal. Yang penting dipahami: MCP adalah fondasi yang membuat connector dapat bekerja, dan connector inilah yang Anda gunakan sehari-hari.

Mengapa ini penting bagi pekerjaan kantor? Karena nilai terbesar AI muncul ketika ia dapat bekerja dengan konteks perusahaan Anda yang sesungguhnya, bukan hanya pengetahuan umum. Dengan connector, AI tidak lagi "buta" terhadap dokumen internal, sehingga jawabannya lebih relevan dan menghemat waktu.

### Connect ke Drive/Gmail dengan governance (quick win)

Anthropic menyediakan connector Google Workspace untuk Gmail, Google Drive, dan Google Calendar. Penting dipahami batas kemampuannya, karena di sinilah letak keamanannya:

- **Gmail**: Claude dapat mencari dan membaca email serta membuat draf, tetapi tidak dapat mengirim email atas nama Anda. Semua email tetap harus Anda kirim sendiri secara manual.
- **Google Drive**: Claude dapat mencari dan membaca isi dokumen (Docs, Sheets, Slides, PDF, dan file Office). Claude hanya mengambil teks, sehingga gambar yang tertanam di dalam dokumen tidak diproses.

Untuk Gmail dan Google Drive, connector bawaan ini bersifat read-only secara default, yaitu Claude hanya membaca isi dan (khusus Gmail) membuat draf, tetapi tidak dapat mengubah, memindahkan, atau menghapus file dan email yang sudah ada. Inilah yang membuat sambungan read-only relatif aman. Selain itu, Claude hanya menjangkau data yang memang sudah dapat Anda akses sendiri di akun Google tersebut, dan hanya saat Anda secara eksplisit memintanya. Perlu dicatat bahwa connector Google Calendar berbeda, karena ia dapat membuat dan mengubah acara, jadi untuk quick win pertama, fokuskan pada Drive dan Gmail terlebih dahulu.

**Governance terlebih dahulu, baru menyambung.** Sebelum mengklik tombol connect, lakukan langkah berikut:

- **Periksa Traffic Light data.** Pastikan data yang akan disentuh AI tergolong "hijau" (aman dibagikan), bukan "merah" (sensitif, seperti data pribadi karyawan, gaji, atau rekam medis).
- **Minta izin IT dan Legal.** Untuk akun Team dan Enterprise, connector Google Workspace hanya dapat aktif jika Owner atau Primary Owner mengaktifkannya di tingkat organisasi terlebih dahulu. Jadi koordinasi dengan IT memang diperlukan, bukan sekadar formalitas.
- **Batasi cakupan.** Sambungkan hanya akun atau folder yang isinya aman, dan manfaatkan sifat read-only bawaan connector Drive/Gmail agar AI tidak dapat mengubah atau menghapus apa pun.

**Contoh konkret untuk tim HR:**

Tim HR sering ditanya hal yang sama berulang kali, misalnya "Bagaimana prosedur pengajuan cuti?" atau "Mana template surat keterangan kerja?". Sebagai quick win, sambungkan Claude secara read-only ke satu folder Drive HR yang khusus berisi SOP dan template, bukan folder berisi data karyawan. Setelah tersambung, Anda dapat bertanya: "Berdasarkan SOP cuti di folder ini, berapa hari sebelumnya pengajuan cuti harus dimasukkan?" Claude akan menjawab merujuk dokumen resmi, sehingga jawaban konsisten dan hemat waktu. Folder berisi data pribadi karyawan tetap tidak disambungkan.

**Langkah praktik singkat:**

1. Tentukan satu folder Drive yang isinya aman (SOP dan template, kategori hijau).
2. Konfirmasi ke IT dan Legal bahwa connector boleh diaktifkan.
3. Aktifkan connector Google Drive di Claude, lalu autentikasi dengan akun Google Anda.
4. Pastikan akun yang Anda hubungkan hanya memiliki akses ke folder yang aman tersebut, mengingat Claude mengikuti izin akun Anda.
5. Uji dengan satu pertanyaan, lalu periksa apakah Claude merujuk dokumen yang benar.

### Poin Kunci

- MCP adalah standar terbuka untuk menyambungkan AI ke data dan sistem; connector adalah antarmuka siap pakai yang Anda klik untuk menyambung.
- Analogi MCP adalah colokan USB-C, yaitu satu standar seragam untuk banyak sambungan, sehingga keterampilannya paling transferable lintas aplikasi AI.
- Connector membuat AI bekerja dengan konteks perusahaan yang sesungguhnya, sehingga jawabannya lebih relevan.
- Connector Gmail dan Drive bawaan bersifat read-only, dan Claude hanya menjangkau data yang sudah dapat Anda akses sendiri. Tetap periksa Traffic Light serta minta izin IT/Legal sebelum menyambung.
- Quick win HR: sambungkan read-only ke folder SOP/template, bukan folder data karyawan.

### Cek Pemahaman

1. Dengan kata-kata Anda sendiri, apa perbedaan antara MCP dan connector?
2. Mengapa menyambung secara read-only lebih aman, dan dalam situasi apa Anda tetap perlu meminta izin IT atau Legal?
3. Di tim Anda, satu folder atau sumber data "hijau" apa yang paling bermanfaat jika disambungkan ke AInya, dan mengapa folder itu aman?

<!-- Materi O4.2 · coverage=true · depth=baik -->

## Pakai & batas connector

Pada materi sebelumnya Anda mengenal apa itu connector, yaitu jembatan yang menghubungkan Claude ke aplikasi kerja seperti Google Drive, Gmail, atau kalender. Sekarang kita masuk ke praktik nyata, yaitu bagaimana menarik data dari satu sumber yang aman lalu mengolahnya dalam satu tugas, dan yang sama pentingnya, memahami batas antara sekadar membaca (read-only) dan benar-benar menulis atau bertindak ke sistem. Memahami batas ini adalah dasar agar Anda dapat menggunakan AI dengan percaya diri tanpa menimbulkan risiko pada data perusahaan.

### Quick win: tarik satu data, olah dalam satu tugas

Cara tercepat merasakan manfaat connector adalah mengerjakan satu tugas kecil dari satu sumber. Jangan langsung mencoba menggabungkan banyak file dari banyak tempat. Mulailah dari satu dokumen dengan satu tujuan.

Contoh kasus HR Indonesia: tim Anda memiliki SOP onboarding karyawan baru di Google Drive HR. Dokumen aslinya panjang, sekitar sepuluh halaman, dan jarang sempat dibaca utuh oleh manajer lini. Dengan connector Google Drive yang sudah terhubung, Anda dapat meminta Claude menarik satu file SOP itu lalu mengolahnya menjadi ringkasan prosedur yang padat.

Langkah praktiknya:

- Pastikan connector Google Drive sudah terhubung ke akun kerja Anda.
- Tulis prompt yang menyebut satu file secara spesifik, misalnya: "Cari di Google Drive file SOP Onboarding Karyawan Baru, lalu buatkan ringkasan langkah prosedurnya dalam bentuk daftar bernomor untuk dibaca manajer lini."
- Claude akan mencari file tersebut, membaca isinya, lalu menyusun ringkasan.
- Periksa hasilnya dengan membandingkan ke dokumen asli. Anda tetap pemilik keputusan akhir.

Penting untuk diketahui: connector Google Drive dapat mencari dan membaca Google Docs, Sheets, Slides, PDF, gambar, serta file Microsoft Office. Satu catatan teknis, Claude hanya mengambil teks dari file Google Drive, sehingga gambar yang tertanam di dalam dokumen tidak ikut diproses.

> Anggap connector seperti seorang asisten yang Anda izinkan masuk ke lemari arsip kantor. Pada tugas ini Anda hanya berkata, "Tolong ambilkan satu map SOP itu, lalu ringkaskan isinya untuk saya." Asisten membaca, lalu melapor. Ia tidak mencoret, tidak memindahkan, dan tidak membuang satu pun berkas asli.

### Batas: membaca vs bertindak

Inilah konsep paling penting dalam materi ini. Tindakan connector terbagi menjadi dua kategori yang dibedakan secara resmi oleh Anthropic, yaitu read-only tools (alat yang hanya membaca) dan write/delete tools (alat yang menulis atau menghapus).

- Read-only (aman, cocok untuk Operator pemula): Claude hanya membaca dan menarik data, misalnya mencari file, membaca isi dokumen, melihat metadata, atau mengambil informasi. Tidak ada perubahan yang terjadi pada sistem sumber. Inilah wilayah yang tepat untuk Anda mulai berlatih.
- Menulis atau bertindak (lanjutan, perlu kehati-hatian): Claude mengubah sesuatu di sistem, misalnya mengunggah file baru, membuat folder, mengirim email, atau menyimpan dokumen hasil olahan. Tindakan ini nyata dan memiliki konsekuensi.

Ada dua lapisan pengaman yang perlu Anda pahami.

**Pertama, Claude mewarisi izin Anda.** Connector menggunakan OAuth per pengguna. Claude hanya dapat melihat dan melakukan apa yang sudah dapat Anda lihat dan lakukan di sistem sumber. Tidak ada service account dengan akses yang lebih tinggi. Jika Anda tidak punya akses ke suatu file di Google Workspace, connector pun tidak dapat menjangkaunya. Claude tidak pernah memberi Anda akses lebih dari yang Anda miliki.

**Kedua, ada pengaturan persetujuan.** Pada paket Team dan Enterprise, pemilik organisasi (Owner) dapat membatasi tindakan yang dapat dilakukan suatu connector untuk seluruh organisasi. Untuk setiap kategori atau setiap tindakan tersedia tiga pilihan, yaitu Always allow (selalu izinkan), Needs approval (perlu persetujuan), dan Blocked (diblokir). Sebagai contoh, organisasi dapat mengizinkan connector membaca data tetapi memblokir penulisan perubahan apa pun ke sistem. Selain itu, setiap tindakan yang Claude lakukan atas nama Anda yang sifatnya menulis tetap memerlukan persetujuan eksplisit Anda terlebih dahulu sebelum dijalankan.

> Bayangkan dua jenis kunci untuk asisten tadi. Kunci pertama hanya membuka lemari arsip untuk dibaca di tempat. Kunci kedua memberi izin menulis di berkas dan mengirim surat atas nama Anda. Untuk pekerjaan sehari-hari, kunci pertama sudah cukup dan jauh lebih aman. Kunci kedua hanya diberikan saat benar-benar diperlukan dan dengan pengawasan.

Untuk peserta yang baru memulai, sebaiknya mulai dari tugas read-only sampai Anda terbiasa. Saat menghubungkan connector baru, tinjau izin yang diminta dengan cermat, batasi cakupan bila memungkinkan, dan hanya hubungkan ke layanan yang Anda percaya. Satu hal yang menenangkan: meskipun suatu tindakan tulis diizinkan di Claude, orang yang menjalankannya tetap harus memiliki izin yang sesuai di sistem sumber. Pembatasan di Claude tidak pernah menambah akses, hanya mempersempitnya.

### Poin Kunci

- Quick win terbaik adalah satu sumber, satu tugas: tarik satu file lalu olah, seperti meringkas satu SOP dari Drive HR.
- Connector Google Drive dapat mencari dan membaca Docs, Sheets, Slides, PDF, gambar, dan file Office; hanya teksnya yang diambil, gambar yang tertanam tidak diproses.
- Tindakan dibagi menjadi read-only (membaca, aman) dan write/delete (menulis atau menghapus, perlu kehati-hatian).
- Claude mewarisi izin Anda lewat OAuth: tidak dapat melihat atau melakukan apa yang tidak dapat Anda lakukan sendiri.
- Pengaturan persetujuan (Always allow, Needs approval, Blocked) memberi kendali pada organisasi, terutama untuk membatasi tindakan tulis; tindakan tulis juga tetap meminta persetujuan Anda.
- Pemula sebaiknya tetap di wilayah read-only sampai terbiasa, dan selalu meninjau izin saat menghubungkan connector baru.

### Cek Pemahaman

1. Apa perbedaan antara tindakan read-only dan tindakan write/delete pada sebuah connector, dan mengapa pemula sebaiknya memulai dari read-only?
2. Jika Anda tidak memiliki akses ke sebuah folder rahasia di Google Drive perusahaan, apakah Claude dapat membacanya untuk Anda? Jelaskan alasannya.
3. Pikirkan satu tugas read-only sederhana di pekerjaan Anda yang dapat diselesaikan dengan menarik satu dokumen dari satu sumber. Apa dokumennya dan hasil olahan seperti apa yang Anda inginkan?
