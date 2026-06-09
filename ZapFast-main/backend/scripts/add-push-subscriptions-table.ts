import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function addPushSubscriptionsTable() {
  try {
    console.log("🔄 Criando tabela push_subscriptions...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tabela push_subscriptions criada com sucesso!");

    // Criar índice para melhor performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
    `);

    console.log("✅ Índice criado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar tabela:", error);
    throw error;
  } finally {
    await client.end();
  }
}

addPushSubscriptionsTable();
