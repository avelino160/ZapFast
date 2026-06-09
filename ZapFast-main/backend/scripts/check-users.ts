import "dotenv/config";
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function checkUsers() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...\n');
    
    // Buscar todos os usuários
    const result = await pool.query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        nickname,
        plan_type,
        is_blocked,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total de usuários registrados: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no banco de dados.');
      return;
    }
    
    console.log('👥 Lista de usuários:\n');
    console.log('━'.repeat(80));
    
    result.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuário:`);
      console.log(`   📧 Email: ${user.email || '(não informado)'}`);
      console.log(`   👤 Nome: ${user.first_name || '(não informado)'}`);
      console.log(`   📝 Sobrenome: ${user.last_name || '(não informado)'}`);
      console.log(`   🏷️  Apelido: ${user.nickname || '(não informado)'}`);
      console.log(`   💳 Plano: ${user.plan_type || 'basic'}`);
      console.log(`   🔒 Bloqueado: ${user.is_blocked ? 'Sim' : 'Não'}`);
      console.log(`   📅 Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
      
      // Verificar se falta informação
      if (!user.first_name || user.first_name.trim() === '') {
        console.log('   ⚠️  ATENÇÃO: Usuário sem nome cadastrado!');
      }
    });
    
    console.log('\n' + '━'.repeat(80));
    
    // Contar usuários sem nome
    const usersWithoutName = result.rows.filter(u => !u.first_name || u.first_name.trim() === '');
    if (usersWithoutName.length > 0) {
      console.log(`\n⚠️  ${usersWithoutName.length} usuário(s) sem nome cadastrado!`);
      console.log('💡 Esses usuários devem atualizar seus perfis nas configurações.');
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao verificar usuários:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
