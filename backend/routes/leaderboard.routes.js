import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getLeaderboard, getImmersionLeaderboard } from '../controllers/leaderboard.controller.js';

const router = Router();
router.use(verifyToken);

router.get('/',         getLeaderboard);
router.get('/immersion', getImmersionLeaderboard);

export default router;
