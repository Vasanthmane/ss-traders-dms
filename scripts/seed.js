// scripts/seed.js
// Usage: node scripts/seed.js
// Creates the admin user. Run once after schema is applied.

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  const adminEmail    = 'admin@sstraders.com';
  const adminPassword = 'Admin@1234';           // ← change after first login
  const adminName     = 'Admin';

  const hash = await bcrypt.hash(adminPassword, 10);

  await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${adminName}, ${adminEmail}, ${hash}, 'admin')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log('✅ Admin user created');
  console.log('   Email   :', adminEmail);
  console.log('   Password:', adminPassword);
  console.log('   ⚠️  Change this password after first login via User Management.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
