import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import shareRoutes from './routes/shareRoutes.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/share', shareRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
