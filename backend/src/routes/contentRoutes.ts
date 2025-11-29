import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { uploadFile, ingestText, ingestYoutube, getItem, reprocessItem } from '../controllers/contentController.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

router.post('/upload', requireAuth, upload.single('file'), uploadFile);
router.post('/text', requireAuth, ingestText);
router.post('/youtube', requireAuth, ingestYoutube);
router.get('/:id', requireAuth, getItem);
router.post('/:id/reprocess', requireAuth, reprocessItem);

export default router;
