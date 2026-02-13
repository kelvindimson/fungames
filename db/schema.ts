import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  code: text("code").primaryKey(),
  gmId: text("gm_id").notNull(),
  status: text("status").notNull().default("lobby"),
  currentRound: integer("current_round").notNull().default(0),
  words: text("words", { mode: "json" }).$type<string[]>().notNull(),
  roundTime: integer("round_time").notNull().default(30),
  roundStartTime: integer("round_start_time"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  gameCode: text("game_code")
    .notNull()
    .references(() => games.code),
  name: text("name").notNull(),
  totalScore: integer("total_score").notNull().default(0),
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const rounds = sqliteTable("rounds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameCode: text("game_code")
    .notNull()
    .references(() => games.code),
  roundNum: integer("round_num").notNull(),
  results: text("results", { mode: "json" })
    .$type<Record<string, { score: number; guesses: number }>>()
    .notNull()
    .default({}),
});
