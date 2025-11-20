/**
 * In-Memory Room Store
 * 
 * Ephemeral storage for all room data.
 * When a room is deleted, all associated data is lost.
 * This is intentional for privacy and cost efficiency.
 */

class MemoryStore {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * Create a new room
   */
  createRoom(roomId, adminUserId) {
    const room = {
      id: roomId,
      admin: adminUserId,
      users: [],
      messages: [],
      media: [],
      locations: {},
      createdAt: new Date()
    };
    
    this.rooms.set(roomId, room);
    console.log(`[MemoryStore] Room created: ${roomId} by admin: ${adminUserId}`);
    return room;
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Check if room exists
   */
  roomExists(roomId) {
    return this.rooms.has(roomId);
  }

  /**
   * Add user to room
   */
  addUserToRoom(roomId, userId, userName, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if user already in room
    const existingUser = room.users.find(u => u.id === userId);
    if (existingUser) {
      // Update socket ID (reconnection case)
      existingUser.socketId = socketId;
    } else {
      room.users.push({ id: userId, name: userName, socketId });
    }

    console.log(`[MemoryStore] User ${userName} added to room ${roomId}`);
    return room;
  }

  /**
   * Remove user from room
   */
  removeUserFromRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.users = room.users.filter(u => u.id !== userId);
    delete room.locations[userId];

    console.log(`[MemoryStore] User ${userId} removed from room ${roomId}`);
    return room;
  }

  /**
   * Add message to room
   */
  addMessage(roomId, userId, userName, text) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      text,
      timestamp: new Date()
    };

    room.messages.push(message);
    return message;
  }

  /**
   * Add media to room
   */
  addMedia(roomId, userId, userName, url, type, location) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const media = {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      url,
      type,
      location: location || null, // Include location if provided
      timestamp: new Date()
    };

    room.media.push(media);
    return media;
  }

  /**
   * Delete media from room
   */
  deleteMedia(roomId, mediaId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const initialLength = room.media.length;
    room.media = room.media.filter(m => m.id !== mediaId);
    
    const deleted = room.media.length < initialLength;
    if (deleted) {
      console.log(`[MemoryStore] Media ${mediaId} deleted from room ${roomId}`);
    }
    return deleted;
  }

  /**
   * Update user location
   */
  updateLocation(roomId, userId, userName, lat, lng) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.locations[userId] = {
      lat,
      lng,
      userName,
      updatedAt: new Date()
    };

    return room.locations[userId];
  }

  /**
   * Delete room completely
   */
  deleteRoom(roomId) {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      console.log(`[MemoryStore] Room deleted: ${roomId}`);
    }
    return deleted;
  }

  /**
   * Get all rooms (for debugging/admin)
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  /**
   * Get room count
   */
  getRoomCount() {
    return this.rooms.size;
  }

  /**
   * Clean up empty rooms (optional periodic cleanup)
   */
  cleanupEmptyRooms() {
    let cleaned = 0;
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.length === 0) {
        this.rooms.delete(roomId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[MemoryStore] Cleaned up ${cleaned} empty rooms`);
    }
    return cleaned;
  }
}

// Singleton instance
const memoryStore = new MemoryStore();

// Optional: Run cleanup every 5 minutes
setInterval(() => {
  memoryStore.cleanupEmptyRooms();
}, 5 * 60 * 1000);

export default memoryStore;
