import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const googleSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

function createToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, env.jwtSecret, { expiresIn: `${env.tokenTtlHours}h` });
}

export const register = async (req: AuthRequest, res: Response) => {
  const body = credentialsSchema.parse(req.body);
  const hashed = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash: hashed,
      name: body.name,
    },
  });

  const token = createToken(user.id, user.email);
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

export const login = async (req: AuthRequest, res: Response) => {
  const body = credentialsSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user.id, user.email);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

export const googleLogin = async (req: AuthRequest, res: Response) => {
  const body = googleSchema.parse(req.body);
  let user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        passwordHash: await bcrypt.hash(jwt.sign({ sub: body.email }, env.jwtSecret), 8),
        googleId: body.token,
      },
    });
  }

  const token = createToken(user.id, user.email);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: { id: user?.id, email: user?.email, name: user?.name } });
};
