import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { sequelize } from './models/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Diego Music API' });
});

app.use((err, req, res, next) => {
  console.error('[Express] Unhandled error:', err);
  if (!res.headersSent) res.status(500).json({ error: err.message || 'Internal Server Error' });
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught exception:', err);
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('[DB] Models synced');
  }
  catch (err) {
    console.error('[DB] Connection failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (ɔ◔‿◔)ɔ ♥`);
  });
}

start();

export default app;
