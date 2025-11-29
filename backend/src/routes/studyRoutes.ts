import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDailyQueue, reviewCard, getQuiz, submitQuiz, getProgress } from '../controllers/studyController.js';

const router = Router();

router.get('/queue', requireAuth, getDailyQueue);
router.post('/review', requireAuth, reviewCard);
router.get('/quiz/:itemId', requireAuth, getQuiz);
router.post('/quiz/:itemId', requireAuth, submitQuiz);
router.get('/progress', requireAuth, getProgress);

export default router;
