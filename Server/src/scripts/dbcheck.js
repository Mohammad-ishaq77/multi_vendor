import pg from "pg";
import { config } from "../config/env.js";

const client = new pg.Client({ connectionString: config.databaseUrl });
try {
  await client.connect();
  const v = await client.query("select version()");
  console.log("CONNECTED:", v.rows[0].version);
  const ext = await client.query(
    "select extname from pg_extension where extname in ('postgis','pgcrypto')"
  );
  console.log("INSTALLED_EXTENSIONS:", JSON.stringify(ext.rows.map((r) => r.extname)));
  const avail = await client.query(
    "select name from pg_available_extensions where name = 'postgis'"
  );
  console.log("POSTGIS_AVAILABLE:", avail.rows.length > 0);
} catch (err) {
  console.log("CONN_FAIL:", err.message);
  process.exitCode = 1;
} finally {
  try {
    await client.end();
  } catch { /* ignore */ }
}
