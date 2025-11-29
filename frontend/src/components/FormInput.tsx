import React from 'react';

type Props = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const FormInput: React.FC<Props> = ({ label, type = 'text', value, onChange, placeholder }) => (
  <label className="form-input">
    <span>{label}</span>
    <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </label>
);

export default FormInput;
