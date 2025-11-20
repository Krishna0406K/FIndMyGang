import { nanoid } from 'nanoid';

/**
 * Generate a unique room code
 * Using nanoid for URL-safe, collision-resistant IDs
 */
export const generateRoomCode = () => {
  // 10 characters: ~2 million years to have 1% collision probability at 1000 IDs/hour
  return nanoid(10);
};

/**
 * Generate a shorter, more human-friendly code (optional)
 * Use this if you want users to type codes manually
 */
export const generateShortCode = () => {
  // 6 characters: easier to type/share
  return nanoid(6).toUpperCase();
};
