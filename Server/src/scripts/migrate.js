import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { config } from "../config/env.js";

const dir = dirname(fileURLToPath(import.meta.url));
const migDir = join(dir, "../../migrations");
const files = readdirSync(migDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: config.databaseUrl });
await client.connect();
try {
  for (const file of files) {
    const sql = readFileSync(join(migDir, file), "utf8");
    await client.query(sql);
    console.log(`Migration ${file} applied.`);
  }
} finally {
  await client.end();
}
