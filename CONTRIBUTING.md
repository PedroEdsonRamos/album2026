# Contributing

## Running locally

See [README.md](README.md#quick-start) for setup instructions.

Requirements: Node 22 (version pinned in `.nvmrc`), npm 10+.

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

| Prefix | When to use |
|---|---|
| `feat:` | New user-facing feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructure with no behaviour change |
| `chore:` | Tooling, config, dependency updates |
| `docs:` | Documentation only |
| `ci:` | CI/CD pipeline changes |
| `style:` | Formatting only (no logic change) |

Examples:

```
feat: add sticker image upload support
fix: correct footer z-index below modal
refactor: extract CategoryBar into molecules/
docs: update data model section in README
```

Keep the subject line under 72 characters. No period at the end.

## Branch model

Trunk-based development — work directly on `main` for solo development.  
For team contributions, open short-lived feature branches (`feat/my-feature`) and submit a PR.

Branch naming: `feat/`, `fix/`, `chore/`, `docs/` prefix + kebab-case description.

## Pull request flow

1. Fork the repo (external contributors) or create a branch (team members)
2. Make focused, atomic commits following the convention above
3. Run `npm run lint` and `npm run build` locally — both must pass
4. Open a PR against `main` using the PR template
5. Squash-merge after approval

Keep PRs small. One concern per PR.

## Code standards

- **No TypeScript** in this phase — plain JavaScript only
- **No external UI libraries** — inline CSS-in-JS only
- **No new runtime dependencies** beyond `react` and `react-dom`
- Max 300 lines per file in `src/` — split if exceeded
- `App.jsx` must stay free of business logic
- Use `@/*` alias for all imports — never relative `../../../`
- Run before committing:
  ```bash
  npm run lint
  npm run build
  ```
