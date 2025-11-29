import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const folderSchema = z.object({ name: z.string().min(2), parentId: z.string().optional() });
const moveSchema = z.object({ folderId: z.string().nullable(), itemId: z.string() });
const filterSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['UPLOAD', 'LINK', 'TEXT', 'YOUTUBE']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const listLibrary = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const filters = filterSchema.parse(req.query);

  const where: any = { ownerId: req.user.id };
  if (filters.type) where.sourceType = filters.type;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lte = new Date(filters.to);
  }
  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { tags: { hasSome: [filters.query] } },
      { rawText: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  const [items, folders, metrics] = await Promise.all([
    prisma.item.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.folder.findMany({ where: { ownerId: req.user.id } }),
    prisma.item.count({ where: { ownerId: req.user.id } }),
  ]);

  res.json({ items, folders, metrics: { totalItems: metrics } });
};

export const createFolder = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = folderSchema.parse(req.body);
  const folder = await prisma.folder.create({
    data: { ownerId: req.user.id, name: body.name, parentId: body.parentId || null },
  });
  res.status(201).json(folder);
};

export const moveItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = moveSchema.parse(req.body);
  const item = await prisma.item.findFirst({ where: { id: body.itemId, ownerId: req.user.id } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const updated = await prisma.item.update({
    where: { id: item.id },
    data: { folderId: body.folderId },
  });
  res.json(updated);
};

export const updateTags = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const schema = z.object({ itemId: z.string(), tags: z.array(z.string()) });
  const body = schema.parse(req.body);
  const item = await prisma.item.findFirst({ where: { id: body.itemId, ownerId: req.user.id } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const updated = await prisma.item.update({
    where: { id: item.id },
    data: { tags: body.tags },
  });
  res.json(updated);
};
