import "dotenv/config";
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function checkUsersTable() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...');
    
    // Verificar estrutura da tabela users
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Estrutura da tabela users:');
    console.table(result.rows);
    
    // Ver alguns registros
    const users = await pool.query('SELECT * FROM users LIMIT 3');
    console.log('\n👥 Usuários existentes:', users.rows.length);
    if (users.rows.length > 0) {
      console.log('Exemplo:', users.rows[0]);
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
