import app from './app.js';
import { closePool } from './db.js';

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`ViewPoint Explorer API listening on port ${port}`);
});

const gracefulShutdown = async () => {
  console.log('\nShutting down server...');
  await new Promise((resolve) => server.close(resolve));
  await closePool();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
