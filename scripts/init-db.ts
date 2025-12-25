import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pgUrl = process.env.PG_URL;
if (!pgUrl) {
  console.error('PG_URL environment variable is not defined');
  process.exit(1);
}

// Extract database name from PG_URL
// Assumes format: postgresql://user:pass@host:port/dbname?params
const urlParts = new URL(pgUrl);
const dbName = urlParts.pathname.slice(1); // Remove leading '/'

if (!dbName) {
  console.error('Could not extract database name from PG_URL');
  process.exit(1);
}

// Connect to default 'postgres' database to create the new one
const connectionString = pgUrl.replace(`/${dbName}`, '/postgres').split('?')[0];

const sql = postgres(connectionString);

async function init() {
  console.log(`Checking if database '${dbName}' exists...`);
  try {
    const result = await sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`;
    
    if (result.length === 0) {
      console.log(`Creating database '${dbName}'...`);
      await sql`CREATE DATABASE ${sql(dbName)}`;
      console.log('Database created successfully.');
    } else {
      console.log('Database already exists.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

init().catch((err) => {
  console.error('Init script failed:', err);
  process.exit(1);
});
