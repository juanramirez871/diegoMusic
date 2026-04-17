import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (ɔ◔‿◔)ɔ ♥`);
});

export default app;
