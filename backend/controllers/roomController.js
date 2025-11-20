import memoryStore from '../utils/memoryStore.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

export const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = generateRoomCode();
    const room = memoryStore.createRoom(roomId, userId);
    const joinLink = `${process.env.CLIENT_URL}/room/${roomId}`;

    console.log(`[Room] Created by ${req.user.name}: ${roomId}`);
    res.status(201).json({ roomId, joinLink, admin: userId });
  } catch (error) {
    console.error('[Room] Create error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const checkRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const exists = memoryStore.roomExists(roomId);

    if (!exists) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = memoryStore.getRoom(roomId);
    res.json({ exists: true, roomId, userCount: room.users.length, admin: room.admin });
  } catch (error) {
    console.error('[Room] Check error:', error);
    res.status(500).json({ error: 'Failed to check room' });
  }
};

export const endRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const room = memoryStore.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.admin !== userId) {
      return res.status(403).json({ error: 'Only room admin can end the room' });
    }

    memoryStore.deleteRoom(roomId);
    console.log(`[Room] Ended by admin: ${roomId}`);
    res.json({ message: 'Room ended successfully' });
  } catch (error) {
    console.error('[Room] End error:', error);
    res.status(500).json({ error: 'Failed to end room' });
  }
};

export const getRoomInfo = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = memoryStore.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      id: room.id,
      admin: room.admin,
      userCount: room.users.length,
      messageCount: room.messages.length,
      mediaCount: room.media.length,
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error('[Room] Get info error:', error);
    res.status(500).json({ error: 'Failed to get room info' });
  }
};
