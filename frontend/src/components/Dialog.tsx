import React from 'react';
import './dialog.css';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Dialog: React.FC<Props> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
