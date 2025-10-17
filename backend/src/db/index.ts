import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Initialize database tables
 */
export async function initDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    // Create delegations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS delegations (
        user_address VARCHAR(42) PRIMARY KEY,
        delegation JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create index on user_address for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_delegations_user_address 
      ON delegations(user_address);
    `);

    console.log('✅ Database tables initialized');

  } finally {
    client.release();
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
});
