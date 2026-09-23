import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { config } from "../config/env.js";

const dir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(dir, "../../migrations/0001_init.sql"), "utf8");

const client = new pg.Client({ connectionString: config.databaseUrl });
await client.connect();
try {
  await client.query(sql);
  console.log("Migration 0001_init applied.");
} finally {
  await client.end();
}
