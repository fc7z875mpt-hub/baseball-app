# Baseball Statistiky

Aplikace pro spravu statistik mladeznickeho baseballoveho tymu.

## Faze 1 - Zaklad (hotovo)

- Next.js 15 + TypeScript + Tailwind CSS
- Prisma schema (kompletni datovy model)
- Autentizace (NextAuth credentials)
- Role: PARENT / ORGANIZER / ADMIN
- Prihlaseni, registrace, zapomenute heslo
- Zakladni dashboard
- Docker Compose pro NAS

## Spusteni

1. Zkopiruj `.env.example` na `.env`
2. `docker compose up -d db`
3. `npm install`
4. `npx prisma db push`
5. `npm run dev`
