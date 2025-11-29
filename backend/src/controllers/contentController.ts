import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { uploadBuffer } from '../utils/storage.js';
import { extractTextFromBuffer } from '../utils/parsers.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  transcribeMediaPlaceholder,
  segmentTopicsPlaceholder,
  generateStructuredNotesPlaceholder,
  summarizePlaceholder,
  generateFlashcardsPlaceholder,
  generateQuizzesPlaceholder,
  generateTtsScriptPlaceholder,
  buildAiContext,
} from '../utils/ai.js';
import { z } from 'zod';

const textSchema = z.object({
  title: z.string().min(3),
  text: z.string().min(20),
  language: z.string().default('en'),
  tags: z.array(z.string()).optional(),
});

const linkSchema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
  language: z.string().default('en'),
  tags: z.array(z.string()).optional(),
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'video/mp4',
]);

export async function runAiPipeline({ itemId, title, text, language }: { itemId: string; title: string; text: string; language: string }) {
  const context = buildAiContext(text, { title, language });
  const sections = await segmentTopicsPlaceholder(context, language);
  const structuredNotes = await generateStructuredNotesPlaceholder(sections, language);
  const summary = await summarizePlaceholder(text, language);
  const flashcards = await generateFlashcardsPlaceholder(text, language);
  const quizzes = await generateQuizzesPlaceholder(text, language);
  const speech = await generateTtsScriptPlaceholder(text, language);

  await prisma.$transaction([
    prisma.item.update({
      where: { id: itemId },
      data: {
        notes: structuredNotes,
        summary: summary.summary,
        insights: summary.insights,
        ttsScript: speech.script,
        ttsAudioUrl: speech.audioUrl,
      },
    }),
    prisma.flashcard.deleteMany({ where: { itemId } }),
    prisma.flashcard.createMany({
      data: flashcards.map((card) => ({
        itemId,
        question: card.question,
        answer: card.answer,
      })),
    }),
    prisma.quizQuestion.deleteMany({ where: { itemId } }),
    prisma.quizQuestion.createMany({
      data: quizzes.map((quiz) => ({
        itemId,
        question: quiz.question,
        choices: quiz.choices,
        correctIndex: quiz.correctIndex,
        explanation: quiz.explanation,
      })),
    }),
  ]);
}

export const uploadFile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) return res.status(400).json({ message: 'File is required' });
  if (!allowedMimeTypes.has(file.mimetype)) {
    return res.status(400).json({ message: 'Unsupported file type' });
  }

  const stored = await uploadBuffer(file.buffer, file.originalname, file.mimetype);

  let rawText = '';
  if (file.mimetype.startsWith('audio') || file.mimetype.startsWith('video')) {
    rawText = await transcribeMediaPlaceholder(stored.key, req.body.language || 'en');
  } else {
    rawText = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);
  }

  let tags: string[] = [];
  if (Array.isArray(req.body.tags)) {
    tags = req.body.tags;
  } else if (typeof req.body.tags === 'string' && req.body.tags.trim().length) {
    try {
      tags = JSON.parse(req.body.tags);
    } catch (error) {
      tags = req.body.tags.split(',').map((tag: string) => tag.trim());
    }
  }

  const item = await prisma.item.create({
    data: {
      ownerId: req.user.id,
      title: req.body.title || file.originalname,
      sourceType: 'UPLOAD',
      storageKey: stored.key,
      rawText,
      language: req.body.language || 'en',
      contentType: file.mimetype,
      tags,
    },
  });

  await runAiPipeline({ itemId: item.id, title: item.title, text: rawText, language: item.language });
  const hydrated = await prisma.item.findUnique({ where: { id: item.id }, include: { flashcards: true, quizzes: true } });
  res.status(201).json(hydrated);
};

export const ingestText = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = textSchema.parse(req.body);

  const item = await prisma.item.create({
    data: {
      ownerId: req.user.id,
      title: body.title,
      sourceType: 'TEXT',
      rawText: body.text,
      language: body.language,
      tags: body.tags || [],
    },
  });

  await runAiPipeline({ itemId: item.id, title: item.title, text: body.text, language: body.language });
  const hydrated = await prisma.item.findUnique({ where: { id: item.id }, include: { flashcards: true, quizzes: true } });
  res.status(201).json(hydrated);
};

export const ingestYoutube = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = linkSchema.parse(req.body);
  const fakeTranscript = await transcribeMediaPlaceholder(body.url, body.language);

  const item = await prisma.item.create({
    data: {
      ownerId: req.user.id,
      title: body.title,
      sourceType: 'YOUTUBE',
      sourceUrl: body.url,
      rawText: fakeTranscript,
      language: body.language,
      tags: body.tags || [],
    },
  });

  await runAiPipeline({ itemId: item.id, title: item.title, text: fakeTranscript, language: body.language });
  const hydrated = await prisma.item.findUnique({ where: { id: item.id }, include: { flashcards: true, quizzes: true } });
  res.status(201).json(hydrated);
};

export const getItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const item = await prisma.item.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
    include: { flashcards: true, quizzes: true, comments: true },
  });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

export const reprocessItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const item = await prisma.item.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
  if (!item || !item.rawText) return res.status(404).json({ message: 'Item not found or missing text' });
  await runAiPipeline({ itemId: item.id, title: item.title, text: item.rawText, language: item.language });
  const refreshed = await prisma.item.findUnique({ where: { id: item.id }, include: { flashcards: true, quizzes: true } });
  res.json(refreshed);
};
