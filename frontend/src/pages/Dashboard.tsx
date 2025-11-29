import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import MetricsCard from '../components/MetricsCard';
import { Item } from '../types';
import { useApi } from '../hooks/useApi';
import Dialog from '../components/Dialog';

const Dashboard: React.FC = () => {
  const api = useApi();
  const [items, setItems] = useState<Item[]>([]);
  const [metrics, setMetrics] = useState({ totalItems: 0 });
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Item | null>(null);

  const load = async () => {
    const res = await api.get('/library', { params: query ? { query } : {} });
    setItems(res.data.items);
    setMetrics(res.data.metrics);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <section>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="Search your library" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <MetricsCard label="Items" value={metrics.totalItems} helper="Total processed" />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {items.map((item) => (
          <Card key={item.id} title={item.title} subtitle={item.sourceType} onClick={() => setSelected(item)}>
            <p>{item.summary || 'Processing summary...'}</p>
            <small>Language: {item.language}</small>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || ''}>
        <p>{selected?.summary}</p>
        <ul>
          {selected?.insights?.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </Dialog>
    </section>
  );
};

export default Dashboard;
