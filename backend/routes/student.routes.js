import { Router } from 'express';
import { verifyToken }   from '../middleware/auth.middleware.js';
import { requireRole }   from '../middleware/role.middleware.js';
import {
  getDashboard, getProfile, updateProfile,
  getCodingStats, getCodingProgress,
  getGithubActivity, getActivity,
  getNotifications, markNotificationRead,
} from '../controllers/student.controller.js';

const router = Router();
router.use(verifyToken, requireRole('student', 'trainer'));

router.get('/dashboard',              getDashboard);
router.get('/profile',                getProfile);
router.patch('/profile',              updateProfile);
router.get('/coding-stats',           getCodingStats);
router.get('/coding-progress',        getCodingProgress);
router.get('/github-activity',        getGithubActivity);
router.get('/activity',               getActivity);
router.get('/notifications',          getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
