import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

const Upload: React.FC = () => {
  const api = useApi();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [rawText, setRawText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    data.append('language', language);
    data.append('title', title || file.name);
    setStatus('Uploading...');
    await api.post('/content/upload', data);
    setStatus('Uploaded and processing complete.');
    setFile(null);
    setTitle('');
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting text...');
    await api.post('/content/text', { title: title || 'Untitled text', text: rawText, language });
    setStatus('Text item processed.');
    setRawText('');
  };

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Processing YouTube link...');
    await api.post('/content/youtube', { title: title || 'YouTube import', url: youtubeUrl, language });
    setStatus('YouTube item processed.');
    setYoutubeUrl('');
  };

  return (
    <section style={{ display: 'grid', gap: '2rem' }}>
      <h2>Ingest content</h2>
      {status && <p>{status}</p>}

      <form onSubmit={handleFileUpload} className="card" style={{ border: '1px solid #e2e8f0' }}>
        <h3>Upload files</h3>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
        <button type="submit">Upload</button>
      </form>

      <form onSubmit={handleTextSubmit} className="card" style={{ border: '1px solid #e2e8f0' }}>
        <h3>Paste text</h3>
        <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={6} />
        <button type="submit">Process text</button>
      </form>

      <form onSubmit={handleYoutubeSubmit} className="card" style={{ border: '1px solid #e2e8f0' }}>
        <h3>YouTube link</h3>
        <input placeholder="https://youtube.com/..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
        <button type="submit">Ingest</button>
      </form>
    </section>
  );
};

export default Upload;
