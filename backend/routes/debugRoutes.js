import express from 'express';
import memoryStore from '../utils/memoryStore.js';

const router = express.Router();

// Get all active rooms (for debugging)
router.get('/rooms', (req, res) => {
  const rooms = memoryStore.getAllRooms().map(room => ({
    id: room.id,
    admin: room.admin,
    userCount: room.users.length,
    users: room.users.map(u => ({ id: u.id, name: u.name })),
    messageCount: room.messages.length,
    mediaCount: room.media.length,
    createdAt: room.createdAt
  }));
  res.json({ roomCount: rooms.length, rooms });
});

export default router;
