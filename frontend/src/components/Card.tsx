import React from 'react';
import './card.css';

type Props = {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
};

const Card: React.FC<Props> = ({ title, subtitle, footer, children, onClick }) => (
  <article className="card" onClick={onClick}>
    <header>
      <h3>{title}</h3>
      {subtitle && <small>{subtitle}</small>}
    </header>
    <div>{children}</div>
    {footer && <footer>{footer}</footer>}
  </article>
);

export default Card;
