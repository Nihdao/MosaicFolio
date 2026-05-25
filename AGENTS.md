<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Portfolio Template — Agent Context

This repo is a static bento-grid portfolio template built with Next.js. All content is driven by YAML files in `content/`. The template engine lives in `src/`.

## Contract

1. **For content updates, only edit `content/` and `public/`.** Do not touch `src/` when the user just wants to update content (text, projects, links, images, layout, identity). Editing `src/` is allowed only when the user explicitly asks to change the project structure itself (template engine, components, routing, styling system, build pipeline).
2. `content/config.yaml` — global identity (name, tagline, accent color, avatar).
3. `content/projects.yaml`, `content/links.yaml`, `content/images.yaml` — multi-document YAML streams (each tile separated by `---`).
4. `content/layout.yaml` — single document; controls tile display order.

Full schema (field names, types, valid values, conditional rules) is in `LLM.md`. Read it before making any content changes.

## Useful commands

| Command | What it does |
|---|---|
| `pnpm validate` | Runs Zod schemas against `content/` in ~700 ms — use this for a fast schema check after edits |
| `pnpm dev` | Starts the dev server with hot-reload on `content/` changes |
| `pnpm build` | Full production check: schema validation + OG image generation + static export to `out/` |

## WYSIWYG editor caveat

The dev server exposes a browser-based WYSIWYG editor (Dev Mode). When it writes back to a YAML file it calls `YAML.stringify`, which normalizes all comments and custom whitespace. Do not rely on in-file comments in `content/*.yaml` — they will be lost on the next visual edit. Keep persistent documentation in `LLM.md`.

## Dev-only API routes

`/api/content/[file]` and `/api/content/[file]/[id]` are used by the WYSIWYG editor to persist changes. They return `403` outside `NODE_ENV=development`. They are not included in the static export and do not exist in production.
