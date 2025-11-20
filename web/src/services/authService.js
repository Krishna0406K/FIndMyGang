import apiClient from './apiClient';

/**
 * User signup
 * @param {object} data - { name, email, password }
 * @returns {Promise<object>} { token, user }
 */
export const signup = async (data) => {
  const response = await apiClient.post('/auth/signup', data);
  return response.data;
};

/**
 * User login
 * @param {object} data - { email, password }
 * @returns {Promise<object>} { token, user }
 */
export const login = async (data) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * Get current user
 * @returns {Promise<object>} { user }
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};
