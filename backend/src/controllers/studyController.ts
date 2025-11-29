import { Response } from 'express';
import dayjs from 'dayjs';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { scheduleCard } from '../utils/spacedRepetition.js';
import { z } from 'zod';

export const getDailyQueue = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const today = dayjs().endOf('day').toDate();
  const cards = await prisma.flashcard.findMany({
    where: { item: { ownerId: req.user.id }, nextDue: { lte: today } },
    orderBy: { nextDue: 'asc' },
    take: 50,
  });
  res.json(cards);
};

const reviewSchema = z.object({ cardId: z.string(), rating: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']) });

export const reviewCard = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = reviewSchema.parse(req.body);
  const card = await prisma.flashcard.findFirst({ where: { id: body.cardId, item: { ownerId: req.user.id } } });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  const updatedState = scheduleCard(
    { easeScore: card.easeScore, interval: card.interval, reviews: card.reviews },
    body.rating
  );

  const updated = await prisma.flashcard.update({
    where: { id: card.id },
    data: updatedState,
  });

  await prisma.studySession.create({
    data: {
      userId: req.user.id,
      type: 'FLASHCARDS',
      score: updatedState.easeScore,
      metadata: { cardId: card.id, rating: body.rating },
    },
  });

  res.json(updated);
};

export const getQuiz = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const itemId = req.params.itemId;
  const quiz = await prisma.quizQuestion.findMany({
    where: { itemId, item: { ownerId: req.user.id } },
  });
  res.json(quiz);
};

const quizSchema = z.object({ answers: z.array(z.number()) });

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const body = quizSchema.parse(req.body);
  const itemId = req.params.itemId;
  const quiz = await prisma.quizQuestion.findMany({ where: { itemId, item: { ownerId: req.user.id } } });
  const total = quiz.length;
  const correct = quiz.reduce((acc, question, idx) => (question.correctIndex === body.answers[idx] ? acc + 1 : acc), 0);
  const score = total ? Math.round((correct / total) * 100) : 0;

  await prisma.studySession.create({
    data: {
      userId: req.user.id,
      type: 'QUIZ',
      score,
      metadata: { itemId, correct, total },
    },
  });

  res.json({ score, correct, total });
};

export const getProgress = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const [items, dueCards, sessions] = await Promise.all([
    prisma.item.count({ where: { ownerId: req.user.id } }),
    prisma.flashcard.count({ where: { item: { ownerId: req.user.id }, nextDue: { lte: dayjs().endOf('day').toDate() } } }),
    prisma.studySession.findMany({
      where: { userId: req.user.id, type: 'QUIZ' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const quizTrend = sessions.map((session) => ({ date: session.createdAt, score: session.score }));
  res.json({ metrics: { totalItems: items, dueFlashcards: dueCards }, quizTrend });
};
