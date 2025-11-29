import { randomUUID } from 'crypto';

type Section = {
  id: string;
  heading: string;
  content: string;
};

type Flashcard = { question: string; answer: string };

type QuizQuestion = { question: string; choices: string[]; correctIndex: number; explanation?: string };

type StudySummary = { summary: string; insights: string[] };

type NotesResponse = Section[];

const fallbackSentences = [
  'This placeholder simulates AI generated content.',
  'Replace with Gemini API to get rich understanding.',
  'Each item maintains structure for quick swap later.'
];

const sampleQuestions = [
  'What is the key idea of this section?',
  'How can this concept be applied in practice?',
  'Which example best illustrates the concept?'
];

export async function transcribeMediaPlaceholder(fileKey: string, language: string) {
  return `Transcribed text for ${fileKey} in ${language}.`;
}

export async function segmentTopicsPlaceholder(text: string, language: string): Promise<NotesResponse> {
  const sentences = text.split(/\n+/).filter(Boolean);
  const chunks = sentences.slice(0, 5);
  return chunks.map((sentence, idx) => ({
    id: randomUUID(),
    heading: `Section ${idx + 1}`,
    content: sentence,
  }));
}

export async function generateStructuredNotesPlaceholder(sections: Section[], language: string) {
  return sections.map((section) => ({
    ...section,
    bullets: [
      `Key point for ${section.heading} (${language})`,
      fallbackSentences[Math.floor(Math.random() * fallbackSentences.length)],
    ],
    examples: ['Example A', 'Example B'],
    takeaways: ['Remember the core concept', 'Connect to prior knowledge'],
  }));
}

export async function summarizePlaceholder(text: string, language: string): Promise<StudySummary> {
  const insights = Array.from({ length: 5 }).map((_, idx) => `Insight ${idx + 1} (${language})`);
  return {
    summary: text.substring(0, 280) || 'Summary placeholder',
    insights,
  };
}

export async function generateFlashcardsPlaceholder(text: string, language: string): Promise<Flashcard[]> {
  return Array.from({ length: 15 }).map((_, idx) => ({
    question: `(${language}) Flashcard question ${idx + 1}`,
    answer: `Answer derived from text snippet ${idx + 1}`,
  }));
}

export async function generateQuizzesPlaceholder(text: string, language: string): Promise<QuizQuestion[]> {
  return Array.from({ length: 10 }).map((_, idx) => ({
    question: `(${language}) Quiz question ${idx + 1}`,
    choices: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: idx % 4,
    explanation: 'Placeholder explanation',
  }));
}

export async function generateTtsScriptPlaceholder(text: string, language: string) {
  return {
    script: `(${language}) Audio script for ${text.substring(0, 120)}...`,
    audioUrl: 'https://example.com/audio-placeholder.mp3',
  };
}

export function buildAiContext(text: string, metadata: { title: string; language: string }) {
  return `${metadata.title} :: ${metadata.language}\n${text.slice(0, 2000)}`;
}
