# Our Little Garden 🌸

## Overview

"Our Little Garden" is a cozy, cottagecore-themed multiplayer web app where two or more users can share a virtual garden space. Users can:
- Create or join a shared garden using a 6-character code
- Draw their own pixel flowers using an HTML5 canvas drawing tool
- Drag and drop their flowers into a shared garden scene
- Send sweet letters (in-garden mailbox) to each other
- Watch the garden's "health score" reflect shared activity

The aesthetic is pixel cottagecore — soft colors, bouncy animations, and cute animal avatars (bunny, fox, cat, bear).

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (React + Vite)

- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: `wouter` — lightweight client-side routing with three main routes:
  - `/` — Landing page (create a garden)
  - `/join/:code` — Join an existing garden (pick name + avatar)
  - `/garden/:code` — Main garden view
- **State & Data Fetching**: TanStack React Query with a 3-second polling interval for real-time-ish garden state updates (no WebSockets)
- **Animations**: Framer Motion for soft bounces, draggable flowers, and page transitions
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives + Tailwind CSS
- **Theme**: Custom pixel cottagecore palette defined with CSS variables in `index.css`; fonts are Pixelify Sans, Nunito, and VT323 (Google Fonts)
- **Session Storage**: `localStorage` stores the current user's session (`garden_session`: `{ gardenCode, userId, role }`) — no server-side auth

### Key Frontend Components

| Component | Purpose |
|---|---|
| `DrawingStudio` | HTML5 Canvas drawing tool; exports drawings as base64 strings |
| `DraggableFlower` | Framer Motion draggable element; calculates drop position as % of garden container |
| `Mailbox` | In-garden letter system; shows unread badge, write/send UI |
| `Avatar` | SVG pixel art animal faces (bunny, fox, cat, bear) with color palette variants |
| `Garden.tsx` | Main garden view; pixel art background SVG, places flowers, shows members |

### Backend (Express + Node)

- **Framework**: Express 5 (with TypeScript via `tsx` for dev)
- **Architecture**: Single `server/index.ts` entry point; routes registered in `server/routes.ts`; data access via `server/storage.ts`
- **API Pattern**: RESTful JSON API; route definitions and Zod schemas are shared between client and server via `shared/routes.ts`
- **Build**: `esbuild` bundles the server to `dist/index.cjs`; Vite builds the client to `dist/public`

### Shared Layer (`shared/`)

- `shared/schema.ts` — Drizzle ORM table definitions + Zod validation schemas (single source of truth for DB shape and API types)
- `shared/routes.ts` — API route definitions with input/output Zod schemas; both client hooks and server handlers import from here, keeping them in sync

### Database

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (requires `DATABASE_URL` env var)
- **Tables**:
  - `gardens` — keyed by a 6-char code; tracks name, health score, last activity
  - `users` — belongs to a garden; stores name, avatar type, color, role (`owner`/`friend`)
  - `flowers` — drawn images stored as base64 `text`; position stored as x/y percentages; `inGarden` boolean for placement state
  - `letters` — messages between users; supports broadcast (null `toUserId`) or direct; tracks `readAt`
- **Migrations**: Drizzle Kit, output to `./migrations`, push via `npm run db:push`

### No Authentication

There is no login system. Identity is purely based on localStorage session (`garden_session`). Anyone with the 6-char garden code can join.

---

## External Dependencies

### NPM / Runtime

| Dependency | Purpose |
|---|---|
| `framer-motion` | Animations and drag-and-drop for flowers |
| `@tanstack/react-query` | Server state management and polling |
| `wouter` | Lightweight client-side router |
| `drizzle-orm` + `drizzle-zod` | ORM + schema-to-Zod type generation |
| `pg` + `connect-pg-simple` | PostgreSQL driver and session store |
| `zod` | Runtime validation for API inputs/outputs |
| `date-fns` | Date formatting in mailbox letters |
| `nanoid` | Generating short garden codes |
| `lucide-react` | Icon set |
| `tailwind-merge` + `clsx` | Class name utilities |
| `shadcn/ui` (Radix UI) | Accessible, headless UI primitives |
| `embla-carousel-react` | Carousel component (available but may not be used yet) |

### External Services

| Service | Purpose |
|---|---|
| Google Fonts | Pixelify Sans, Nunito, VT323 fonts loaded in `index.html` |
| PostgreSQL (via `DATABASE_URL`) | Primary persistent data store |

### Replit-Specific Plugins (dev only)

- `@replit/vite-plugin-runtime-error-modal` — Shows runtime errors as overlay
- `@replit/vite-plugin-cartographer` — Replit code mapping
- `@replit/vite-plugin-dev-banner` — Dev environment banner

These are only loaded when `REPL_ID` is set and `NODE_ENV !== 'production'`.