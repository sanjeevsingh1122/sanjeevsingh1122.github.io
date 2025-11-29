import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listLibrary, createFolder, moveItem, updateTags } from '../controllers/libraryController.js';

const router = Router();

router.get('/', requireAuth, listLibrary);
router.post('/folders', requireAuth, createFolder);
router.post('/move', requireAuth, moveItem);
router.post('/tags', requireAuth, updateTags);

export default router;
