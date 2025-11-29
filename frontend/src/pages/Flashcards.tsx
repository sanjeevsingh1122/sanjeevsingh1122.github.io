import React, { useEffect, useState } from 'react';
import FlashcardViewer from '../components/FlashcardViewer';
import { Flashcard } from '../types';
import { useApi } from '../hooks/useApi';

const Flashcards: React.FC = () => {
  const api = useApi();
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState<Flashcard | undefined>(undefined);

  const loadQueue = async () => {
    const res = await api.get('/study/queue');
    setQueue(res.data);
    setCurrent(res.data[0]);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleRate = async (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    if (!current) return;
    await api.post('/study/review', { cardId: current.id, rating });
    const remaining = queue.slice(1);
    setQueue(remaining);
    setCurrent(remaining[0]);
  };

  return (
    <section>
      <h2>Flashcard review</h2>
      <FlashcardViewer card={current} onRate={handleRate} />
      <p>{queue.length} cards left in today's queue.</p>
    </section>
  );
};

export default Flashcards;
