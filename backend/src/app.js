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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} -.-`);
});

export default app;
