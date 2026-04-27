# Sky Calendar v2

New visual design for Sky's Calendar — sticker-book aesthetic, 5 original kid-friendly themes (Pup Pals, Piggy Town, Web Hero, Big Adventure, Frost & Flame), bilingual EN/HE with full RTL.

**Stack:** Vite + React + TypeScript.

**Status:** Visual prototype with sample data. Real Supabase data integration is the next phase — see the original sky-calendar for the data layer to port (`useSchedule`, `usePeople`, `useActivities`, `useTheme`, `useRealtimeSchedule`, `usePushSubscription`, AI assistant edge function).

**Lives at:** https://sky.door2k.com (the original is still at https://sky.door2k.dev / https://sky-calendar.vercel.app).

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
```

The toolbar at the top has theme / language / view / avatar controls.

## Source

Designs ported 1:1 from the Claude Design bundle at `/tmp/sky-design/sky-calendar/project/` — see `chats/chat1.md` in that bundle for the iteration history.
