---
type: project
title: Adam Portfolio (live bento)
status: building
slot: mai-juin 2026
captured: 2026-05-09
ship_target: 2026-06-08
theme_fit: 5
feasibility: 4
score: infra (no slot consumption alternative)
monetization: none (open-source, audience play)
distribution: Show HN, X thread, r/SideProject, r/webdev, Indie Hackers
---

# Adam Portfolio — Live Bento

## One-line pitch

A live bento dashboard portfolio that pulls real data from my actual maker life — MRR, running streaks, project status — open-sourced as a forkable template.

## Why this project

- Personal brand foundation for the next 6 projects of 2026
- Open-source repo = passive distribution to other makers
- Showcase of the claim "Tools that feel like games. Games that feel useful." in _experience_, not words
- Live data = differentiation vs the 1000 static bento clones
- Counts as **infra**, but takes the mai-juin slot to do it right

## Scope V1

### Sections (bento tiles)

1. **Hero** — claim + small 3D animation or stylized avatar
2. **Now** — auto-parsed from `now.md` in the repo (current focus)
3. **HabitGrove** — live MRR via RevenueCat, downloads count
4. **Maker Stats** — projects shipped count, days since last ship, build streak
5. **Running** — current streak, total km YTD, latest run pace (Strava or Polar)
6. **JRPG sneak peek** — manual status, %completion, optional rendered scene
7. **Manifesto** — claim in big + 1 paragraph "how I work"
8. **Links** — X, GitHub, email, RSS

### Live data flow architecture

```
GitHub Action (daily cron 6am)
  → pull RevenueCat, Strava, GitHub API
  → write to Supabase table `stats`
  ↓
/api/stats (Vercel Edge function)
  → reads Supabase
  → returns JSON
  ↓
Frontend bento tiles
  → fetch /api/stats
  → animate onChange (number tickers)
```

**Key principle :** abstract sources behind one endpoint. Add sources progressively. If a source breaks, others keep running.

## Tech stack (frozen)

- Next.js 15 App Router
- Tailwind + shadcn/ui
- Framer Motion (animations)
- React Three Fiber (optional 3D in tiles)
- Supabase (stats table)
- Vercel (deploy)
- GitHub Actions (data pulls)

## Day-by-day plan

### Week 1 (12-18 May) — Foundation

- D1-2 : repo setup, Next.js, Tailwind, shadcn, Vercel deploy, domain pointed
- D3-4 : bento layout, all tiles with hardcoded data, responsive mobile
- D5-7 : Framer Motion animations, micro-interactions, hero polish (TIME-BOX 1 day max for hero)

**End-of-week milestone : site live in prod with hardcoded data.**

### Week 2 (19-25 May) — Backend

- D8-9 : Supabase table `stats`, schema design, first GitHub Action
- D10-11 : First connector — GitHub API for repo count (easiest)
- D12-14 : `/api/stats` Vercel Edge function, first live tile working end-to-end

### Week 3 (26 May - 1 Jun) — Multi-source

- D15-16 : RevenueCat integration (HabitGrove MRR + downloads)
- D17-18 : Strava or Polar integration (running stats)
- D19-21 : Now tile from `now.md` parser, JRPG status manual, animation polish

### Week 4 (2-8 Jun) — Cleanup + Launch

- D22-24 : README "Fork this template in 5 steps", license MIT, `.env.example`, all keys externalized
- D25 : Tweet thread draft (5-7 tweets) + Show HN title + Reddit posts drafted
- D26-27 : Soft launch to existing followers, gather feedback, fix bugs
- **D28 (8 Jun) — LAUNCH DAY** : Show HN + r/SideProject + r/webdev + Indie Hackers + X thread

## Distribution plan

### Launch day channels

- **Show HN** : "Show HN: My portfolio is a live bento pulling real data from my life"
- **X thread** (5-7 tweets) : hook = "I open-sourced my portfolio. It's a live bento dashboard pulling real MRR, running streaks, and project status from my actual life. Fork it, make it yours. Here's how I built it →"
- **r/SideProject** : focus on the live data twist
- **r/webdev** : focus on the architecture (Supabase + GitHub Actions cron + Edge functions)
- **Indie Hackers** : story angle ("why I open-sourced my portfolio instead of hoarding it")
- **DM to 20 makers in network** : asking for honest feedback before public launch

### Post-launch maintenance

- Add forks to a "Made with this template" section (acts as social proof)
- Tweet quarterly updates as the live stats evolve

## Risks & guardrails

| Risk                     | Mitigation                                                       |
| ------------------------ | ---------------------------------------------------------------- |
| API blocking (1 day max) | Fallback on JSON manuel, ship without that source, iterate later |
| Sur-design hero (>1 day) | Time-box hero to D5-D7, no more                                  |
| 0 revenue on this slot   | Accept it — infra investment, amplifies next 6 projects          |
| Repo with no forks       | Polish README seriously (2-3 full days in W4)                    |
| Domain not chosen        | Decide D1, no later                                              |

## Decisions to make before D1

- [ ] Domain (existing? new? `.tools` / `.dev` / `.fr`?)
- [ ] Avatar : 3D model, photo, illustrated, or pure typo logo
- [ ] First connector to integrate W2 (GitHub recommended for ease)
- [ ] Polar or Strava for running data (Polar = HRM-native, Strava = better API/community)

## Success metrics

- **Hard** : repo live + open-sourced + ≥50 GitHub stars in 30 days post-launch
- **Soft** : 5+ forks visible in "Made with this template", measurable bump in X followers (target +200), 1-2 inbound DMs from interesting makers
- **Personal** : the site replaces my LinkedIn/CV in pro conversations within 6 weeks

## Notes

- Don't add features mid-build. Capture them in `ideas.md` for V2 (next year).
- Iteration on this site IS allowed (1.0.X) — it's _your_ perso site, not a productized product.
- The repo is the actual product, not the site. Treat README as marketing copy.
