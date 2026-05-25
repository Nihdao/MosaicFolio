@AGENTS.md

# Project Context

This is a personal portfolio template. All content lives in `content/*.yaml`. The WYSIWYG Dev Mode (floating ⚙ button in the browser) is the primary editing path in local dev. AI agents should prefer direct YAML edits via Workflow B documented in `LLM.md`.

Do not edit anything in `src/` when the user only wants to update content — stick to `content/` and `public/` for those tasks. Editing `src/` is allowed only when the user explicitly requests a change to the project structure itself (template engine, components, build setup). Run `pnpm validate` after any `content/` change to catch schema errors without a full build.
