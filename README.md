# album2026

FIFA World Cup 2026 sticker album tracker — manage your Panini collection digitally.

![Node](https://img.shields.io/badge/node-22-brightgreen)
![Vite](https://img.shields.io/badge/vite-6-646cff)
![License](https://img.shields.io/badge/license-MIT-blue)
![Last commit](https://img.shields.io/github/last-commit/PedroEdsonRamos/album2026)

## Screenshots

<p align="center">
  <img src="/screenshots/01-dashboard.png" width="180"/>
  <img src="/screenshots/02-selecoes.png" width="180"/>
  <img src="/screenshots/03-album.png" width="180"/>
</p>
<p align="center">
  <img src="/screenshots/04-adicionar.png" width="180"/>
  <img src="/screenshots/05-trocas.png" width="180"/>
  <img src="/screenshots/06-status.png" width="180"/>
</p>

## Features

- **Dashboard** — completion percentage, stat cards, team ranking, recently added stickers
- **Teams** — 48 national teams across 12 groups with per-team completion tracking; search by name or code
- **Album** — full 980-sticker grid with filters by team, status and finish type; inline edit modal
- **Add** — add stickers individually, by team batch, or via raw code list
- **Trades** — view duplicate stickers available for trading
- **Status** — per-team detailed completion breakdown with player names and positions

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build | Vite 6 |
| Language | JavaScript (ES modules) |
| Styling | CSS-in-JS inline styles |
| Persistence | localStorage (`album2026-stickers-v1`) |
| Runtime deps | `react`, `react-dom` only |

## Quick start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

## Project structure

```
src/
├── styles/
│   ├── tokens.js          # design tokens (colors, spacing)
│   ├── finishes.js        # sticker finish definitions
│   └── globals.css        # global resets and base styles
├── data/
│   ├── teams.js           # 48 teams with group, flag, color
│   ├── squads.js          # 18 players per team + positions
│   ├── fwc.js             # 20 special FWC stickers
│   ├── userCollection.js  # user's owned stickers (MY_RAW)
│   └── database.js        # builds FULL_DB from the above
├── services/
│   └── storage.js         # localStorage read/write
├── hooks/
│   ├── useStickers.js     # central state + mutations
│   ├── useInView.js       # intersection observer
│   └── useCounter.js      # animated number counter
├── utils/
│   └── teamInfo.js        # team lookup helpers
├── components/
│   ├── atoms/             # Icon, CircleProgress, Toast, FIFATrophy, PTECLogo
│   ├── molecules/         # StatCard, StickerCard, TeamCard, CategoryBar, StatMiniBox, StatusTeamRow
│   ├── organisms/         # Header, BottomNav, Footer, QuickSearch, StickerEditModal, Add*Panel
│   └── pages/             # Dashboard, Teams, Stickers, AddPage, Trades, Status
├── App.jsx                # orchestration only — state via useStickers + page routing
└── main.jsx               # Vite entry point
```

## Data model

- **Total**: 980 stickers = 48 teams × 20 + 19 special FWC + 1 album cover
- **Per team (20)**: #1 Shield · #2–12 Players 1–11 · #13 Team Photo · #14–20 Players 12–18
- **Finish types** (5): Regular `#1fc8d1` · Lilás `#6d48a8` · Bronze `#b8621b` · Prata `#cbd5e1` · Ouro `#fbbf24`
- **Sticker codes**: `BRA 1`, `FWC 10`, `00` (cover)
- **Persistence key**: `album2026-stickers-v1`

## Roadmap

- [ ] Real screenshots in README
- [ ] Automatic deploy via Vercel / Netlify
- [ ] TypeScript migration (v2)
- [ ] Automated tests — Vitest + React Testing Library (v2)
- [ ] PWA with service worker and offline support (v2)
- [ ] OCR camera scanner for physical sticker codes (v2)
- [ ] Supabase backend for multi-device sync (v3)
- [ ] Multi-user support and trade matching (v3)

## Credits

Built by [PTEC Solutions](https://github.com/PedroEdsonRamos).

## License

[MIT](LICENSE) © 2026 PTEC Solutions
