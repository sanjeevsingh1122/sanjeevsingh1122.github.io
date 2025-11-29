import React from 'react';
import './metrics-card.css';

type Props = {
  label: string;
  value: string | number;
  helper?: string;
};

const MetricsCard: React.FC<Props> = ({ label, value, helper }) => (
  <div className="metrics-card">
    <span>{label}</span>
    <strong>{value}</strong>
    {helper && <small>{helper}</small>}
  </div>
);

export default MetricsCard;
