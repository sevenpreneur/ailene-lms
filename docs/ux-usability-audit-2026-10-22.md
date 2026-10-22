# Audit UX & Usability — Ailene AI Learn

Tanggal: **22 Oktober 2026** · Basis kode: **`31f49e18`** · Cakupan: Student, Champion, Sponsor.

## Status perbaikan — 22 Oktober 2026

Bagian audit di bawah merekam kondisi sebelum perubahan. Sesuai arahan terbaru, **jalur tugas Prompt dihapus**, termasuk API frontend, form pengerjaan/review, dan opsi penugasan. Prompt sebagai teks instruksi di workflow AI tetap digunakan. Data historis di backend tidak dihapus; notifikasi Prompt lama diberi penjelasan nonaktif dan tidak lagi membuka route tugas.

| Temuan | Perubahan di frontend | Status dan batas |
| --- | --- | --- |
| UX-01 | Jalur tugas Prompt dihentikan di Student dan Champion; pembuatan manual serta draft AI yang dapat digunakan hanya Use Case | Selesai di frontend. Generator backend masih mengenali tipe historis, sehingga hasil Prompt disaring dan tidak bisa ditugaskan dari LMS |
| UX-02 | Perubahan URL bukti dipisahkan dari penghapusan pilihan file; URL mendukung batas 500 karakter | Selesai; regression test memeriksa callback URL tidak menghapus file/nilai |
| UX-03 | Redirect login tidak lagi berdasarkan keberadaan cookie; validasi backend membedakan token tidak valid dan layanan gagal; tujuan awal memakai redirect aman; tersedia petunjuk bantuan akun | Loop cookie tidak valid dihilangkan. Cookie lama diganti saat login berhasil; tidak dibuat endpoint reset/password baru |
| UX-04 | Read API terkait meneruskan kegagalan; dashboard Student membedakan error per bagian; error halaman bisa dicoba ulang; data utama Sponsor/Champion/ROI yang tidak tersedia tidak diekspor sebagai nol | Selesai untuk jalur yang diubah. Pada halaman selain dashboard Student, kegagalan endpoint dapat menampilkan pemulihan tingkat halaman |
| UX-05 | Intake dan evidence guided dipulihkan dari draft browser yang terpisah per akun/program/use case; ada batas 30 hari, indikator kegagalan storage, dan perlindungan keluar | Mitigasi frontend selesai. Sinkronisasi evidence lintas perangkat masih memerlukan kontrak draft backend |
| UX-06 | Status diterima konsisten saat membuka ulang modal; revisi menjelaskan bahwa hasil lama/catatan belum tersedia | Sebagian. Endpoint Student belum menyediakan catatan review, bukti, dan seluruh hasil submission sebelumnya; perlu pengembangan backend agar revisi lengkap |
| UX-07 | Sheet, konfirmasi, dan drawer mobile memakai Radix dengan pengelolaan fokus, Escape, dan kontrol tutup | Implementasi selesai; verifikasi keyboard/screen reader langsung masih diperlukan |
| UX-08 | Quiz menunjukkan status simpan, memeriksa respons, mengantrekan request, menyimpan draft lokal per attempt, dan menyimpan sebelum keluar lewat UI | Implementasi selesai; finalisasi waktu tetap milik backend. Uji jaringan/tab tidur langsung belum dilakukan |
| UX-09 | Tautan semua Use Case menuju antrean review yang tersedia; judul item membuka detail submission | Selesai |
| UX-10 | Detail anggota memiliki link/button keyboard; pencarian memiliki nama kontrol | Selesai di kode |
| UX-11 | Pengiriman manual quiz dan pre-assessment meminta konfirmasi beserta jumlah jawaban | Selesai; auto-submit quiz tetap tidak memerlukan konfirmasi |
| UX-12 | Draft memakai identitas pengguna, program, dan versi form/attempt; draft lama tanpa pemilik tidak dimigrasikan | Selesai; data draft lama tidak dihapus dari perangkat secara otomatis |
| UX-13 | Tombol nonaktif menampilkan alasan tetap; form coaching menjelaskan keterbatasan sebelum input | Selesai; fungsi yang belum memiliki endpoint tetap nonaktif |
| UX-14 | Library memakai pencarian backend dan paging; tab/filter berada di URL; self-assign melalui CTA eksplisit | Pencarian/paging selesai. Riwayat dibatasi dan diberi label sebagai tugas Champion; riwayat lengkap catatan pribadi menunggu endpoint Student |
| UX-15 | Status baca mengikuti respons server, request baca diantrekan, error dapat dicoba ulang | Selesai di kode; tidak menambahkan polling interval |
| UX-16 | Klaim “baru saja/real-time” dihilangkan; dashboard/ROI dan PDF menjelaskan periode serta sifat estimasi | Sebagian. Timestamp sumber, cakupan submission, dan rekonsiliasi metrik tetap memerlukan metadata/definisi backend |
| UX-17 | Sheet selebar layar pada mobile; soal ditampilkan sebelum panel navigator; rating memiliki target sentuh yang lebih besar | Implementasi dasar selesai; uji viewport, zoom, dan keyboard virtual masih diperlukan |
| UX-18 | Field wajib diteruskan ke input, error dihubungkan ke field, pilihan mengumumkan state, rating memakai radio native, bahasa dokumen Indonesia | Selesai untuk komponen/alur yang diubah; bukan klaim sertifikasi WCAG |
| UX-19 | Membuka halaman materi/video tidak lagi melakukan completion; pengguna menandai selesai secara eksplisit; chapter menyediakan pemilih jika ada beberapa video | Selesai di frontend; tidak mengubah aturan skor di backend |
| UX-20 | Navigasi dan halaman memakai istilah Latihan AI/Tugas/Ringkasan Tim; metadata memakai Ailene AI Learn; statistik tugas Prompt dihilangkan dari capaian Student | Selesai untuk jalur aktif yang diubah; nama internal legacy dipertahankan |

Validasi otomatis tersedia melalui `npm run test:ux` (12 regression test), `npm run lint`, pemeriksaan TypeScript, dan `npm run build`. Build berhasil dengan dua warning fallback font Stack Sans; lint masih memiliki empat warning yang sudah ada sebelumnya. Hasil pengujian otomatis tidak menggantikan skenario end-to-end terautentikasi dan uji mobile yang tercantum di audit.

Verifikasi browser pada versi lokal HTTPS yang terautentikasi: dashboard Champion menampilkan link detail anggota dan tautan antrean review yang benar; halaman Tugas dan form manual hanya menawarkan Use Case; Escape menutup form dan mengembalikan fokus ke “Buat Manual”; dashboard Student menampilkan error Fokus Hari Ini secara terpisah. Endpoint backend `getTodayFocus` dan `getAssignedUseCases` mengembalikan 500 saat pemeriksaan. Error tugas Student kini terpisah dari Library. Katalog berisi 10 hasil berhasil ditampilkan dengan CTA pengambilan eksplisit dan tab yang mengikuti URL, meskipun endpoint tugas gagal. Pencarian "transkripsi" berhasil menghasilkan satu item dan menyimpan kata pencarian serta nomor halaman di URL. Tidak ada assignment, submission, review, atau upload yang dijalankan untuk pengujian. Pengujian mobile dan alur kirim/revisi lengkap masih perlu dilakukan pada lingkungan uji dengan backend yang sehat.

Perubahan belum di-commit atau di-push. Untuk bukti path yang sudah dihapus, gunakan snapshot commit audit `31f49e18`.

## Kesimpulan

LMS ini sudah punya struktur yang membantu pengguna: pemisahan navigasi per role, Fokus Hari Ini untuk menentukan langkah berikutnya, urutan evaluasi chapter dengan alasan penguncian, dan panduan use case dalam langkah-langkah kecil. Prioritas berikutnya adalah **memastikan pengguna bisa menyelesaikan tugas, mempertahankan pekerjaan mereka, dan mempercayai status yang ditampilkan**.

Ada **20 temuan: 8 P1, 11 P2, dan 1 P3**. Tiga perbaikan yang sebaiknya dikerjakan paling awal:

1. Selaraskan tugas Prompt antara Champion dan Student; saat ini tugas masih bisa diberikan tetapi halaman pengerjaannya mengalihkan pengguna ke daftar Use Case.
2. Perbaiki input tautan bukti guided use case yang memanggil handler pengosongan nilai setelah pengguna mengetik.
3. Bedakan kegagalan mengambil data dari kondisi kosong atau selesai; jangan tampilkan angka nol atau “semua tugas selesai” ketika request gagal.

Ini adalah audit heuristik berbasis implementasi dengan tinjauan langsung terbatas, **bukan hasil usability testing dengan peserta**. Prioritas merupakan penilaian dampak, bukan frekuensi masalah yang sudah diukur.

## Metode dan batas verifikasi

| Sumber bukti | Yang diperiksa | Batas |
| --- | --- | --- |
| Kode pada commit di atas | Routing, autentikasi, API states, dashboard tiga role, pre-assessment, chapter, quiz/test, guided use case, assignment/review, notifikasi, komponen form dan overlay | Perilaku ditelusuri dari kode; skenario gangguan jaringan dan kedaluwarsa sesi belum dijalankan |
| Browser produksi | Beranda pemilihan program dan dashboard Champion pada sesi yang sudah login; tampilan desktop dan accessibility tree | Versi deployment belum dicocokkan dengan commit lokal; Student/Sponsor dan mobile belum ditinjau langsung |
| Referensi desain | Heuristik usability Nielsen serta panduan W3C untuk dialog, pesan status, error, dan target interaksi | Tidak melakukan sertifikasi kepatuhan WCAG |

Kontrol browser berhenti setelah Chrome memblokir otomasi karena UI ekstensi lain sedang terbuka. Tautan pada dashboard terlihat pada accessibility tree, tetapi hasil klik tujuannya belum terverifikasi langsung. Tidak ada tugas yang dikirim, review yang diubah, atau upload yang dilakukan dalam audit ini. Identitas anggota yang terlihat pada sesi produksi tidak disalin ke laporan.

**Cara membaca bukti:** “Kode” berarti perilaku atau kondisi tampak pada implementasi. “Observasi” berarti terlihat langsung di browser. “Risiko bersyarat” memerlukan keadaan tertentu, misalnya cookie tidak valid, katalog lebih dari 100 item, atau perangkat dipakai bergantian. Link kode mengacu pada posisi baris saat audit.

## Hal yang sudah baik dan perlu dipertahankan

- **Fokus pada tindakan berikutnya:** dashboard Student memiliki Fokus Hari Ini, sehingga pengguna tidak harus menafsirkan seluruh dashboard sebelum mulai belajar. Pertahankan, lalu perbaiki pembedaan state gagal/kosongnya.
- **Konteks chapter cukup kuat:** status, jadwal, progres, dan alasan materi/evaluasi terkunci sudah tersedia. Ini lebih membantu daripada tombol terkunci tanpa penjelasan.
- **Guided use case memecah tugas kompleks:** ada contoh isian, instruksi verifikasi hasil AI, checklist, ringkasan sebelum kirim, dan pemberitahuan jika perubahan intake menghapus workflow.
- **Ada fondasi aksesibilitas yang bisa direuse:** guided modal memakai Radix Dialog, tab mendukung tombol panah/Home/End, dan navigasi aktif memakai `aria-current`. Fondasi ini belum konsisten di komponen lama.
- **Beberapa alur sudah menangani pemulihan dengan baik:** chapter test menyimpan draft lokal dan meminta konfirmasi sebelum pengiriman satu kali; laporan pre-assessment membedakan kegagalan scoring dan menyediakan pemulihan. Hindari menyamaratakan semua halaman sebagai bermasalah.
- **Notifikasi tidak melakukan polling interval:** refresh saat navigasi/tab aktif merupakan keputusan yang disengaja. Perbaikan feedback tidak perlu menambahkan polling terus-menerus.

## Prioritas

**P1:** menghalangi tugas inti, berisiko menghilangkan pekerjaan, atau memberi status yang menyesatkan pada alur penting. **P2:** menambah kesalahan, beban memahami, atau hambatan bagi kelompok pengguna/skenario tertentu. **P3:** perapihan konsistensi setelah alur inti pulih.

Estimasi usaha bersifat relatif: **S** = lokal pada satu/dua komponen; **M** = beberapa komponen/alur; **L** = lintas alur atau membutuhkan kontrak backend. Ini bukan estimasi hari pengerjaan.

| ID | Prioritas | Temuan | Role | Usaha | Bukti |
| --- | --- | --- | --- | --- | --- |
| UX-01 | P1 | Champion masih memberi Prompt yang tidak bisa dikerjakan Student | Champion, Student | M | Kode |
| UX-02 | P1 | Input tautan bukti guided mengosongkan nilainya sendiri | Student | S | Kode |
| UX-03 | P1 | Cookie tidak valid berpotensi membuat loop login | Semua | M | Kode; risiko bersyarat |
| UX-04 | P1 | Request gagal berubah menjadi nol, kosong, selesai, atau tidak ditemukan | Semua | L | Kode |
| UX-05 | P1 | Draft guided tidak mencakup seluruh isian yang dijanjikan | Student | L | Kode |
| UX-06 | P1 | Revisi guided tidak membawa catatan dan hasil lama yang diperlukan | Student, Champion | L | Kode |
| UX-07 | P1 | Overlay penting belum konsisten mendukung fokus dan keyboard | Semua | M | Kode |
| UX-08 | P1 | Autosave quiz gagal diam-diam, tetapi UI menjanjikan tersimpan | Student | M | Kode |
| UX-09 | P2 | Tautan dari use case terbaru mengarah ke route yang tidak tersedia | Champion | S | Observasi tautan + kode |
| UX-10 | P2 | Detail anggota hanya bisa dibuka lewat klik baris | Champion | S | Kode + accessibility tree |
| UX-11 | P2 | Pengiriman assessment belum konsisten mencegah salah kirim | Student | M | Kode |
| UX-12 | P2 | Draft assessment tidak dibedakan berdasarkan pengguna | Student | M | Kode; risiko perangkat bersama |
| UX-13 | P2 | Pengguna bisa mengisi form yang sejak awal tidak bisa dikirim | Champion dan area mock | S | Kode |
| UX-14 | P2 | Library sulit ditemukan kembali dan dapat berhenti di 100 item | Student | M | Kode; risiko skala |
| UX-15 | P2 | Status baca notifikasi tidak direkonsiliasi saat penyimpanan gagal | Student, Champion | M | Kode |
| UX-16 | P2 | Dashboard Sponsor menyatakan kesegaran data tanpa timestamp | Sponsor | M | Kode |
| UX-17 | P2 | Layout mobile berpotensi mendahulukan navigasi daripada tugas | Student, Champion | M | Kode; perlu verifikasi viewport |
| UX-18 | P2 | Semantik jawaban, field wajib, dan bahasa halaman belum lengkap | Semua | M | Kode |
| UX-19 | P2 | Arti “sudah ditonton/dibaca” berubah menurut pintu masuk | Student, Sponsor | M | Kode |
| UX-20 | P3 | Nama fitur dan identitas produk tidak konsisten | Semua | S | Kode + observasi |

## Temuan dan rekomendasi

### UX-01 — Tugas Prompt kehilangan jalur pengerjaan

**Bukti:** [AssignmentChampionAILN.tsx:154](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/AssignmentChampionAILN.tsx#L154) masih menampilkan tab Prompt. [AssignFormChampionAILN.tsx:82](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/forms/AssignFormChampionAILN.tsx#L82) mengirim penugasan ke endpoint Prompt. Namun, [halaman Prompt Student:14](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/%28lms%29/lms/%5Bproject_id%5D/student/%28gated%29/skill-practice/prompts/%5Bprompt_id%5D/page.tsx#L14) hanya melakukan redirect ke daftar Use Case. [Notifikasi Prompt](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/lib/notifications.ts#L43) masih mengarah ke halaman tersebut.

**Dampak:** Champion dapat memberi instruksi yang terlihat sah, tetapi Student tidak menemukan objek tugas atau form pengerjaannya. Pengingat deadline juga tidak membawa pengguna ke tindakan yang dijanjikan.

**Rekomendasi:** putuskan lifecycle Prompt secara menyeluruh. Jika masih dipakai, kembalikan detail dan pengerjaan yang didukung backend. Jika dihentikan, hentikan penugasan baru dan tentukan penanganan tugas serta notifikasi lama. Jangan sekadar mengalihkan semuanya tanpa konteks.

**Kriteria selesai:** satu tugas yang dapat diberikan Champion selalu muncul dan bisa diselesaikan Student; klik notifikasi membuka tugas yang sama. Tugas lama mendapat penjelasan dan tujuan pengganti yang jelas.

### UX-02 — Tautan bukti guided bisa terhapus saat diketik

**Bukti:** [GuidedEvidenceAILN.tsx:80](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/forms/guided-use-case/GuidedEvidenceAILN.tsx#L80) mengubah `outcome_proof`, lalu memanggil `onFileChange(null)`. Parent mengarahkannya ke `upload(null, "outcome")`; [handler tersebut:343](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/forms/GuidedUseCaseAILN.tsx#L343) mengosongkan `outcome_proof` sebelum keluar ketika file kosong.

**Dampak:** alternatif “tempel tautan” tidak berfungsi sesuai ekspektasi. Pengguna yang tidak memiliki file bisa tertahan pada langkah terakhir.

**Rekomendasi:** pisahkan perubahan pilihan file dari perubahan URL. Beralih ke mode tautan boleh menghapus pilihan file, tetapi harus mempertahankan tautan yang baru dimasukkan. Beri pilihan file/tautan yang eksplisit.

**Kriteria selesai:** mengetik dan menempel URL lengkap mempertahankan nilainya; memilih file, mengganti file, menghapus file, dan beralih kembali ke URL menghasilkan bukti yang sesuai pada ringkasan dan request kirim.

### UX-03 — Pemulihan sesi berpotensi berputar antara beranda dan login

**Bukti:** [next.config.mts:83](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/next.config.mts#L83) mengalihkan `/auth…` ke `/` berdasarkan keberadaan cookie. [checkSession():86](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/apis/auth.ts#L86) mengembalikan `null` ketika validasi gagal tanpa membersihkan cookie. [Beranda:11](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/%28lms%29/lms/page.tsx#L11) mengalihkan sesi `null` kembali ke login.

**Dampak bersyarat:** ketika cookie masih ada tetapi token tidak valid, pengguna dapat terjebak redirect. Kegagalan backend juga diperlakukan sama dengan sesi tidak valid. Ini belum direproduksi langsung.

**Rekomendasi:** bedakan sesi tidak valid dari layanan autentikasi yang sedang gagal. Bersihkan cookie tidak valid melalui Route Handler/Action yang sesuai, dan jangan menolak akses ke login hanya karena cookie ada. Simpan tujuan awal yang aman agar pengguna kembali ke tugas setelah login. Login juga perlu jalur bantuan akun/password atau instruksi menghubungi pengelola jika reset mandiri belum tersedia; saat ini [form login](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/LoginAILN.tsx#L88) belum menyediakannya.

**Kriteria selesai:** token valid, token tidak valid, cookie hilang, dan backend auth gagal menghasilkan state berbeda yang dapat dipulihkan; tidak ada loop. Masuk kembali dari tautan tugas mengembalikan pengguna ke tugas itu.

### UX-04 — Gagal memuat data terlihat seperti hasil yang valid

**Bukti:** [getUseCases():237](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/apis/use-cases.ts#L237) mengubah kegagalan menjadi daftar kosong; `getUseCaseDetails()` mengubah semua kegagalan menjadi `not_found`. [Dashboard Champion:63](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/DashboardChampionAILN.tsx#L63), [Sponsor:87](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/DashboardSponsorAILN.tsx#L87), dan [ROI:65](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/RoiProductivityAILN.tsx#L65) memakai fallback nol. [getTodayFocus():589](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/apis/learnings.ts#L589) mengembalikan `null` baik saat gagal maupun tidak ada fokus; [TodayFocusCard:89](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/cards/TodayFocusCardAILN.tsx#L89) menafsirkan `null` sebagai semua tugas selesai.

**Dampak:** Student bisa berhenti belajar karena mengira selesai. Champion/Sponsor bisa menyimpulkan aktivitas atau penghematan nol. Export PDF tetap tersedia ketika angka fallback dipakai.

**Rekomendasi:** pertahankan state `berhasil`, `kosong`, `gagal`, `tidak berhak`, dan `sesi berakhir` sepanjang API hingga UI. Tampilkan error per bagian dengan “Coba lagi”, bukan mengganti seluruh dashboard. Angka yang tidak tersedia ditampilkan sebagai “Belum dapat dimuat”. Export harus menolak atau menjelaskan bagian yang gagal secara jelas.

**Kriteria selesai:** simulasi satu endpoint gagal tidak menampilkan angka nol, klaim selesai, atau 404 palsu; bagian lain tetap berguna. PDF tidak menyajikan data gagal sebagai angka valid.

### UX-05 — Janji penyimpanan guided lebih luas daripada data yang disimpan

**Bukti:** [GuidedUseCaseModalAILN.tsx:56](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/modals/GuidedUseCaseModalAILN.tsx#L56) menjelaskan penyimpanan setiap pindah langkah. [persist():243](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/forms/GuidedUseCaseAILN.tsx#L243) hanya menyimpan intake; bukti, durasi dengan AI, hasil, dan pengalaman berada di state `evidence`. [handleClose():394](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/forms/GuidedUseCaseAILN.tsx#L394) menutup tanpa menyimpan perubahan langkah aktif. Evidence juga tidak dipulihkan oleh `hydrate()`.

**Dampak:** refresh atau meninggalkan halaman pada langkah akhir dapat menghilangkan pekerjaan panjang dan tautan hasil upload. Menutup lalu membuka modal pada mount yang sama bisa mempertahankan state, tetapi itu bukan jaminan draft yang persisten.

**Rekomendasi:** sediakan draft untuk seluruh isian melalui kontrak backend, disertai status “Menyimpan… / Tersimpan / Gagal menyimpan”. Sampai tersedia, jelaskan batas penyimpanan, sediakan penyimpanan lokal yang sesuai, dan peringatkan saat keluar dengan perubahan belum tersimpan. Jangan menyatakan semua isian aman jika hanya intake yang dipersistenkan.

**Kriteria selesai:** isi sebagian setiap langkah, refresh, lalu lanjutkan tanpa kehilangan data yang dijanjikan tersimpan. Kegagalan simpan terlihat dan tidak membuat UI mengaku sukses.

### UX-06 — Revisi guided tidak memberi bahan untuk memperbaiki hasil

**Bukti:** [GuidedUseCaseStudentAILN](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/GuidedUseCaseStudentAILN.tsx#L53) mengenali status revisi, tetapi tipe [UseCaseDetail](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/apis/use-cases.ts#L43) dan [GuidedSession](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/apis/use-cases.ts#L96) tidak membawa catatan review maupun seluruh bukti submission sebelumnya. Form menampilkan instruksi umum “Champion meminta revisi” dan memulai evidence kosong. Selain itu, [SubmittedView:727](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/forms/GuidedUseCaseAILN.tsx#L727) menentukan diterima dari hasil kirim yang berada di memori; saat dibuka ulang tanpa `result`, isi modal kembali mengatakan “Terkirim ke Champion” meski halaman luar menyatakan diterima.

**Dampak:** pengguna tidak tahu bagian yang harus diperbaiki, harus mengisi ulang hasil, dan menerima status yang berbeda antar tampilan.

**Rekomendasi:** konsumsi catatan review, hasil kiriman terakhir, status, dan waktu review yang persisten dari backend. Tampilkan “Yang perlu diperbaiki”, hasil lama yang dapat diedit, dan tindakan “Kirim revisi”. Gunakan sumber status yang sama untuk kartu, halaman detail, modal, dan notifikasi.

**Kriteria selesai:** setelah Champion meminta revisi, Student melihat catatan yang sama beserta bukti lama; setelah diterima dan refresh, semua tampilan tetap menyatakan diterima.

### UX-07 — Sheet dan dialog lama belum memiliki perilaku modal yang lengkap

**Bukti:** [SheetAILN.tsx:32](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/modals/SheetAILN.tsx#L32) menggunakan overlay `div` dan SVG `X` dengan `onClick`; belum ada semantik dialog, pemindahan/focus trap, pengembalian fokus, atau penanganan Escape pada primitive. [AlertConfirmDialogAILN.tsx:35](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/modals/AlertConfirmDialogAILN.tsx#L35) juga belum mengelola fokus/semantik modal. [SidebarShellAILN.tsx:90](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/navigations/SidebarShellAILN.tsx#L90) punya `aria-modal`, tetapi belum mengurung fokus di drawer. Notifikasi menambahkan Escape sendiri, sehingga tidak semua pemakai Sheet memperoleh perilaku yang sama.

**Dampak:** pengguna keyboard/screen reader dapat tetap berada di belakang panel, kesulitan menemukan tombol tutup, atau kehilangan posisi setelah menutupnya.

**Rekomendasi:** gunakan pola Radix Dialog/AlertDialog yang sudah tersedia, dengan judul, deskripsi yang sesuai, tombol tutup bernama, fokus awal, pengurungan fokus, Escape, dan pengembalian fokus. Panduan [W3C APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) menjelaskan perilaku keyboard dan fokus ini.

**Kriteria selesai:** setiap overlay dapat dibuka, digunakan, dan ditutup dengan keyboard; Tab tidak masuk ke halaman belakang; fokus kembali ke pemicu. Uji termasuk modal bertumpuk dan drawer mobile.

### UX-08 — Autosave quiz tidak menunjukkan apakah jawaban benar-benar tersimpan

**Bukti:** [QuizAttemptAILN.tsx:115](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/QuizAttemptAILN.tsx#L115) menyimpan setelah debounce 800 ms, tetapi tidak memeriksa `response.ok` dan mengabaikan network error. Dialog keluar pada [baris 351](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/QuizAttemptAILN.tsx#L351) tetap mengatakan jawaban tersimpan otomatis. Navigasi keluar sebelum debounce selesai membatalkan timer melalui cleanup.

**Dampak:** pengguna bisa kehilangan jawaban terbaru setelah keluar/refresh, sementara UI sudah memberi rasa aman. Kegagalan HTTP seperti 401/500 tidak tampak.

**Rekomendasi:** tampilkan status simpan yang mengikuti respons server, simpan draft lokal bila sesuai, dan tunggu/flush penyimpanan ketika pengguna memilih keluar lewat UI. Bedakan “jawaban tersimpan” dari “jawaban terkirim”. Untuk waktu habis, otoritas waktu dan finalisasi tetap milik backend.

**Kriteria selesai:** pilih jawaban lalu langsung keluar, matikan koneksi, serta simulasi 401/500. Draft tidak hilang tanpa peringatan dan tidak muncul klaim tersimpan saat request gagal. Verifikasi auto-submit setelah tab tidak aktif/ditutup bersama backend; perilaku itu belum diuji dalam audit ini.

### UX-09 — Tautan “Lihat semua use case” tidak cocok dengan routing

**Bukti:** tautan terlihat pada dashboard produksi dan [RecentUseCasesAILN.tsx:58](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/indexes/RecentUseCasesAILN.tsx#L58) menunjuk ke `/champion/submissions/use-cases`. Inventaris route hanya memiliki `/champion/submissions` dan `/champion/submissions/use-cases/[submission_id]`; tidak ada halaman index `use-cases`. Hasil navigasi belum teruji langsung karena browser terhalang ekstensi.

**Dampak:** jalan keluar dari ringkasan ke antrean review berpotensi berakhir pada halaman tidak ditemukan.

**Rekomendasi:** arahkan ke index review yang tersedia, dengan filter Use Case jika dibutuhkan. Jadikan judul item terbaru tautan ke submission terkait agar pengguna tidak harus mencarinya ulang.

**Kriteria selesai:** tautan ringkasan membuka antrean yang relevan dan setiap item dapat membuka detailnya; tidak ada tujuan 404.

### UX-10 — Baris anggota tampak memiliki aksi, tetapi tidak menyediakan kontrol keyboard

**Bukti:** [ChampionTeamMembersAILN.tsx:240](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/indexes/ChampionTeamMembersAILN.tsx#L240) memakai `onClick` pada `<tr>` dan teks “Lihat detail” berupa `<span>`. [MembersChampionAILN:207](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/MembersChampionAILN.tsx#L207) memakai pola serupa. Accessibility tree dashboard menunjukkan teks aksi dalam cell, tanpa link/button untuk membuka detail anggota.

**Dampak:** pengguna yang menavigasi dengan Tab tidak memperoleh cara langsung memilih anggota; perilaku link standar seperti buka tab baru juga hilang.

**Rekomendasi:** sediakan link pada nama/aksi detail untuk navigasi halaman, atau button untuk pemilihan panel. Klik seluruh baris boleh tetap menjadi kemudahan tambahan. Beri label pencarian yang menetap dan pengumuman hasil filter.

**Kriteria selesai:** detail setiap anggota dapat dicapai dengan Tab dan Enter; nama kontrol menyebut anggota yang dituju dan fokus tetap jelas saat filter berubah.

### UX-11 — Perlindungan sebelum mengirim assessment belum konsisten

**Bukti:** [QuizAttemptAILN.tsx:341](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/QuizAttemptAILN.tsx#L341) memanggil submit langsung, tanpa ringkasan jumlah belum terjawab atau konfirmasi pengiriman manual. [PreAssessmentAILN.tsx:138](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/PreAssessmentAILN.tsx#L138) mengirim langsung setelah lengkap, meskipun UI menjelaskan hanya bisa dikirim satu kali. Sebaliknya, chapter test sudah memiliki dialog konfirmasi.

**Dampak:** salah klik bisa mengakhiri pengerjaan sebelum pengguna mengecek jawaban. Pembatasan satu kali membuat kesalahan ini mahal bagi pengguna.

**Rekomendasi:** untuk submit manual, tampilkan ringkasan terjawab/belum, konsekuensi pengiriman, dan “Cek lagi / Kirim sekarang”. Soal kosong pada quiz boleh dikirim jika memang aturannya demikian, tetapi pengguna harus tahu. Jangan menambah konfirmasi yang menghalangi auto-submit saat waktu habis.

**Kriteria selesai:** pengiriman manual tidak terjadi hanya karena satu klik yang tidak disengaja; pengguna dapat kembali ke soal kosong, dan auto-submit tetap mengikuti aturan backend.

### UX-12 — Draft lokal assessment dapat terbaca oleh akun berikutnya

**Bukti:** [draft chapter test:30](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/ChapterTestAttemptAILN.tsx#L30) hanya memakai `testId`. [Draft pre-assessment:52](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/PreAssessmentAILN.tsx#L52) memakai project dan versi, tanpa identitas pengguna. Keduanya berada di `localStorage`, yang dibagi antar sesi akun pada origin/browser yang sama.

**Dampak bersyarat:** pada perangkat bersama, akun berikutnya dapat mendapatkan jawaban akun sebelumnya untuk assessment yang sama. Pemulihan draft menjadi tidak dapat dipercaya.

**Rekomendasi:** scope draft berdasarkan pengguna, project, assessment, dan versi pertanyaan; validasi sebelum pemulihan dan tentukan masa simpan/pembersihan. Saat storage tidak tersedia, tampilkan bahwa draft hanya bertahan selama halaman terbuka.

**Kriteria selesai:** akun B tidak memuat draft akun A; draft tetap bisa dilanjutkan oleh pemiliknya setelah login kembali sesuai kebijakan produk. Perubahan soal tidak memulihkan jawaban yang sudah tidak cocok.

### UX-13 — Form yang belum tersedia baru terasa buntu di akhir

**Bukti:** [MemberDetailPanelChampionAILN.tsx:177](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/indexes/MemberDetailPanelChampionAILN.tsx#L177) menyediakan textarea catatan coaching tetapi tombol kirim memakai `DisabledActionButtonAILN`. [Komponen tombol:19](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/buttons/DisabledActionButtonAILN.tsx#L19) memakai native `disabled` sekaligus `onClick` toast; pada button native disabled, klik normal tidak menjalankan handler itu. Alasan hanya melalui `title` tidak andal untuk touch/keyboard.

**Dampak:** pengguna menghabiskan waktu menulis sebelum mengetahui tindakannya belum tersedia. Pesan “migrasi backend” juga tidak menjelaskan apa yang bisa dilakukan pengguna.

**Rekomendasi:** beri penjelasan terlihat sebelum input: “Pengiriman catatan belum tersedia. Gunakan catatan ini untuk persiapan sesi coaching.” Pertahankan submit nonaktif sesuai status integrasi; jangan mensimulasikan keberhasilan. Jika input tetap interaktif, jelaskan apakah hasilnya disimpan dan sediakan salin teks bila berguna.

**Kriteria selesai:** pengguna mengetahui batas fungsi sebelum mulai menulis, melalui mouse, touch, maupun keyboard. Tidak ada toast sukses atau status tersimpan tanpa endpoint nyata.

### UX-14 — Library belum mendukung pencarian dan kelanjutan katalog

**Bukti:** [route daftar Use Case:16](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/%28lms%29/lms/%5Bproject_id%5D/student/%28gated%29/skill-practice/page.tsx#L16) mengambil `page_size: 100`, lalu hanya meneruskan `list`; metadata paging tidak dipakai. [SkillPracticeStudentAILN](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/SkillPracticeStudentAILN.tsx#L137) belum menyediakan pencarian/filter katalog. Pergantian tab hanya mengubah state meskipun halaman dapat membaca parameter `tab`. [Klik kartu Library](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/items/SkillPracticeCardAILN.tsx#L101) juga langsung melakukan self-assign sebelum navigasi.

**Dampak:** katalog besar dapat terpotong tanpa penjelasan, pengguna sulit menemukan latihan relevan, dan membuka kartu memiliki konsekuensi yang tidak terlihat sebagai aksi penugasan.

**Rekomendasi:** gunakan paging serta pencarian backend yang sudah didukung wrapper, filter level/kategori yang didukung kontrak, dan tampilkan jumlah hasil. Bedakan “Lihat detail” dari “Ambil latihan”. Simpan tab/filter pada URL agar kembali dari detail tidak kehilangan konteks.

**Kriteria selesai:** item di luar halaman pertama tetap dapat ditemukan; hasil kosong karena filter berbeda dari katalog kosong; pengguna tahu kapan self-assign terjadi; Back/refresh mempertahankan konteks.

### UX-15 — Notifikasi tampak sudah dibaca meskipun request gagal

**Bukti:** [NotificationSheetAILN.tsx:83](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/modals/NotificationSheetAILN.tsx#L83) mengubah status dan badge secara optimistis, lalu mengabaikan kegagalan request baca; respons HTTP tidak diperiksa. State gagal memuat daftar hanya menampilkan teks tanpa tombol retry khusus pada tampilan awal.

**Dampak:** badge dapat berubah kembali setelah refresh tanpa penjelasan. Pengguna tidak tahu apakah tindakan baca tersimpan dan harus menutup/membuka panel untuk mencoba memuat ulang.

**Rekomendasi:** rekonsiliasi unread count dari respons server; jika gagal, rollback atau tandai perlu sinkronisasi tanpa menghalangi navigasi tugas. Sediakan “Coba lagi” pada panel. Pertahankan refresh saat navigasi/tab aktif, tanpa polling interval baru.

**Kriteria selesai:** simulasi network error/500 pada aksi baca tidak meninggalkan status palsu; daftar dapat dimuat ulang dari panel; kegagalan mark-read tidak menghalangi membuka tugas.

### UX-16 — Kesegaran dan arti metrik Sponsor perlu dibuat dapat diperiksa

**Bukti:** [DashboardSponsorAILN.tsx:302](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/DashboardSponsorAILN.tsx#L302) selalu mengirim label “baru saja”; deskripsi kesehatan program menyatakan “update real-time”. Tidak ada timestamp aktual pada props tersebut. Halaman mencampur periode kumulatif, mingguan, bulanan, dan annualized. [ROI Productivity](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/RoiProductivityAILN.tsx#L94) sudah menampilkan basis tarif per jam; itu fondasi yang baik, tetapi perlu definisi periode dan cakupan.

**Dampak:** pengguna dapat membandingkan angka dengan jendela waktu berbeda atau mengira estimasi nilai waktu adalah pengembalian investasi yang sudah terealisasi.

**Rekomendasi:** tampilkan waktu pembaruan dari backend, periode setiap metrik, cakupan organisasi/grup, serta basis submission yang dihitung: dikirim, diterima, atau lainnya. Jelaskan perbedaan estimasi nilai penghematan dan ROI menurut definisi backend. Tambahkan “Cara membaca angka ini” dan bawa konteks yang sama ke PDF. Kalkulasi tetap di backend.

**Kriteria selesai:** pembaca dapat menjelaskan periode, sumber, dan arti angka tanpa menebak; timestamp tidak dibuat-buat. Jika definisi belum tersedia dari backend, UI menyatakan keterbatasannya.

**Perlu investigasi data:** pada dashboard Champion yang diamati, kartu “Use Case Dikirim” menunjukkan nol sementara panel terbaru memiliki entri. Ini belum terbukti bug hitungan; periksa perbedaan scope/periode atau data uji, lalu beri label yang membedakannya bila memang disengaja.

### UX-17 — Layout mobile berisiko menambah pekerjaan sebelum soal/form terlihat

**Bukti:** [SheetAILN.tsx:38](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/modals/SheetAILN.tsx#L38) tetap memakai lebar 75% layar; pada viewport 320 CSS px, lebarnya sekitar 240 px sebelum padding. [PreAssessmentAILN.tsx:271](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/PreAssessmentAILN.tsx#L271), [quiz:291](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/QuizAttemptAILN.tsx#L291), dan [chapter test:306](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/ChapterTestAttemptAILN.tsx#L306) memakai `order-first` untuk panel navigasi lengkap pada mobile. Informasi sekunder di beberapa panel Champion berukuran 10–11 px.

**Dampak yang perlu diuji:** form terasa sempit, navigasi banyak soal dapat mendorong soal ke bawah, dan pengguna harus sering scroll. Belum ada pengukuran overflow atau kontras pada mobile dalam audit ini.

**Rekomendasi:** jadikan sheet hampir/sepenuhnya selebar layar pada mobile; tampilkan nomor soal serta progres ringkas di atas dan navigator lengkap sebagai panel yang bisa dibuka. Tempatkan aksi berikutnya dekat soal tanpa menutupi input saat keyboard virtual terbuka. Besarkan teks sekunder penting berdasarkan uji keterbacaan. Untuk target sentuh utama, gunakan sasaran desain sekitar 44 px; ini pilihan usability, bukan klaim batas minimum WCAG. [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) menggunakan 24×24 CSS px atau pengecualian yang relevan.

**Kriteria selesai:** uji 320/375/390/768 px, zoom 200%, dan keyboard virtual. Pengguna mencapai soal aktif serta aksi utama tanpa scroll yang tidak perlu; tidak ada elemen terpotong. Ukuran font kecil sendiri tidak cukup untuk menyimpulkan pelanggaran WCAG.

### UX-18 — Tampilan state belum sepenuhnya tersedia bagi teknologi bantu

**Bukti:** [InputAILN.tsx:56](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/fields/InputAILN.tsx#L56) dan [TextAreaAILN](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/fields/TextAreaAILN.tsx#L94) memakai `required` untuk tanda bintang tetapi tidak meneruskannya ke elemen input; error belum terhubung melalui `aria-describedby`/`aria-invalid`. Jawaban pilihan pada [pre-assessment:505](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/PreAssessmentAILN.tsx#L505), quiz, dan chapter test hanya mengubah varian visual button. Textarea pre-assessment tidak punya label programatis. [RatingScaleAILN](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/fields/RatingScaleAILN.tsx#L34) punya role radio tetapi belum implementasi tombol panah. [Root layout:56](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/layout.tsx#L56) menyatakan bahasa Inggris untuk UI yang dominan Indonesia.

**Dampak:** field wajib, pilihan aktif, serta kesalahan lebih sulit dipahami tanpa melihat warna dan posisi. Pelafalan screen reader juga dapat tidak sesuai.

**Rekomendasi:** teruskan atribut wajib, hubungkan label/helper/error, gunakan radio native atau pola radio yang lengkap, nyatakan soal aktif/terjawab melalui teks programatis, dan pakai bahasa utama yang sesuai. Status menyimpan/gagal/tersimpan perlu dapat diumumkan tanpa memindahkan fokus; lihat [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Penjelasan error harus mengidentifikasi field yang perlu diperbaiki; lihat [W3C Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification).

**Kriteria selesai:** dengan keyboard dan screen reader, pengguna mengetahui pertanyaan, jawaban terpilih, field wajib, error, dan status simpan. Validasi tidak hanya bergantung pada warna atau toast singkat.

### UX-19 — Membuka konten dan menyelesaikannya memiliki arti yang berbeda antar route

**Bukti:** [route video:39](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/%28lms%29/lms/%5Bproject_id%5D/student/%28gated%29/videos/%5Bvideo_id%5D/page.tsx#L39) memanggil `completeVideo()` saat halaman dibuka, sebelum pengguna menekan “Tonton Video” di tab baru. [Route materi:47](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/%28lms%29/lms/%5Bproject_id%5D/student/%28gated%29/materials/%5Bmaterial_id%5D/page.tsx#L47) juga memanggil completion saat render. Sebaliknya, [halaman chapter:738](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/ChapterDetailsAILN.tsx#L738) meminta pengguna menandai sudah ditonton secara eksplisit. Label UI kemudian menyatakan “Ditonton” atau selesai.

**Dampak:** tindakan yang sama memperoleh progres berbeda menurut pintu masuk. Status dapat menyatakan sudah menonton sebelum video dijalankan, sehingga pengguna dan pengelola sulit menafsirkan capaian.

**Rekomendasi:** tetapkan definisi completion bersama backend, lalu gunakan secara konsisten pada semua pintu masuk. Jika definisinya hanya membuka konten, beri nama “Sudah dibuka”. Jika perlu konfirmasi belajar, tampilkan tindakan eksplisit dan feedback penyimpanan yang sama. Jangan membuat aturan skoring baru di frontend.

**Kriteria selesai:** membuka item dari chapter, Fokus Hari Ini, atau URL langsung menghasilkan status dengan makna yang sama. Label progres menggambarkan tindakan yang benar-benar dikonfirmasi sistem.

**Pemeriksaan tambahan:** halaman chapter memilih `learnings.videos[0]`. Jika backend dapat mengirim beberapa video per chapter, tambahkan daftar/pemilih agar semua item dapat diakses dan diselesaikan. Kondisi konten multi-video belum diverifikasi.

### UX-20 — Istilah fitur dan nama produk belum satu suara

**Bukti:** [sidebar](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/navigations/SidebarAILN.tsx#L59) menyebut “Latihan Skill”, halaman tujuan memakai “Use Case”, dan [Alur Belajar:244](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/components/pages/LearningPathStudentAILN.tsx#L244) masih mengajak latihan Prompt & Use Case. Champion memakai campuran “Team Overview”, “Dashboard Team”, “Assignment”, dan “Assign Tugas”. Browser produksi serta [metadata layout:29](https://github.com/sevenpreneur/ailene-lms/blob/31f49e18/src/app/layout.tsx#L29) masih menampilkan “AI LMS Sevenpreneur”.

**Dampak:** pengguna harus menebak apakah istilah berbeda menunjuk fitur yang sama. Nama tab browser tidak cocok dengan identitas Ailene yang mereka lihat di produk.

**Rekomendasi:** tetapkan kosakata produk singkat, misalnya “Ringkasan Tim”, “Tugas”, “Review Tugas”, dan satu istilah konsisten untuk latihan penerapan AI. Pertahankan istilah domain yang memang familiar seperti Champion/Use Case jika hasil uji mendukungnya. Rapikan title/description dan copy yang terlihat pengguna. Nama package, token warna legacy, dan penamaan kosmetik internal tidak perlu ikut diubah.

**Kriteria selesai:** satu fitur memiliki nama yang sama pada sidebar, judul halaman, CTA, notifikasi, dan panduan. Pengguna dapat mencocokkan nama tab browser dengan produk yang sedang dibuka.

## Rekomendasi alur yang dituju

| Journey | Pengalaman yang seharusnya diperoleh pengguna |
| --- | --- |
| Login → program → tugas | Akun dan program jelas; sesi bermasalah bisa dipulihkan; login dari tautan tugas kembali ke tugas tersebut |
| Pre-assessment | Tujuan, durasi, sifat satu kali, dan batas draft dijelaskan; soal menjadi fokus; ada pemeriksaan sebelum kirim |
| Belajar satu chapter | Tahu prasyarat, tindakan berikutnya, dan arti selesai; seluruh konten bisa diakses; progres tidak bergantung pada pintu masuk |
| Guided use case | Input → workflow → uji hasil → bukti → ringkasan → kirim; status simpan terlihat pada tiap tahap |
| Revisi | Catatan Champion → hasil sebelumnya → perubahan yang diperlukan → kirim ulang → status konsisten |
| Champion | Daftar prioritas → detail anggota/tugas → tindakan yang tersedia → hasil yang dapat diverifikasi; tidak ada form buntu tersembunyi |
| Sponsor | Ringkasan dengan periode/sumber → detail pembanding → penjelasan metode → export dengan konteks yang sama |

## Urutan pengerjaan yang disarankan

### Gelombang 1 — Pulihkan jalur tugas dan kepercayaan status

- UX-01/02/03: tutup jalur tugas yang buntu, perbaiki bukti URL, dan pemulihan sesi.
- UX-04/08: error tidak boleh menjadi klaim selesai/tersimpan atau angka nol.
- UX-09/13: perbaiki tujuan tautan dan beri penjelasan kemampuan form sejak awal.
- Mulai UX-07 dengan primitive overlay bersama karena dipakai banyak alur.

**Gerbang verifikasi:** satu tugas dapat ditugaskan, ditemukan, dikerjakan, dan dikirim dengan backend yang tersedia; request gagal tidak menghasilkan status sukses palsu; alur penting dapat dilewati dengan keyboard.

### Gelombang 2 — Lindungi pekerjaan dan tutup putaran review

- UX-05/06/12: persistence penuh, pemulihan hasil, dan pemisahan draft antar akun.
- UX-11/15/18/19: konfirmasi pengiriman manual, sinkronisasi notifikasi, semantik input, dan definisi completion.
- UX-10: akses detail anggota melalui kontrol yang benar.

**Gerbang verifikasi:** refresh, pindah halaman, kegagalan jaringan, dan siklus minta revisi tidak menghilangkan pekerjaan yang dijanjikan tersimpan.

### Gelombang 3 — Efisiensi pemakaian rutin

- UX-14/17: pencarian/paging, pemulihan konteks daftar, serta layout tugas pada mobile.
- UX-16/20: definisi metrik, timestamp, konsistensi istilah dan identitas.

**Gerbang verifikasi:** katalog besar dapat ditelusuri; dashboard dan PDF dapat dijelaskan dengan definisi yang sama; tugas mobile dapat diselesaikan tanpa hambatan layout.

Urutan ini bukan persetujuan otomatis atas perubahan fitur. Persistence, status submission, timestamp, perhitungan metrik, serta finalisasi quiz membutuhkan pemeriksaan kontrak backend yang berlaku. Reuse `src/apis/api.ts` dan API per resource; perhitungan bisnis tetap berada di backend. Fitur mock tetap nonaktif sampai endpointnya tersedia.

## Validasi berikutnya dengan pengguna

Mulai dengan satu putaran kecil: sekitar 5 Student dengan pengalaman AI beragam, 3 Champion, dan 2 Sponsor. Jumlah ini merupakan usulan rekrutmen awal, bukan jaminan cakupan statistik. Libatkan pengguna mobile serta pengguna keyboard/screen reader sesuai profil peserta program.

| Role | Tugas pengujian | Yang diamati |
| --- | --- | --- |
| Student baru | Masuk dari tautan tugas, pilih program, mulai dan lanjutkan pre-assessment | Memahami tujuan, menemukan bantuan, mengenali draft dan konsekuensi kirim |
| Student | Temukan langkah belajar berikutnya dan jelaskan kenapa bagian lain terkunci | Ketepatan pilihan tindakan dan pemahaman syarat membuka konten |
| Student | Catat use case dengan URL bukti, simpan sebagian, refresh, lalu lanjutkan | Keutuhan draft, pemahaman menit/jam, kejelasan error dan status simpan |
| Student | Perbaiki submission berdasarkan catatan Champion | Catatan ditemukan, hasil lama tersedia, perubahan tepat, status akhir dipahami |
| Champion | Temukan anggota yang perlu bantuan, buka detail, berikan tugas yang dapat dikerjakan | Kejelasan prioritas, akses keyboard, kesesuaian tugas dengan tampilan Student |
| Champion | Temukan submission dari dashboard, minta revisi, lalu periksa kiriman ulang | Jalur review utuh, konteks dan hasil tindakan tidak hilang |
| Sponsor | Jelaskan arti penghematan/ROI, periode, dan waktu pembaruan; export | Kesamaan interpretasi dashboard dan PDF; tidak menyamakan unavailable dengan nol |

Catat keberhasilan tanpa bantuan, salah navigasi, waktu tugas, pekerjaan yang hilang, dan penilaian kemudahan setelah tiap tugas. Ukur baseline dulu; jangan menetapkan klaim peningkatan tanpa data pembanding. Untuk telemetry, cukup rekam tahapan/status dan kategori kegagalan yang diperlukan; jangan merekam isi jawaban, prompt, atau bukti upload.

## Checklist penerimaan lintas alur

- [ ] Semua assignment aktif memiliki tujuan pengerjaan Student yang valid.
- [ ] Sesi tidak valid dapat pulih tanpa loop dan tanpa kehilangan tujuan tugas.
- [ ] Error backend tidak berubah menjadi “selesai”, angka nol, atau 404 yang keliru.
- [ ] Setiap janji penyimpanan sesuai data yang benar-benar dapat dipulihkan.
- [ ] Revisi mempertahankan catatan, hasil sebelumnya, dan status setelah refresh.
- [ ] Submit manual yang mengakhiri pengerjaan memiliki pemeriksaan yang sesuai.
- [ ] Semua modal, navigasi anggota, dan jawaban dapat digunakan dengan keyboard.
- [ ] Screen reader memperoleh nama field, pilihan, error, dan status simpan.
- [ ] Katalog lebih dari 100 item tetap dapat ditelusuri.
- [ ] Dashboard/PDF membedakan data nol, data kosong, dan data gagal.
- [ ] Periode, timestamp, dan definisi metrik tersedia bagi pembaca laporan.
- [ ] Mobile, zoom, keyboard virtual, dan jaringan terputus sudah diuji langsung.

## Referensi

Kerangka evaluasi mengikuti prinsip status sistem, konsistensi, pencegahan error, dan pemulihan pada [10 Usability Heuristics — Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/). Referensi aksesibilitas yang dipakai pada rekomendasi: [W3C APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification), [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), dan [WCAG Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

Tidak ada skor SUS, tingkat konversi, klaim peningkatan completion, hasil contrast audit, atau pernyataan lulus/gagal WCAG dalam laporan ini karena pengukurannya belum dilakukan.
