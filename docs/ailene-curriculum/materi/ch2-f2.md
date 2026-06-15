# Materi Chapter 2, F2: Prompting & cara pikir kerja sama AI

> Materi LMS hasil penulisan + verifikasi ke sumber resmi Anthropic (workflow `tulis-materi-ch2-9`). Tiap section ## = field `content` satu item Materi.

<!-- Materi F2.1 · coverage=true · depth=baik -->

## Mindset & anatomi prompt

Hasil yang baik dari AI bukan sekadar keberuntungan. Ketika rekan kerja Anda mendapat jawaban Claude yang rapi dan langsung dapat digunakan, sementara Anda mendapat jawaban yang melebar dan kurang tepat, perbedaannya hampir selalu terletak pada cara bertanya, bukan pada "model yang sedang baik hati". Materi ini membahas dua hal, yakni pola pikir bekerja sama dengan AI (AI fluency) dan anatomi prompt yang terdiri atas empat komponen sederhana, sehingga Anda dapat menyusun permintaan yang tajam sejak awal.

### AI fluency: kerja sama dengan AI adalah keterampilan

AI fluency berarti kemampuan bekerja sama dengan AI secara efektif. Ini adalah keterampilan yang dapat dilatih, sama seperti keterampilan menulis email yang jelas atau membuat brief yang baik untuk vendor. Hasil yang bagus datang dari cara Anda mengarahkan, bukan dari kebetulan.

Anthropic memberikan satu analogi yang sangat membantu untuk pemula: anggap Claude sebagai karyawan baru yang cerdas, tetapi belum mengenal norma, singkatan internal, dan cara kerja perusahaan Anda. Semakin tepat Anda menjelaskan apa yang Anda inginkan, semakin baik hasilnya.

> Bayangkan Anda meminta tolong staf magang yang pandai pada hari pertamanya. Jika Anda hanya berkata "tolong rapikan ini", ia akan menebak. Jika Anda menjelaskan untuk siapa, dalam bentuk apa, dan sepanjang apa, ia akan langsung mengerjakan dengan benar. Claude juga demikian.

Konsep ini berlaku lintas tool. Teknik yang Anda pelajari di Claude dapat dipindahkan (transferable) ke GPT maupun Gemini, karena prinsipnya sama: model memberi hasil terbaik ketika instruksinya jelas dan eksplisit. Anthropic menyebut prinsip dasar ini "be clear and direct", yakni jelas dan langsung. Jika Anda menginginkan hasil yang melebihi standar, mintalah secara eksplisit, jangan berharap model menebaknya dari prompt yang samar.

### Anatomi prompt: empat komponen (quick win)

Prompt yang tajam umumnya memuat empat komponen berikut. Anggap ini sebagai daftar periksa singkat sebelum menekan kirim.

- **Tujuan**: apa yang sebenarnya Anda minta. Sebutkan tindakannya secara langsung (rapikan, ringkas, buat draft, bandingkan), bukan sekadar topiknya.
- **Audiens**: untuk siapa hasil ini. Karyawan baru, seluruh karyawan, manajer, atau klien. Audiens menentukan nada dan tingkat formalitas.
- **Format**: bentuk keluaran yang Anda inginkan. Paragraf, poin-poin, tabel, atau email dengan salam pembuka dan penutup. Anthropic menekankan agar Anda spesifik soal format keluaran yang diinginkan.
- **Batasan**: aturan main. Panjang maksimal, nada (sopan, ringkas), kata yang dihindari, atau fakta yang wajib dipertahankan.

Satu tips tambahan dari Anthropic: berikan konteks atau alasan di balik instruksi Anda. Misalnya, "tulis ringkas karena akan ditempel di papan pengumuman" membantu model memahami tujuan sehingga hasilnya lebih tepat sasaran. Ada pula "aturan emas" (golden rule) yang praktis: tunjukkan prompt Anda kepada rekan kerja yang minim konteks dan minta ia mengikutinya. Jika ia bingung, Claude pun akan bingung.

### Membandingkan prompt lemah dan prompt tajam

Mari gunakan kasus HR yang umum: Anda memiliki draft pengumuman kebijakan cuti yang masih kasar dan ingin merapikannya.

**Prompt lemah:**

> Tolong rapikan pengumuman cuti ini.

Masalahnya: tidak ada audiens, tidak ada format, tidak ada batasan. Model akan menebak. Hasilnya dapat terlalu panjang, terlalu kaku, atau justru mengubah isi kebijakan.

**Prompt tajam (memuat empat komponen):**

> **Tujuan:** Rapikan draft pengumuman kebijakan cuti di bawah ini agar jelas dan mudah dipahami.
> **Audiens:** Seluruh karyawan, dari staf sampai manajer.
> **Format:** Email pengumuman dengan judul, satu paragraf pembuka, poin-poin aturan utama, dan satu kalimat penutup berisi narahubung.
> **Batasan:** Nada sopan dan ramah, maksimal 200 kata, jangan mengubah angka atau ketentuan kebijakan, hindari istilah hukum yang rumit.
>
> Berikut drafnya: [tempel draft Anda di sini]

Tabel berikut merangkum perbedaannya.

| Komponen | Prompt lemah | Prompt tajam |
| --- | --- | --- |
| Tujuan | "rapikan" (kabur) | rapikan agar jelas dan mudah dipahami |
| Audiens | tidak disebut | seluruh karyawan |
| Format | tidak disebut | email berjudul, poin aturan, penutup |
| Batasan | tidak disebut | sopan, maksimal 200 kata, angka tidak diubah |

Dengan prompt tajam, hasilnya konsisten dan langsung dapat dipakai, bukan karena keberuntungan, melainkan karena Anda memberi arah yang lengkap.

### Langkah praktik

1. Ambil satu tugas tulis-menulis nyata di pekerjaan Anda (misalnya draft pengumuman, balasan email, atau ringkasan rapat).
2. Tulis tujuannya dalam satu kalimat yang dimulai dengan kata kerja (rapikan, ringkas, buat).
3. Tambahkan audiens: untuk siapa hasil ini.
4. Tentukan format keluaran yang Anda inginkan.
5. Tuliskan batasan: panjang, nada, dan hal yang tidak boleh diubah.
6. Tempel materi sumber Anda, lalu kirim ke Claude.
7. Jika hasil belum pas, perbaiki satu komponen saja (biasanya batasan atau format), lalu minta revisi. Inilah inti dari kerja sama dengan AI.

### Poin Kunci

- Hasil baik berasal dari cara kerja sama dengan AI, bukan keberuntungan. AI fluency adalah keterampilan yang dapat dilatih.
- Perlakukan Claude seperti karyawan baru yang cerdas namun belum mengenal konteks Anda. Jelaskan keinginan Anda secara eksplisit.
- Empat komponen prompt: tujuan, audiens, format, batasan.
- Tambahkan konteks atau alasan di balik permintaan agar hasil lebih tepat sasaran.
- Aturan emas: jika rekan kerja yang minim konteks bingung membaca prompt Anda, Claude pun akan bingung.
- Prinsip ini transferable ke GPT dan Gemini.

### Cek Pemahaman

1. Dari empat komponen (tujuan, audiens, format, batasan), komponen mana yang paling sering Anda lupakan saat meminta bantuan AI selama ini?
2. Ambil prompt lemah "buatkan ringkasan rapat". Bagaimana Anda akan menambahkan audiens, format, dan batasan agar menjadi prompt tajam?
3. Mengapa menyebutkan alasan (misalnya "akan dibacakan di rapat") dapat membuat hasil AI lebih baik?

<!-- Materi F2.2 · coverage=true · depth=baik -->

## Teknik prompting

Pada materi sebelumnya kita belajar dasar menyusun prompt, yaitu konteks yang jelas, instruksi spesifik, dan format keluaran. Sekarang kita naik satu tingkat. Empat teknik berikut adalah cara paling cepat membuat keluaran AI terasa "pas" tanpa harus mengetik ulang berkali-kali, yaitu memberi contoh (few-shot), meminta AI berpikir bertahap, mengatur peran dan nada, serta memperbaiki keluaran lewat iterasi. Semua teknik ini bersumber dari panduan resmi Anthropic dan berlaku juga untuk GPT maupun Gemini.

### Few-shot: tunjukkan contoh, bukan hanya minta

Cara paling andal mengarahkan gaya, format, dan struktur keluaran adalah dengan memberi contoh. Anthropic menyebutnya few-shot atau multishot prompting. Daripada panjang lebar menjelaskan format yang Anda inginkan, cukup tempelkan satu sampai beberapa contoh hasil yang sudah benar, lalu minta AI mengikuti polanya.

> Bayangkan Anda melatih staf baru. Menjelaskan secara lisan "buat ringkasan rapat yang rapi" sering disalahartikan. Tetapi begitu Anda menunjukkan satu contoh ringkasan rapat lama yang formatnya sudah pas, staf langsung paham. AI bekerja dengan cara yang sama.

Menurut docs Anthropic, contoh yang baik memiliki tiga ciri: relevan (mirip dengan kasus nyata Anda), beragam (mencakup variasi sehingga AI tidak menangkap pola yang keliru), dan terstruktur (dipisahkan jelas dari instruksi). Anthropic menyarankan menyertakan 3 sampai 5 contoh untuk hasil terbaik, walaupun 1 sampai 2 contoh sudah memberi lompatan kualitas yang besar.

Contoh untuk tim HR. Anda ingin menulis pengumuman internal dengan nada yang konsisten:

```
Tolong tulis pengumuman libur bersama dengan gaya seperti contoh berikut.

Contoh:
"Halo rekan-rekan, sehubungan dengan Hari Kemerdekaan, kantor akan tutup pada
17 Agustus. Operasional kembali normal 18 Agustus. Selamat berlibur, sampai
jumpa kembali dengan semangat baru."

Sekarang buat pengumuman serupa untuk cuti bersama Idulfitri tanggal 19 sampai 23 Mei.
```

Dengan satu contoh saja, AI menangkap panjang, nada hangat, dan strukturnya sekali jalan.

### Minta AI berpikir bertahap untuk tugas kompleks

Untuk tugas yang rumit (analisis, perhitungan, keputusan dengan banyak pertimbangan), mintalah AI menguraikan langkah berpikirnya terlebih dahulu sebelum memberi jawaban akhir. Anthropic menyebut teknik ini chain-of-thought, yaitu membiarkan Claude berpikir terlebih dahulu. Tanpa diminta, AI cenderung langsung melompat ke kesimpulan dan lebih mudah keliru.

> Ini seperti meminta rekan kerja menunjukkan cara hitung di kertas coret-coret, bukan hanya menyebut angka akhirnya. Saat langkahnya terlihat, kesalahan jauh lebih mudah ditemukan dan diperbaiki.

Cara melakukannya cukup sederhana, yaitu tambahkan kalimat seperti "Uraikan dahulu langkah-langkahnya, baru berikan kesimpulan." Untuk hasil yang lebih rapi, docs Anthropic menyarankan memisahkan proses berpikir dari jawaban akhir menggunakan penanda, misalnya bagian "Analisis" lalu bagian "Rekomendasi".

Contoh untuk operasional:

```
Saya punya 3 kandidat untuk posisi admin: A (pengalaman 5 tahun, minta gaji tinggi),
B (fresh graduate, cepat belajar), C (pengalaman 2 tahun, gaji sedang).

Uraikan dahulu pertimbangan untuk tiap kandidat (kelebihan, kekurangan, kecocokan
dengan kebutuhan tim kecil). Setelah itu, baru berikan rekomendasi akhir Anda.
```

Catatan praktis: teknik ini paling berguna untuk tugas yang sungguh membutuhkan penalaran bertahap. Untuk pertanyaan sederhana, meminta uraian panjang justru memperlambat dan tidak perlu.

### Atur peran dan nada

Menetapkan peran atau persona mengubah sudut pandang, kedalaman, dan nada jawaban AI. Docs Anthropic menegaskan bahwa bahkan satu kalimat peran saja sudah membuat perbedaan nyata pada fokus dan gaya keluaran. Saat Anda menulis "Anda adalah konsultan HR berpengalaman", AI akan memilih kosakata, prioritas, dan tingkat detail yang berbeda dibanding tanpa peran.

> Pertanyaan yang sama, "bagaimana menyampaikan kabar PHK", akan dijawab berbeda oleh seorang pengacara, seorang psikolog, dan seorang manajer HR. Memberi peran berarti memilih "siapa" yang Anda ajak bicara.

Anda dapat mengatur dua hal sekaligus: peran (siapa dia) dan nada (bagaimana dia berbicara). Contoh:

```
Berperanlah sebagai HR Business Partner yang empatik namun tetap profesional.
Gunakan nada yang menenangkan dan tidak menggurui.

Susun naskah singkat untuk memberi tahu seorang karyawan bahwa pengajuan kenaikan
gajinya ditunda sampai kuartal berikutnya.
```

Di Claude, peran dapat ditulis di awal percakapan, atau diatur secara permanen melalui fitur Project (tersedia di paket berbayar) agar berlaku untuk semua percakapan di dalamnya. Mengubah peran adalah cara cepat menggeser hasil dari "terlalu kaku" menjadi "lebih manusiawi", atau dari "terlalu umum" menjadi "lebih ahli".

### Iterasi dan feedback loop

Jarang sekali keluaran pertama langsung sempurna, dan itu wajar. Kunci penggunaan AI yang mahir bukan menulis prompt sempurna sekali jadi, melainkan memperbaiki keluaran melalui percakapan. Docs Anthropic menyebut pola yang paling umum sebagai self-correction, yaitu hasilkan draf, tinjau terhadap kriteria, lalu perbaiki.

> Anggap percakapan dengan AI seperti bolak-balik revisi dengan asisten. Anda tidak memberhentikan asisten karena draf pertamanya kurang tepat. Anda memberi tahu apa yang meleset, dan dia memperbaiki.

Ada tiga cara memperbaiki keluaran yang meleset:

- Refine, yaitu beri instruksi perbaikan spesifik. Contoh: "Versi ini terlalu formal. Buat lebih santai dan persingkat menjadi tiga kalimat."
- Beri contoh, yaitu tunjukkan seperti apa yang Anda inginkan (kembali ke teknik few-shot). Contoh: "Bukan begitu, saya mau gaya seperti ini: [tempel contoh]."
- Ganti pendekatan, yaitu jika beberapa kali revisi tetap melenceng, ubah perannya atau minta AI menguraikan langkah terlebih dahulu.

Contoh feedback loop untuk surat peringatan:

```
Putaran 1: "Buat draf surat teguran untuk keterlambatan berulang."
Putaran 2: "Terlalu keras. Buat lebih membina, fokus pada solusi, bukan ancaman."
Putaran 3: "Bagus. Sekarang tambahkan satu kalimat penutup yang menawarkan diskusi
            tatap muka."
```

Setiap putaran membuat hasil lebih dekat dengan yang Anda butuhkan. Semakin spesifik umpan balik Anda, semakin cepat AI menyesuaikan.

### Poin Kunci

- Few-shot: tempelkan 1 sampai 5 contoh keluaran yang benar agar AI menangkap gaya dan format sekali jalan. Contoh harus relevan, beragam, dan terpisah jelas dari instruksi.
- Minta berpikir bertahap: untuk tugas kompleks, minta AI menguraikan langkah dahulu sebelum menyimpulkan agar jawaban lebih akurat dan mudah diperiksa.
- Atur peran dan nada: satu kalimat peran (misalnya "berperanlah sebagai HR Business Partner") sudah mengubah sudut pandang, kedalaman, dan tone jawaban.
- Iterasi: keluaran pertama jarang sempurna. Perbaiki dengan refine, beri contoh, atau ganti pendekatan. Umpan balik yang spesifik mempercepat hasil.
- Keempat teknik dapat digabung dalam satu percakapan, dan konsepnya transferable ke GPT serta Gemini.

### Cek Pemahaman

1. Anda meminta AI membuat balasan email keluhan pelanggan, tetapi hasilnya selalu terlalu kaku. Teknik mana yang paling cepat memperbaikinya, dan bagaimana Anda menerapkannya?
2. Mengapa meminta AI "uraikan langkah dahulu, baru simpulkan" lebih membantu untuk tugas analisis kandidat dibanding pertanyaan sederhana? Berikan alasannya dengan kata-kata Anda sendiri.
3. Sebutkan satu tugas rutin di pekerjaan Anda yang dapat ditingkatkan dengan memberi AI sebuah peran. Peran apa yang akan Anda tetapkan, dan nada seperti apa yang Anda minta?

<!-- Materi F2.3 · coverage=true · depth=baik -->

## Workflow thinking & tools

Sampai titik ini Anda sudah memahami cara kerja AI dan cara menyusun prompt yang baik. Materi ini menjembatani teori menuju praktik nyata: bagaimana memilih pekerjaan yang tepat untuk didelegasikan ke AI, mengenal tiga tool besar yang ada di pasar, lalu menghasilkan satu hasil sungguhan dari masalah pekerjaan Anda sendiri. Tujuannya bukan sekadar tahu, melainkan pulang dengan satu output yang dapat langsung Anda gunakan di kantor.

### Workflow thinking: AI sebagai rekan kerja yang didelegasikan

Cara paling sehat memandang AI adalah menganggapnya sebagai rekan kerja magang yang cerdas, cepat, dan rajin, tetapi tidak mengenal konteks perusahaan Anda kecuali Anda jelaskan. Sama seperti mendelegasikan tugas ke staf baru, hasilnya bergantung pada sejelas apa Anda menjelaskan apa yang diinginkan.

Kunci pertama adalah memecah tugas menjadi tiga bagian: input, proses, dan output.

- Input: bahan yang Anda berikan (data, dokumen, konteks, contoh, instruksi).
- Proses: apa yang harus dilakukan AI terhadap bahan itu (merangkum, menyusun draf, mengelompokkan, menerjemahkan, membandingkan).
- Output: bentuk hasil akhir yang Anda inginkan (email, tabel, poin-poin, paragraf dengan nada formal).

> Bayangkan Anda meminta tolong asisten membuat kopi. Input adalah biji kopi, air, dan gula. Proses adalah cara menyeduhnya. Output adalah secangkir kopi sesuai selera. Jika Anda hanya berkata "buatkan minuman" tanpa menyebut bahan dan selera, hasilnya dapat meleset. AI bekerja dengan logika yang sama.

Tidak semua tugas cocok untuk AI. Tugas yang tepat memiliki ciri: berulang, berbasis teks atau bahasa, memakan waktu, dan tidak menuntut keputusan rahasia atau tanggung jawab hukum final. Tugas yang sebaiknya tetap di tangan manusia: keputusan yang menyangkut data pribadi sensitif, penilaian akhir terhadap orang, dan hal yang membutuhkan akuntabilitas resmi. AI menyusun draf, manusia memutuskan.

Contoh memilah tugas di lingkungan HR:

| Tugas | Cocok untuk AI? | Alasan |
| --- | --- | --- |
| Draf balasan email pertanyaan cuti yang sering masuk | Ya | Berulang, berbasis teks |
| Merangkum 30 lembar notulen rapat menjadi poin kunci | Ya | Memakan waktu, berbasis teks |
| Menyusun draf job ad untuk lowongan baru | Ya | Berbasis bahasa, butuh kerangka |
| Memutuskan siapa yang lolos seleksi akhir | Tidak | Butuh akuntabilitas manusia |
| Menentukan besaran gaji final karyawan | Tidak | Keputusan sensitif dan rahasia |

### Gambaran tools (landscape): tiga besar

Saat ini ada tiga penyedia AI percakapan terbesar yang perlu Anda kenali namanya.

- OpenAI dengan produk ChatGPT (seri model terbarunya adalah GPT, misalnya GPT-5.5).
- Google dengan produk Gemini (seri model terbarunya misalnya Gemini 3.5).
- Anthropic dengan produk Claude (seri model terbarunya adalah Opus, Sonnet, dan Haiku, masing-masing untuk kebutuhan yang berbeda).

Dalam program ini kita fokus pada Claude dari Anthropic. Claude menyediakan beberapa fitur yang berguna untuk pekerjaan kantor:

- Projects: ruang kerja terpisah untuk menyimpan instruksi dan dokumen acuan yang berlaku di seluruh percakapan di dalamnya, sehingga Anda tidak perlu menjelaskan ulang konteks setiap memulai obrolan baru.
- Artifacts: hasil yang muncul di panel terpisah dan dapat langsung digunakan, seperti dokumen, tabel, atau aplikasi sederhana, sehingga mudah ditinjau dan diperbaiki.
- Upload file: Anda dapat mengunggah file seperti PDF, Word, atau Excel untuk dibaca dan dianalisis Claude.
- Skills: paket instruksi siap pakai yang memperluas kemampuan Claude untuk tugas tertentu. Ada Skills bawaan dari Anthropic (misalnya membuat dokumen Word, Excel, dan PowerPoint) dan Skills khusus yang dapat Anda buat sendiri tanpa harus menulis kode.
- Connectors: penghubung resmi yang menyambungkan Claude ke aplikasi kerja seperti Google Drive atau Gmail, dibangun di atas standar terbuka bernama MCP (Model Context Protocol), sehingga Claude dapat menarik konteks tanpa Anda mengunggahnya satu per satu.

> Anggap ketiga tool ini seperti tiga merek mobil. Mesin dan posisi setir berbeda sedikit, tetapi cara mengemudi pada dasarnya sama: tekan gas, rem, dan belok. Begitu Anda mahir menyetir satu mobil, Anda dapat menyetir mobil lain dengan cepat.

Inilah inti pesan kita: keterampilan yang Anda pelajari di Claude bersifat transferable. Konsep memecah tugas, menyusun prompt yang jelas, memberi konteks, dan menetapkan format output berlaku sama di ChatGPT maupun Gemini. Anda tidak perlu belajar ulang dari nol jika suatu hari berpindah tool. Yang mungkin berbeda hanya nama menu dan letak tombol, bukan cara berpikirnya.

### Win Sesi 1: hasilkan satu output nyata dari friction point Anda

Friction point adalah titik kesal dalam pekerjaan harian, yaitu tugas yang berulang, membosankan, atau memakan waktu, tetapi tetap harus dikerjakan. Sekarang giliran Anda menerapkan teknik prompting pada satu friction point pribadi sampai keluar satu hasil sungguhan.

Langkah praktiknya:

1. Tulis satu friction point Anda dalam satu kalimat. Contoh: "Setiap minggu saya membalas email karyawan yang menanyakan sisa kuota cuti dengan isi yang hampir sama."
2. Pecah menjadi input, proses, output. Input: format jawaban standar dan nada bahasa perusahaan. Proses: menyusun balasan yang ramah dan jelas. Output: draf email siap kirim, paling banyak satu paragraf.
3. Tulis prompt lengkap dengan peran, konteks, tugas, dan format. Contoh: "Anda staf HR sebuah perusahaan di Indonesia. Buatkan draf balasan email untuk karyawan yang menanyakan sisa kuota cuti. Nada sopan dan hangat. Sebutkan bahwa data sisa cuti dapat dilihat di aplikasi HRIS. Panjang maksimal satu paragraf."
4. Jalankan di Claude, baca hasilnya secara kritis, lalu minta revisi bila perlu. Contoh perintah revisi: "Buat lebih singkat dan tambahkan kalimat penutup yang menawarkan bantuan lanjutan."
5. Simpan hasil akhir sebagai output nyata Anda.

Contoh lain yang cocok untuk HR: draf job ad untuk lowongan staf admin, draf pengumuman libur nasional, atau rangkuman aturan reimbursement menjadi poin yang mudah dipahami. Pilih satu, kerjakan sampai jadi, jangan berhenti di tengah.

### Poin Kunci

- Pandang AI sebagai rekan kerja magang yang cerdas: hasil bergantung pada kejelasan instruksi Anda.
- Pecah setiap tugas menjadi input, proses, dan output sebelum menulis prompt.
- Pilih tugas yang berulang dan berbasis teks untuk AI; pertahankan keputusan sensitif dan final di tangan manusia.
- Tiga tool besar: ChatGPT (OpenAI), Gemini (Google), dan Claude (Anthropic). Kita fokus Claude, tetapi keterampilannya transferable.
- Kenali fitur Claude yang menunjang kerja kantor: Projects, Artifacts, upload file, Skills, dan connectors.
- Akhiri sesi ini dengan satu output nyata dari friction point Anda sendiri.

### Cek Pemahaman

1. Ambil satu tugas rutin Anda minggu ini, lalu uraikan menjadi input, proses, dan output. Bagian mana yang paling sulit Anda jelaskan ke AI?
2. Mengapa keputusan seperti menentukan kelulusan seleksi atau besaran gaji sebaiknya tidak diserahkan sepenuhnya ke AI?
3. Jika besok perusahaan berpindah dari Claude ke Gemini, keterampilan apa yang tetap dapat Anda gunakan tanpa belajar ulang?
