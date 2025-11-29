import { Response, Request } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const inviteSchema = z.object({ email: z.string().email() });
const commentSchema = z.object({ itemId: z.string(), sectionId: z.string().optional(), content: z.string().min(3) });

export const createShareLink = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const itemId = req.params.itemId;
  const item = await prisma.item.findFirst({ where: { id: itemId, ownerId: req.user.id } });
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const link = await prisma.sharedNote.upsert({
    where: { itemId },
    create: { itemId, ownerId: req.user.id, shareToken: randomUUID(), mode: 'PUBLIC' },
    update: {},
  });
  res.json({ url: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/shared/${link.shareToken}` });
};

export const getSharedNote = async (req: Request, res: Response) => {
  const token = req.params.token;
  const shared = await prisma.sharedNote.findUnique({ where: { shareToken: token }, include: { item: true } });
  if (!shared) return res.status(404).json({ message: 'Shared note not found' });
  res.json(shared.item);
};

export const inviteCollaborator = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const itemId = req.params.itemId;
  const body = inviteSchema.parse(req.body);
  const item = await prisma.item.findFirst({ where: { id: itemId, ownerId: req.user.id } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const invite = await prisma.collaborationInvite.create({
    data: {
      itemId,
      inviterId: req.user.id,
      inviteeEmail: body.email,
    },
  });
  res.status(201).json(invite);
};

export const addComment = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = commentSchema.parse(req.body);
  const item = await prisma.item.findFirst({ where: { id: body.itemId, ownerId: req.user.id } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const comment = await prisma.comment.create({
    data: {
      itemId: body.itemId,
      authorId: req.user.id,
      sectionId: body.sectionId,
      content: body.content,
    },
  });
  res.status(201).json(comment);
};

export const listComments = async (req: Request, res: Response) => {
  const itemId = req.params.itemId;
  const comments = await prisma.comment.findMany({
    where: { itemId },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  res.json(comments);
};
