import React, { useEffect, useState } from 'react';
import { Item, QuizQuestion } from '../types';
import { useApi } from '../hooks/useApi';
import QuizRunner from '../components/QuizRunner';

const Quiz: React.FC = () => {
  const api = useApi();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/library').then((res) => {
      setItems(res.data.items);
      if (res.data.items.length) {
        setSelected(res.data.items[0].id);
        loadQuiz(res.data.items[0].id);
      }
    });
  }, []);

  const loadQuiz = async (itemId: string) => {
    const res = await api.get(`/study/quiz/${itemId}`);
    setQuestions(res.data);
  };

  const handleSubmit = async (answers: number[]) => {
    if (!selected) return;
    const res = await api.post(`/study/quiz/${selected}`, { answers });
    setMessage(`Score: ${res.data.score}% (${res.data.correct}/${res.data.total})`);
  };

  return (
    <section>
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select value={selected} onChange={(e) => { setSelected(e.target.value); loadQuiz(e.target.value); }}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        {message && <strong>{message}</strong>}
      </header>
      <QuizRunner questions={questions} onSubmit={handleSubmit} />
    </section>
  );
};

export default Quiz;
