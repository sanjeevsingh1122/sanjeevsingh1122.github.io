import React, { useEffect, useState } from 'react';
import { Item } from '../types';
import { useApi } from '../hooks/useApi';
import './notes.css';

const Notes: React.FC = () => {
  const api = useApi();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<Item | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLibrary = async () => {
    const res = await api.get('/library');
    setItems(res.data.items);
    if (!active && res.data.items.length) setActive(res.data.items[0]);
  };

  const loadItem = async (id: string) => {
    const res = await api.get(`/content/${id}`);
    setActive(res.data);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const share = async () => {
    if (!active) return;
    const res = await api.post(`/share/${active.id}/link`);
    setShareUrl(res.data.url);
  };

  const reprocess = async () => {
    if (!active) return;
    setLoading(true);
    const res = await api.post(`/content/${active.id}/reprocess`);
    setActive(res.data);
    setLoading(false);
  };

  return (
    <section className="notes-layout">
      <aside>
        <h3>Your items</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id} className={item.id === active?.id ? 'active' : ''} onClick={() => loadItem(item.id)}>
              {item.title}
            </li>
          ))}
        </ul>
      </aside>
      <div className="notes-viewer">
        {active ? (
          <>
            <header>
              <h2>{active.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={share}>Share</button>
                <button onClick={reprocess} disabled={loading}>
                  {loading ? 'Reprocessing...' : 'Reprocess'}
                </button>
              </div>
            </header>
            {shareUrl && <p>Share link: {shareUrl}</p>}
            <p>{active.summary}</p>
            <div className="notes-grid">
              {Array.isArray(active.notes) &&
                active.notes.map((section: any) => (
                  <article key={section.id}>
                    <h4>{section.heading}</h4>
                    <ul>
                      {section.bullets?.map((bullet: string) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <p>{section.content}</p>
                  </article>
                ))}
            </div>
          </>
        ) : (
          <p>Select an item to view notes.</p>
        )}
      </div>
    </section>
  );
};

export default Notes;
