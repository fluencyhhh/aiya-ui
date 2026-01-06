import axios from 'axios';

const baseUrl = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8080/api/auth';

export const registerUser = async (payload) => {
  const response = await axios.post(`${baseUrl}/register`, payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await axios.post(`${baseUrl}/login`, payload);
  return response.data;
};
