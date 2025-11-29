import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SharedView: React.FC = () => {
  const { token } = useParams();
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_URL}/share/public/${token}`)
      .then((res) => setItem(res.data))
      .catch(() => setError('Link invalid or expired.'));
  }, [token]);

  if (error) return <p>{error}</p>;
  if (!item) return <p>Loading...</p>;

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>{item.title}</h1>
      <p>{item.summary}</p>
      <section style={{ display: 'grid', gap: '1rem' }}>
        {Array.isArray(item.notes) &&
          item.notes.map((section: any) => (
            <article key={section.id} className="card">
              <h3>{section.heading}</h3>
              <p>{section.content}</p>
              <ul>
                {section.bullets?.map((bullet: string) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
      </section>
    </main>
  );
};

export default SharedView;
