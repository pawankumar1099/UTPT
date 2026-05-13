import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes        from './routes/auth.routes.js';
import studentRoutes     from './routes/student.routes.js';
import trainerRoutes     from './routes/trainer.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import { errorHandler }  from './middleware/error.middleware.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'UTPT API is running' }));

app.use('/api/auth',        authRoutes);
app.use('/api/student',     studentRoutes);
app.use('/api/trainer',     trainerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use(errorHandler);

export default app;
