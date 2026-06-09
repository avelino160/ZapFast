import "dotenv/config";
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function addNicknameColumn() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...\n');
    
    // Adicionar coluna nickname se não existir
    console.log('📋 Adicionando coluna "nickname"...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS nickname varchar;
    `);
    
    console.log('✅ Coluna "nickname" adicionada com sucesso!\n');
    console.log('📊 Agora os usuários podem definir um apelido personalizado!');
    
  } catch (error: any) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
  } finally {
    await pool.end();
  }
}

addNicknameColumn();
