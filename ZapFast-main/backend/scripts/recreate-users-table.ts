import "dotenv/config";
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function recreateUsersTable() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...');
    
    // Dropar tabela antiga (cuidado: vai apagar todos os usuários!)
    console.log('⚠️  Dropando tabela users antiga...');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar enum de plano se não existir
    console.log('📝 Criando enum de plano...');
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE plan_type AS ENUM('free', 'basic', 'pro', 'enterprise');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Criar nova tabela users com estrutura correta
    console.log('📊 Criando tabela users com estrutura correta...');
    await pool.query(`
      CREATE TABLE users (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar UNIQUE,
        password varchar,
        first_name varchar,
        last_name varchar,
        profile_image_url varchar,
        plan_type plan_type DEFAULT 'free',
        plan_expires_at timestamp,
        is_blocked boolean DEFAULT false,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);
    
    console.log('✅ Tabela users recriada com sucesso!');
    console.log('📊 Nova estrutura:');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.table(result.rows);
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

recreateUsersTable();
