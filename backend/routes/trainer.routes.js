import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  getOverview, getStudents, getStudentById,
  getActivityTrend, getTopPerformers, getAtRisk, getInsights,
  getImmersionExamLatest, getImmersionResults,
  createImmersionExam, uploadImmersionResults,
} from '../controllers/trainer.controller.js';

const router = Router();
router.use(verifyToken, requireRole('trainer'));

router.get('/overview',                        getOverview);
router.get('/students',                        getStudents);
router.get('/students/:id',                    getStudentById);
router.get('/activity-trend',                  getActivityTrend);
router.get('/top-performers',                  getTopPerformers);
router.get('/at-risk',                         getAtRisk);
router.get('/insights',                        getInsights);
router.get('/immersion-exam/latest',           getImmersionExamLatest);
router.get('/immersion-exam/:week/results',    getImmersionResults);
router.post('/immersion-exam',                 createImmersionExam);
router.post('/immersion-exam/:week/results',   uploadImmersionResults);

export default router;
