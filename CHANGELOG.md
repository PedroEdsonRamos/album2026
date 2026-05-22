# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-05-22

### Fixed
- Restructured groups to official 12-group format (A–L, 4 teams each)
- Added Haiti, Scotland, Jordan; removed teams not in official draw
- Complete squad data for all 48 teams with Portuguese position labels
- Sticker codes now include space separator (`BRA 10`, `FWC 6`, `00`)
- Footer always fixed at bottom regardless of content height
- Modal z-index verified above footer
- Team search field in Seleções tab
- Updated trophy images (header title + dashboard watermark)

## [1.0.0] - 2026-05-22

### Added
- Initial public release
- 980-sticker database: 48 teams × 20 + 19 special FWC + 1 album cover
- 6 tabs: Dashboard, Seleções, Álbum, Adicionar, Trocas, Status
- localStorage persistence with key `album2026-stickers-v1`
- Sticker edit modal — toggle status (Tenho / Faltando) and finish type
- Quick search by sticker code or player name
- Per-team completion tracking with animated progress bars
- Duplicate sticker detection and trade list
- Animated counter and intersection-observer-based entrance animations
- 5 finish types: Regular, Lilás, Bronze, Prata, Ouro
- Dark theme with glassmorphism and amber/violet gradient background

### Architecture
- React 18 + Vite 6, JavaScript only, zero runtime dependencies beyond react/react-dom
- Atomic Design: atoms → molecules → organisms → pages
- Custom hooks: `useStickers`, `useInView`, `useCounter`
- Design tokens centralized in `src/styles/tokens.js`
- `@/*` path alias configured in Vite
