import "dotenv/config";
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function setupAuth() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...\n');
    
    // 1. Garantir que a coluna password existe
    console.log('📋 Passo 1: Verificando coluna "password"...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password varchar;
    `);
    console.log('✅ Coluna "password" verificada!\n');
    
    // 2. Verificar se existe algum usuário
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    
    console.log(`📊 Usuários existentes: ${userCount}\n`);
    
    // 3. Criar usuário de teste se não existir nenhum
    if (userCount === 0) {
      console.log('👤 Criando usuário de teste...');
      const testEmail = 'admin@zapfast.com';
      const testPassword = 'admin123';
      const passwordHash = await bcrypt.hash(testPassword, 10);
      
      await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, plan_type)
        VALUES ($1, $2, $3, $4, $5)
      `, [testEmail, passwordHash, 'Admin', 'ZapFast', 'pro']);
      
      console.log('✅ Usuário de teste criado com sucesso!\n');
      console.log('📧 Email: ' + testEmail);
      console.log('🔑 Senha: ' + testPassword);
      console.log('⚠️  IMPORTANTE: Altere essa senha após o primeiro login!\n');
    } else {
      console.log('ℹ️  Já existem usuários cadastrados. Nenhum usuário de teste foi criado.\n');
    }
    
    // 4. Verificar usuários sem senha
    const noPasswordResult = await pool.query(
      'SELECT id, email, first_name FROM users WHERE password IS NULL'
    );
    
    if (noPasswordResult.rows.length > 0) {
      console.log('⚠️  Encontrados usuários sem senha cadastrada:');
      noPasswordResult.rows.forEach(user => {
        console.log(`   - ${user.email || 'Sem email'} (ID: ${user.id})`);
      });
      console.log('\n💡 Esses usuários não conseguirão fazer login até que uma senha seja definida.\n');
    }
    
    console.log('✨ Configuração de autenticação concluída com sucesso!\n');
    console.log('🚀 Você já pode iniciar o servidor e fazer login!');
    
  } catch (error: any) {
    console.error('❌ Erro durante a configuração:', error.message);
    console.error('\n🔍 Detalhes do erro:', error);
  } finally {
    await pool.end();
  }
}

setupAuth();
