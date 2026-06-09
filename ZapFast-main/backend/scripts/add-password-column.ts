import "dotenv/config";
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function addPasswordColumn() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...');
    
    // Adicionar coluna password se não existir
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password varchar;
    `);
    
    console.log('✅ Coluna "password" adicionada com sucesso!');
    console.log('📊 Agora você pode fazer login e registro com autenticação real!');
    
  } catch (error: any) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
  } finally {
    await pool.end();
  }
}

addPasswordColumn();
