import axios from 'axios';
import { useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useApi = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return useMemo(() => {
    const instance = axios.create({ baseURL: API_URL });
    if (token) instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return instance;
  }, [token]);
};
