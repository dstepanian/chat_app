const API_URL = import.meta.env.VITE_API_URL || 'https://chatapp-production-1b1f.up.railway.app';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_URL}/api/auth/register`,
    LOGIN: `${API_URL}/api/auth/login`,
  },
  MESSAGES: `${API_URL}/api/messages`,
}; 