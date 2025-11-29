import React, { useEffect, useState } from 'react';
import MetricsCard from '../components/MetricsCard';
import { useApi } from '../hooks/useApi';

const Progress: React.FC = () => {
  const api = useApi();
  const [metrics, setMetrics] = useState({ totalItems: 0, dueFlashcards: 0 });
  const [trend, setTrend] = useState<{ date: string; score: number | null }[]>([]);

  useEffect(() => {
    api.get('/study/progress').then((res) => {
      setMetrics(res.data.metrics);
      setTrend(res.data.quizTrend);
    });
  }, []);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2>Progress dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <MetricsCard label="Items" value={metrics.totalItems} helper="Created" />
        <MetricsCard label="Cards due" value={metrics.dueFlashcards} helper="Today" />
      </div>
      <div className="card">
        <h3>Quiz history</h3>
        <ul>
          {trend.map((entry) => (
            <li key={entry.date}>
              {new Date(entry.date).toLocaleDateString()} — {entry.score ?? 0}%
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Progress;
