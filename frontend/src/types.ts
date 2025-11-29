export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Item = {
  id: string;
  title: string;
  sourceType: 'UPLOAD' | 'LINK' | 'TEXT' | 'YOUTUBE';
  tags: string[];
  language: string;
  summary?: string;
  insights?: string[];
  notes?: any;
  flashcards?: Flashcard[];
  quizzes?: QuizQuestion[];
  createdAt: string;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  easeScore?: number;
  nextDue?: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
};

export type Comment = {
  id: string;
  content: string;
  author?: { id: string; name?: string; email: string };
  createdAt: string;
};
