import express from 'express';
import cors from 'cors';
import authRoutes        from './routes/auth.routes.js';
import studentRoutes     from './routes/student.routes.js';
import trainerRoutes     from './routes/trainer.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import { errorHandler }  from './middleware/error.middleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'utpt-backend' }));

app.use('/api/auth',        authRoutes);
app.use('/api/student',     studentRoutes);
app.use('/api/trainer',     trainerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(errorHandler);

export default app;
