import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token && typeof token === 'string') {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Token retrieval error:', error);
  }
  return config;
});

export default api;
