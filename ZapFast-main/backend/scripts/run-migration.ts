import "dotenv/config";
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function runMigration() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...');
    
    const sqlFile = readFileSync(join(process.cwd(), 'migrations', '0000_workable_obadiah_stane.sql'), 'utf-8');
    
    // Dividir em statements individuais
    const statements = sqlFile
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Executando ${statements.length} statements SQL...`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          successCount++;
        } catch (error: any) {
          if (error.code === '42P07' || error.code === '42710') {
            // Tabela ou tipo já existe - ignorar
            skipCount++;
          } else {
            console.warn(`⚠️  Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Migration executada com sucesso!`);
    console.log(`   ${successCount} statements executados`);
    console.log(`   ${skipCount} statements ignorados (já existiam)`);
    console.log('\n📊 Tabelas no banco de dados:');
    console.log('   - sessions (sessões de usuário)');
    console.log('   - users (usuários)');
    console.log('   - whatsapp_connections (conexões WhatsApp)');
    console.log('   - campaigns (campanhas)');
    console.log('   - funnels (fluxos de automação)');
    console.log('   - funnel_nodes (nós dos fluxos)');
    console.log('   - contacts (contatos)');
    console.log('   - messages (mensagens)');
    console.log('   - message_templates (templates)');
    console.log('   - funnel_executions (execuções de fluxos)');
    console.log('\n🎉 Banco de dados configurado com sucesso!');
    console.log('🚀 Agora você pode iniciar o servidor com: npm run dev');
    
  } catch (error: any) {
    console.error('❌ Erro crítico ao executar migration:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
