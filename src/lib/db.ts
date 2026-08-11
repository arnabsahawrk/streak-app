import postgres from "postgres";

// Reuse one connection across hot reloads (dev) and warm serverless
// invocations (prod) instead of opening a fresh one on every request.
declare global {
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

const sql =
  global.__sql ??
  postgres(process.env.DATABASE_URL ?? "", {
    ssl: "require",
    max: 1,
  });

global.__sql = sql;

export default sql;
