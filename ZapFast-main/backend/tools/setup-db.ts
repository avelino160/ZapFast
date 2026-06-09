import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './shared/schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

console.log('🔗 Conectando ao banco de dados Neon...');

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function setupDatabase() {
  try {
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Banco de dados configurado e pronto para uso!');
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:5000');
    console.log('   3. As tabelas serão criadas automaticamente quando necessário');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

setupDatabase();
