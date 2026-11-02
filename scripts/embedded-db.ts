import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";
import fs from "node:fs";
import net from "node:net";
import { Client } from "pg";

const DATA_DIR = path.resolve(process.cwd(), ".data/postgres");
const PORT = 5433;
const DB_NAME = "sahayak_db";
const USER = "postgres";
const PASSWORD = "postgres_password";

let pgInstance: EmbeddedPostgres | null = null;

export function isPortListening(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function ensureDatabaseAndSchemas(port = PORT): Promise<void> {
  // Connect to default 'postgres' db first to create target database
  const rootClient = new Client({
    host: "localhost",
    port,
    user: USER,
    password: PASSWORD,
    database: "postgres",
  });

  await rootClient.connect();
  const dbCheck = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
  if (dbCheck.rows.length === 0) {
    await rootClient.query(`CREATE DATABASE ${DB_NAME}`);
  }
  await rootClient.end();

  // Connect to sahayak_db to ensure schemas
  const appClient = new Client({
    host: "localhost",
    port,
    user: USER,
    password: PASSWORD,
    database: DB_NAME,
  });

  await appClient.connect();
  await appClient.query(`CREATE SCHEMA IF NOT EXISTS identity;`);
  await appClient.query(`CREATE SCHEMA IF NOT EXISTS telemetry;`);
  await appClient.query(`CREATE SCHEMA IF NOT EXISTS audit;`);
  await appClient.end();
}

export async function startEmbeddedPostgres(dataDir = DATA_DIR, port = PORT): Promise<string> {
  const databaseUrl = `postgresql://${USER}:${PASSWORD}@localhost:${port}/${DB_NAME}?sslmode=disable`;

  if (await isPortListening(port)) {
    return databaseUrl;
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  pgInstance = new EmbeddedPostgres({
    databaseDir: dataDir,
    port,
    user: USER,
    password: PASSWORD,
  });

  try {
    await pgInstance.initialise();
  } catch {
    // Already initialised
  }

  try {
    await pgInstance.start();
  } catch {
    // Might already be running
  }

  await ensureDatabaseAndSchemas(port);
  return databaseUrl;
}

export async function stopEmbeddedPostgres(): Promise<void> {
  if (pgInstance) {
    try {
      await pgInstance.stop();
    } catch {
      // Ignored
    }
    pgInstance = null;
  }
}

// Standalone runner for `pnpm run db:up`
if (process.argv[1]?.endsWith("embedded-db.ts") || process.argv[1]?.endsWith("embedded-db.js")) {
  (async () => {
    console.log("Starting Sahayak embedded PostgreSQL instance...");
    const url = await startEmbeddedPostgres();
    console.log(`Embedded PostgreSQL running at: ${url}`);
    console.log("Schemas 'identity', 'telemetry', and 'audit' verified.");
  })().catch((err) => {
    console.error("Failed to start embedded PostgreSQL:", err);
    process.exit(1);
  });
}
