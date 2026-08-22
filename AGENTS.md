# Ailene AI Learn — Agent Instructions

## Project Overview

Ailene AI Learn (kode suffix `AILN`) adalah aplikasi Next.js untuk program AI adoption — lesson journeys, quiz, pre-assessment, live session, leaderboard, plus dashboard khusus untuk role Champion dan Sponsor. Satu codebase, dua subdomain via rewrites di `next.config.mts`:

| Subdomain          | Route Group | Isi                                                    |
| ------------------- | ----------- | ------------------------------------------------------- |
| `lms.ailene.id`     | `(lms)`     | Aplikasi utama — auth, student/champion/sponsor pages   |
| `gateway.ailene.id` | `(gateway)` | tRPC API (`/trpc/[trpc]`) + QStash callback routes       |

> **Catatan historis:** repo ini adalah hasil split dari monorepo multi-platform "Sevenpreneur" (lihat commit `Migrate hardcoded domain from sevenpreneur.com to ailene.id`, `Rename ailene route group to lms`). Beberapa sisa penamaan lama masih ada tapi murni kosmetik, bukan indikasi bahwa platform lain masih hidup di sini: `package.json` masih bernama `"sevenpreneur"`, Tailwind color token di `globals.css` masih pakai prefix `--color-sevenpreneur-*`, dan ada satu komponen nyasar `PageContainerSVP.tsx`. Jangan bikin fitur baru dengan asumsi ada platform `www`/`admin`/`agora` — di repo ini cuma ada `lms` dan `gateway`.

## Dev Commands

```bash
npm run dev       # Start dengan HTTPS (wajib — pakai --experimental-https)
npm run build     # prisma generate + next build
npm run lint      # ESLint check
```

> Dev server **wajib** pakai HTTPS. Google OAuth dan subdomain rewrites butuh ini.

## Architecture

### Routing

Subdomain routing ditangani sepenuhnya di `next.config.mts` via rewrites — request ke `lms.ailene.id/*` di-rewrite ke `/lms/*`, `gateway.ailene.id/*` ke `/gateway/*` (sama untuk padanan lokal `*.example.com`, ngrok, dan Vercel preview). Semua navigasi internal (`<Link>`, `router.push`, `redirect()`) pakai path publik tanpa prefix route group (mis. `/auth/login`, bukan `/lms/auth/login`). Jangan pernah hardcode subdomain URL.

### API Layer — tRPC

Semua data fetching internal lewat tRPC.

- **Routers di** `src/trpc/routers/`: `auth.ts`, `create.ts`, `list.ts`, `queue.ts`, `read.ts`, `update.ts`
- **Main router:** `src/trpc/routers/_app.ts` — tambah router baru di sini
- **Client (browser):** `src/trpc/client.tsx` (React Query integration)
- **Client (Server Component/Action):** `src/trpc/server.tsx`
- **Procedures** (`src/trpc/init.ts`):
  - `baseProcedure` / `publicProcedure` — unauthenticated
  - `loggedInProcedure` — butuh session token valid
  - `superAdminProcedure`, `administratorProcedure` — admin role
  - `ailMemberProcedure` — Ailene program member (student/champion/sponsor)
  - `championProcedure`, `sponsorProcedure` — turunan `ailMemberProcedure` per role
  - `roleBasedProcedure(roleList: string[])` — custom role check

#### Endpoint granularity

**One endpoint = one service concern.** Jangan bikin "kitchen-sink" endpoint yang menggabungkan banyak query berbeda hanya karena dipakai di satu halaman. Pisahkan per kebutuhan datanya supaya:

- Mudah di-cache & di-invalidate satu per satu di React Query.
- Bisa di-reuse di halaman/komponen lain tanpa harus refactor backend.
- Error/loading state granular — satu bagian dashboard bisa loading tanpa block bagian lain.

Contoh: halaman dashboard yang butuh leaderboard, streak, level progress, dan today's focus → bikin 4 endpoint terpisah (`read.leaderboard`, `read.streak`, `read.levelProgress`, `read.todayFocus`), bukan satu endpoint `read.studentDashboard` yang query semuanya sekaligus.

### Authentication

Token-based (bukan NextAuth). Session token disimpan di tabel `Token` DB dan dikirim sebagai `Authorization: Bearer <token>`. tRPC context (`src/trpc/init.ts`) baca header, validasi ke DB, dan attach `ctx.user`.

Cookie session: `SESSION_COOKIE_NAME` (`session_token_ailene_lms`, di `src/lib/constants.ts`) dipakai bareng oleh dua flow — tRPC/`Token` table lama, dan Google login lewat `ailene-lms-backend` yang baru (`src/apis/auth.ts`). Sinkronisasi cookie lintas-app dengan ailene-os (domain, dst.) belum di-handle, diabaikan dulu untuk sekarang.

### API Layer — External (`src/apis/`)

Untuk komunikasi ke `ailene-lms-backend` (Java/Spring, bertahap menggantikan tRPC), jangan `fetch` langsung dari component atau route handler. Ikuti pola ini:

- `src/apis/api.ts` — `callApi()`, thin fetch wrapper ke `BASE_URL` dengan envelope typing (`ApiEnvelope<T>`). Jangan bikin wrapper fetch baru — reuse ini.
- `src/apis/<resource>.ts` (mis. `auth.ts`) — satu file per resource, isi function-function yang manggil `callApi()`. File-file ini `import "server-only"` tapi **bukan** `"use server"` — jadi bisa dipanggil dari Server Component, Route Handler, maupun Server Action.
- Endpoint yang belum punya auth per-user (mis. login) di-gate backend pakai static bearer `CLIENT_SECRET` (satu secret yang sama untuk semua client, dicek sebelum backend tahu siapa user-nya — lihat `docs/auth.md` di `ailene-lms-backend`). Pola-nya: lewatin `token: process.env.CLIENT_SECRET` ke `callApi()`, contoh di `src/apis/auth.ts`. Cek dokumentasi backend (`ailene-lms-backend/docs/<area>.md`) tiap kali nambah endpoint baru — request/response shape & auth gate bisa beda per endpoint.
- Client Component yang butuh manggil ini dari browser: pakai Route Handler di `src/app/(<group>)/<subdomain>/api/...` (contoh: `src/app/(lms)/lms/api/auth/callback/google/route.ts`), bukan Server Action — path ini di-rewrite jadi `/api/...` di subdomain yang bersangkutan (lihat `next.config.mts`). Kalau logic-nya cukup dipanggil dari Server Component (redirect, dsb), `src/lib/actions.ts` (`"use server"`) boleh dipakai sebagai wrapper tipis ke `src/apis/*`.
- Route Handler REST juga dipakai untuk callback QStash — itu hidup di subdomain `gateway` (`src/app/(gateway)/gateway/qstash/...`), terpisah dari `lms`.

### Database — Prisma + Supabase

- Schema: `prisma/schema.prisma`
- Client singleton: `src/lib/prisma.ts`
- Connection string pakai Supabase pooler; direct URL untuk migrations
- Jalankan `prisma generate` sebelum build (sudah ada di `npm run build`)
- **Jangan jalankan migration di prod tanpa review terlebih dahulu**

### Background Jobs & AI

- **QStash** (`src/lib/qstash.ts`) — trigger job async, di-handle di `src/app/(gateway)/gateway/qstash/*/route.ts` (mis. `pre-assessment-report`, `submit-quiz`)
- **OpenAI** (`src/lib/openai.ts`) — model constants + client, dipakai untuk generate pre-assessment report AI

## Component Conventions

### Naming Suffix

| Suffix          | Dipakai di      | Contoh                             |
| --------------- | --------------- | ----------------------------------- |
| `App*` (prefix) | Lintas komponen | `AppButton`, `AppModal`             |
| `*AILN`         | Semua fitur app | `LeaderboardAILN`, `QuizCardAILN`   |

> `*AILN` adalah satu-satunya suffix platform-spesifik yang aktif dipakai di repo ini (ada satu sisa `PageContainerSVP.tsx` dari sebelum split — jangan dijadikan acuan pola).

### Folder Structure

Komponen diorganisir berdasarkan purpose di `src/components/`:

| Folder         | Isi                                                    |
| -------------- | ------------------------------------------------------- |
| `ui/`          | Primitive shadcn/ui components                          |
| `banners/`     | Banner section di dalam halaman (bukan hero)             |
| `buttons/`     | Button variants                                          |
| `cards/`       | Card-shaped UI blocks                                    |
| `charts/`      | Wrapper MUI chart components untuk visualisasi data       |
| `css/`         | CSS Modules untuk styling yang nggak praktis lewat Tailwind |
| `elements/`    | Reusable UI elements — `App*` + platform-spesifik         |
| `fields/`      | Form inputs — rich editor, file upload, select, dll       |
| `forms/`       | Full form layout components                               |
| `heroes/`      | Hero / banner section di atas halaman                      |
| `indexes/`     | List / index page components (tabel, grid listing)        |
| `items/`       | Line-item / list-row components                            |
| `labels/`      | Label, badge, tag components                               |
| `modals/`      | Dialog dan drawer components                                |
| `navigations/` | Nav bars dan sidebars                                        |
| `pages/`       | Full-page layout components (satu per route)                 |
| `pdf/`         | `@react-pdf/renderer` components untuk export PDF (report)   |
| `states/`      | Loading skeletons dan empty states                            |
| `steppers/`    | Multi-step wizard / stepper components                        |
| `titles/`      | Heading / title section components                            |

Saat membuat komponen baru, tentukan dulu folder yang sesuai purpose-nya dan pakai suffix `*AILN` kalau spesifik ke platform ini.

## Library (`src/lib/`)

**Sebelum membuat function baru, selalu cek `src/lib/` dulu** — kemungkinan sudah ada dan bisa direuse. Kalau belum ada dan akan dipakai secara global di banyak tempat, buat di `src/lib/`. Kalau hanya dipakai di satu router/feature, bisa langsung di file tersebut.

File-file penting di `src/lib/`:

| File                        | Purpose                                                          |
| --------------------------- | ------------------------------------------------------------------ |
| `actions.ts`                | Next.js Server Actions (`"use server"`) untuk operasi server        |
| `app-types.ts`               | Shared TypeScript types lintas codebase                             |
| `config.ts`                  | Deployment config — `LOGIN_URL`, program start/end date, org/program name |
| `constants.ts`               | `SESSION_COOKIE_NAME` dan konstanta global lainnya                  |
| `date-time-manipulation.ts`  | Date/time manipulation dan formatting (dayjs)                       |
| `feature-tracking.ts`        | Client-side hook untuk track feature usage                          |
| `format.ts`                  | Number/score formatting (locale `id-ID`) untuk dashboard laporan     |
| `gate.ts`                    | `getProgramGate()` — cek session + role gating untuk Server Component |
| `level-colors.ts`            | Mapping level (`L0`–`L4`) ke warna UI                                |
| `openai.ts`                  | OpenAI client + model constants                                     |
| `optional-type.ts`           | TypeScript helper untuk optional/nullable types                     |
| `prisma-log-error.ts`        | Helper log error yang konsisten, pakai Prisma client                |
| `prisma.ts`                  | Prisma client singleton                                             |
| `qstash.ts`                  | QStash client untuk background jobs                                  |
| `sponsor-access.ts`          | `canAccessSponsor()` — cek role/hardcoded access list untuk Sponsor  |
| `status_code.ts`             | HTTP status code constants                                           |
| `supabase.ts`                | Supabase Storage upload                                              |
| `utils.ts`                   | General utilities — `cn()` class merger, dll                        |

## Styling

- Tailwind CSS v4 — config di `src/app/globals.css` (bukan `tailwind.config.js`)
- Brand color tokens didefinisikan di sana — masih pakai nama variabel `--color-sevenpreneur-*` (legacy, tetap pakai token yang sudah ada, jangan bikin token baru dengan nama beda untuk warna yang sama)
- Dark mode via `next-themes`
- MUI (`@mui/x-charts`) hanya untuk chart components (lihat `src/components/charts/`) — pakai Tailwind + Radix untuk yang lain

## Key Patterns

### Data mutations

```tsx
const utils = trpc.useUtils();
const mutation = trpc.something.create.useMutation({
  onSuccess: () => utils.something.list.invalidate(),
});
```

### File uploads

- Upload ke Supabase Storage via `src/lib/supabase.ts`
- Simpan public URL di field DB

### Date & Time

- **Semua operasi tanggal dan waktu wajib pakai `dayjs`** — jangan pakai native `Date` untuk manipulasi/formatting
- Helper umum tersedia di `src/lib/date-time-manipulation.ts` — cek dulu sebelum bikin baru
- Untuk timezone, parsing, dan formatting konsisten, selalu lewat dayjs (`dayjs()`, `dayjs.utc()`, `dayjs.tz()`)

## What to Avoid

- Jangan pakai `fetch` langsung untuk data internal — pakai tRPC (kecuali komunikasi ke `ailene-lms-backend`, lewat `src/apis/`)
- Jangan hardcode subdomain URL — routing internal path-based
- Jangan bypass `loggedInProcedure`/`ailMemberProcedure` untuk protected data
- Jangan pakai raw SQL kecuali Prisma tidak bisa express-nya (pakai `$queryRaw` dengan parameterized queries)
- Jangan simpan secrets di kode — semua keys di `.env`
- Jangan pakai MUI untuk layout/UI di luar chart components
- Jangan asumsikan ada route group/platform lain (`www`/`admin`/`agora`) — repo ini cuma `(lms)` dan `(gateway)`
