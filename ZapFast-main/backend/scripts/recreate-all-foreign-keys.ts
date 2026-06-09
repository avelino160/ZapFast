import "dotenv/config";
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

async function recreateForeignKeys() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔗 Conectando ao banco de dados Neon...');
    
    // Adicionar foreign keys
    console.log('🔗 Adicionando foreign keys...');
    
    const foreignKeys = [
      'ALTER TABLE campaigns ADD CONSTRAINT campaigns_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade',
      'ALTER TABLE contacts ADD CONSTRAINT contacts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade',
      'ALTER TABLE funnels ADD CONSTRAINT funnels_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade',
      'ALTER TABLE message_templates ADD CONSTRAINT message_templates_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade',
      'ALTER TABLE messages ADD CONSTRAINT messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade',
      'ALTER TABLE whatsapp_connections ADD CONSTRAINT whatsapp_connections_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade',
    ];
    
    for (const fk of foreignKeys) {
      try {
        await pool.query(fk);
        console.log('✅ Foreign key criada');
      } catch (error: any) {
        if (error.code === '42710') {
          console.log('⏭️  Foreign key já existe');
        } else {
          console.warn('⚠️  ', error.message);
        }
      }
    }
    
    console.log('✅ Todas as foreign keys foram processadas!');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

recreateForeignKeys();
