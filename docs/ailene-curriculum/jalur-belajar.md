# Jalur Belajar — Kurikulum AI Fundamentals (dokumen review)

> Dokumen review, **belum diimplementasikan ke kode**. Sumber kurikulum: `peta-kurikulum-ai-fundamentals-2-bulan.html`. Struktur platform mengikuti **sevenpreneur-ai-lms** (Level → Chapter → item Materi/Quiz/Recording).

## Keputusan (final)
- **Tangga 4 rung (Level):** `L0 Foundation` · `L1 Operator Dasar` · `L2 Operator Lanjut` · **`Capstone`** (rung terakhir tanpa nomor).
- **Chapter = Modul** (9 chapter: F1, F2, O1–O6, C). Tiap chapter = satu blok sesi mingguan (Jumat) dengan `session_date`.
- **Materi dikelompokkan per modul** — tiap chapter punya 1–3 item **Materi**; isi (`content` markdown) menggabungkan beberapa lesson kurikulum jadi bagian/section (bukan 1 item per micro-lesson).
- **Quiz per chapter** — tiap chapter konten punya 1 Quiz sendiri (mengikuti sevenpreneur). Capstone tanpa quiz.
- **Recording per chapter** — sesi fasilitator tiap Jumat disimpan sebagai item **Recording** (`video_url`) di dalam chapter-nya.
- Font & warna tetap milik kita (display-font, aksen biru student); warna editorial HTML tidak dipakai.

---

## A. Struktur platform (acuan sevenpreneur)

**Hierarki:** `Level` → `Chapter` (per sesi, punya `session_date`) → `Item`. Tiap chapter berisi item bertipe Materi / Quiz / Recording, diurut `order_index`. Urutan baku: **Materi → Quiz → Recording**.

| Tipe item | Field utama | Tombol | Status | XP |
|-----------|-------------|--------|--------|----|
| **Materi** | `title`, `content` (markdown), `file_url?` | "Baca Materi" → halaman materi | `Read` / `Not started` | 30–40 |
| **Quiz** | `name`, `questions[]` | "Mulai Quiz" / "Lihat Hasil" | `Not taken yet` / `Score X%` | 200–300 |
| **Recording** | `title`, `video_url` | "Lihat Recording" | `Watched` / `Not watched yet` | 10–20 |

- **Item "Lanjutkan"** = item pertama yang belum selesai di chapter aktif → diberi badge merah + ring (seperti sevenpreneur).
- **Chapter progress:** `not_started` / `in_progress` / `completed`.
- **Gate naik level:** semua chapter di level selesai (semua Materi `Read` + semua Quiz lulus + Recording `Watched`). Capstone: selesaikan Materi + tonton Recording showcase.
- **Elaborasi materi** ada di field `content` (markdown) tiap Materi, dibuka di halaman "Baca Materi".

---

## B. Ringkasan chapter

| # | Chapter (Modul) | Level | Sesi (Jumat) | Materi | Quiz | Recording | Lesson |
|---|------|-------|------|--------|------|-----------|--------|
| 1 | F1 · Paham AI & pakai dengan benar | L0 | Sesi 1 | 3 | ✅ | ✅ | 1–8 |
| 2 | F2 · Prompting & cara pikir kerja sama AI | L0 | Sesi 1 | 3 | ✅ | ✅ | 9–17 |
| 3 | O1 · Bangun asisten kerja pertamamu | L1 | Sesi 2 | 3 | ✅ | ✅ | 18–24 |
| 4 | O2 · Bikin alat bantu interaktif | L1 | Sesi 3 | 2 | ✅ | ✅ | 25–28 |
| 5 | O3 · Riset yang bisa dipercaya | L1 | Sesi 4 | 2 | ✅ | ✅ | 29–33 |
| 6 | O4 · Sambungkan AI ke datamu (MCP) | L2 | Sesi 5 | 2 | ✅ | ✅ | 34–37 |
| 7 | O5 · Kemas keahlianmu jadi Skill | L2 | Sesi 6 | 2 | ✅ | ✅ | 38–42 |
| 8 | O6 · Delegasikan kerja multi-langkah (Cowork) | L2 | Sesi 7 | 2 | ✅ | ✅ | 43–46 |
| 9 | C · Capstone: buktikan & panen | Capstone | Sesi 8 | 2 | — | ✅ | 47–50 |

**Seed prototipe:** Ahmad (student) di **L2**. Chapter L0 (F1, F2) & L1 (O1–O3) `completed`; L2 (O4–O6) sedang berjalan; Capstone terkunci.

---

## C. Detail per chapter

> Tiap chapter: item **Materi** (berisi lesson-lesson sebagai section `content`), lalu **Quiz**, lalu **Recording**. Detail lesson dipertahankan lengkap (judul · durasi · deskripsi · ✓ Output · badge Quick Win · contoh HR) sebagai bahan `content`.

### Chapter 1 · F1 — Paham AI & pakai dengan benar `[L0 · Sesi 1]`
**Value:** Paham cara kerja AI tanpa jargon, tahu batas & risikonya, dan bisa pasang ekspektasi realistis — fondasi yang kepakai di tool AI mana pun.

**📖 Materi 1.1 — Orientasi & tetapkan target** · _~9 mnt · 30 XP_ (lesson 1–2)
1. **Pembukaan + sneak peek** · _5 min_ — Sambutan singkat, lalu pemateri nunjukin sekilas 2–3 hasil keren (dokumen/artifact jadi) sebagai cuplikan apa yang bakal kamu bisa — bikin penasaran, peserta belum praktik. · ✓ Student termotivasi dan punya gambaran jelas hasil akhir yang akan dikuasai.
2. **Friction point kamu** · _4 min_ — Tentukan satu tugasmu sendiri yang paling makan waktu — jadi target sepanjang kelas. · ✓ Student menetapkan satu tugas pribadi yang paling makan waktu sebagai target kelas.

**📖 Materi 1.2 — Cara kerja AI (LLM, token, model)** · _~11 mnt · 35 XP_ (lesson 3–6)
3. **AI itu apa & LLM itu apa** · _3 min_ — Mesin pola yang nebak kata/token berikutnya. Lancar ≠ benar; kenapa bisa pede tapi salah. · ✓ Student memahami AI/LLM sebagai mesin penebak token dan sadar lancar belum tentu benar.
4. **Token & context window** · _3 min_ — AI baca per token & punya ingatan jangka pendek — kenapa chat panjang ngaco dan kapan mulai chat baru. · ✓ Student memahami batas ingatan AI (token dan context window).
5. **Pilih otak yang tepat** · _3 min_ — Model bertingkat: kuat-lambat vs cepat-ringan. Di Claude Opus/Sonnet/Haiku; logika sama di GPT/Gemini. · ✓ Student dapat memilih model yang tepat sesuai kebutuhan.
6. **AI bisa & TIDAK bisa** · _2 min_ — Contoh konkret yang AI jago vs masih lemah, biar ekspektasi realistis sejak awal. · ✓ Student punya ekspektasi realistis atas yang AI bisa dan tidak bisa.

**📖 Materi 1.3 — Aman & verifikasi** · _~5 mnt · 30 XP_ (lesson 7–8 + resource)
7. **Aman & etis — Traffic Light** · _3 min_ — Hijau/Kuning/Merah: mana data yang aman, mana yang jangan pernah masuk AI publik. · ✓ Student dapat mengklasifikasikan data dengan Traffic Light sebelum masuk ke AI.
8. **Baca & verifikasi output** · _2 min_ — Kenapa AI halusinasi + protokol cek cepat sebelum hasilnya dipakai. · ✓ Student punya protokol cepat untuk memeriksa dan memverifikasi output sebelum dipakai.
- 📦 Lampiran (`file_url`): **Starter prompt pack** — 5 prompt siap tempel buat win pertama (email, ringkasan, ide, balasan, rapihin tulisan).

**❓ Quiz F1 — Fondasi AI** · _250 XP_
1. AI/LLM pada dasarnya bekerja dengan cara… → **Menebak token (kata) berikutnya berdasarkan pola** ✓ / Mencari di database internet / Menyalin dokumen / Berpikir seperti manusia
2. Chat yang sangat panjang bisa jadi "ngaco" karena… → **Melebihi context window / ingatan jangka pendek AI** ✓ / Server penuh / Internet lambat / Model rusak
3. Dalam Traffic Light, data yang TIDAK boleh masuk AI publik berwarna… → **Merah** ✓ / Hijau / Kuning / Biru
4. "Halusinasi" AI artinya… → **Menghasilkan informasi salah yang terdengar meyakinkan** ✓ / Menolak menjawab / Kehabisan token / Jawaban terlalu singkat

**🎬 Recording** · _15 XP_ — "Sesi 1 — Fondasi: Cara Kerja AI & Pakai dengan Aman" (rekaman sesi fasilitator).

---

### Chapter 2 · F2 — Prompting & cara pikir kerja sama AI `[L0 · Sesi 1]`
**Value:** Bisa nulis prompt yang konsisten ngasih hasil bagus dan punya cara pikir delegasi — skill paling transferable, jalan di model apa pun.

**📖 Materi 2.1 — Mindset & anatomi prompt** · _~23 mnt · 35 XP_ (lesson 9–10)
9. **AI fluency: kerja sama AI itu skill** · _8 min_ — Hasil bagus datang dari cara kita bekerja sama AI, bukan keberuntungan. · ✓ Student memahami hasil bagus berasal dari cara kerja sama, bukan keberuntungan.
10. **Anatomi prompt** · _15 min_ · ⚡ bikin di tempat — 4 komponen: tujuan, audiens, format, batasan. Bandingin prompt lemah vs tajam. · 🧩 HR: Rapihin draft pengumuman kebijakan cuti jadi versi jelas, sopan, ringkas. · ✓ Student dapat menyusun prompt dengan empat komponen.

**📖 Materi 2.2 — Teknik prompting** · _~33 mnt · 40 XP_ (lesson 11–14)
11. **Teknik: beri contoh (few-shot)** · _8 min_ — Kasih 1–2 contoh output biar gaya & format pas sekali jalan. · ✓ Student dapat memberi contoh (few-shot).
12. **Teknik: minta mikir bertahap** · _8 min_ — Suruh AI urai langkah dulu sebelum jawab — hasil lebih tepat untuk tugas kompleks. · ✓ Student dapat meminta AI berpikir bertahap.
13. **Teknik: atur peran & nada** · _7 min_ — Tetapkan peran/persona buat ngubah sudut pandang, kedalaman, dan tone. · ✓ Student dapat mengatur peran, persona, dan nada.
14. **Iterasi & feedback loop** · _10 min_ — Cara benerin saat output meleset: refine, kasih contoh, atau ganti pendekatan. · ✓ Student dapat memperbaiki output lewat iterasi.

**📖 Materi 2.3 — Workflow thinking & tools** · _~31 mnt · 35 XP_ (lesson 15–17)
15. **Workflow thinking** · _12 min_ — AI sebagai rekan kerja yang didelegasikan; pecah tugas input→proses→output. · ✓ Student dapat memecah tugas dan memilih tugas yang tepat untuk AI.
16. **Gambaran tools (landscape)** · _7 min_ — Tiga besar: OpenAI (GPT) · Google (Gemini) · Anthropic (Claude). Fokus Claude, konsep transferable. · ✓ Student mengenal tiga tool besar dan paham konsepnya transferable.
17. **Win Sesi 1: prompt tajam → hasil kepake** · _12 min_ · ⚡ bikin di tempat — Pakai teknik prompting ke friction point-mu sampai keluar 1 hasil nyata. · 🧩 HR: draft balasan email karyawan berulang, atau draft job ad. · ✓ Student keluar dengan satu hasil nyata dari friction point sendiri.

**❓ Quiz F2 — Prompting** · _250 XP_
1. Empat komponen anatomi prompt adalah… → **Tujuan, audiens, format, batasan** ✓ / Judul, isi, penutup / Tanya, jawab, koreksi / Input, proses, output
2. Teknik "few-shot" artinya… → **Memberi 1–2 contoh output yang diinginkan** ✓ / Menulis prompt sangat singkat / Menanyakan banyak hal sekaligus / Menggunakan model termurah
3. "Minta AI mikir bertahap" paling berguna untuk… → **Tugas kompleks agar hasil lebih tepat** ✓ / Mempercepat jawaban / Menghemat token / Tugas sangat sederhana
4. Saat output meleset, langkah terbaik adalah… → **Iterasi: refine, beri contoh, atau ganti pendekatan** ✓ / Langsung pakai apa adanya / Ganti model / Berhenti memakai AI

**🎬 Recording** · _15 XP_ — "Sesi 1 — Prompting: Cara Ngobrol yang Benar dengan AI".

---

### Chapter 3 · O1 — Bangun asisten kerja pertamamu `[L1 · Sesi 2]`
**Value:** Punya asisten Claude yang udah ngerti konteks kerjamu — dan output nyata pertama di tangan, bukan cuma teori.

**📖 Materi 3.1 — Konteks & Project** · _~30 mnt · 35 XP_ (lesson 18–19)
18. **Kenapa AI lupa konteks** · _10 min_ — Context window: kenapa tiap chat mulai dari nol, dan kenapa konteks bikin output beda total. · ✓ Student memahami peran context window.
19. **Bangun Project + custom instructions** · _20 min_ · ⚡ demonstrasi bareng — Tulis instruksi yang bikin Claude konsisten ngikutin konteks, tone, dan aturanmu. · 🧩 HR: bikin Project 'Asisten HR Ops' berisi SOP cuti & kebijakan kantor. · ✓ Student punya satu Project dengan custom instructions yang konsisten.

**📖 Materi 3.2 — Knowledge base aman & RAG** · _~27 mnt · 35 XP_ (lesson 20–21)
20. **Kurasi knowledge base (aman)** · _15 min_ — Dokumen mana yang masuk vs jangan — kaitkan ke Traffic Light, jangan upload data MERAH. · ✓ Student dapat memilih dokumen yang aman untuk knowledge base.
21. **Jawab dari dokumen, bukan ngarang (RAG)** · _12 min_ — Atur biar Claude ngambil jawaban dari dokumen yang di-upload, bukan ngarang. · ✓ Student dapat mengatur Claude menjawab dari dokumen (RAG).

**📖 Materi 3.3 — Produksi output & asisten kedua** · _~45 mnt · 40 XP_ (lesson 22–24 + resource)
22. **Produksi output + pilih format** · _15 min_ — Satu permintaan, beragam file (Word/Excel/PDF/HTML). Rumus kapan pakai format apa. · ✓ Student dapat menghasilkan output multi-format.
23. **Win L1: asisten + 1 dokumen jadi** · _20 min_ · ⚡ bikin di tempat — Uji asistenmu dengan tugas nyata sampai jadi file yang kepake. · 🧩 HR: Payroll: tanya aturan komponen/potongan (pakai dokumen aturan, BUKAN data gaji) → 1 dokumen rapi. · ✓ Student punya asisten teruji + satu dokumen jadi.
24. **Asisten kedua & memory** · _10 min_ — Workstream kedua; kapan cukup chat biasa; bagaimana memory melengkapi. · ✓ Student paham kapan cukup chat, kapan butuh Project, dan peran memory.
- 📦 Lampiran (`file_url`): **Template Project + instruksi** — Project siap pakai untuk skenario kerja umum.

**❓ Quiz O1 — Asisten & RAG** · _300 XP_
1. Tujuan utama Project + custom instructions adalah… → **Claude konsisten mengikuti konteks, tone, dan aturanmu** ✓ / Agar lebih murah / Agar offline / Agar lebih cepat mengetik
2. RAG (jawab dari dokumen) memastikan Claude… → **Mengambil jawaban dari dokumen yang di-upload** ✓ / Mengarang dari ingatannya / Mencari di Google / Menolak menjawab
3. Dokumen yang boleh jadi knowledge base adalah yang berstatus… → **Hijau/aman (mis. SOP, template)** ✓ / Merah (data sensitif) / Apa saja / Hanya gambar
4. Untuk data tabular yang perlu diolah lagi, format terbaik biasanya… → **Excel/spreadsheet** ✓ / PDF / Gambar / Audio

**🎬 Recording** · _15 XP_ — "Sesi 2 — Bangun Asisten Kerja Pertamamu".

---

### Chapter 4 · O2 — Bikin alat bantu interaktif `[L1 · Sesi 3]`
**Value:** Bisa bikin output yang dipakai — artifact & visual interaktif — bukan cuma teks yang dibaca.

**📖 Materi 4.1 — Artifacts & visualisasi** · _~25 mnt · 35 XP_ (lesson 25–26)
25. **Artifacts: output yang bisa dipakai** · _15 min_ · ⚡ demonstrasi bareng — Statis vs interaktif: kalkulator, tracker, dashboard kecil, diedit di samping chat. · 🧩 HR: kalkulator simulasi take-home pay (angka dummy). · ✓ Student dapat membuat artifact yang bisa dipakai.
26. **Visualisasi inline** · _10 min_ — Kapan visual/diagram lebih cepat dipahami daripada paragraf. · ✓ Student tahu kapan visual lebih efektif daripada paragraf.

**📖 Materi 4.2 — Bikin & batas artifact** · _~35 mnt · 40 XP_ (lesson 27–28 + resource)
27. **Win: bikin 1 artifact** · _25 min_ · ⚡ bikin di tempat — Buat satu artifact untuk kebutuhan kerja nyatamu. · 🧩 HR: Recruitment: tracker kandidat sederhana (nama/posisi dummy). · ✓ Student punya satu artifact untuk kebutuhan kerja nyatanya.
28. **Batas artifact** · _10 min_ — Sampai mana masih Operator, kapan mulai mendekati 'bikin aplikasi'. · ✓ Student memahami batas Operator.
- 📦 Lampiran (`file_url`): **Template artifact siap pakai**.

**❓ Quiz O2 — Artifact** · _250 XP_
1. Keunggulan artifact dibanding teks biasa adalah… → **Output yang bisa dipakai/diedit (kalkulator, tracker, dashboard)** ✓ / Hanya teks panjang / Selalu butuh coding manual / Tidak bisa diubah
2. Visual/diagram lebih baik dari paragraf ketika… → **Informasi lebih cepat dipahami secara visual** ✓ / Selalu, tanpa kecuali / Hanya untuk laporan resmi / Tidak pernah
3. Sesuatu mulai melewati batas Operator saat… → **Mulai mendekati "membuat aplikasi"** ✓ / Memakai banyak warna / Lebih dari 1 halaman / Memakai data dummy

**🎬 Recording** · _15 XP_ — "Sesi 3 — Bikin Alat Bantu Interaktif (Artifacts)".

---

### Chapter 5 · O3 — Riset yang bisa dipercaya `[L1 · Sesi 4]`
**Value:** Bisa riset cepat dengan jawaban yang ada sumbernya, plus olah data pakai code — tanpa kejebak halusinasi.

**📖 Materi 5.1 — Riset & sumber** · _~30 mnt · 35 XP_ (lesson 29–30)
29. **Retrieval & deep research** · _15 min_ — Kapan butuh web search / riset mendalam vs cukup chat biasa. · ✓ Student tahu kapan butuh web search / riset mendalam.
30. **Cara pakai (best practice) + vision** · _15 min_ — Riset multi-sumber dengan rujukan + baca dokumen/gambar yang di-upload. · ✓ Student dapat riset multi-sumber bersumber serta membaca dokumen/gambar.

**📖 Materi 5.2 — Olah data & verifikasi** · _~45 mnt · 40 XP_ (lesson 31–33)
31. **Code execution untuk data** · _15 min_ — Claude menjalankan kode buat olah/hitung data — beda dari sekadar ekspor file. · ✓ Student dapat memakai code execution untuk mengolah data.
32. **Win: 1 riset terverifikasi** · _20 min_ · ⚡ bikin di tempat — Kerjakan riset nyata lalu cek hasilnya ke sumber primer. · 🧩 HR: cek aturan BPJS/ketenagakerjaan terbaru ke sumber resmi, atau benchmark salary pasar. · ✓ Student punya satu hasil riset terverifikasi ke sumber primer.
33. **Klasifikasi risiko output** · _10 min_ — Generatif/faktual/analitik → pakai langsung, verifikasi dulu, atau tulis ulang. · ✓ Student dapat mengklasifikasikan risiko output.

**❓ Quiz O3 — Riset** · _250 XP_
1. Kamu butuh web search / deep research ketika… → **Perlu info terbaru atau multi-sumber, bukan cukup chat biasa** ✓ / Selalu, untuk semua tugas / Hanya untuk menulis email / Tidak pernah perlu
2. Code execution dipakai untuk… → **Mengolah dan menghitung data** ✓ / Mengganti model / Membuat gambar / Menghemat token
3. Hasil riset sebaiknya diverifikasi ke… → **Sumber primer / resmi** ✓ / Jawaban AI sebelumnya / Media sosial / Tidak perlu diverifikasi

**🎬 Recording** · _15 XP_ — "Sesi 4 — Riset yang Bisa Dipercaya".

---

### Chapter 6 · O4 — Sambungkan AI ke datamu (MCP) `[L2 · Sesi 5]`
**Value:** Bisa nyambungin Claude ke data & tools sendiri dengan aman — kerja langsung di konteks nyata.

**📖 Materi 6.1 — MCP & connector** · _~35 mnt · 35 XP_ (lesson 34–35)
34. **Apa itu MCP & kenapa penting** · _15 min_ — Protokol standar terbuka yang nyambungin AI ke data/sistem. 'Connectors' cuma nama antarmukanya. · ✓ Student mengerti MCP dan connectors serta mengapa penting.
35. **Connect ke Drive/Gmail + governance** · _20 min_ · ⚡ demonstrasi bareng — Sambungin read-only dengan aman: cek Traffic Light + izin IT/Legal dulu. · 🧩 HR: sambungkan read-only ke folder Drive HR berisi SOP/template — bukan data karyawan. · ✓ Student dapat menyambungkan AI read-only dengan aman.

**📖 Materi 6.2 — Pakai & batas connector** · _~30 mnt · 40 XP_ (lesson 36–37 + resource)
36. **Win: pakai connector di tugas nyata** · _20 min_ · ⚡ bikin di tempat — Tarik data dari satu sumber aman lalu olah dalam satu tugas. · 🧩 HR: tarik 1 SOP dari Drive HR, olah jadi ringkasan prosedur. · ✓ Student berhasil menarik & mengolah data dari satu sumber aman.
37. **Batas: baca vs bertindak** · _10 min_ — Read-only (aman, Operator) vs yang menulis/bertindak ke sistem (lanjutan). · ✓ Student memahami batas read-only vs menulis/bertindak.
- 📦 Lampiran (`file_url`): **Panduan setup connector aman** — langkah konek + checklist governance.

**❓ Quiz O4 — MCP** · _300 XP_
1. MCP (Model Context Protocol) pada dasarnya adalah… → **Protokol standar terbuka yang menyambungkan AI ke data/sistem** ✓ / Nama sebuah model / Jenis prompt / Fitur pembayaran
2. Langkah aman pertama menyambungkan AI ke Drive/Gmail adalah… → **Sambungkan read-only + cek Traffic Light & izin IT/Legal** ✓ / Langsung sambungkan semua folder / Upload semua data karyawan / Matikan governance
3. Batas aman seorang Operator adalah… → **Read-only (membaca), bukan menulis/bertindak ke sistem** ✓ / Boleh menghapus data / Selalu otomatis bertindak / Tidak ada batas

**🎬 Recording** · _15 XP_ — "Sesi 5 — Sambungkan AI ke Datamu (MCP)".

---

### Chapter 7 · O5 — Kemas keahlianmu jadi Skill `[L2 · Sesi 6]`
**Value:** Punya minimal 1 Skill reusable buatan sendiri, bisa pasang skill yang sudah ada, plus output yang konsisten sama gaya kamu.

**📖 Materi 7.1 — Bikin & pasang Skill** · _~40 mnt · 40 XP_ (lesson 38–40)
38. **Apa itu Skills & kapan dipakai** · _10 min_ — Paket instruksi reusable yang bisa dipanggil kapan aja buat jenis tugas tertentu. · ✓ Student memahami konsep Skill & kapan dipakai.
39. **Bikin Skill sendiri** · _20 min_ · ⚡ bikin di tempat — Kemas satu tugas berulang jadi skill — nggak perlu prompt dari nol tiap kali. · 🧩 HR: Skill 'surat HR standar' (SK, kontrak, teguran) dengan format & klausul tetap. · ✓ Student punya minimal satu Skill buatan sendiri.
40. **Pasang skill yang sudah ada** · _10 min_ · ⚡ demonstrasi bareng — Cari & install skill dari directory atau yang dibagikan orang lain. · 🧩 HR: pasang skill perapih dokumen dari directory + baca keamanannya. · ✓ Student dapat mencari & memasang skill yang sudah ada.

**📖 Materi 7.2 — Keamanan skill & styles** · _~27 mnt · 35 XP_ (lesson 41–42 + resource)
41. **Waspada skill abal: aman vs bahaya** · _12 min_ — Risiko pasang skill sembarangan — bisa nyuri data, nyisipin instruksi tersembunyi, atau manipulasi hasil. · ✓ Student dapat menilai keamanan sebuah skill sebelum memakainya.
42. **Styles & preferences** · _15 min_ — Set gaya & format sekali, berlaku terus di semua percakapan. · ✓ Student dapat mengatur gaya & format sekali agar berlaku di semua percakapan.
- 📦 Lampiran (`file_url`): **Skill preset siap pasang**.

**❓ Quiz O5 — Skills** · _300 XP_
1. Sebuah "Skill" di Claude adalah… → **Paket instruksi reusable untuk jenis tugas tertentu** ✓ / Nama lain dari model / Fitur berbayar wajib / Sertifikat kelulusan
2. Sebelum memasang skill dari directory, kamu harus… → **Menilai keamanannya (bisa mencuri data / menyisipkan instruksi tersembunyi)** ✓ / Langsung pakai tanpa cek / Membayar dulu / Menghapus skill lain
3. Styles & preferences berguna untuk… → **Mengatur gaya/format sekali agar berlaku di semua percakapan** ✓ / Mempercepat internet / Mengganti model otomatis / Menghapus riwayat chat

**🎬 Recording** · _15 XP_ — "Sesi 6 — Kemas Keahlianmu jadi Skill".

---

### Chapter 8 · O6 — Delegasikan kerja multi-langkah (Cowork) `[L2 · Sesi 7]`
**Value:** Bisa kasih tugas multi-langkah ke Claude & ngawasin hasilnya — plus satu otomasi personal yang jalan rutin.

**📖 Materi 8.1 — Cowork & otomasi** · _~30 mnt · 35 XP_ (lesson 43–44)
43. **Apa itu Cowork & cara kerjanya** · _15 min_ — Beri tujuan, Claude merencanakan & mengeksekusi banyak langkah; kamu mengarahkan & review. · ✓ Student memahami cara kerja Cowork.
44. **Otomasi dasar (terjadwal)** · _15 min_ · ⚡ demonstrasi bareng — Tugas berulang personal yang dijadwalkan, tapi tetap kamu awasi hasilnya. · 🧩 HR: setup rekap mingguan lamaran masuk (data dummy) yang jalan terjadwal. · ✓ Student dapat menyiapkan satu otomasi terjadwal yang tetap diawasi.

**📖 Materi 8.2 — Tugas Cowork & efisiensi** · _~32 mnt · 40 XP_ (lesson 45–46)
45. **Win: 1 tugas Cowork nyata + review** · _20 min_ · ⚡ bikin di tempat — Jalankan satu tugas multi-langkah untuk kerjamu, lalu review sebelum dipakai. · 🧩 HR: delegasi alur onboarding karyawan baru, lalu review hasilnya. · ✓ Student menjalankan satu tugas Cowork nyata lalu me-review.
46. **Hemat token & biaya** · _12 min_ — Begitu pemakaian menskala: context lean, output ringkas, reset sesi — responsif & hemat tanpa ngorbanin kualitas. · ✓ Student dapat menjaga context tetap lean.

**❓ Quiz O6 — Cowork** · _300 XP_
1. Cowork memungkinkan kamu… → **Memberi tujuan lalu AI merencanakan & mengeksekusi banyak langkah (kamu arahkan & review)** ✓ / Sekadar mengetik lebih cepat / Menghapus context window / Menjalankan AI tanpa internet
2. Otomasi terjadwal tetap perlu… → **Diawasi / review hasilnya** ✓ / Dibiarkan tanpa pengawasan / Dihapus setiap minggu / Dijalankan manual tiap kali
3. Agar hemat token & biaya saat pemakaian menskala… → **Jaga context lean, output ringkas, reset sesi** ✓ / Selalu pakai model termahal / Kirim semua dokumen tiap chat / Tidak pernah mulai chat baru

**🎬 Recording** · _15 XP_ — "Sesi 7 — Delegasikan Kerja Multi-langkah (Cowork)".

---

### Chapter 9 · C — Capstone: buktikan & panen `[Capstone · Sesi 8]`
**Value:** Keluar kelas dengan bukti nyata — use case yang kebukti motong waktu kerjamu, plus library prompt/use case yang udah numpuk.

> **Catatan:** Capstone **tanpa Quiz**. Ini sesi showcase (live, bareng champion). Alur: pilih tantangan → kerjakan → showcase. Output capstone dapat ditautkan ke **Catat Use Case / Latihan Skill** (loop champion-validation yang sudah ada).

**📖 Materi 9.1 — Siapkan capstone** · _~10 mnt · 30 XP_ (lesson 47)
47. **Pilih tantangan nyata** · _10 min_ — Satu tugas berulang paling makan waktu, dijadiin proyek akhir. · ✓ Student menetapkan satu tantangan nyata sebagai proyek akhir.

**📖 Materi 9.2 — Kurasi library & ukur efisiensi** · _~25 mnt · 35 XP_ (lesson 49)
49. **Kurasi library & ukur efisiensi** · _25 min_ — Pilih prompt/use case terkuat dari yang dikumpulkan; hitung before vs after. · ✓ Student punya library terkurasi + angka efisiensi before vs after.

**🎬 Recording — Showcase (sesi live)** · _20 XP_ (lesson 48 & 50) — "Sesi 8 — Showcase Capstone bersama Champion"
48. **Capstone live** · _20 min_ · ⚡ bikin di tempat — Kerjakan dari awal sampai output, live, pakai semua yang udah dipelajari. · 🧩 HR: bawa 1 tugas HR nyata (payroll/ops/recruitment) → buktikan motong waktu, data dummy.
50. **Showcase bersama champion + roadmap** · _25 min_ — Rayakan hasil bareng champion (bukan diuji), jawab pertanyaan kritis, susun rencana lanjut.

---

## D. Breakdown implementasi (menyusul, setelah dokumen ini disetujui)

1. **Model data** `src/lib/learning.ts`:
   - `Lesson { num; title; dur; desc; output; quickWin?; hrExample? }` (bahan `content` Materi).
   - `Materi { id; title; minutes; xp; lessons:number[]; fileUrl? }`.
   - `Quiz { id; name; xp; questions:QuizQ[] }` (pertahankan `QuizQ`/`QuizResult`).
   - `Recording { id; title; xp; videoUrl }`.
   - `Chapter { code; title; value; session; levelKey; materials:Materi[]; quiz?:Quiz; recording:Recording }`.
   - `CurrLevel { key; label; name; tagline }` (`L0/L1/L2` + `Capstone`).
2. **Transkripsi** Bagian C → `CURRICULUM` (9 chapter, materi-grouped) + array `LESSONS` (50 lesson detail).
3. **Quiz** per chapter dari draf Bagian C (8 quiz; Capstone tanpa quiz).
4. **Store** reaktif (`useSyncExternalStore`): `State { currentKey; materialDone:Record<id,bool>; quiz:Record<quizId,QuizResult|null>; recordingDone:Record<id,bool> }`. Seed: Ahmad `L2`, chapter L0/L1 selesai, L2 berjalan.
5. **Rewrite** `learning-path/page.tsx` → timeline Level → ChapterCard (badge kode + value + sesi, status not_started/in_progress/completed) → `ChapterTaskItem` per item (Materi/Quiz/Recording) meniru pola sevenpreneur: ikon per tipe, XP star, status, tombol, badge "Lanjutkan", lock. Materi → modal/page `content`; Quiz → `QuizModal`; Recording → buka `videoUrl` + tandai watched.
6. **Verifikasi** `tsc` + `build` + manual.

---

_Dokumen review · belum diimplementasikan. Setelah disetujui → lanjut Langkah 1–6 (kode)._
