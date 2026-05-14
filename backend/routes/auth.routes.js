import { Router } from 'express';
import { login, getMe, setPassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login',        login);
router.post('/set-password', setPassword);
router.get('/me',            verifyToken, getMe);

export default router;
