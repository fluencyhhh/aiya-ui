import axios from 'axios';

const gatewayBase = import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost:8081';
const authPath = import.meta.env.VITE_AUTH_BASE_URL || '/api/auth';
const baseUrl = authPath.startsWith('http') ? authPath : `${gatewayBase}${authPath}`;
const TOKEN_KEY = 'aiya-token';
const USER_KEY = 'aiya-user';

const formatToken = (token) => (token?.startsWith('Bearer') ? token : `Bearer ${token}`);

const persistAuth = (data) => {
  if (data?.token) {
    const bearerToken = formatToken(data.token);
    localStorage.setItem(TOKEN_KEY, bearerToken);
    axios.defaults.headers.common['Authorization'] = bearerToken;
  }
  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
};

export const registerUser = async (payload) => {
  const response = await axios.post(`${baseUrl}/register`, payload);
  persistAuth(response.data);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await axios.post(`${baseUrl}/login`, payload);
  persistAuth(response.data);
  return response.data;
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
