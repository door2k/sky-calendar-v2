# sky-calendar-v2 — visual redesign of Sky's calendar

## Purpose
v2 redesign of [sky-calendar](https://github.com/door2k/sky-calendar). Sticker-book aesthetic, 5 original kid-friendly themes (Pup Pals, Piggy Town, Web Hero, Big Adventure, Frost & Flame), bilingual EN/HE with full RTL.

**Stack:** Vite + React 18 + TypeScript. **Sample data only** (no Supabase wiring yet — that's phase 2).

## Live URLs
- https://sky.door2k.com (custom domain, Cloudflare CNAME → cname.vercel-dns.com, Let's Encrypt cert)
- https://sky-calendar-v2.vercel.app (Vercel default)

**v1 (still live, unchanged):** https://sky.door2k.dev / https://sky-calendar.vercel.app

## Current State
Phase-1 visual prototype shipped 2026-04-27. **Phase-2 data layer wired 2026-05-03**. **Phase-2 functional editing shipped 2026-05-04** — sky.door2k.com is now end-to-end functional:
- Supabase client + 5 hooks (`useSchedule`, `usePeople`, `useActivities`, `useRealtimeSchedule`, `usePushSubscription`) — ported verbatim from v1 in `src/hooks/`
- API routes (`/api/translate`, `/api/assistant`, `/api/push/subscribe`, `/api/push/send`) — edge runtime, custom Web Push impl in `api/push/_lib/web-push-edge.ts`
- PWA: `public/manifest.json` + `public/sw.js`, registered in `main.tsx`
- Adapter layer (`src/lib/adapters.ts`) maps v1 DB shape → v2 UI types. Combined "Gili & Yossi" → `gili+yossi` slug renders as overlapping dual-avatar via PersonAvatar. Unknown DB people register a synthetic procedural avatar (hue/skin/hair from slug hash).
- **LIVE is now the default**; `?demo=1` (or `?live=0`) opts into the sample fixture, persisted in `localStorage["sky:demo"]`. Dev controls (avatar size, halo, demo toggle) hidden behind a ⚙ button; "DEMO DATA" pill shows when sample is on.
- **EditDayModal** (sticker style): click any weekday card → modal with no-gan toggle/reason, gan text, after-gan activity+time, dropoff/pickup/bedtime person selects, Friday dinner host+time, notes. Saves via `useUpdateDaySchedule` (auto-translates EN→HE, pushes notification on success).
- **EditSaturdayModal**: click Saturday or last-Friday-of-month → activities list with add/remove rows, family/Friday dinner host+time, notes. Saves via `useUpdateSaturdaySchedule`.
- **PrintWeekLive** (`pages/PrintWeekLive.tsx`): Print · Week view uses real Supabase data + computes the date-range label from today.
- **AIStrip wired** to `/api/assistant`: typed input POSTs with people/activities/schedules/conversationHistory, response actions executed (`update_day`, `update_saturday`, `message`); other action types (create/assign/delete activity) are listed as "skipped unsupported". Errors render as a red bubble with the human-readable Anthropic message extracted from the body. **Anthropic credits are out as of 2026-05-04 → real replies will surface "credit balance too low"** until topped up.

Still tracked:
- **#155** — investigate "days not broken into components" rendering observation Tamir flagged
- AIStrip can't fully exercise the assistant: needs Anthropic credits (user-side billing).
- Push notifications: subscribe-flow exists but no UI surface to opt the user in.
- Print views default to live data via the `*Live` wrappers and (as of 2026-06-20) have screen-only ‹ Today › week/month navigation (`PrintNav`); only the `?demo=1` path still renders the sample fixture.
- Service worker caches aggressively — to test new builds in browser, manually `unregister()` SWs and clear caches. (After any deploy, tell Tamir to **hard-refresh** sky.door2k.com.)

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
- [x] Phase 2: LIVE-default + ?demo escape ✅ 2026-05-04
- [x] Phase 2: EditDayModal ✅ 2026-05-04
- [x] Phase 2: EditSaturdayModal ✅ 2026-05-04
- [x] Phase 2: AIStrip wired ✅ 2026-05-04 (limited by Anthropic credits)
- [x] Phase 2: PrintWeek live data ✅ 2026-05-04
- [x] Adapter person resolution: synthetic procedural avatars + dual-avatar combined entries ✅ 2026-05-04
- [ ] Phase 2: React Router (currently state-based view switcher; works fine, lower priority)
- [x] PrintMonth / PrintCombined — Live wrappers shipped (`PrintCombinedLive`, `PrintMonthLive`)
- [x] 2026-06-17: Show & Tell (free-text `gan_activity`) now renders across month/combined views — `PrintCombined` day card, `PrintMonth` cell events, and `WebMonthViewLive` cells. (Same gap was fixed in v1's `PrintCombined`/`PrintMonth`.)
- [x] 2026-06-20: Edit/print bug cluster (v2 only):
  - **After-gan activity people persist.** `EditDayModal` auto-save invalidated the queries → recomputed `baseline` → an effect reset the whole form, wiping the "Who's joining?" people picked after the activity auto-created. Now inits the form once per open (guarded `initializedRef`). Also render those people on `PrintWeek` (parity with screen + combined print).
  - **Last-Friday activities render.** Day card + all prints gated the activity list behind `isSat`, but a last Friday is `isFri`; its `saturday_schedules` activities (e.g. a custom "US Passport") vanished. The adapter only sets `day.activities` for Sat/last-Fri, so the gate was just dropped.
  - **Print navigation.** `PrintWeekLive`/`PrintCombinedLive`/`PrintMonthLive` each own an anchor + a screen-only `PrintNav` (‹ / Today / ›) — week step for week/combined, month step for month. Were locked to `new Date()`.
  - **Last-Friday gan-open override.** New column `day_schedules.last_friday_gan_open boolean default false`. A last Friday is no-gan/Saturday-style by default; set the flag (via the "Gan is open this Friday" toggle in either editor) to render & edit it as a regular gan day from `day_schedules`. Flipping in `EditSaturdayModal` carries the dinner host over; the Saturday-style activities stay dormant on `saturday_schedules` and return on flip-back. Routing in `WebWeekViewLive`, rendering in `adapters.adaptWeekToDays`, and both month views skip the dormant saturday row for a flipped day. **v1 ignores this column (unchanged).**
- [ ] AIStrip currently only handles `update_day`, `update_saturday`, `message` actions. `create_activity`, `assign_activity`, `delete_activity` from the assistant are surfaced as "skipped unsupported".
- [ ] Tamir flagged "days don't visually break into components" — investigate (kladban #155)

## Deploy
Vercel auto-deploys on push to `main`. Manual: `npx vercel --prod --token=$(cat ~/.vercel-token)` from this dir (vercel CLI auth lives at `~/Library/Application Support/com.vercel.cli/auth.json`).

## Cloudflare DNS
Token at `~/.cloudflare-token` (Edit zone DNS scoped to door2k.com). Zone ID `5afe4825e5767934250f244e48c9edfa`. CNAME `sky` → `cname.vercel-dns.com` (id `27bf9ebd94fdb98ef5f15d321d4b149d`, proxy off).

If sky.door2k.com cert breaks: `vercel domains rm sky.door2k.com` + re-add — that re-triggers Let's Encrypt provisioning.

**Env var gotcha:** `vercel env pull` writes long values with a literal `\n` suffix (escaped, inside the quoted string). When re-adding via `vercel env add ... --value="$value"` from a parsed dotenv line, strip with `sed 's/\\n$//'` first — otherwise the `\n` ends up in the env var and breaks `Authorization` headers (Anthropic returns "invalid x-api-key"). Sensitive vars (default for prod/preview) read back as `""` on `vercel env pull`; this is masking, not corruption — the real value is at runtime.

## Context for Claude
- **Maintain BOTH v1 and v2.** They share the Supabase DB (`thzesmfiecccpvuzuscd`), so a data/feature/display fix usually needs to land in both apps — re-implemented in each one's idiom (v1 = Tailwind + React Query, classic components; v2 = inline styles + `adapters.ts` + `*Live.tsx` wrappers). v1 repo `github.com/door2k/sky-calendar` at `~/projects/sky-calendar`; domains sky-calendar.vercel.app / sky.door2k.dev; Vercel project `prj_JnCwqhHgFqtZTt1VTAwe9rqZcc7X`.
- **Deploy:** `git push origin main` auto-deploys via GitHub→Vercel. `npx vercel --prod` fails (expired CLI token); confirm via Vercel MCP `list_deployments` (team `team_ZjB8fTO69klbnGqn0rMBy7ML`).
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
