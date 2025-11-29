import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './topbar.css';

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div>
        <h2>Welcome back</h2>
        <small>Stay consistent with your learning streak.</small>
      </div>
      <div className="topbar-user">
        <span>{user?.name || user?.email}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
};

export default TopBar;
