import { LogoAileneAILN } from "@/components/elements/LogoAileneAILN";
import ThemeSwitcherAILN from "@/components/buttons/ThemeSwitcherAILN";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

const chapters = [
  { id: "mulai", label: "Masuk & pilih program" },
  { id: "pre-assessment", label: "Isi pre-assessment" },
  { id: "sesi", label: "Ikuti sesi belajar" },
  { id: "pre-test", label: "Kerjakan pre-test" },
  { id: "materi", label: "Pelajari materi & video" },
  { id: "quiz", label: "Jawab quiz" },
  { id: "post-test", label: "Kerjakan post-test" },
  { id: "survei", label: "Isi survei chapter" },
  { id: "use-case", label: "Praktik & kirim Use Case" },
  { id: "progres", label: "Pantau progres & notifikasi" },
  { id: "champion-sponsor", label: "Panduan Champion & Sponsor" },
  { id: "bantuan", label: "Kendala & pertanyaan umum" },
];

const linkStyle =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude";

function Contents() {
  return (
    <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <a
            href={`#${chapter.id}`}
            className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition hover:bg-card-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-claude"
          >
            <span className="w-5 shrink-0 text-xs text-stakeholder-student-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            {chapter.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-5 space-y-4">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-sm leading-7 sm:text-base">
          <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-stakeholder-student-soft text-xs font-medium text-stakeholder-student-foreground">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">{item}</div>
        </li>
      ))}
    </ol>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex gap-3 rounded-lg border border-dashboard-border bg-card-2 p-4 text-sm leading-6 text-muted-foreground">
      <Info
        className="mt-1 size-4 shrink-0 text-stakeholder-student-foreground"
        aria-hidden="true"
      />
      <div>{children}</div>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  intro,
  children,
}: {
  id: string;
  number: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 border-t border-dashboard-border py-9 sm:py-12"
    >
      <p className="mb-2 text-xs font-medium tracking-widest text-stakeholder-student-foreground">
        {number}
      </p>
      <h2
        id={`${id}-title`}
        className="text-2xl font-medium tracking-tight sm:text-3xl"
      >
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
        {intro}
      </p>
      {children}
    </section>
  );
}

const questions = [
  {
    question:
      "Program saya tidak muncul setelah masuk. Apa yang harus dilakukan?",
    answer:
      "Pastikan email yang dipakai sama dengan email terdaftar di program. Jika masih kosong atau perannya tidak sesuai, hubungi admin atau Champion untuk memeriksa akses akun. Panduan ini tetap bisa dibuka tanpa login.",
  },
  {
    question: "Kenapa selalu diarahkan ke pre-assessment?",
    answer:
      "Peserta perlu mengirim pre-assessment terlebih dahulu sebelum membuka halaman belajar. Draft yang tersimpan belum dianggap selesai. Buka Pre Assessment, lengkapi semua pertanyaan, lalu kirim dan tunggu konfirmasi hasil.",
  },
  {
    question: "Chapter, materi, quiz, atau post-test masih terkunci.",
    answer:
      "Baca alasan yang tampil. Chapter dibuka oleh admin; materi membutuhkan pre-test jika tersedia; quiz dan post-test dapat mensyaratkan semua materi selesai. Tandai materi yang benar-benar sudah dipelajari, lalu muat ulang. Jika syarat sudah terpenuhi tetapi masih terkunci, hubungi Champion.",
  },
  {
    question: "Tautan sesi atau rekaman belum ada.",
    answer:
      "Cek jadwal dan lokasi di detail chapter serta pengumuman program. Rekaman dan tautan mengikuti ketersediaan dari penyelenggara. Hubungi Champion jika waktunya sudah tiba tetapi tautan belum tersedia. Membuka chapter sendiri tidak membuktikan kehadiran sesi.",
  },
  {
    question: "Apakah draft bisa dilanjutkan dari perangkat lain?",
    answer:
      "Draft pre-assessment dan pre-test/post-test disimpan di browser untuk akun dan program yang sama, bukan disinkronkan ke semua perangkat. Draft quiz memiliki status penyimpanan ke server. Pada guided Use Case, perhatikan keterangan penyimpanan tiap bagian: bukti dan cerita yang belum dikirim dapat hanya tersimpan di browser. Jangan menghapus data browser, berganti perangkat, atau memakai mode privat untuk mengandalkan draft lokal. File yang belum selesai diunggah perlu dipilih ulang.",
  },
  {
    question: "Jawaban atau tugas gagal dikirim. Haruskah mengisi ulang?",
    answer:
      "Tetap di halaman, periksa koneksi dan pesan kesalahan, lalu coba lagi. Jika muncul peringatan draft belum tersimpan, salin jawaban panjang ke tempat yang aman sebelum keluar. Jika sesi login berakhir, masuk kembali dengan akun yang sama dan buka formulir di browser yang sama. Pastikan status berubah menjadi terkirim; draft atau indikator autosave bukan konfirmasi pengiriman akhir.",
  },
  {
    question: "Halaman menampilkan gagal muat atau tombol coba lagi.",
    answer:
      "Gunakan Coba lagi atau Muat ulang setelah memastikan koneksi aktif. Gagal muat tidak berarti progres hilang atau tugas sudah selesai. Jika berulang, kirim nama program, chapter/tugas, waktu kejadian, dan tangkapan layar pesan kesalahan ke Champion atau admin. Hindari menyertakan password maupun data pekerjaan sensitif.",
  },
  {
    question: "Champion meminta revisi, tetapi catatan lama tidak terlihat.",
    answer:
      "Hubungi Champion untuk meminta detail revisi. Pada beberapa alur, catatan review dan kiriman sebelumnya belum ditampilkan kembali. Siapkan ulang bukti dan cerita yang diminta, buka tugas yang sama, lalu kirim revisi setelah memeriksa isian.",
  },
  {
    question: "Kenapa ada tombol yang dinonaktifkan?",
    answer:
      "Baca alasan di dekat tombol. Aksi dapat menunggu syarat belajar, data wajib, atau ketersediaan fitur. Jangan menganggap perubahan sudah tersimpan ketika tombol kirim belum bisa digunakan. Jika alasannya tidak jelas, tanyakan ke Champion atau admin.",
  },
];

export default function DocsAILN() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#isi-panduan"
        className="sr-only z-50 rounded-lg bg-forest-deep p-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Lewati navigasi ke isi panduan
      </a>
      <header className="sticky top-0 z-20 border-b border-dashboard-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/docs"
            aria-label="Ailene AI Learn — panduan penggunaan"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
          >
            <LogoAileneAILN className="h-7 w-auto" />
            <span className="hidden border-l border-dashboard-border pl-3 text-sm text-muted-foreground sm:block">
              Panduan LMS
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcherAILN />
            <Link
              href="/"
              prefetch={false}
              className={`${linkStyle} bg-forest-deep text-white dark:bg-lime-bright dark:text-forest-deep`}
            >
              Buka LMS <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="isi-panduan" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <aside className="pt-7 lg:pt-12">
            <details className="group rounded-lg border border-dashboard-border p-3 lg:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-claude [&::-webkit-details-marker]:hidden">
                Daftar isi panduan
                <ChevronDown
                  className="size-4 transition group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <nav aria-label="Daftar isi panduan di ponsel" className="mt-2">
                <Contents />
              </nav>
            </details>
            <nav
              aria-label="Daftar isi panduan"
              className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto"
            >
              <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                <BookOpen className="size-4" aria-hidden="true" /> Isi panduan
              </p>
              <Contents />
            </nav>
          </aside>

          <div className="min-w-0 max-w-3xl pb-12">
            <div className="pb-10 lg:pt-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-stakeholder-student-soft px-3 py-1 text-xs font-medium text-stakeholder-student-foreground">
                <BookOpen className="size-3.5" aria-hidden="true" /> Terbuka
                tanpa login
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                Dari mulai belajar sampai AI terpakai di pekerjaanmu.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                Panduan menggunakan Ailene AI Learn untuk peserta, Champion, dan
                Sponsor. Ikuti langkahnya dari awal, atau pilih topik yang
                sedang kamu butuhkan.
              </p>
              <a
                href="#mulai"
                className={`${linkStyle} mt-6 border border-dashboard-border hover:bg-card-2`}
              >
                Mulai dari sini{" "}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <div className="mt-8 rounded-lg border border-dashboard-border bg-card-2 p-5 sm:p-6">
                <h2 className="text-lg font-medium">Urutan belajar sekilas</h2>
                <p className="mt-3 text-sm leading-7">
                  Masuk & pilih program → Pre-assessment → Buka chapter & cek
                  sesi → Pre-test → Sesi, materi & video → Quiz → Post-test →
                  Survei → Praktik Use Case.
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Ikuti jadwal penyelenggara dan status pada LMS. Komponen
                  setiap chapter dapat berbeda; kerjakan bagian yang tersedia
                  dan baca alasan jika masih terkunci.
                </p>
              </div>
            </div>

            <Section
              id="mulai"
              number="01 / PERSIAPAN"
              title="Masuk dan pilih program"
              intro="Gunakan akun yang didaftarkan oleh penyelenggara agar program dan peranmu tampil dengan benar."
            >
              <Steps
                items={[
                  <>
                    Buka{" "}
                    <Link
                      href="/auth/login"
                      prefetch={false}
                      className="text-stakeholder-student-foreground underline underline-offset-4"
                    >
                      halaman masuk
                    </Link>
                    . Pilih <strong>Lanjutkan dengan Google</strong> atau isi
                    email dan password sesuai akses akunmu.
                  </>,
                  <>
                    Di halaman utama, pilih <strong>Buka LMS</strong> pada
                    program yang ingin diikuti. Jika
                    memiliki beberapa program atau peran, pastikan pilihan
                    program dan peran pada menu sudah sesuai.
                  </>,
                  <>
                    Untuk belajar, gunakan peran <strong>Student</strong>. Menu
                    utama berisi <strong>Hari Ini</strong>,{" "}
                    <strong>Pre Assessment</strong>,{" "}
                    <strong>Alur Belajar</strong>, <strong>Latihan AI</strong>,
                    dan <strong>Progress Saya</strong>. Di ponsel, buka tombol
                    menu untuk melihat navigasi.
                  </>,
                  <>
                    Siapkan koneksi internet, waktu belajar, dan contoh
                    pekerjaan yang boleh digunakan untuk latihan. Untuk sesi
                    online, siapkan juga aplikasi pertemuan yang diminta
                    penyelenggara.
                  </>,
                ]}
              />
              <Note>
                Belum punya akses, lupa password, atau program tidak muncul?
                Hubungi admin atau Champion program. Peserta yang belum mengirim
                pre-assessment akan diarahkan ke assessment terlebih dahulu.
              </Note>
              <figure className="mt-6 overflow-hidden rounded-lg border border-dashboard-border bg-card-2">
                <a
                  href="/images/docs/home-program.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Perbesar screenshot halaman home (buka di tab baru)"
                  className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-claude"
                >
                  <Image
                    src="/images/docs/home-program.jpg"
                    alt="Area Program kamu di halaman home, dengan nama program, badge peran di kanan atas, dan tombol Buka LMS di kiri bawah kartu."
                    width={1100}
                    height={467}
                    sizes="(max-width: 1023px) 100vw, 768px"
                    className="h-auto w-full"
                  />
                </a>
                <figcaption className="space-y-2 border-t border-dashboard-border p-4 text-sm leading-6">
                  <p className="font-medium">Pilih program, lalu tekan Buka LMS.</p>
                  <p className="text-muted-foreground">
                    Periksa nama program dan badge peran di kanan atas kartu.
                    Contoh ini menampilkan peran Champion; peran yang muncul
                    mengikuti akses akunmu.
                  </p>
                  <a
                    href="/images/docs/home-program.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg text-stakeholder-student-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-claude"
                  >
                    Buka gambar ukuran penuh (tab baru)
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </figcaption>
              </figure>
            </Section>

            <Section
              id="pre-assessment"
              number="02 / TITIK AWAL"
              title="Isi pre-assessment program"
              intro="Pre-assessment memetakan kondisi awalmu sebelum mengikuti pembelajaran. Jawab sesuai kemampuan dan kebiasaan yang sebenarnya."
            >
              <Steps
                items={[
                  <>
                    Buka <strong>Pre Assessment</strong>, baca pengantar, jumlah
                    pertanyaan, serta perkiraan durasi yang tampil. Pilih{" "}
                    <strong>Mulai Assessment</strong> atau{" "}
                    <strong>Lanjutkan Assessment</strong> jika sudah memiliki
                    draft.
                  </>,
                  <>
                    Isi bagian <strong>Profil</strong>,{" "}
                    <strong>Skenario</strong>, <strong>Praktik</strong>, dan{" "}
                    <strong>Kebiasaan</strong>. Pilih jawaban yang sesuai; untuk
                    praktik menulis prompt, tulis jawabanmu sendiri selengkap
                    yang kamu bisa.
                  </>,
                  <>
                    Gunakan tombol berikutnya/sebelumnya atau nomor soal untuk
                    berpindah. Periksa penanda soal yang belum terjawab dan
                    lengkapi semua pertanyaan wajib.
                  </>,
                  <>
                    Pilih <strong>Kirim Jawaban</strong>, periksa konfirmasi,
                    lalu kirim. Pengiriman hanya satu kali; jawaban tidak bisa
                    diubah setelah dikirim.
                  </>,
                  <>
                    Tunggu penilaian selesai, lalu baca laporan hasil untuk
                    mengenali kompetensi awal dan area yang perlu dikembangkan.
                    Setelah selesai, lanjutkan ke halaman belajar.
                  </>,
                ]}
              />
              <Note>
                Tidak ada batas waktu pengerjaan pre-assessment. Draft tersimpan
                sementara di browser yang sama untuk akun dan programmu, selama
                penyimpanan browser tersedia. Draft belum berarti jawaban sudah
                dikirim.
              </Note>
              <div className="mt-6 overflow-x-auto rounded-lg border border-dashboard-border">
                <table className="w-full min-w-[450px] text-left text-sm leading-6">
                  <caption className="sr-only">
                    Perbedaan assessment program dan evaluasi chapter
                  </caption>
                  <thead className="bg-card-2">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Kegiatan
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Tujuan & waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dashboard-border">
                    <tr>
                      <th scope="row" className="px-4 py-3">
                        Pre-assessment
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">
                        Kondisi awal peserta, sebelum mulai program.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3">
                        Pre-test
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">
                        Pemahaman awal pada chapter, sebelum mempelajari isinya.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3">
                        Post-test
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">
                        Pemahaman setelah mempelajari materi chapter.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              id="sesi"
              number="03 / JADWAL BELAJAR"
              title="Buka chapter dan ikuti sesi"
              intro="Alur Belajar adalah tempat untuk melihat chapter, jadwal sesi, dan kegiatan yang perlu kamu selesaikan."
            >
              <Steps
                items={[
                  <>
                    Buka <strong>Alur Belajar</strong>, pilih level dan chapter
                    yang tersedia. Periksa tanggal, jam, durasi, metode sesi,
                    dan lokasi pada detail chapter.
                  </>,
                  <>
                    Jika chapter masih terkunci, tunggu admin membuka sesi.
                    Gunakan pengumuman dan arahan Champion untuk memastikan
                    jadwal; jangan menganggap chapter terbuka otomatis hanya
                    karena tanggalnya tiba.
                  </>,
                  <>
                    Sebelum mengikuti pembelajaran, kerjakan{" "}
                    <strong>pre-test</strong> jika tersedia. Untuk sesi online,
                    gunakan tautan lokasi yang disediakan, seperti{" "}
                    <strong>Buka lokasi</strong>; untuk sesi tatap muka, hadir
                    di lokasi yang tercantum.
                  </>,
                  <>
                    Ikuti penjelasan trainer dan praktik selama sesi.
                    Setelahnya, kembali ke detail chapter untuk membaca materi,
                    membuka video/rekaman yang tersedia, dan menyelesaikan
                    evaluasi.
                  </>,
                ]}
              />
              <Note>
                Jadwal pada detail chapter ditampilkan dalam WIB. Tautan
                pertemuan dan rekaman mengikuti ketersediaan dari penyelenggara.
                Konfirmasi kehadiran mengikuti arahan trainer atau Champion.
              </Note>
            </Section>

            <Section
              id="pre-test"
              number="04 / SEBELUM MATERI"
              title="Kerjakan pre-test chapter"
              intro="Pre-test mengukur pemahaman awal untuk topik chapter yang sedang kamu buka."
            >
              <Steps
                items={[
                  <>
                    Di detail chapter, cari kartu <strong>Pre-test</strong>,
                    lalu pilih <strong>Mulai pre-test</strong>. Jika belum
                    tersedia, baca status atau alasan pengunciannya.
                  </>,
                  <>
                    Jawab setiap soal pilihan ganda atau uraian. Untuk uraian,
                    gunakan kalimatmu sendiri. Navigasi nomor soal membantu
                    memeriksa jawaban yang masih kosong.
                  </>,
                  <>
                    Lengkapi semua soal, pilih <strong>Kirim jawaban</strong>,
                    baca konfirmasi, lalu pilih <strong>Kirim sekarang</strong>.
                    Pre-test hanya bisa dikirim satu kali.
                  </>,
                  <>
                    Kembali ke detail chapter. Setelah pengiriman tercatat,
                    materi yang mensyaratkan pre-test dapat dibuka. Gunakan{" "}
                    <strong>Lihat hasil</strong> untuk membuka hasil yang
                    tersedia.
                  </>,
                ]}
              />
              <Note>
                Jawaban yang belum dikirim disimpan sebagai draft di browser.
                Pre-test dapat ditutup setelah post-test dikirim. Soal uraian
                tidak masuk skor otomatis; ikuti keterangan pada halaman hasil.
              </Note>
            </Section>

            <Section
              id="materi"
              number="05 / PAHAMI & COBA"
              title="Pelajari materi dan video"
              intro="Membuka halaman saja belum menandai kegiatan sebagai selesai. Gunakan tombol penyelesaian setelah benar-benar mempelajarinya."
            >
              <Steps
                items={[
                  <>
                    Buka materi yang tersedia pada chapter, baca sampai selesai,
                    dan coba contoh atau latihan yang diberikan.
                  </>,
                  <>
                    Tekan tombol untuk <strong>menandai materi selesai</strong>,
                    lalu pastikan statusnya berubah. Lakukan untuk semua materi
                    wajib agar evaluasi berikutnya dapat dibuka.
                  </>,
                  <>
                    Tonton video atau rekaman yang tersedia. Jika ada beberapa
                    video, gunakan pilihan video chapter. Penanda waktu atau
                    shortcut, jika tersedia, membantu kembali ke bagian
                    tertentu.
                  </>,
                  <>
                    Setelah selesai menonton, gunakan tombol penyelesaian video
                    dan periksa progres chapter. Jika gagal tersimpan, coba lagi
                    sebelum meninggalkan halaman.
                  </>,
                ]}
              />
              <Note>
                Materi dan video dapat terbuka setelah pre-test selesai. Quiz
                atau post-test dapat tetap terkunci sampai semua materi yang
                disyaratkan ditandai selesai.
              </Note>
            </Section>

            <Section
              id="quiz"
              number="06 / CEK PEMAHAMAN"
              title="Jawab quiz chapter"
              intro="Quiz merupakan evaluasi tersendiri. Perhatikan petunjuk dan batas waktu yang tampil sebelum memulai."
            >
              <Steps
                items={[
                  <>
                    Di detail chapter, pilih <strong>Mulai quiz</strong> dan
                    baca konfirmasi sebelum memulai percobaan. Jika sudah mulai
                    sebelumnya, gunakan <strong>Lanjutkan quiz</strong>.
                  </>,
                  <>
                    Pilih jawaban dan gunakan nomor soal untuk meninjau ulang.
                    Perhatikan sisa waktu: keluar atau memuat ulang halaman
                    tidak berarti waktu percobaan dimulai kembali.
                  </>,
                  <>
                    Perhatikan status autosave. Tunggu{" "}
                    <strong>Jawaban tersimpan ke server</strong>. Jika
                    penyimpanan gagal, gunakan coba lagi; saat keluar lewat
                    tombol pada halaman, LMS akan mencoba menyimpan terlebih
                    dahulu.
                  </>,
                  <>
                    Sebelum waktu habis, periksa jawaban dan pilih tombol kirim,
                    lalu konfirmasi. Saat waktu habis, sistem mencoba mengirim
                    jawaban yang tersedia secara otomatis; tetap periksa hasil
                    atau pesan kesalahan.
                  </>,
                  <>
                    Baca <strong>Hasil Quiz</strong>, skor, XP yang tercatat,
                    dan pembahasan jawaban. Ikuti pilihan yang tersedia pada
                    LMS; ketersediaan percobaan berikutnya mengikuti aturan
                    program.
                  </>,
                ]}
              />
              <Note>
                Autosave menyimpan jawaban selama percobaan, tetapi belum
                menyelesaikan quiz. Pastikan pengiriman berhasil dan halaman
                hasil tampil. Hindari membuka percobaan yang sama di beberapa
                tab sekaligus.
              </Note>
            </Section>

            <Section
              id="post-test"
              number="07 / SETELAH MATERI"
              title="Kerjakan post-test chapter"
              intro="Post-test digunakan untuk melihat pemahamanmu setelah mengikuti pembelajaran pada chapter tersebut."
            >
              <Steps
                items={[
                  <>
                    Pastikan pre-test dan semua materi yang disyaratkan telah
                    selesai. Buka kartu <strong>Post-test</strong>, lalu pilih{" "}
                    <strong>Mulai post-test</strong>.
                  </>,
                  <>
                    Jawab seluruh soal sesuai pemahamanmu setelah belajar.
                    Tinjau pilihan ganda dan uraian melalui navigasi nomor soal.
                  </>,
                  <>
                    Pilih <strong>Kirim jawaban</strong>, baca konfirmasi, lalu
                    kirim. Sama seperti pre-test, post-test hanya bisa dikirim
                    satu kali dan jawaban tidak bisa diubah setelahnya.
                  </>,
                  <>
                    Periksa status selesai dan hasil yang tersedia. Kembali ke
                    detail chapter untuk menyelesaikan kegiatan lain yang masih
                    belum selesai.
                  </>,
                ]}
              />
              <Note>
                Jika post-test terkunci, ikuti alasan yang tampil, misalnya
                pre-test belum dikirim atau materi belum lengkap. Draft
                post-test disimpan di browser yang sama sampai dikirim; bukan
                bukti bahwa post-test sudah selesai.
              </Note>
            </Section>

            <Section
              id="survei"
              number="08 / MASUKAN UNTUK SESI"
              title="Isi survei chapter"
              intro="Berikan masukan tentang pengalaman belajarmu agar sesi berikutnya dapat diperbaiki."
            >
              <Steps
                items={[
                  <>
                    Pada detail chapter, cari bagian survei dan pilih{" "}
                    <strong>Isi survei sekarang</strong> saat tersedia.
                  </>,
                  <>
                    Isi seluruh penilaian skala <strong>1–5</strong> tentang
                    kejelasan, penguasaan, respons, dan interaksi trainer, serta
                    relevansi, alur, kedalaman, dan manfaat materi.
                  </>,
                  <>
                    Tambahkan feedback jika ingin: bagian favorit, topik yang
                    belum dibahas, bagian yang perlu diperbaiki, dan saran sesi
                    berikutnya. Pertanyaan teks ini boleh dikosongkan.
                  </>,
                  <>
                    Kirim survei dan pastikan muncul status{" "}
                    <strong>Terima kasih, survei terkirim</strong>. Periksa
                    kembali detail chapter untuk melihat kegiatan yang tersisa.
                  </>,
                ]}
              />
            </Section>

            <Section
              id="use-case"
              number="09 / TERAPKAN DI PEKERJAAN"
              title="Praktik dan kirim Use Case"
              intro="Gunakan Latihan AI untuk menerapkan AI pada pekerjaan nyata, lalu laporkan proses dan hasilnya dengan bukti yang bisa diperiksa."
            >
              <h3 className="mt-6 text-lg font-medium">Pilih cara mulai</h3>
              <ul className="mt-3 space-y-3 text-sm leading-7 sm:text-base">
                <li>
                  <strong>Untukmu:</strong> buka tugas yang diberikan Champion.
                  Periksa tujuan, instruksi, dan deadline sebelum mengerjakan.
                </li>
                <li>
                  <strong>Catat Use Case:</strong> buka modal pencatatan dari
                  pekerjaanmu sendiri. Isi langkah 1–3, lalu lanjutkan langkah
                  4–6 di halaman setelah workflow AI selesai dibuat.
                </li>
              </ul>
              <h3 className="mt-7 text-lg font-medium">
                Jika memakai panduan bertahap
              </h3>
              <Steps
                items={[
                  <>
                    <strong>Pekerjaan harian.</strong> Ceritakan tugas yang
                    menyita waktu dan seberapa sering kamu mengerjakannya.
                  </>,
                  <>
                    <strong>Kirim contoh.</strong> Pilih area Tempel contoh atau
                    Upload file. Samarkan data sensitif sebelum mengirim.
                  </>,
                  <>
                    <strong>Proses sekarang.</strong> Jelaskan langkah kerja,
                    alat yang dipakai, hambatan, dan durasi sebelum memakai AI
                    dalam menit. Pilih <strong>Kirim & buat workflow AI</strong>
                    agar AI mulai menyusun workflow. Modal menampilkan status
                    proses, lalu otomatis membuka halaman langkah 4–6 setelah
                    workflow berhasil dibuat.
                  </>,
                  <>
                    <strong>Saran Workflow.</strong> Baca workflow yang disarankan
                    di halaman. Pilih <strong>Perbaiki workflow</strong> di kanan
                    atas jika ingin memberi arahan melalui modal. Periksa
                    instruksi serta prompt di setiap langkah sebelum mencoba.
                  </>,
                  <>
                    <strong>Coba & centang.</strong> Jalankan langkah pada
                    pekerjaanmu menggunakan alat AI yang sesuai, periksa
                    hasilnya, lalu centang langkah yang benar-benar sudah
                    dicoba.
                  </>,
                  <>
                    <strong>Bukti & cerita.</strong> Lengkapi bukti hasil berupa
                    file atau tautan, waktu pengerjaan dengan AI dalam menit, alat yang
                    dipakai, kategori, deskripsi hasil, dan pertanyaan
                    pengalaman yang diminta. Periksa ringkasan, lalu pilih{" "}
                    <strong>Kirim ke Champion</strong>.
                  </>,
                ]}
              />
              <h3 className="mt-7 text-lg font-medium">
                Siapkan bukti yang mudah direview
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-7 sm:text-base">
                <li>
                  Tunjukkan hasil, misalnya ringkasan laporan, dokumen, atau
                  tangkapan layar. Jelaskan apa yang dibantu AI dan bagaimana
                  kamu memeriksa kualitasnya.
                </li>
                <li>
                  Samarkan data pribadi dan informasi sensitif. Jika memakai
                  tautan, pastikan Champion dapat membukanya. Tunggu unggahan
                  selesai sebelum mengirim.
                </li>
                <li>
                  Setelah dikirim, periksa apakah status menunggu review,
                  diterima, atau perlu revisi. Status menentukan langkah
                  berikutnya; jangan menganggap draft sudah dikirim.
                </li>
                <li>
                  Jika perlu revisi, baca arahan Champion, perbaiki hasil dan
                  bukti, lalu kirim ulang melalui tugas yang sama. Minta catatan
                  ke Champion jika belum tampil.
                </li>
              </ul>
              <Note>
                Catatan pribadi yang sudah masuk langkah 4 tersedia di bagian
                <strong> Lanjutkan Use Case</strong> pada Latihan AI. Buka
                kartunya untuk melanjutkan halaman yang sama. Setelah dikirim,
                periksa statusnya melalui tab <strong>Riwayat</strong>.
              </Note>
            </Section>

            <Section
              id="progres"
              number="10 / LANJUTKAN KEBIASAAN"
              title="Pantau progres dan notifikasi"
              intro="Gunakan status di LMS untuk menentukan langkah berikutnya, bukan hanya mengandalkan halaman yang pernah dibuka."
            >
              <Steps
                items={[
                  <>
                    Buka <strong>Hari Ini</strong> untuk melihat fokus belajar
                    dan kegiatan yang tersedia. Cocokkan dengan jadwal sesi dan
                    deadline tugas.
                  </>,
                  <>
                    Buka <strong>Progress Saya</strong> untuk memantau progres,
                    level, kompetensi, dan pencapaian yang tersedia. Nilai dan
                    XP mengikuti aktivitas yang sudah tercatat di sistem.
                  </>,
                  <>
                    Buka <strong>Notifikasi</strong> untuk memeriksa
                    pemberitahuan sesi, penugasan, deadline, dan review. Klik
                    pemberitahuan yang memiliki tautan untuk membuka kegiatan
                    terkait.
                  </>,
                  <>
                    Periksa kembali <strong>Alur Belajar</strong> dan{" "}
                    <strong>Latihan AI</strong>. Selesaikan bagian yang belum
                    dikerjakan atau revisi yang masih diminta sebelum lanjut.
                  </>,
                ]}
              />
              <Note>
                Menandai notifikasi dibaca hanya mengubah status notifikasinya.
                Tugas, quiz, atau materi tetap perlu diselesaikan pada halaman
                masing-masing.
              </Note>
              <div className="mt-6 rounded-lg border border-dashboard-border p-5">
                <h3 className="text-lg font-medium">
                  Checklist sebelum menutup LMS
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-6">
                  {[
                    "Jawaban atau tugas sudah berstatus terkirim, bukan hanya draft.",
                    "Materi dan video yang dipelajari sudah ditandai selesai.",
                    "Pesan gagal simpan atau unggah sudah ditangani.",
                    "Jadwal berikutnya, deadline, dan permintaan revisi sudah dicek.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check
                        className="mt-1 size-4 shrink-0 text-stakeholder-student-foreground"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            <Section
              id="champion-sponsor"
              number="11 / PENDAMPING PROGRAM"
              title="Untuk Champion dan Sponsor"
              intro="Menu mengikuti peran pada program yang dipilih. Champion dapat berpindah antara Mode Champion dan Mode Student melalui pemilih program; akun Student tidak memiliki akses ke Mode Champion."
            >
              <h3 className="mt-6 text-lg font-medium">
                Champion: dampingi penerapan AI tim
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Saat ingin belajar atau mencatat Use Case milik sendiri,
                pilih <strong>Mode Student</strong> lalu buka{" "}
                <strong>Latihan AI</strong>. Kembali ke{" "}
                <strong>Mode Champion</strong> untuk mendampingi tim.
              </p>
              <Steps
                items={[
                  <>
                    Buka <strong>Ringkasan Tim</strong> untuk melihat kondisi
                    tim, anggota, dan kiriman terbaru. Gunakan{" "}
                    <strong>Pre Assessment Report</strong> untuk memahami titik
                    awal peserta.
                  </>,
                  <>
                    Buka <strong>Tugas</strong> untuk menyiapkan Use Case.
                    Gunakan bantuan AI atau pembuatan Use Case yang tersedia,
                    periksa draft, tentukan anggota penerima dan deadline, lalu
                    kirim penugasan. Draft belum menjadi tugas peserta sampai
                    aksi penugasan berhasil.
                  </>,
                  <>
                    Buka <strong>Review Tugas</strong>, pilih kiriman Use Case,
                    lalu periksa proses, bukti, dan hasil yang dilaporkan.
                    Berikan keputusan dan catatan review melalui aksi yang
                    tersedia. Jika perlu revisi, jelaskan bagian yang harus
                    diperbaiki.
                  </>,
                  <>
                    Pantau kembali status tim dan tindak lanjuti kendala akses,
                    sesi, tugas, atau revisi. Jika peserta belum bisa melihat
                    catatan revisi, sampaikan arahannya melalui kanal program.
                  </>,
                ]}
              />
              <h3 className="mt-7 text-lg font-medium">
                Sponsor: baca perkembangan program
              </h3>
              <Steps
                items={[
                  <>
                    Buka <strong>Executive Overview</strong> untuk melihat
                    ringkasan program. Periksa cakupan dan periode data sebelum
                    membandingkan angka.
                  </>,
                  <>
                    Gunakan <strong>Pre Assessment</strong> dan{" "}
                    <strong>Workforce</strong> untuk meninjau kondisi awal serta
                    perkembangan kelompok atau anggota yang tersedia.
                  </>,
                  <>
                    Buka <strong>ROI Productivity</strong> untuk membaca dampak
                    penerapan AI dan unduh laporan jika opsi tersedia.
                    Perhatikan asumsi serta periode metrik: estimasi nilai waktu
                    berbeda dari penghematan biaya tunai yang sudah terealisasi.
                  </>,
                ]}
              />
            </Section>

            <Section
              id="bantuan"
              number="12 / SAAT BUTUH BANTUAN"
              title="Kendala dan pertanyaan umum"
              intro="Mulai dari pesan yang tampil pada halaman. Jika belum teratasi, hubungi Champion atau admin program dengan konteks yang jelas."
            >
              <div className="mt-6 divide-y divide-dashboard-border border-y border-dashboard-border">
                {questions.map(({ question, answer }) => (
                  <details key={question} className="group py-1">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-claude sm:text-base [&::-webkit-details-marker]:hidden">
                      {question}
                      <ChevronDown
                        className="size-4 shrink-0 transition group-open:rotate-180 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="pb-5 pr-5 text-sm leading-7 text-muted-foreground">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </Section>

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-dashboard-border pt-6 text-sm text-muted-foreground">
              <span>Ailene AI Learn · Panduan penggunaan</span>
              <a
                href="#isi-panduan"
                className="inline-flex min-h-11 items-center rounded-lg underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-claude"
              >
                Kembali ke atas ↑
              </a>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
