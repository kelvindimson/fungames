# LINGO — Multiplayer Word Game: Product Requirements Document

## Overview

Lingo is a real-time multiplayer word-guessing game inspired by the popular TV game show "Lingo." A Game Master creates a game session, players join via a shared code, and compete across multiple rounds to guess hidden 4-letter words. The game features Wordle-style colored feedback, time pressure, and a cumulative leaderboard.

**Target Platform:** Self-hosted web application on `game.[yourdomain].com`
**Tech Stack:** Next.js (App Router), TypeScript (TSX), Drizzle ORM, PostgreSQL, Tailwind CSS
**Deployment:** Coolify on Contabo VPS
**Players:** 2–20 players per game session

---

## Game Rules

### Word Format
- All words are **4 letters** long
- Words are common English words (no obscure/technical terms)
- The game maintains two word lists:
  - **Answer words** (~700 words): Words that can be selected as the hidden answer
  - **Valid guess words** (~1,500 words): All words accepted as valid guesses (superset of answer words)

### Round Structure
- Each game consists of **8 rounds**
- Each round has a **30-second timer**
- Each round, players get **6 guesses** maximum
- The **first letter** of the hidden word is always revealed at the start of each round
- Players only type the remaining **3 letters** — the first letter is locked/static

### Feedback System (Wordle-Style)
After each guess, every letter receives colored feedback:
- 🟩 **Green (Correct):** Letter is in the word AND in the correct position
- 🟨 **Yellow (Present):** Letter is in the word BUT in the wrong position
- ⬛ **Gray (Absent):** Letter is NOT in the word at all

**Feedback algorithm:**
1. First pass: Mark all exact position matches as "correct" (green)
2. Second pass: For remaining letters, check if they exist elsewhere in the answer (mark as "present"/yellow), consuming each answer letter only once
3. All remaining unmatched letters are "absent" (gray)

### Scoring (Guess-Based)
Points are awarded based on which guess number was correct:

| Guess Number | Points |
|---|---|
| 1st guess | 100 |
| 2nd guess | 80 |
| 3rd guess | 60 |
| 4th guess | 40 |
| 5th guess | 20 |
| 6th guess | 10 |
| Not solved / Time up | 0 |

- Scores are cumulative across all 8 rounds
- The player with the highest total score at the end wins

### Word Validation
- Only valid English words are accepted as guesses
- If a player enters an invalid word:
  - The input area **shakes** (animation)
  - An error message **"Not a valid word!"** appears briefly
  - The input is **cleared** automatically
  - The guess does **NOT** count toward the 6-guess limit

---

## User Roles

### Game Master (GM)
- Creates the game session
- Receives a unique 4-character game code
- Controls the flow of the game:
  - Starts each round manually (clicks "Start Round X")
  - Ends each round manually (clicks "End Round")
  - Advances to next round
- Can also play/guess like any other player
- Identified by 👑 icon in the player list

### Player
- Joins an existing game using the 4-character code
- Enters a display name upon joining
- Guesses words during active rounds
- Sees the leaderboard between rounds
- Waits for GM to advance rounds (sees "Waiting for Game Master..." message)

---

## Game Flow (Screen by Screen)

### Screen 1: Home
- Input field: **"YOUR NAME"** (max 20 characters)
- Button: **"🎮 CREATE NEW GAME"** → Creates game, transitions to Lobby as GM
- Divider: "— or join —"
- Input field: **4-character code** (uppercase, monospace, centered)
- Button: **"JOIN"** → Joins existing game, transitions to Lobby as Player
- Validation: Name is required for both actions

### Screen 2: Lobby
- Displays the **game code** prominently (large, gold, glowing animation) with text "SHARE THIS CODE"
- Player list showing all connected players with:
  - 👑 icon for GM (first player)
  - 🎮 icon for other players
  - "YOU" label next to the current user
- **GM sees:** Button "🚀 START ROUND 1"
- **Players see:** "Waiting for Game Master..." (pulsing animation)
- Player list updates via polling every 1.5 seconds

### Screen 3: Countdown
- Full-screen overlay with dark background
- Large animated numbers: **3** → **2** → **1** → **GO!**
- Each number appears with a pop-in animation
- 1 second between each number
- "GO!" displays for 0.5 seconds before transitioning to playing screen

### Screen 4: Playing (Active Round)
**Header area:**
- Round indicator: "ROUND X/8" (gold text)
- Timer: countdown from 30s (changes color: green → yellow at 10s → red at 5s, pulses at ≤5s)
- Timer progress bar below (shrinking, color-matched)

**Guess grid:**
- 6 rows of 4 tiles each
- Unused rows show the first letter in position 0 (gold border = hint)
- Active row shows the locked first letter + player's current typed input
- Completed rows show the guessed letters with colored feedback (green/yellow/gray)
- Tiles animate: pop-in when typing, flip when revealing feedback

**Input area (below grid):**
- Static first letter tile (gold border, non-editable)
- Text input field (3 characters max, uppercase, monospace, large font)
- Submit button "↵" (enabled only when 3 letters entered)
- Error message area (for invalid word feedback)
- Remaining guesses counter: "X guesses left · First letter is locked"

**Solved state:**
- 🎉 emoji
- "+XX POINTS" in green
- "Solved in X guess(es)!"
- GM sees: "END ROUND →" button
- Players see: "Waiting for GM to end round..."

**Failed state (time up or out of guesses):**
- 😅 emoji
- "TIME'S UP!" or "OUT OF GUESSES!" in red
- The correct answer revealed in yellow
- GM sees: "END ROUND →" button
- Players see: "Waiting for GM to end round..."

### Screen 5: Round Result
- Card showing "ROUND X COMPLETE" with the correct word displayed
- Full leaderboard showing:
  - Player ranking (🥇🥈🥉 for top 3, then 4., 5., etc.)
  - Player names
  - Points earned THIS round (green "+XX" badge)
  - Total cumulative score (gold)
  - Current user highlighted with gold background
- **GM sees:** "🚀 START ROUND X+1" button (or "🏆 SHOW FINAL RESULTS" if round 8)
- **Players see:** "Waiting for Game Master..."

### Screen 6: Game Over
- 🏆 trophy emoji (large)
- "GAME OVER" header (gold)
- Winner's name and total points prominently displayed
- Full final leaderboard (same format as round results, without round scores)
- **GM sees:** "🎮 NEW GAME" button (returns to home screen)

---

## Multiplayer Architecture

### Production Architecture (Self-Hosted)

**Approach: Polling via Next.js API Routes + PostgreSQL**

```
Browser (React/TSX)  →  Next.js API Routes  →  PostgreSQL (Coolify)
       ↑                                              |
       └──────────── polls every 1.5s ────────────────┘
```

**Why polling (not WebSockets):**
- Simpler to implement and deploy
- No WebSocket server management needed
- For a word game, 1.5s latency is acceptable
- Guessing and feedback are calculated client-side (instant for the player)
- Only leaderboard/state updates have the polling delay

### Database Schema

**Table: `games`**
| Column | Type | Description |
|---|---|---|
| `code` | VARCHAR(4), PK | 4-character unique game code |
| `gm_id` | VARCHAR(12) | Game master's player ID |
| `status` | VARCHAR(20) | `lobby`, `countdown`, `playing`, `roundEnd`, `gameOver` |
| `current_round` | INTEGER | Current round number (0 = not started) |
| `words` | JSONB | Array of 8 obfuscated answer words |
| `round_start_time` | BIGINT | Unix timestamp (ms) when current round started |
| `created_at` | TIMESTAMP | Game creation time |
| `updated_at` | TIMESTAMP | Last state change |

**Table: `players`**
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(12), PK | Unique player identifier |
| `game_code` | VARCHAR(4), FK | References games.code |
| `name` | VARCHAR(20) | Display name |
| `total_score` | INTEGER | Cumulative score across all rounds |
| `joined_at` | TIMESTAMP | When the player joined |

**Table: `rounds`**
| Column | Type | Description |
|---|---|---|
| `game_code` | VARCHAR(4) | References games.code |
| `round_num` | INTEGER | Round number (1-8) |
| `results` | JSONB | Map of player_id → { score, guesses } |
| PK | | Composite: (game_code, round_num) |

### API Routes

**`POST /api/game`** — Create a new game
- Body: `{ playerName, playerId }`
- Returns: `{ code, gameState, players }`
- Creates game record + first player record

**`POST /api/game/[code]/join`** — Join a game
- Body: `{ playerName, playerId }`
- Returns: `{ gameState, players }`
- Adds player to players table (or returns existing if rejoining)

**`GET /api/game/[code]`** — Poll game state
- Returns: `{ gameState, players, currentRound }`
- Called every 1.5s by all clients

**`POST /api/game/[code]/action`** — Perform a game action
- Body: `{ playerId, action, payload }`
- Actions:
  - `startRound` — GM only. Sets status to countdown, increments round, sets roundStartTime
  - `endRound` — GM only. Sets status to roundEnd (or gameOver if round 8)
  - `submitScore` — Any player. Writes their score for the current round
- Returns: `{ gameState, players }`

### Security Considerations
- Words are obfuscated (base64 reversed) in storage — not plaintext
- Feedback is calculated **client-side** to keep things snappy
- For a casual Friday office game, this level of security is sufficient
- Production hardening (if needed later): calculate feedback server-side, never send the word to client

### Player Identity
- Players are identified by a randomly generated 8-character ID
- Stored in `sessionStorage` so it persists within a browser session
- No authentication required — this is a casual game

---

## Visual Design

### Theme
- Dark theme with a premium gaming feel
- Background: Deep navy (`#0b0e1a`)
- Cards: Dark blue-gray (`#141829`) with subtle borders
- Primary accent: Gold (`#f5a623`) — used for headings, game code, scores
- Feedback colors: Green (`#22c55e`), Yellow (`#eab308`), Gray (`#334155`)
- Error color: Red (`#ef4444`)
- Typography: "Russo One" for headings/game elements, "Nunito" for body text

### Animations
- **Pop-in:** Elements scale from 0.5 → 1 with opacity (0.3s)
- **Flip:** Tiles rotate on X-axis when revealing feedback (0.3s)
- **Shake:** Invalid word input shakes horizontally (0.3s)
- **Glow:** Game code pulses with gold box-shadow in lobby
- **Pulse:** "Waiting for GM" text fades in/out

### Responsive Design
- Max width: 420px for game cards
- Should work on both desktop and mobile browsers
- Input supports both physical keyboard and on-screen typing

---

## Edge Cases & Error Handling

| Scenario | Behavior |
|---|---|
| Player joins mid-round | See current round state, can start guessing |
| Player disconnects and returns | Rejoin with same ID via sessionStorage; scores preserved |
| GM disconnects | Game paused until GM returns |
| Invalid game code | "Game not found" error on join screen |
| Duplicate player name | Allowed (identified by ID, not name) |
| Game code collision | Retry with new code |
| Timer sync | Based on `roundStartTime` in DB; all clients calculate locally |
| Browser tab backgrounded | Timer uses absolute time, not intervals |
| All players solved early | GM can click "End Round" without waiting |

---

## Future Enhancements (Post-MVP)
- Sound effects (buzzer, chime, ticking)
- Show player guess progress during round
- On-screen keyboard for mobile
- Custom word lists
- Configurable rounds/timer/guesses
- Spectator mode
- Game history / stats
- Shareable results card
- WebSocket upgrade for real-time updates
