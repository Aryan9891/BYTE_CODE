import { Client } from "pg";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { startEmbeddedPostgres, ensureDatabaseAndSchemas } from "./embedded-db";

async function main() {
  console.log("Resetting database on real PostgreSQL...");
  const dbUrl = await startEmbeddedPostgres();

  const client = new Client({
    connectionString: dbUrl,
    ssl: false,
  });
  await client.connect();

  console.log("Dropping and recreating schemas: identity, telemetry, audit...");
  await client.query(`DROP SCHEMA IF EXISTS identity CASCADE;`);
  await client.query(`DROP SCHEMA IF EXISTS telemetry CASCADE;`);
  await client.query(`DROP SCHEMA IF EXISTS audit CASCADE;`);
  await client.query(`CREATE SCHEMA identity;`);
  await client.query(`CREATE SCHEMA telemetry;`);
  await client.query(`CREATE SCHEMA audit;`);
  await client.end();

  console.log("Pushing Prisma schema to PostgreSQL...");
  execSync("pnpm exec prisma db push --skip-generate", { stdio: "inherit", env: { ...process.env, DATABASE_URL: dbUrl } });

  console.log("Applying immutability triggers...");
  const triggerSql = fs.readFileSync(path.resolve(process.cwd(), "prisma/migrations/audit_immutability.sql"), "utf-8");
  const triggerClient = new Client({ connectionString: dbUrl, ssl: false });
  await triggerClient.connect();
  await triggerClient.query(triggerSql);
  await triggerClient.end();

  console.log("Seeding synthetic data...");
  execSync("pnpm exec tsx prisma/seed.ts", { stdio: "inherit", env: { ...process.env, DATABASE_URL: dbUrl } });

  console.log("Database reset and seed COMPLETE!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Database reset error:", err);
  process.exit(1);
});
