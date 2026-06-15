# Quiz Chapter F1 sampai O6

> Quiz LMS hasil penulisan + verifikasi (grounded ke materi tiap chapter), workflow `tulis-quiz-f1-o6`. Tiap chapter 5 soal pilihan ganda (4 opsi, 1 benar). Capstone tanpa quiz.

---

## Quiz F1: Fondasi AI

**1. Materi menjelaskan bahwa LLM pada dasarnya adalah "mesin penebak token" yang menebak kata berikutnya berdasarkan pola. Apa konsekuensi paling penting dari cara kerja ini bagi pengguna?**

- A. Lancar belum tentu benar, karena AI dapat menyusun kalimat yang terdengar meyakinkan tetapi isinya keliru (halusinasi)  ✅
- B. AI selalu mengingat seluruh percakapan sebelumnya dengan sempurna tanpa batas
- C. AI tidak pernah salah selama kalimatnya tersusun rapi dan profesional
- D. AI hanya dapat digunakan untuk menghitung angka, bukan menulis teks

_Penjelasan:_ Karena tugas LLM adalah membentuk pola kalimat yang mulus, bukan mengingat fakta, ia dapat tampil percaya diri tetapi salah. Inilah yang disebut halusinasi, sehingga lancar belum tentu benar.

**2. Mengapa percakapan (chat) yang sangat panjang justru dapat membuat jawaban AI melenceng?**

- A. Karena context window penuh dan terjadi context rot, yaitu akurasi serta daya ingat model menurun saat token menumpuk  ✅
- B. Karena AI sengaja melupakan permintaan agar pengguna membayar lebih
- C. Karena chat panjang otomatis mengganti model menjadi Haiku yang lebih lemah
- D. Karena context window berisi seluruh data pelatihan model sehingga selalu penuh

_Penjelasan:_ Anthropic menyebut fenomena context rot, yaitu semakin banyak token menumpuk, akurasi dan daya ingat model dapat menurun. Karena itu lebih panjang tidak otomatis lebih baik, dan ada baiknya memulai chat baru saat jawaban mulai melenceng.

**3. Bu Sari hanya perlu merapikan satu email singkat secepat mungkin. Berdasarkan panduan pemilihan model, mana pendekatan yang paling tepat?**

- A. Gunakan Haiku atau Sonnet karena tugas ringan tidak perlu model paling kuat, sebab yang terkuat belum tentu paling cepat  ✅
- B. Selalu gunakan Opus untuk semua tugas karena paling kuat dan pasti paling cepat
- C. Tidak boleh menggunakan AI untuk email karena email termasuk data merah
- D. Gunakan Opus karena context window 1 juta token wajib untuk email singkat

_Penjelasan:_ Untuk tugas ringan, model cepat seperti Haiku atau model harian seperti Sonnet sudah cukup. Materi menegaskan jangan otomatis memilih model paling kuat, karena yang terkuat belum tentu paling cepat dan hemat.

**4. Seorang staf HR ingin meminta AI publik meringkas daftar gaji satu divisi yang memuat nama dan NIK karyawan. Menurut kerangka Traffic Light, apa tindakan yang benar?**

- A. Ini data Merah, jadi jangan memasukkan identitas asli; samarkan dengan placeholder lalu masukkan data asli secara manual setelah output jadi  ✅
- B. Ini data Hijau, aman langsung ditempel apa adanya ke AI publik
- C. Ini data Kuning, cukup ditempel tanpa perubahan karena tersimpan hanya 30 hari
- D. Aman selama menggunakan paket berbayar, karena akun berbayar tidak menyimpan data

_Penjelasan:_ Gaji, NIK, dan identitas karyawan yang dapat dikenali termasuk data Merah yang tidak boleh dimasukkan ke AI publik. Solusinya adalah anonimisasi dengan placeholder, lalu memasukkan data asli secara manual di dokumen Anda.

**5. AI menghasilkan pengumuman yang menyebut "berdasarkan SE Menaker Nomor 5 Tahun 2024" lengkap dengan persentase yang terdengar meyakinkan. Apa langkah verifikasi yang paling tepat sebelum disebarkan?**

- A. Verifikasi nomor peraturan, angka, dan tanggal ke sumber resmi terlebih dahulu, karena referensi hukum dan angka rawan dikarang  ✅
- B. Langsung sebarkan karena AI sudah mencantumkan nomor peraturan yang spesifik
- C. Cukup meminta AI mengulang jawaban; jika sama berarti pasti benar
- D. Percayai AI sepenuhnya karena nadanya formal dan percaya diri

_Penjelasan:_ Nama aturan, nomor undang-undang, angka, dan tanggal sangat rawan halusinasi dan harus dicocokkan ke satu sumber resmi. Menyebarkan nomor aturan hasil halusinasi adalah salah satu kesalahan kantor yang paling umum.

---

## Quiz F2: Prompting

**1. Menurut materi, mengapa rekan kerja Anda dapat memperoleh jawaban Claude yang rapi dan langsung dapat dipakai, sementara Anda memperoleh jawaban yang melebar?**

- A. Karena model AI memang sedang dalam kondisi baik dan memberi hasil acak yang lebih bagus untuk orang tertentu
- B. Karena perbedaannya hampir selalu terletak pada cara bertanya, dan AI fluency adalah keterampilan yang dapat dilatih  ✅
- C. Karena rekan kerja Anda menggunakan paket berbayar, sedangkan hasil baik hanya muncul di paket berbayar
- D. Karena hasil yang baik dari AI memang murni keberuntungan dan tidak dapat dikendalikan

_Penjelasan:_ Hasil baik berasal dari cara bekerja sama dengan AI (AI fluency), yaitu keterampilan yang dapat dilatih, bukan keberuntungan atau kondisi model.

**2. Empat komponen anatomi prompt menurut materi adalah tujuan, audiens, format, dan batasan. Manakah contoh yang paling tepat mewakili komponen "batasan"?**

- A. Menyebutkan bahwa hasil ditujukan untuk seluruh karyawan dari staf sampai manajer
- B. Meminta hasil dalam bentuk email berjudul dengan poin-poin aturan dan kalimat penutup
- C. Menyatakan tindakan yang diminta, misalnya merapikan draft agar jelas dan mudah dipahami
- D. Menetapkan maksimal 200 kata, nada sopan, dan tidak mengubah angka atau ketentuan kebijakan  ✅

_Penjelasan:_ Batasan adalah aturan main seperti panjang maksimal, nada, dan fakta yang wajib dipertahankan. Pilihan lain berturut-turut menggambarkan audiens, format, dan tujuan.

**3. Anda ingin AI menghasilkan pengumuman internal dengan gaya dan nada yang konsisten. Menurut materi, teknik mana yang paling andal untuk mengarahkan gaya dan format keluaran?**

- A. Few-shot, yaitu menempelkan satu sampai beberapa contoh hasil yang sudah benar lalu meminta AI mengikuti polanya  ✅
- B. Chain-of-thought, yaitu meminta AI menguraikan langkah berpikirnya terlebih dahulu sebelum menyimpulkan
- C. Mengganti tool dari Claude ke Gemini agar gaya keluarannya lebih konsisten
- D. Memperpanjang instruksi dengan penjelasan tertulis sedetail mungkin tanpa memberi contoh

_Penjelasan:_ Few-shot (multishot) adalah cara paling andal mengarahkan gaya, format, dan struktur. Contoh yang baik bersifat relevan, beragam, dan terpisah jelas dari instruksi.

**4. Untuk tugas analisis kandidat yang membutuhkan banyak pertimbangan, mengapa materi menyarankan meminta AI "uraikan dahulu langkah-langkahnya, baru berikan kesimpulan"?**

- A. Karena uraian panjang selalu mempercepat AI untuk semua jenis pertanyaan, termasuk yang sederhana
- B. Karena tanpa diminta AI cenderung langsung melompat ke kesimpulan dan lebih mudah keliru, sedangkan langkah yang terlihat mempermudah pemeriksaan kesalahan  ✅
- C. Karena teknik ini menggantikan kebutuhan memberi peran atau nada pada AI
- D. Karena meminta langkah membuat AI menyimpan konteks secara permanen untuk percakapan berikutnya

_Penjelasan:_ Teknik berpikir bertahap (chain-of-thought) membuat penalaran AI terlihat sehingga jawaban lebih akurat dan kesalahan mudah ditemukan. Untuk pertanyaan sederhana justru tidak perlu.

**5. Materi menekankan bahwa keterampilan yang dipelajari di Claude bersifat transferable ke ChatGPT dan Gemini. Apa makna pernyataan ini menurut materi?**

- A. Ketiga tool memiliki menu dan letak tombol yang persis sama sehingga tidak ada perbedaan apa pun
- B. Claude lebih unggul sehingga pengguna sebaiknya tidak pernah berpindah ke tool lain
- C. Cara berpikir seperti memecah tugas, menulis prompt yang jelas, memberi konteks, dan menetapkan format berlaku sama lintas tool meski nama menu dan letak tombol berbeda  ✅
- D. Prompt yang ditulis di Claude harus diterjemahkan ulang dari awal agar dapat bekerja di Gemini

_Penjelasan:_ Prinsipnya sama lintas tool: model memberi hasil terbaik saat instruksinya jelas. Yang berbeda hanya nama menu dan letak tombol, bukan cara berpikirnya, sehingga tidak perlu belajar ulang dari nol.

---

## Quiz O1: Asisten & RAG

**1. Mengapa Claude tampak "lupa" diskusi kemarin ketika Anda membuka chat baru?**

- A. Karena setiap chat baru dimulai dari nol; context window tidak berpindah antar percakapan, sehingga memori kerja Claude kosong kembali  ✅
- B. Karena server Claude menghapus seluruh data pengguna setiap 24 jam demi keamanan
- C. Karena Claude hanya mengingat percakapan jika Anda menggunakan paket berbayar
- D. Karena terjadi kesalahan teknis (bug) yang membuat riwayat chat tidak tersimpan

_Penjelasan:_ Context window adalah memori kerja untuk satu percakapan dan tidak berpindah antar chat. Setiap chat baru mulai dari nol, sehingga Claude tidak mengingat obrolan sebelumnya kecuali konteksnya diberikan lagi.

**2. Apa perbedaan peran antara knowledge base dan custom instructions di dalam sebuah Project?**

- A. Knowledge base menyimpan dokumen sumber sebagai konteks, sedangkan custom instructions menetapkan aturan tetap tentang bagaimana Claude harus berperilaku dan menjawab  ✅
- B. Knowledge base mengatur tone jawaban, sedangkan custom instructions menyimpan file dan dokumen referensi
- C. Keduanya sama saja, hanya berbeda nama tergantung paket yang digunakan
- D. Knowledge base hanya berlaku untuk satu chat, sedangkan custom instructions hanya berlaku saat RAG aktif

_Penjelasan:_ Knowledge base adalah tempat meng-upload dokumen yang menjadi konteks bagi seluruh chat dalam Project, sementara custom instructions adalah aturan tetap soal peran, tone, dan perilaku yang membuat Claude konsisten di semua chat Project.

**3. Tim People Operations ingin membuat asisten FAQ kepegawaian. Berdasarkan prinsip Traffic Light, dokumen mana yang JANGAN di-upload ke knowledge base?**

- A. File rekap pengajuan cuti per karyawan beserta alasan medisnya (data pribadi lengkap)  ✅
- B. Buku panduan onboarding karyawan
- C. Daftar FAQ kebijakan cuti
- D. Template surat keterangan kerja

_Penjelasan:_ Data pribadi karyawan lengkap seperti alasan medis termasuk kategori MERAH dan tidak boleh di-upload. Panduan onboarding, FAQ, dan template surat termasuk HIJAU yang aman.

**4. Apa inti dari teknik RAG (Retrieval Augmented Generation) saat digunakan pada Project Claude?**

- A. Claude mencari bagian dokumen yang relevan dari knowledge base lalu menyusun jawaban berdasarkan isi dokumen tersebut, bukan murni dari ingatan model  ✅
- B. Claude mengarang jawaban secepat mungkin tanpa membaca dokumen agar lebih hemat token
- C. Claude memuat seluruh isi semua dokumen sekaligus ke dalam setiap jawaban
- D. Claude mengirim dokumen Anda ke internet untuk dicari jawabannya secara publik

_Penjelasan:_ RAG membuat Claude mengambil (retrieval) hanya bagian dokumen yang paling relevan lalu menyusun jawaban (generation) dari situ, sehingga jawaban lebih akurat, dapat ditelusuri, dan tidak mengarang.

**5. Anda menyusun kebijakan cuti yang masih akan direvisi atasan, lalu butuh versi final yang dibagikan ke semua karyawan dan tidak boleh diubah. Format apa yang paling tepat untuk masing-masing kebutuhan?**

- A. Word (.docx) untuk naskah yang masih disunting, lalu PDF untuk versi final yang dibagikan  ✅
- B. Excel (.xlsx) untuk naskah yang disunting, lalu PowerPoint (.pptx) untuk versi final
- C. PDF untuk naskah yang disunting, lalu Word (.docx) untuk versi final
- D. PowerPoint (.pptx) untuk keduanya karena paling fleksibel

_Penjelasan:_ Word cocok untuk naskah yang masih akan disunting, sedangkan PDF cocok untuk dokumen final yang dibagikan dan tidak boleh diubah.

---

## Quiz O2: Artifact

**1. Apa perbedaan mendasar antara artifact statis dan artifact interaktif?**

- A. Artifact statis hanya dibaca dan isinya tetap, sedangkan artifact interaktif menerima masukan lalu menghitung atau menampilkan hasil yang berbeda sesuai input  ✅
- B. Artifact statis tampil di panel kanan, sedangkan artifact interaktif tampil di dalam chat
- C. Artifact statis hanya dapat dibuat pada paket berbayar, sedangkan artifact interaktif gratis
- D. Artifact statis dibuat dengan menulis kode, sedangkan artifact interaktif tidak memerlukan kode sama sekali

_Penjelasan:_ Seperti analogi brosur cetak versus mesin ATM: artifact statis (misalnya draf surat) hanya dibaca dan isinya tetap, sedangkan artifact interaktif (misalnya kalkulator) menerima masukan lalu menghitung hasil yang berbeda sesuai angka yang dimasukkan.

**2. Manakah contoh yang paling tepat dari sebuah artifact yang merupakan alat yang dapat sungguhan dipakai, bukan sekadar teks untuk dibaca?**

- A. Kalkulator simulasi take-home pay yang menghitung otomatis saat angka diubah  ✅
- B. Ringkasan rapat dalam bentuk paragraf
- C. Jawaban panjang berisi penjelasan kebijakan cuti
- D. Draf email balasan untuk kandidat

_Penjelasan:_ Artifact dapat berupa alat yang sungguhan dipakai seperti kalkulator, tracker, atau dashboard kecil. Kalkulator take-home pay menerima masukan dan menghitung otomatis, sedangkan pilihan lain hanya teks untuk dibaca.

**3. Kapan sebaiknya Anda memilih visual (flowchart atau diagram) daripada paragraf untuk menyampaikan informasi?**

- A. Saat menjelaskan alur proses bertahap, perbandingan angka antar kelompok, atau hubungan dan hierarki  ✅
- B. Saat menjelaskan kebijakan sensitif yang memerlukan banyak nuansa dan pertimbangan
- C. Setiap kali, karena visual selalu lebih baik daripada teks dalam segala situasi
- D. Hanya saat Anda menggunakan paket berbayar Pro atau Enterprise

_Penjelasan:_ Visual lebih efektif untuk alur proses, perbandingan angka, serta hubungan atau hierarki karena mata cepat menangkap struktur. Untuk pesan bernuansa yang memerlukan pertimbangan, paragraf justru lebih tepat.

**4. Sebuah ide alat Anda mulai bergeser dari wilayah Operator (cukup artifact) ke wilayah membuat aplikasi. Manakah tanda yang menunjukkan pergeseran tersebut?**

- A. Alat harus dipakai banyak pengguna terus-menerus, butuh database permanen besar, dan terhubung ke sistem internal perusahaan seperti HRIS  ✅
- B. Alat hanya dipakai diri sendiri atau tim kecil dengan data dummy sementara
- C. Alat berupa satu halaman dengan satu fungsi yang hidup di dalam Claude
- D. Alat dibuat hanya dengan menjelaskan kebutuhan tanpa menulis kode

_Penjelasan:_ Sinyal bergeser ke membuat aplikasi adalah kebutuhan banyak pengguna terus-menerus, database permanen besar, dan integrasi ke sistem perusahaan seperti HRIS. Saat ini terjadi, sebaiknya libatkan tim IT atau developer.

**5. Apa perbedaan penting antara visual inline dan artifact terkait penyimpanan?**

- A. Visual inline bersifat sementara dan tidak otomatis tersimpan saat percakapan berlanjut, sedangkan artifact tersimpan di panel terpisah  ✅
- B. Visual inline tersimpan permanen otomatis, sedangkan artifact selalu hilang setelah chat ditutup
- C. Keduanya sama-sama tersimpan otomatis tanpa batas penyimpanan apa pun
- D. Visual inline hanya tersedia di paket berbayar, sedangkan artifact gratis untuk semua

_Penjelasan:_ Visual inline bersifat sementara (ephemeral), yaitu muncul sebagai bagian dari jawaban dan tidak otomatis tersimpan ketika percakapan berlanjut, sedangkan artifact tampil dan tersimpan di panel terpisah.

---

## Quiz O3: Riset

**1. Seorang staf HR ingin menyusun draf email selamat datang untuk karyawan baru dan menjelaskan konsep umum tentang proses onboarding. Mode mana yang paling tepat?**

- A. Chat biasa, karena tugas ini konseptual dan tidak bergantung pada informasi terkini  ✅
- B. Web search, karena setiap jawaban Claude wajib diambil dari internet secara langsung
- C. Research, karena draf email selalu membutuhkan perbandingan banyak sumber
- D. Code execution, karena menulis email memerlukan perhitungan yang akurat

_Penjelasan:_ Chat biasa sudah memadai untuk tugas yang sifatnya konseptual dan tidak bergantung waktu, seperti menyusun draf email atau menjelaskan konsep umum. Web search baru diperlukan saat jawaban bergantung pada informasi terkini atau fakta yang dapat berubah.

**2. Apa perbedaan utama antara satu kali web search dan mode Research, dan kapan sebaiknya memilih Research?**

- A. Web search bekerja agentik dengan banyak langkah, sedangkan Research hanya membaca satu URL yang Anda tempel
- B. Research merencanakan dan menjalankan beberapa pencarian yang saling membangun, cocok untuk pertanyaan berlapis yang membutuhkan perbandingan banyak sumber  ✅
- C. Research hanya tersedia gratis, sedangkan web search hanya untuk plan berbayar
- D. Keduanya identik, perbedaannya hanya nama tombol yang diklik

_Penjelasan:_ Research adalah mode agentik yang merencanakan proses riset dan menjalankan beberapa pencarian yang saling membangun, sehingga cocok untuk pertanyaan berlapis yang membutuhkan perbandingan banyak sumber. Untuk pertanyaan sederhana, satu kali web search sudah cukup.

**3. Tim HR meng-upload 15 berkas CV dalam format PDF dan beberapa foto sertifikat pelatihan untuk dibandingkan. Pernyataan mana yang benar mengenai kemampuan Claude membaca berkas ini?**

- A. Claude tidak dapat membaca PDF maupun gambar, hanya teks yang diketik langsung di kolom chat
- B. Claude dapat membaca isi PDF, termasuk tabel dan grafik untuk PDF di bawah 100 halaman, serta gambar seperti foto sertifikat  ✅
- C. Claude hanya dapat membaca satu berkas per chat, sehingga 15 CV harus dikirim satu per satu di chat berbeda
- D. Foto sertifikat tidak dapat dibaca karena Claude hanya mendukung dokumen teks

_Penjelasan:_ Untuk PDF di bawah 100 halaman, Claude membaca teks sekaligus elemen visual seperti tabel dan grafik, dan untuk gambar Claude dapat membaca informasi seperti nama serta tanggal pada foto sertifikat. Batas chat adalah 20 berkas per chat, sehingga 15 CV dapat di-upload dalam satu chat.

**4. Apa perbedaan mendasar antara Claude yang menjalankan code execution untuk menghitung total gaji dengan Claude yang sekadar memberi file ekspor?**

- A. Code execution hanya menebak kata yang paling masuk akal, sedangkan ekspor file menghitung secara presisi
- B. Tidak ada perbedaan, keduanya menghasilkan angka tebakan yang sama
- C. Dengan code execution Claude menjalankan kode sungguhan terhadap data sehingga hasilnya akurat dan dapat direproduksi, sedangkan ekspor hanya memberi file mentah untuk Anda olah sendiri  ✅
- D. Code execution memberi Anda data mentah, sedangkan ekspor file menampilkan langkah perhitungannya

_Penjelasan:_ Code execution membuat Claude menjalankan kode sungguhan di dalam sandbox untuk mengolah data, sehingga hasilnya akurat secara matematis dan dapat direproduksi, bukan tebakan. Ekspor file hanya memberi Anda berkas mentah untuk diolah sendiri.

**5. Claude memberi jawaban berisi angka iuran BPJS Kesehatan terbaru dan sebuah draf pengumuman cuti bersama. Bagaimana sebaiknya kedua output ini diperlakukan menurut klasifikasi risiko output?**

- A. Angka iuran BPJS adalah output faktual yang wajib diverifikasi ke sumber primer; draf pengumuman adalah output generatif yang dapat langsung digunakan lalu disunting  ✅
- B. Keduanya output generatif, sehingga keduanya dapat langsung digunakan tanpa pemeriksaan
- C. Angka iuran BPJS adalah output generatif, sedangkan draf pengumuman adalah output faktual yang wajib diverifikasi
- D. Keduanya output analitik, sehingga keduanya cukup diperiksa dengan code execution

_Penjelasan:_ Angka iuran BPJS termasuk output faktual yang berisiko tinggi karena satu angka salah dapat berdampak pada kepatuhan hukum, sehingga wajib diverifikasi ke sumber primer. Draf pengumuman termasuk output generatif yang berisiko rendah dan aman digunakan langsung dengan sedikit penyuntingan.

---

## Quiz O4: MCP

**1. Apa pengertian paling tepat dari MCP (Model Context Protocol)?**

- A. Standar terbuka (open standard) untuk menyambungkan aplikasi AI ke sistem eksternal seperti sumber data, tools, dan workflow  ✅
- B. Sebuah produk berbayar milik Anthropic yang hanya dapat dipakai di Claude
- C. Fitur untuk meng-upload file secara manual ke jendela percakapan AI
- D. Pengaturan keamanan yang memblokir AI dari mengakses internet

_Penjelasan:_ MCP adalah standar terbuka dan open-source yang tidak dimiliki satu perusahaan, sehingga satu hubungan dapat dipakai banyak aplikasi AI yang berbeda.

**2. Apa perbedaan antara MCP dan connector?**

- A. MCP adalah aturan main atau bahasanya, sedangkan connector adalah antarmuka siap pakai yang Anda klik untuk menyambung ke layanan tertentu  ✅
- B. MCP adalah colokan fisik di komputer, sedangkan connector adalah perangkat lunak antivirus
- C. MCP hanya untuk Gmail, sedangkan connector hanya untuk Google Drive
- D. Keduanya adalah istilah yang sama persis tanpa perbedaan makna

_Penjelasan:_ MCP adalah standar atau bahasanya, sedangkan connector adalah produk nyata, yaitu colokan siap pakai yang menghubungkan AI ke sebuah layanan tertentu.

**3. Sebelum mengklik tombol connect untuk menyambungkan Claude ke Google Drive, langkah governance apa yang sebaiknya dilakukan terlebih dahulu?**

- A. Memeriksa Traffic Light data (pastikan tergolong hijau, bukan merah) dan meminta izin IT serta Legal  ✅
- B. Langsung menyambungkan semua folder agar AI memiliki konteks selengkap mungkin
- C. Menonaktifkan akun Google terlebih dahulu agar lebih aman
- D. Menyalin seluruh isi folder ke komputer pribadi sebagai cadangan

_Penjelasan:_ Governance terlebih dahulu, baru menyambung: pastikan data tergolong hijau (aman), bukan merah (sensitif), dan untuk akun Team atau Enterprise koordinasi dengan IT dan Legal memang diperlukan.

**4. Manakah pernyataan yang benar tentang sifat read-only connector Gmail dan Google Drive bawaan?**

- A. Claude hanya membaca isi dan (khusus Gmail) membuat draf, tetapi tidak dapat mengubah, memindahkan, atau menghapus file dan email yang sudah ada  ✅
- B. Claude dapat mengirim email atas nama Anda secara otomatis tanpa persetujuan
- C. Claude dapat menghapus file di Drive untuk merapikan folder Anda
- D. Claude dapat melihat semua data di seluruh organisasi, bahkan yang tidak dapat Anda akses sendiri

_Penjelasan:_ Connector Gmail dan Drive bawaan bersifat read-only: Claude membaca isi dan membuat draf di Gmail, tetapi tidak mengubah, memindahkan, atau menghapus apa pun, dan hanya menjangkau data yang sudah dapat Anda akses sendiri.

**5. Mengapa peserta pemula (Operator) sebaiknya memulai dari tindakan read-only, bukan langsung tindakan menulis atau bertindak ke sistem?**

- A. Karena read-only hanya membaca dan menarik data tanpa mengubah sistem sumber, sehingga aman dan tidak menimbulkan konsekuensi nyata pada data perusahaan  ✅
- B. Karena tindakan menulis selalu gratis sedangkan read-only memerlukan biaya tambahan
- C. Karena read-only memberi Claude akses lebih tinggi daripada yang Anda miliki sendiri
- D. Karena tindakan menulis tidak pernah dapat dilakukan oleh connector mana pun

_Penjelasan:_ Read-only hanya membaca dan menarik data tanpa perubahan pada sistem sumber, sementara menulis atau bertindak (mengunggah, mengirim email, menghapus) memiliki konsekuensi nyata, jadi pemula sebaiknya berlatih dahulu di wilayah read-only.

---

## Quiz O5: Skill

**1. Apa definisi Skill yang paling tepat menurut materi, dan kapan Skill paling layak digunakan?**

- A. Paket instruksi reusable (folder berisi SKILL.md) yang dimuat Claude otomatis untuk jenis tugas tertentu, cocok untuk tugas berulang dengan format atau aturan tetap  ✅
- B. Sebuah percakapan tunggal yang disimpan agar dapat dibuka kembali di kemudian hari
- C. Pengaturan tingkat akun untuk mengubah bahasa dan nada jawaban Claude di semua chat
- D. Fitur untuk menambah jumlah token pada context window agar Claude dapat membaca dokumen panjang

_Penjelasan:_ Skill adalah paket instruksi reusable berupa folder berisi SKILL.md yang dimuat otomatis untuk jenis tugas tertentu, dan paling berguna saat tugas sering berulang serta memiliki format atau aturan tetap.

**2. Saat membuat Skill sendiri, mengapa field description pada metadata menjadi bagian terpenting?**

- A. Karena description adalah yang dibaca Claude untuk memutuskan kapan Skill harus dipanggil, sehingga jika tidak jelas Skill berisiko tidak terpicu  ✅
- B. Karena description menentukan urutan file pendukung yang akan dijalankan terlebih dahulu
- C. Karena description menggantikan seluruh isi SKILL.md sehingga badan instruksi tidak perlu ditulis
- D. Karena description menentukan harga atau kuota token yang dipakai Skill setiap kali aktif

_Penjelasan:_ Lewat progressive disclosure, Claude membaca description untuk menilai relevansi dan memutuskan kapan memanggil Skill, sehingga deskripsi yang kabur dapat membuat Skill gagal terpanggil.

**3. Bagaimana langkah yang benar untuk memasang Skill yang sudah jadi dari directory di Claude?**

- A. Buka Customize di sidebar kiri, klik tombol "+" untuk membuka directory, pilih tab Skills, cari Skill, lalu klik Install dan pastikan toggle-nya menyala  ✅
- B. Buka Settings > Capabilities, lalu salin kode Skill ke dalam Instructions for Claude
- C. Kemas Skill menjadi file ZIP terlebih dahulu, lalu unggah melalui menu Projects
- D. Kirim file SKILL.md sebagai lampiran di dalam percakapan agar Claude membacanya

_Penjelasan:_ Memasang Skill jadi dilakukan lewat Customize, membuka directory dengan tombol "+", memilih tab Skills, lalu klik Install dan memastikan Skill aktif (toggle menyala). Pengemasan ZIP hanya untuk Skill buatan sendiri.

**4. Seorang staf HR menemukan Skill "Rekap Cuti Otomatis" dari grup WhatsApp yang berisi instruksi untuk mengirim daftar nama dan nomor karyawan ke sebuah alamat web. Mengapa Skill ini patut dicurigai?**

- A. Karena Skill meminta mengirim data ke alamat luar yang tidak relevan dengan fungsinya, sebuah tanda risiko data exfiltration dan kemungkinan prompt injection  ✅
- B. Karena Skill berasal dari WhatsApp, padahal Skill hanya boleh diunduh melalui email resmi perusahaan
- C. Karena Skill tidak memiliki field name sehingga tidak dapat dikenali oleh Claude
- D. Karena merekap cuti membutuhkan code execution yang selalu berbahaya untuk diaktifkan

_Penjelasan:_ Fungsi merekap cuti tidak memerlukan pengiriman data ke luar, sehingga instruksi mengirim data karyawan ke alamat web menandakan risiko data exfiltration dan prompt injection. Inilah alasan harus meninjau isi Skill sebelum memasang.

**5. Anda lelah mengetik ulang "jawab singkat dan dalam Bahasa Indonesia baku" di setiap percakapan. Di mana sebaiknya preferensi ini diatur agar berlaku otomatis di semua percakapan?**

- A. Di bagian Instructions for Claude pada Settings, yaitu pengaturan tingkat akun yang berlaku untuk semua percakapan  ✅
- B. Di Project instructions, karena pengaturan ini otomatis menyebar ke seluruh chat di luar proyek
- C. Dengan menulis ulang preferensi di awal setiap chat baru, karena tidak ada cara mengaturnya sekali
- D. Di field description sebuah Skill, karena description mengatur gaya jawaban di semua percakapan

_Penjelasan:_ Instructions for Claude di Settings adalah pengaturan tingkat akun yang berlaku di semua percakapan, sedangkan Project instructions hanya berlaku di dalam proyek terkait.

---

## Quiz O6: Cowork

**1. Apa perbedaan inti antara cara kerja biasa (satu perintah satu jawaban) dan pola Cowork?**

- A. Pada Cowork, Anda menyebut tujuan akhir lalu AI yang menyusun rencana dan mengeksekusi banyak langkah, sementara Anda mengarahkan dan me-review hasilnya.  ✅
- B. Pada Cowork, AI mengambil semua keputusan penting sendiri tanpa perlu campur tangan manusia lagi.
- C. Pada Cowork, Anda harus menyetir setiap langkah secara manual agar hasilnya lebih akurat.
- D. Pada Cowork, AI hanya menjawab satu pertanyaan tetapi dengan jawaban yang lebih panjang.

_Penjelasan:_ Cowork adalah pola delegasi multi-langkah: Anda memberi tujuan, AI merencanakan dan mengeksekusi, sedangkan Anda tetap mengarahkan dan me-review. Keputusan berkonsekuensi tetap di tangan manusia.

**2. Anda akan menjalankan Cowork pada folder berisi file sensitif yang belum Anda kenal. Mode izin mana yang paling tepat dan mengapa?**

- A. Mode "Ask before acting", karena Claude berhenti dan meminta persetujuan tiap langkah sehingga lebih aman untuk pekerjaan sensitif.  ✅
- B. Mode "Act without asking", karena lebih cepat dan tidak menyela pekerjaan Anda.
- C. Tidak ada bedanya, karena Claude selalu meminta izin untuk setiap tindakan apa pun modenya.
- D. Mode "Act without asking", karena file sensitif justru lebih aman ditangani tanpa jeda.

_Penjelasan:_ Mode "Ask before acting" membuat Claude berhenti dan meminta persetujuan tiap langkah, mode aman yang disarankan untuk pekerjaan sensitif atau file yang belum dikenal.

**3. Manakah pernyataan yang benar tentang otomasi terjadwal (/schedule) di Claude Cowork?**

- A. Tugas terjadwal hanya berjalan saat komputer menyala dan aplikasi Claude Desktop terbuka; tugas yang terlewat akan dijalankan otomatis begitu komputer bangun atau aplikasi dibuka kembali.  ✅
- B. Tugas terjadwal berjalan di server Anthropic sehingga tetap jalan walau komputer Anda mati.
- C. Tugas terjadwal sangat cocok untuk mengirim pesan dan melakukan pembelian otomatis tanpa pengawasan.
- D. Tugas yang terlewat saat komputer tidur akan hilang selamanya dan harus dibuat ulang manual.

_Penjelasan:_ Tugas terjadwal hanya jalan saat komputer menyala dan aplikasi terbuka; yang terlewat akan menyusul otomatis. Tugas yang sulit dibatalkan seperti mengirim pesan atau membeli sebaiknya tidak dijadwalkan.

**4. Anda merancang otomasi rekap mingguan lamaran yang hasilnya belum boleh dilihat orang lain sebelum Anda periksa. Praktik mana yang paling tepat?**

- A. Jadwalkan Claude menghasilkan tabel rekap, lalu jadwalkan juga pengiriman otomatis ke tim setelah rekap selesai agar Anda tidak perlu turun tangan.
- B. Jadwalkan Claude membuat rekap sekaligus langsung mengirimkannya ke tim agar lebih hemat waktu.
- C. Latih terlebih dahulu dengan data dummy, jadwalkan Claude hanya membuat rekap, lalu Anda yang membaca, mengoreksi, dan membagikan; pengiriman tidak dilakukan otomatis.  ✅
- D. Gunakan mode "Act without asking" pada data sungguhan sejak awal agar prosesnya cepat selesai.

_Penjelasan:_ Mulailah dengan data dummy dan hasil yang mudah diperiksa, jadwalkan hanya pembuatan rekap, lalu manusia yang membaca, mengoreksi, dan membagikannya. Pengiriman otomatis ke orang lain justru bertentangan dengan prinsip tetap diawasi.

**5. Seorang rekan mengeluh jawaban Claude makin lambat dan kurang akurat setelah percakapan berjalan sangat panjang membahas banyak topik berbeda. Berdasarkan konsep yang dibahas, saran terbaik adalah?**

- A. Mulai sesi baru saat berpindah topik, berikan hanya konteks relevan, dan minta output ringkas, karena context yang menumpuk memicu context rot.  ✅
- B. Tempelkan ulang seluruh dokumen terkait ke dalam percakapan agar Claude memiliki lebih banyak context.
- C. Teruskan percakapan yang sama selama mungkin karena lebih banyak context selalu meningkatkan akurasi.
- D. Minta jawaban sepanjang mungkin agar Claude lebih teliti meski lebih boros token.

_Penjelasan:_ Context rot membuat akurasi dan daya ingat model menurun saat token bertambah. Menjaga context lean (reset sesi, konteks relevan, output ringkas) membuat model lebih fokus, cepat, akurat, sekaligus hemat token dan biaya.
