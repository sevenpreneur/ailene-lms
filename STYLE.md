# Sevenpreneur — Style Guide (Ailene)

Satu sumber kebenaran: **`src/app/globals.css`** (preset root). Semua warna, radius,
shadow, dan font ditarik dari token di sana — komponen **tidak** boleh hardcode
hex/warna. Ganti preset di root → seluruh UI ikut berubah otomatis.

---

## 1. Font

Body memakai **Space Grotesk** lewat `--font-sans` (di-set di `src/app/layout.tsx`).

- Default: semua teks otomatis `font-sans` (Space Grotesk) — cukup pakai utility teks biasa.
- Angka/metrik boleh mono: `font-mono` (atau `font-jetbrains`).
- **Jangan** pakai `font-geist-*` lagi (sudah di-repoint ke preset; hindari menambah baru).

---

## 2. Warna — semua dari token preset

Pakai **utility yang dibacking token**, bukan hex:

| Kebutuhan | Token / class | Catatan |
| --- | --- | --- |
| Background halaman | `bg-background` / `--dashboard-bg` | light = muted, dark = paling gelap |
| Permukaan card | `bg-card` / `.ailn-card` | putih (light) / gelap (dark) |
| Panel di dalam card | `bg-muted` / `--card-inside-bg` | |
| Border | `border-border` / `--dashboard-border` | |
| Teks utama | `text-foreground` | |
| Teks sekunder | `text-muted-foreground` | |
| Aksi utama | `bg-primary` `text-primary-foreground` | |
| Error/destruktif | `bg-destructive` | |
| Data viz (chart) | `var(--chart-1)` … `var(--chart-5)` | light → dark |

> ❌ `bg-gray-200`, `text-emerald-600`, `border-[#e3e0ed]`, `#1f5f4e`
> ✅ `bg-muted`, `text-foreground`, `border-border`, `var(--chart-3)`

### Warna identitas per stakeholder

Tiap platform punya **satu warna identitas** (token di preset root):

| Stakeholder | Warna | Token | Tailwind |
| --- | --- | --- | --- |
| **Student** (agora/ailene) | 🔴 Merah | `--stakeholder-student` | `text-stakeholder-student`, `bg-stakeholder-student`, `border-stakeholder-student` |
| **Champion** | 🟢 Hijau | `--stakeholder-champion` | `text-stakeholder-champion`, `bg-stakeholder-champion`, … |
| **Sponsor** | 🔵 Biru | `--stakeholder-sponsor` | `text-stakeholder-sponsor`, `bg-stakeholder-sponsor`, … |

Pakai untuk: state aktif sidebar, accent strip KPI, indikator/badge identitas, ring highlight.
Untuk tint lembut pakai opacity: `bg-stakeholder-champion/10`, `ring-stakeholder-sponsor/40`.

> Catatan: ini warna **identitas**, bukan warna **data**. Chart tetap pakai `--chart-*`.
> Status semantik (success/warning) tetap pakai konvensi masing-masing — jangan
> samakan "champion hijau" dengan "success hijau".

---

## 3. Radius

Skala dari `--radius` (preset). Pakai utility, bukan angka arbitrer.

| Utility | Nilai |
| --- | --- |
| `rounded-md` | `var(--radius-md)` |
| `rounded-lg` | `var(--radius-lg)` = `--radius` |
| `rounded-xl` | `var(--radius-xl)` |
| `rounded-full` | lingkaran (icon tile, avatar) |

- Card/surface → `rounded-lg`/`rounded-xl` (atau `.ailn-card` yang sudah pakai `var(--radius-lg)`).
- ❌ Jangan `rounded-[12px]` untuk surface. (Micro-element seperti swatch 2px boleh dikecualikan.)

---

## 4. Shadow & card

Gunakan helper **`.ailn-card`** (didefinisikan di `globals.css`) untuk semua card permukaan:

- **Light:** background `var(--card)` + soft layered shadow (tanpa border 1px — border flat bikin "generic").
- **Dark:** hairline `border` `var(--dashboard-border)` + tanpa shadow (shadow tak terlihat di gelap).
- Radius: `var(--radius-lg)`.

```tsx
<div className="ailn-card p-5">…</div>
```

❌ Jangan bikin shadow custom hardcoded (`shadow-[0_0_10px_rgba(…)]`) untuk card biasa.

---

## 5. Pola Card-with-Icon (statistics-02)

Standar kartu KPI / metrik (lihat `ScorecardAILN`): konten di kiri, **icon
bulat ber-border** di kanan. Untuk satu baris berisi beberapa kartu, render
`ScorecardAILN` di dalam grid responsif (`grid grid-cols-1 md:grid-cols-2
xl:grid-cols-4 gap-4`).

```tsx
<div className="ailn-card">
  <div className="flex items-start justify-between gap-3 p-6">
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div>
        <p className="text-2xl font-medium text-foreground">{value}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{footer}</p>
      </div>
    </div>
    {/* icon tile */}
    <div className="shrink-0 rounded-full border border-border p-3">
      <Icon size={16} className="text-muted-foreground" />
    </div>
  </div>
</div>
```

Konvensi:
- **Library icon:** `lucide-react`. Render `currentColor` → warnai lewat class token
  (`text-muted-foreground`, atau `text-stakeholder-*` untuk accent).
- **Icon tile:** `rounded-full border border-border p-3`, `size={16}`. Untuk accent
  platform: `border-stakeholder-<role>` + `text-stakeholder-<role>` + tint `/10`.
- Padding cell `p-6`, gap konten `gap-4`, value `text-2xl font-medium` (bukan bold/mono
  kecuali memang ingin mono untuk angka).

---

## 6. Container & layout

- Wrapper halaman (`PageContainerAILN`): `max-w-[1400px]` + `mx-auto` + padding
  responsif `px-4 md:px-6 xl:px-8`. Jangan full-width edge-to-edge di layar lebar.

---

## Ringkas: Do / Don't

| ✅ Do | ❌ Don't |
| --- | --- |
| `bg-card`, `bg-muted`, `border-border`, `text-foreground` | `bg-white`, `bg-gray-100`, `border-gray-200`, `#fff` |
| `var(--chart-1..5)` untuk data viz | hex hijau/biru hardcoded |
| `text-stakeholder-champion` untuk identitas | `text-emerald-600` |
| `.ailn-card`, `rounded-lg`, `var(--radius-lg)` | shadow/radius hardcoded |
| Space Grotesk via `font-sans` | `font-geist-*` baru |

Ubah look global cukup dari **`globals.css`** (token) — bukan per-komponen.
