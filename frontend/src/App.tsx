import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Notes from './pages/Notes';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import SharedView from './pages/SharedView';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/shared/:token" element={<SharedView />} />

      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/upload" element={<Layout><Upload /></Layout>} />
      <Route path="/notes" element={<Layout><Notes /></Layout>} />
      <Route path="/flashcards" element={<Layout><Flashcards /></Layout>} />
      <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
      <Route path="/progress" element={<Layout><Progress /></Layout>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default App;
