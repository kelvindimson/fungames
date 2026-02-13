# LINGO — Execution Plan for Claude Code

## Context

We are converting a working React artifact (Claude.ai) into a self-hosted Next.js application.
The artifact uses `window.storage` (Claude's persistent storage API) for multiplayer state.
We need to replace this with PostgreSQL + Next.js API routes while keeping the exact same UX.

**Reference file:** `lingo-artifact.tsx` — the current working game UI (attached)
**PRD:** `LINGO-PRD.md` — full game specification (attached)

---

## Prerequisites (Manual Setup Before Starting)

1. **Coolify:** Spin up a PostgreSQL instance
2. **Note the connection string:** `postgresql://user:pass@host:port/lingo`
3. **Create a GitHub repo:** `lingo-game`
4. **Domain:** Point `game.[yourdomain].com` to your Coolify instance

---

## Phase 1: Project Scaffolding (~10 min)

### Step 1.1: Initialize Next.js project
```bash
npx create-next-app@latest lingo-game --typescript --tailwind --app --src-dir --no-eslint
cd lingo-game
```

### Step 1.2: Install dependencies
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit @types/node
```

### Step 1.3: Set up environment
Create `.env.local`:
```
DATABASE_URL=postgresql://user:pass@host:port/lingo
```

### Step 1.4: Project structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Home screen (create/join game)
│   ├── game/
│   │   └── [code]/
│   │       └── page.tsx        # Main game page (lobby/play/results)
│   └── api/
│       └── game/
│           ├── route.ts        # POST: create game
│           └── [code]/
│               ├── route.ts    # GET: poll state
│               ├── join/
│               │   └── route.ts # POST: join game
│               └── action/
│                   └── route.ts # POST: game actions
├── db/
│   ├── index.ts                # Drizzle client
│   └── schema.ts               # Table definitions
├── lib/
│   ├── words.ts                # Word lists (ANSWER_WORDS, VALID_WORDS)
│   ├── game-logic.ts           # Feedback algorithm, scoring, obfuscation
│   └── types.ts                # TypeScript types/interfaces
└── components/
    ├── Tile.tsx                 # Single letter tile
    ├── GuessRow.tsx             # Row of 4 tiles
    ├── GuessGrid.tsx            # 6 rows grid
    ├── Leaderboard.tsx          # Score board
    ├── TimerBar.tsx             # Countdown progress bar
    ├── CountdownOverlay.tsx     # 3, 2, 1, GO! overlay
    └── GameInput.tsx            # Static first letter + 3-char input
```

---

## Phase 2: Database Layer (~10 min)

### Step 2.1: Define schema (`src/db/schema.ts`)
Three tables as defined in the PRD:
- `games` — code (PK), gm_id, status, current_round, words (JSONB), round_start_time, created_at, updated_at
- `players` — id (PK), game_code (FK), name, total_score, joined_at
- `rounds` — composite PK (game_code, round_num), results (JSONB)

### Step 2.2: Drizzle client (`src/db/index.ts`)
- Use `postgres` driver with `DATABASE_URL`
- Export `db` instance

### Step 2.3: Push schema
```bash
npx drizzle-kit push
```

---

## Phase 3: Shared Logic (~5 min)

### Step 3.1: Word lists (`src/lib/words.ts`)
- Copy `ANSWER_WORDS` array (~700 words) from artifact
- Copy `VALID_WORDS` Set (~1500 words) from artifact
- Export both

### Step 3.2: Game logic (`src/lib/game-logic.ts`)
- `getFeedback(guess: string, answer: string): number[]` — Wordle algorithm (0=absent, 1=present, 2=correct)
- `obfuscate(word: string): string` — base64 reverse encoding
- `deobfuscate(encoded: string): string` — decode
- `pickWords(n: number): string[]` — random word selection
- `generateCode(): string` — 4-char alphanumeric code
- `generatePlayerId(): string` — 8-char random ID
- `SCORE_MAP` — { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 10 }
- `TOTAL_ROUNDS = 8`, `MAX_GUESSES = 6`, `ROUND_TIME = 30`

### Step 3.3: Types (`src/lib/types.ts`)
```typescript
type GameStatus = "lobby" | "countdown" | "playing" | "roundEnd" | "gameOver"

interface GameState {
  code: string
  gmId: string
  status: GameStatus
  currentRound: number
  words: string[] // obfuscated
  roundStartTime: number | null
}

interface Player {
  id: string
  gameCode: string
  name: string
  totalScore: number
}

interface RoundResult {
  results: Record<string, { score: number; guesses: number }>
}
```

---

## Phase 4: API Routes (~15 min)

### Step 4.1: `POST /api/game` — Create game
- Validate: playerName required
- Generate code, pick 8 words, create game record
- Create first player record (the GM)
- Return: { code, gameState, players }

### Step 4.2: `POST /api/game/[code]/join` — Join game
- Validate: playerName required, game exists
- Add player if not already in game (check by playerId)
- Return: { gameState, players }

### Step 4.3: `GET /api/game/[code]` — Poll state
- Fetch game state + all players + current round results
- Return: { gameState, players, roundData }
- This is called every 1.5s by every client

### Step 4.4: `POST /api/game/[code]/action` — Game actions
Handle three action types:

**`startRound`** (GM only):
- Verify playerId === gmId
- Increment currentRound
- Set status = "countdown"
- Set roundStartTime = Date.now() + 4000 (4s for countdown)
- Initialize round record with empty results
- Update game

**`endRound`** (GM only):
- Verify playerId === gmId
- Set status = "roundEnd" (or "gameOver" if currentRound >= 8)
- Update game

**`submitScore`** (any player):
- Write player's score for current round to rounds table
- Update player's totalScore in players table
- Return updated state

---

## Phase 5: Frontend Components (~15 min)

### Step 5.1: Extract components from artifact
The artifact has all the UI logic inline. Extract into separate TSX components:

- **`Tile.tsx`** — Single letter tile with status-based coloring and animations
- **`GuessRow.tsx`** — Row of 4 Tiles (handles: guessed row, active row with input, empty row with hint)
- **`GuessGrid.tsx`** — 6 GuessRows stacked
- **`GameInput.tsx`** — Static gold first-letter tile + 3-char input field + submit button. Handles: invalid word shake, error message, remaining guesses display
- **`Leaderboard.tsx`** — Sorted player list with medals, round scores, total scores, "you" highlight
- **`TimerBar.tsx`** — Colored progress bar (green → yellow → red)
- **`CountdownOverlay.tsx`** — Full-screen 3, 2, 1, GO! with animations

### Step 5.2: Styling approach
- Use Tailwind CSS for all styling
- Replicate the dark theme from artifact:
  - bg: `#0b0e1a`, cards: `#141829`, gold: `#f5a623`
  - Fonts: "Russo One" (headings), "Nunito" (body) — import via `next/font/google` or `@import`
- Add CSS keyframes in `globals.css`: popIn, flipIn, shake, glow, pulse

---

## Phase 6: Game Pages (~15 min)

### Step 6.1: Home page (`src/app/page.tsx`)
- Name input + Create Game button → `POST /api/game` → redirect to `/game/[code]`
- Code input + Join button → `POST /api/game/[code]/join` → redirect to `/game/[code]`
- Store playerId in sessionStorage

### Step 6.2: Game page (`src/app/game/[code]/page.tsx`)
This is the main game page. It manages all game screens via local state:

**State management:**
- `screen`: "lobby" | "countdown" | "playing" | "roundResult" | "gameOver"
- `gameState`, `players`, `roundData`: from polling
- `guesses`, `feedbacks`, `input`, `solved`, `timeLeft`: local playing state

**Polling hook:**
- `useEffect` with `setInterval(1500ms)` calling `GET /api/game/[code]`
- Detect state transitions (status changes) to trigger screen changes
- When status changes to "countdown" → trigger local countdown
- When status changes to "roundEnd" → show results
- When status changes to "gameOver" → show final screen

**Playing logic (all client-side):**
- Timer: uses `roundStartTime` from game state, calculates remaining time locally
- Guess submission: validate word locally → calculate feedback locally → display locally → then `POST /api/game/[code]/action` with submitScore
- Word validation: check against VALID_WORDS set client-side
- The answer word: deobfuscated client-side from the words array in game state

**Screen rendering:**
- Conditionally render Lobby / Countdown / Playing / RoundResult / GameOver based on `screen` state
- Each screen follows the layout described in the PRD

---

## Phase 7: Polish & Deploy (~10 min)

### Step 7.1: Error handling
- API error responses with proper status codes
- Client-side error display (toast or inline)
- Handle stale game states gracefully

### Step 7.2: Mobile responsiveness
- Ensure input works on mobile (autoFocus, proper keyboard type)
- Touch-friendly button sizes
- Max-width containers with proper padding

### Step 7.3: Deploy to Coolify
```bash
git init && git add . && git commit -m "Initial lingo game"
git remote add origin [your-repo-url]
git push -u origin main
```

In Coolify:
1. Add new service → Git-based → Point to your repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variable: `DATABASE_URL=postgresql://...`
5. Set domain: `game.[yourdomain].com`
6. Deploy

### Step 7.4: Verify
- Open in two browsers, create a game, join, play through 2-3 rounds
- Check leaderboard syncs, timer works, round transitions are smooth

---

## Estimated Total Time: ~60–80 minutes

| Phase | Task | Time |
|---|---|---|
| 1 | Project scaffolding | 10 min |
| 2 | Database layer | 10 min |
| 3 | Shared logic | 5 min |
| 4 | API routes | 15 min |
| 5 | Frontend components | 15 min |
| 6 | Game pages | 15 min |
| 7 | Polish & deploy | 10 min |

---

## Claude Code Tips

When using Claude Code to build this, provide these files as context:
1. This execution plan (`EXECUTION-PLAN.md`)
2. The PRD (`LINGO-PRD.md`)
3. The working artifact (`lingo-artifact.tsx`)

Suggested Claude Code prompts to follow the plan:
1. "Read all 3 reference files. Set up the Next.js project with Drizzle and the database schema per the execution plan Phase 1 and 2."
2. "Implement the shared logic (words, game-logic, types) per Phase 3."
3. "Build all 4 API routes per Phase 4. Reference the PRD for exact behavior."
4. "Extract the UI components from lingo-artifact.tsx into separate TSX components per Phase 5. Use Tailwind CSS, keep the same dark theme and animations."
5. "Build the home page and game page per Phase 6. Wire up polling, state management, and all game screens."
6. "Test the full flow, fix any TypeScript errors, and prepare for deployment."
