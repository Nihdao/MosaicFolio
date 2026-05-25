# LLM.md — AI Onboarding Guide

This file is the single source of truth for AI assistants and developers who want to customize this portfolio.

---

## Repo Overview

This is a static portfolio template built with Next.js. All content lives in `content/` YAML files. The template engine lives in `src/` and must not be edited.

**Two-rule contract:**
1. All customization happens in `content/` and `public/` only.
2. Never edit `src/`.

**Build pipeline:**

```
content/*.yaml → yaml package → Zod validation → React Server Components → static HTML (out/)
```

**Validation:** `pnpm validate` runs Zod schemas against `content/` in ~700 ms without touching Next.js. Use this for tight edit/check loops. `pnpm build` is the full check (compile + OG image generation + static export).

**OG image:** `pnpm build` auto-runs `scripts/generate-og.ts` as a prebuild step. It reads `content/config.yaml`, `content/links.yaml`, and `public/profile.png` to generate `public/og.png`. No manual step needed.

**No database, no API keys, no environment variables required in production.**

---

## Authoring Workflows

### Workflow A — WYSIWYG (Dev Mode)

The primary authoring path. Run `pnpm dev`, click the floating ✎ button (bottom-center) or open `http://localhost:3000/?dev=true`, and edit tiles in-place.

Every edit is persisted to the underlying `content/*.yaml` file via dev-only API routes (`/api/content/[file]` and `/api/content/[file]/[id]`). These routes return 403 outside `NODE_ENV=development`.

**Caveat for AI agents:** When the WYSIWYG editor writes back to a YAML file via `YAML.stringify`, all in-file comments and custom whitespace are normalized. Do not place persistent documentation inside `content/*.yaml` — keep it here.

### Workflow B — Direct YAML editing (recommended for AI agents and batch changes)

Edit the files in `content/` directly. The dev server hot-reloads on save.

This is the most reliable path for an AI making multiple changes in one shot — the schema below tells you exactly which fields are valid.

---

## File Structure

| File | Purpose | Edit? |
|---|---|---|
| `content/config.yaml` | Global settings: name, tagline, accent color, avatar, status colors (single YAML document) | ✅ Yes |
| `content/projects.yaml` | Project tiles — one YAML document per project, separated by `---` | ✅ Yes |
| `content/links.yaml` | Hero column links — one document per link. **Links do not render in the tile grid**, only in the hero column. | ✅ Yes |
| `content/images.yaml` | Image tiles — one document per image | ✅ Yes |
| `content/layout.yaml` | Tile display order in the grid + section header positions (single document). Accepts project IDs, image IDs, and `section-*` headers only. | ✅ Yes |
| `public/` | Images, avatar, and other static assets served at the site root | ✅ Yes |
| `LLM.md` | This file — keep in sync with schema changes | ✅ Yes |
| `README.md` | Setup and dev mode walkthrough | ✅ Yes |
| `src/` | Template engine — React components, content parser, Zod schemas, dev-mode API | ❌ Do not edit |
| `scripts/generate-og.ts` | Prebuild script that generates `public/og.png` | ❌ Do not edit |

---

## YAML File Format

Files are pure YAML — no Markdown, no frontmatter wrappers.

**Single-document files** (`config.yaml`, `layout.yaml`) hold one top-level mapping:

```yaml
name: Adam Alet
tagline: Building Data Products and playful things
accent: "#9c88ff"
```

**Multi-document files** (`projects.yaml`, `links.yaml`, `images.yaml`) use the YAML stream form. Each tile is its own document, separated by `---` on a line by itself. The first document is preceded by `---`:

```yaml
---
type: project
title: My Portfolio
status: building
---
type: project
title: Another One
status: active
```

Empty documents are ignored at parse time. Both block (`key:\n  value`) and flow (`[a, b]`) styles are accepted.

---

## Field-by-Field Reference

### content/config.yaml

Single document. One file, one config object.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `name` | string | Yes | Portfolio owner's display name | `Adam` |
| `tagline` | string | Yes | One-line description shown in the hero | `Builder of things on the internet.` |
| `accent` | hex string | Yes | Primary accent color. Must match `^#[0-9A-Fa-f]{6}$` | `"#9c88ff"` |
| `theme` | string | Yes | Pre-style name — only `clean` is valid in V1 | `clean` |
| `description` | string | No | Extended description shown in the hero column (multi-line) and used as SEO meta description | `My personal portfolio.` |
| `canonical_url` | string | No | Canonical URL used for SEO meta tags and sitemap | `https://yourname.dev` |
| `avatar` | string | No | Avatar path. Bare filenames (`profile.png`) are auto-prefixed with `/`. Must exist in `public/`. Omit for typography-only hero. | `profile.png` or `/uploads/me.png` |
| `status_colors` | object | No | Override the default status pill colors. Each key is a 6-digit hex string. See below. | (see below) |

**`status_colors` sub-fields** (all optional, all 6-digit hex):

| Key | Default (light) | Description |
|---|---|---|
| `idea` | `#F4F4F5` | Background of the `idea` status pill |
| `building` | `#FEF9C3` | Background of the `building` status pill |
| `active` | `#DCFCE7` | Background of the `active` status pill |
| `archived` | `#F4F4F5` | Background of the `archived` status pill |

The text color of each pill is computed automatically from the background luminance.

**Notes:**
- `accent` must be a quoted string — the `#` character is a YAML comment marker: `accent: "#9c88ff"`.
- All hex strings are validated strictly — non-hex values throw at validation time.

---

### content/projects.yaml

Each project is a separate YAML document separated by `---`.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `type` | `project` | Yes | Literal — always `project` | `project` |
| `title` | string | Yes | Display name shown on the tile | `My Portfolio` |
| `status` | enum | Yes | `idea` \| `building` \| `active` \| `archived` | `active` |
| `size` | enum | Yes | `square` (1×1) \| `full` (full-width row) | `square` |
| `description` | string | Yes | Short description shown on the tile and in the modal | `Open-source Next.js portfolio.` |
| `stack` | string[] | Yes | Technology list as a YAML array | `[Next.js, TypeScript]` |
| `start_date` | string | Yes | Start date in `YYYY-MM` format | `2026-01` |
| `featured` | boolean | No | `true` renders an accent-colored left band on the tile as a stylistic highlight. No limit on how many projects can be featured. Defaults to `false`. | `true` |
| `link` | string | Conditional | External URL — **required when `modal: true`** | `https://github.com/you/project` |
| `modal` | boolean | No | `true` (default) opens a modal; `false` navigates to `link` directly | `true` |
| `icon` | string | No | Custom icon: a path from `public/` (e.g. `/uploads/logo.png`), a `lucide:<name>` keyword, or a `si:<slug>` Simple Icons slug. See the icon catalog below. | `lucide:rocket` |
| `tag` | string | No | Free-form flair badge shown in the top-right corner of the tile (e.g. `App`, `Game`, `SaaS`, `Rentable`) | `Game` |
| `tag_color` | hex string | No | Background color for the `tag` badge. Must match `^#[0-9A-Fa-f]{6}$`. | `"#EB5A46"` |

**Notes:**
- When `modal: false`, `link` is optional — the tile is non-interactive if `link` is absent.
- Renaming `now` to `featured`: the previous `now` field was renamed to `featured` and no longer carries a single-project constraint.

**Example document:**

```yaml
---
type: project
title: My Portfolio
status: active
featured: true
size: square
description: Open-source Next.js portfolio with a bento tile grid.
stack: [Next.js, TypeScript, Tailwind CSS]
start_date: 2026-01
link: https://github.com/you/portfolio
modal: true
tag: Template
tag_color: "#9c88ff"
```

---

### content/links.yaml

**Links render exclusively in the hero column (left/top side of the page).** They do not produce tiles in the grid and must not appear in `layout.yaml`.

One YAML document per link.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `type` | `link` | Yes | Literal — always `link` | `link` |
| `url` | string | Yes | Full URL — domain drives icon and brand color lookup | `https://github.com/you` |
| `label` | string | Yes | Display label shown next to the icon | `GitHub` |
| `size` | enum | No | `square` \| `full` — defaults to `square`. Kept for forward-compat; not visually used in the hero column. | `square` |
| `icon` | string | No | Override the auto-detected icon with a path or keyword (see icon catalog) | `si:github` |

**Notes:**
- Platform brand icon and background color are derived automatically from the URL domain via `src/lib/platforms.ts` — no `icon` field needed for known platforms.
- Supported branded domains: `github.com`, `x.com`, `twitter.com`, `linkedin.com`, `youtube.com`, `discord.gg`, `twitch.tv`, `apps.apple.com`.
- Unknown domains fall back to a favicon fetch via `icons.duckduckgo.com`, with a generic chain icon as last resort.
- `mailto:` URLs are supported; they render with a mail icon.

---

### content/images.yaml

Each image becomes its own tile. One YAML document per image.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `type` | `image` | Yes | Literal — always `image` | `image` |
| `src` | string | Yes | Path from the site root. Bare filenames (`banner.jpg`) are auto-prefixed with `/`. File must exist in `public/` before building. | `/images/banner.jpg` |
| `size` | enum | Yes | `square-sm` (small square) \| `square` (medium square) \| `full` (full-width row) | `square` |
| `label` | string | No | Overlay caption + alt text. Omit to render the image with no overlay and an empty alt (decorative). | `Cover photo` |
| `id` | string | No | Explicit tile ID for `layout.yaml`. Auto-derived from `label` or `src` otherwise. Used verbatim when set. | `my-photo` |

**Notes:**
- The image file must exist in `public/` (or `public/images/`, `public/uploads/`, etc.) before running `pnpm build`.
- Reference the path as it would resolve from the site root (`public/` is served as `/`).

---

### content/layout.yaml

Defines the display order of all tiles. Single YAML document containing one key: `tiles`.

| Field | Type | Required | Description |
|---|---|---|---|
| `tiles` | string[] | Yes | Ordered list of tile IDs — controls rendering order |

**How tile IDs are formed:**
- Projects: slugified `title` (lowercase, spaces → hyphens) — e.g. `My Portfolio` → `my-portfolio`
- Images: `id` field if present, otherwise slugified `label`, otherwise slugified `src`
- Section headers: any ID starting with `section-` renders a full-width visual divider — the label is derived from the slug (e.g. `section-my-projects` → "My Projects")

**Notes:**
- **Do not put link IDs in `layout.yaml`** — links live in the hero column only. The validator throws if a link slug is found.
- Tiles not listed in `layout.yaml` produce a non-blocking warning at validation time but will not render.
- Section headers are not defined in any `content/` file — they are created by adding a `section-<slug>` entry anywhere in the `tiles` list.
- Tile IDs must be exact lowercase hyphenated slugs.
- Duplicate IDs or unknown IDs in `layout.yaml` throw a validation error with the exact position.

**Example:**

```yaml
tiles:
  - section-projects
  - my-portfolio
  - redshift-survivor
  - section-photos
  - cover-photo
```

---

## Icon Catalog

The `icon` field on projects and links accepts three forms:

1. **Path** — `/uploads/foo.png` or `https://…`
2. **Lucide** — `lucide:<kebab-name>`, e.g. `lucide:rocket`
3. **Simple Icons** — `si:<slug>`, e.g. `si:github`

### Lucide names (project & link icons)

```
link, code, rocket, box, sparkles, terminal, globe, package, layers,
monitor, smartphone, server, database, cloud, lock, shield, key,
user, users, star, heart, bookmark, folder, file-text, mail,
message-square, bell, calendar, clock, target, trophy, briefcase,
lightbulb, brain, settings, wrench, share-2, download, upload,
external-link, zap, power, wifi, play, book, pen, feather,
git-branch, cpu, eye
```

### Simple Icons slugs

```
github, gitlab, git, vercel, netlify,
react, vuedotjs, svelte, angular, astro,
nextdotjs, typescript, javascript,
nodedotjs, deno, npm, bun,
tailwindcss, css, html5, sass,
docker, kubernetes,
go, rust, swift, kotlin, python, php, ruby, elixir, scala, cplusplus,
postgresql, mongodb, mysql, sqlite, redis, firebase, supabase,
graphql, prisma, drizzle, stripe,
figma, notion, linear, discord,
vite, webpack, eslint, prettier, turborepo,
googlecloud, flutter, android, apple,
claude, anthropic,
x, youtube, twitch
```

Unknown slugs fall back to a favicon lookup (for domain-derived icons) or a generic chain icon.

---

## Customization Order

Follow this sequence to avoid broken-looking intermediate states:

1. **`content/config.yaml`** — Set name, tagline, and accent color first. This drives global identity and the OG image.
2. **`content/links.yaml`** — Add your platform links (they show in the hero column only).
3. **`content/projects.yaml`** — Add your projects. Start with 2–3 entries.
4. **`content/images.yaml`** — Add image tiles (image files must already exist in `public/`).
5. **`content/layout.yaml`** — Arrange tile order; add `section-*` entries as section headers. Only project IDs, image IDs, and `section-*` are valid.
6. Run `pnpm validate` after each file (or `pnpm dev` to also preview) to catch Zod errors early.

If you prefer the WYSIWYG editor, run `pnpm dev` first, open `?dev=true`, and skip the steps above — every authoring action has a UI equivalent.

---

## Smoke-check (do this after every batch of edits)

1. `pnpm validate` — schema + layout validation in ~700 ms. Should print `content/ is valid`.
2. Look for `[content]` orphan warnings — these flag content blocks that won't render because they're missing from `layout.yaml`.
3. If you touched any visual aspect, run `pnpm dev` and open `http://localhost:3000` (and `?dev=true` to compare with the WYSIWYG view).
4. Before shipping: `pnpm build` regenerates `public/og.png` and produces the static `out/` directory.
