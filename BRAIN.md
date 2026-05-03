# sky-calendar-v2 — visual redesign of Sky's calendar

## Purpose
v2 redesign of [sky-calendar](https://github.com/door2k/sky-calendar). Sticker-book aesthetic, 5 original kid-friendly themes (Pup Pals, Piggy Town, Web Hero, Big Adventure, Frost & Flame), bilingual EN/HE with full RTL.

**Stack:** Vite + React 18 + TypeScript. **Sample data only** (no Supabase wiring yet — that's phase 2).

## Live URLs
- https://sky.door2k.com (custom domain, Cloudflare CNAME → cname.vercel-dns.com, Let's Encrypt cert)
- https://sky-calendar-v2.vercel.app (Vercel default)

**v1 (still live, unchanged):** https://sky.door2k.dev / https://sky-calendar.vercel.app

## Current State
Phase-1 visual prototype shipped 2026-04-27. **Phase-2 data layer wired 2026-05-03** (kladban #154 progress):
- Supabase client + 5 hooks (`useSchedule`, `usePeople`, `useActivities`, `useRealtimeSchedule`, `usePushSubscription`) — ported verbatim from v1 in `src/hooks/`
- API routes (`/api/translate`, `/api/assistant`, `/api/push/subscribe`, `/api/push/send`) — ported verbatim from v1, edge runtime, custom Web Push impl in `api/push/_lib/web-push-edge.ts`
- PWA: `public/manifest.json` + `public/sw.js`, registered in `main.tsx`
- React Query provider in `main.tsx`
- Adapter layer (`src/lib/adapters.ts`) maps v1 DB shape → v2 UI types; person UUIDs slug-mapped to v2 procedural avatars by name (lowercase contains)
- **LIVE toggle** in toolbar (`?live=1` URL param or localStorage `sky:live`) — defaults to OFF (sample data); ON renders `WebWeekViewLive`/`WebMonthViewLive`

Still tracked:
- **#155** — investigate "days not broken into components" rendering observation Tamir flagged

## Key Decisions
| Decision | Reasoning | Date |
|---|---|---|
| Vite + TS, no monorepo | Match v1 stack, lowest friction | 2026-04-27 |
| Sample data first, real data later | Visual review before phase-2 plumbing | 2026-04-27 |
| Themes are original (Pup Pals, etc.), not Bluey/Peppa | Avoid copyright; design bundle from claude.ai/design | 2026-04-27 |
| Vercel project `door2ks-projects/sky-calendar-v2` | Separate from v1 project so domains don't collide | 2026-04-27 |
| Custom domain via Cloudflare CNAME (not NS delegation) | door2k.com DNS stays at Cloudflare | 2026-04-29 |

## Known Issues / TODOs
- [x] Phase 2: Supabase hooks ✅ 2026-05-03
- [x] Phase 2: API routes ✅ 2026-05-03 (edge runtime; web-push-edge.ts widened to `ArrayBufferLike` for TS 5.9 compat)
- [x] Phase 2: real date logic ✅ 2026-05-03 (live mode only; sample views still hardcoded)
- [x] Phase 2: PWA manifest + service worker ✅ 2026-05-03
- [ ] Phase 2: React Router (currently state-based view switcher; works fine, lower priority)
- [ ] Phase 2: Edit Day / People / Add Person modals — port from `/tmp/sky-design/sky-calendar/project/screens-web.jsx`
- [ ] Phase 2: Wire AIStrip → `/api/assistant` (currently UI-only placeholder)
- [ ] Adapter falls back to first PEOPLE entry when DB person name doesn't match v2's static slug list (e.g. "Ben" → tamir). Either add procedural-avatar generation from name hash, or extend `data/people.ts` registry.
- [ ] "Gili & Yossi" combined DB person renders single avatar (gili) — extend PersonAvatar to render dual avatars when person has `& other` in name.
- [ ] Tamir flagged "days don't visually break into components" — investigate (kladban #155)

## Deploy
Vercel auto-deploys on push to `main`. Manual: `npx vercel --prod --token=$(cat ~/.vercel-token)` from this dir (vercel CLI auth lives at `~/Library/Application Support/com.vercel.cli/auth.json`).

## Cloudflare DNS
Token at `~/.cloudflare-token` (Edit zone DNS scoped to door2k.com). Zone ID `5afe4825e5767934250f244e48c9edfa`. CNAME `sky` → `cname.vercel-dns.com` (id `27bf9ebd94fdb98ef5f15d321d4b149d`, proxy off).

If sky.door2k.com cert breaks: `vercel domains rm sky.door2k.com` + re-add — that re-triggers Let's Encrypt provisioning.

**Env var gotcha:** `vercel env pull` writes long values with a literal `\n` suffix (escaped, inside the quoted string). When re-adding via `vercel env add ... --value="$value"` from a parsed dotenv line, strip with `sed 's/\\n$//'` first — otherwise the `\n` ends up in the env var and breaks `Authorization` headers (Anthropic returns "invalid x-api-key"). Sensitive vars (default for prod/preview) read back as `""` on `vercel env pull`; this is masking, not corruption — the real value is at runtime.

## Context for Claude
- v1 lives on cloud at `~/projects/sky-calendar` (different project, both share Supabase ref `thzesmfiecccpvuzuscd`).
- Design source: `/tmp/sky-design/sky-calendar/project/` (gzip from claude.ai/design, decompressed).
- Don't mix this project with v1 — separate Vercel project, separate repo.

## Notion hub

Tamir shares a Notion workspace with all his Claude instances:
https://www.notion.so/34837f0083cb81ffa9d4f41dc700950b

Relevant for this project:
- **Projects DB** (`collection://837f8915-0724-46dc-b24b-166097e2e778`) — find this project's row, update Status / Current Focus / Blockers as they change, and append substantive progress to the page body.
- **Research & Sourcing** (`collection://dccd3610-587e-4bc6-a324-a235c6085aa4`) — open a row when Tamir asks you to find or compare options.
- **Appointments** (`collection://207abc29-64ab-40bd-8911-ed3870101707`), **Contacts** (`collection://53adee4e-6642-4da5-83d0-1c3695eb548c`), **Follow-ups** (`collection://e5e59629-8ba0-4443-ba8e-65ae00f50290`) — see hub page for schemas.

Notion MCP tools: `notion-fetch`, `notion-search`, `notion-create-pages`, `notion-update-page`.

API quirks: checkbox values = `"__YES__"` / `"__NO__"`; multi-select = JSON-string array like `"[\"work\",\"friend\"]"`; date fields expand into `date:<Name>:start`, `date:<Name>:end`, `date:<Name>:is_datetime` (1 = datetime, 0 = date-only).
