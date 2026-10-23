# Stack Sans fonts

Variable TrueType fonts from the official Google Fonts repository:

- [Stack Sans Text](https://github.com/google/fonts/tree/main/ofl/stacksanstext)
- [Stack Sans Headline](https://github.com/google/fonts/tree/main/ofl/stacksansheadline)

Each family includes its original SIL Open Font License in `OFL.txt`.

Loaded through `next/font/local` in `src/app/layout.tsx` so production builds
do not fetch Google Fonts. This avoids the extensionless font URL parsing
failure in Next.js 16.3.2 ([upstream issue](https://github.com/vercel/next.js/issues/99114)).
