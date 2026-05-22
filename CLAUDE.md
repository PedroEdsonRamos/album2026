# CLAUDE.md — Memória do Projeto `album2026`

Este arquivo define **regras invariantes** que valem em toda sessão do Claude Code neste projeto. Leia antes de qualquer ação.

## Identidade do projeto

App React mobile-first para rastrear coleção de figurinhas do álbum oficial Panini da Copa do Mundo FIFA 2026. MVP funcionalmente completo e visualmente aprovado pelo product owner — em fase de refatoração e profissionalização para publicação como portfólio.

## Stack obrigatória

- **Build**: Vite 5 + React 18
- **Linguagem**: JavaScript puro (NÃO migrar para TypeScript nesta fase)
- **Estilo**: CSS-in-JS inline (NÃO migrar para CSS Modules, Tailwind ou styled-components)
- **Dependências runtime permitidas**: APENAS `react` e `react-dom`. Nada de UI libs, routers, state managers ou data fetchers.
- **Dev tools permitidas**: ESLint, Prettier, Vite plugins essenciais
- **Node**: LTS atual, pinado via `.nvmrc`

## Restrição imutável — CRÍTICA

**NÃO altere lógica de negócio, design visual, comportamento ou texto da UI.** Apenas estrutura, organização e governança. Se uma refatoração causar qualquer mudança visual ou comportamental, **pare imediatamente** e me avise antes de prosseguir.

Considere "mudança proibida":
- Alterar cores, espaçamentos, fontes, animações
- Renomear variáveis ou chaves do localStorage (`"album2026-stickers-v1"` é fixo)
- Mudar copy/textos da UI
- Alterar formato dos dados (`MY_RAW`, `FULL_DB`, etc.)
- Adicionar/remover funcionalidades não solicitadas
- "Melhorar" código que está funcionando

## Modelo de dados (fixo, NÃO alterar)

- **Total**: 980 figurinhas = 48 seleções × 20 + 19 especiais FWC + 1 capa
- **Por seleção (20)**: #1 = Escudo · #2–12 = Jogadores 1–11 · #13 = Foto da Equipe · #14–20 = Jogadores 12–18
- **5 acabamentos visuais**:
  - Regular `#1fc8d1` (tiffany)
  - Lilás `#6d48a8`
  - Bronze `#b8621b`
  - Prata `#cbd5e1`
  - Ouro `#fbbf24`
- **Persistência**: localStorage com chave `"album2026-stickers-v1"`
- **Coleção real do usuário**: 140 figurinhas em `MY_RAW`, com FWC10 e URU16 repetidas

## Identidade visual (preservar exatamente)

- Tema escuro: fundo `#0c0c1a`
- Fonte: Sora (importada do Google Fonts)
- Glassmorphism: bordas translúcidas, backdrop-filter blur
- Gradientes radiais âmbar/violeta no background
- Mobile-first: max-width 480px
- Bottom navigation com 6 abas

## Arquitetura alvo (Atomic Design)

```
src/
├── styles/        → tokens.js, finishes.js, globals.css
├── data/          → teams.js, squads.js, fwc.js, userCollection.js, database.js
├── services/      → storage.js
├── hooks/         → useInView.js, useCounter.js, useStickers.js
├── utils/         → teamInfo.js
├── components/
│   ├── atoms/     → Icon, CircleProgress, Toast, FIFATrophy, PTECLogo
│   ├── molecules/ → StatCard, StickerCard, TeamCard, CategoryBar, StatMiniBox, StatusTeamRow
│   ├── organisms/ → Header, BottomNav, Footer, QuickSearch, StickerEditModal
│   └── pages/     → Dashboard, Teams, Stickers, AddPage, Trades, Status
├── App.jsx        → apenas orquestração (sem lógica de negócio)
└── main.jsx       → entry Vite
```

## Convenções de código

- **Imports**: use sempre alias `@/*` (configurado no `vite.config.js`). Nunca `../../../`
- **Nomes de componentes**: PascalCase
- **Nomes de hooks**: camelCase começando com `use`
- **Limite por arquivo**: máximo 300 linhas em `src/`. Se passar disso, dividir
- **App.jsx**: zero lógica de negócio. Apenas state via `useStickers()` + roteamento por `page` + composição de Header/Footer/BottomNav

## Convenções de Git

- **Commits**: Conventional Commits (`refactor:`, `chore:`, `docs:`, `ci:`, `feat:`, `fix:`)
- **Branch**: trunk-based, trabalhando direto em `main` durante o setup inicial
- **Granularidade**: 1 fase = 1 commit. Não condensar fases em commits únicos
- **Verificação obrigatória entre commits**: após cada commit, rodar `npm run dev` e confirmar que o app boota e visualmente parece idêntico ao monolito original

## Comunicação esperada

- Ao iniciar uma fase, anuncie qual é
- Ao terminar, resuma em 3–5 linhas o que foi feito
- Sempre forneça o comando para eu verificar (ex: "rode `npm run dev` e confirme que a aba Início está idêntica")
- Em caso de ambiguidade, **pergunte antes de assumir**
- Não invente funcionalidades que não foram pedidas

## Não-objetivos (NÃO fazer)

- ❌ Migrar para TypeScript
- ❌ Adicionar Vitest, Jest, ou qualquer framework de teste
- ❌ Adicionar backend (Supabase, Firebase, etc.)
- ❌ Adicionar react-router-dom
- ❌ Adicionar UI libraries
- ❌ Refatorar a lógica de negócio
- ❌ Mudar a paleta de cores ou identidade visual
- ❌ Renomear arquivos do usuário (`Logo_PTEC.png`, `trophy.png`)

Estes itens são roadmap futuro, não escopo desta refatoração.
