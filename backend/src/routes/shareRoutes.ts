import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createShareLink, getSharedNote, inviteCollaborator, addComment, listComments } from '../controllers/shareController.js';

const router = Router();

router.post('/:itemId/link', requireAuth, createShareLink);
router.post('/:itemId/invite', requireAuth, inviteCollaborator);
router.post('/comments', requireAuth, addComment);
router.get('/comments/:itemId', listComments);
router.get('/public/:token', getSharedNote);

export default router;
