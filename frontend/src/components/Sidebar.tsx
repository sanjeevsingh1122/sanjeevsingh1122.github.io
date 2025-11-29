import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Turbo Notes</div>
      <nav>
        <NavLink to="/dashboard">Library</NavLink>
        <NavLink to="/upload">Upload</NavLink>
        <NavLink to="/notes">Notes</NavLink>
        <NavLink to="/flashcards">Flashcards</NavLink>
        <NavLink to="/quiz">Quizzes</NavLink>
        <NavLink to="/progress">Progress</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
