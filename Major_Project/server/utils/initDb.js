const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDb() {
  console.log('====================================================');
  console.log('  MediLink Database Initialization & Migration Tool');
  console.log('====================================================');

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'medilink_db';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('[1/3] Reading database schema from database/schema.sql...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[2/3] Executing schema DDL statements...');
    await connection.query(schemaSql);
    console.log('      Tables created successfully in database:', database);

    console.log('[3/3] Reading seed data from database/seed.sql...');
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('      Executing seed DML statements...');
    await connection.query(seedSql);
    console.log('      Seed data imported successfully!');

    await connection.end();
    console.log('\n[SUCCESS] MySQL Database initialization completed successfully!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Database initialization failed:');
    console.error(error.message);
    console.error('\nEnsure MySQL server (e.g., XAMPP, WAMP, MySQL Service) is running and your .env credentials match.');
    process.exit(1);
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
