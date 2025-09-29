import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 1000 * 30,
  connectionTimeoutMillis: 1000 * 5,
  application_name: 'viewpoint-explorer'
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export const closePool = () => pool.end();
export default pool;
