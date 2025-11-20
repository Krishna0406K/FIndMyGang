import memoryStore from '../utils/memoryStore.js';

export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] User connected: ${user.name} (${user.id})`);

    socket.on('join-room', ({ roomId }) => {
      handleJoinRoom(io, socket, roomId);
    });

    socket.on('leave-room', ({ roomId }) => {
      handleLeaveRoom(io, socket, roomId);
    });

    socket.on('send-message', ({ roomId, text }) => {
      handleSendMessage(io, socket, roomId, text);
    });

    socket.on('update-location', ({ roomId, lat, lng }) => {
      handleUpdateLocation(io, socket, roomId, lat, lng);
    });

    socket.on('send-media', ({ roomId, url, type, location }) => {
      handleSendMedia(io, socket, roomId, url, type, location);
    });

    socket.on('delete-media', ({ roomId, mediaId }) => {
      handleDeleteMedia(io, socket, roomId, mediaId);
    });

    socket.on('end-room', ({ roomId }) => {
      handleEndRoom(io, socket, roomId);
    });

    socket.on('disconnect', () => {
      handleDisconnect(io, socket);
    });
  });
};

const handleJoinRoom = (io, socket, roomId) => {
  const user = socket.user;
  console.log(`[Socket] ${user.name} attempting to join room ${roomId}`);
  
  const room = memoryStore.getRoom(roomId);

  if (!room) {
    console.error(`[Socket] Room not found: ${roomId}. Available rooms: ${memoryStore.getRoomCount()}`);
    socket.emit('error', { message: `Room ${roomId} not found. It may have been deleted or never existed.` });
    return;
  }

  socket.join(roomId);
  memoryStore.addUserToRoom(roomId, user.id, user.name, socket.id);

  const updatedRoom = memoryStore.getRoom(roomId);
  socket.emit('room-data', { room: updatedRoom });
  io.to(roomId).emit('user-joined', {
    userId: user.id,
    userName: user.name,
    users: updatedRoom.users
  });

  console.log(`[Socket] ${user.name} successfully joined room ${roomId}`);
};

const handleLeaveRoom = (io, socket, roomId) => {
  const user = socket.user;
  const room = memoryStore.getRoom(roomId);

  if (!room) return;

  socket.leave(roomId);
  memoryStore.removeUserFromRoom(roomId, user.id);

  const updatedRoom = memoryStore.getRoom(roomId);

  if (updatedRoom && updatedRoom.users.length > 0) {
    io.to(roomId).emit('user-left', {
      userId: user.id,
      users: updatedRoom.users
    });
  } else {
    memoryStore.deleteRoom(roomId);
    console.log(`[Socket] Room ${roomId} deleted (empty)`);
  }

  console.log(`[Socket] ${user.name} left room ${roomId}`);
};

const handleSendMessage = (io, socket, roomId, text) => {
  const user = socket.user;
  const message = memoryStore.addMessage(roomId, user.id, user.name, text);

  if (!message) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  io.to(roomId).emit('new-message', message);
  console.log(`[Socket] Message in ${roomId} from ${user.name}`);
};

const handleUpdateLocation = (io, socket, roomId, lat, lng) => {
  const user = socket.user;
  const location = memoryStore.updateLocation(roomId, user.id, user.name, lat, lng);

  if (!location) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  io.to(roomId).emit('location-updated', {
    userId: user.id,
    userName: user.name,
    lat,
    lng
  });
};

const handleSendMedia = (io, socket, roomId, url, type, location) => {
  const user = socket.user;
  const media = memoryStore.addMedia(roomId, user.id, user.name, url, type, location);

  if (!media) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  io.to(roomId).emit('new-media', media);
  
  const locationInfo = location ? ` with location (${location.lat}, ${location.lng})` : '';
  console.log(`[Socket] Media in ${roomId} from ${user.name}${locationInfo}`);
};

const handleDeleteMedia = (io, socket, roomId, mediaId) => {
  const user = socket.user;
  const room = memoryStore.getRoom(roomId);

  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  // Find the media item
  const mediaItem = room.media.find(m => m.id === mediaId);
  
  if (!mediaItem) {
    socket.emit('error', { message: 'Media not found' });
    return;
  }

  // Check permissions: owner or admin can delete
  const isOwner = mediaItem.userId === user.id;
  const isAdmin = room.admin === user.id;

  if (!isOwner && !isAdmin) {
    socket.emit('error', { message: 'You can only delete your own media' });
    console.log(`[Socket] ${user.name} tried to delete media in ${roomId} but lacks permission`);
    return;
  }

  // Delete the media
  const deleted = memoryStore.deleteMedia(roomId, mediaId);

  if (deleted) {
    io.to(roomId).emit('media-deleted', { mediaId });
    console.log(`[Socket] Media ${mediaId} deleted from ${roomId} by ${user.name}${isAdmin && !isOwner ? ' (admin)' : ''}`);
  }
};

const handleEndRoom = (io, socket, roomId) => {
  const user = socket.user;
  const room = memoryStore.getRoom(roomId);

  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  // Check if user is admin
  if (room.admin !== user.id) {
    socket.emit('error', { message: 'Only the room admin can end the room' });
    console.log(`[Socket] ${user.name} tried to end room ${roomId} but is not admin`);
    return;
  }

  console.log(`[Socket] Admin ${user.name} ending room ${roomId}`);

  // Notify all users in the room that it's ending
  io.to(roomId).emit('room-ended', { 
    message: 'Room has been ended by the admin',
    adminName: user.name 
  });

  // Delete the room from memory
  memoryStore.deleteRoom(roomId);
  console.log(`[Socket] Room ${roomId} ended and deleted by admin`);
};

const handleDisconnect = (io, socket) => {
  const user = socket.user;
  console.log(`[Socket] User disconnected: ${user.name}`);

  // Add a delay before removing user to handle temporary disconnections
  // (e.g., during large file uploads)
  setTimeout(() => {
    // Check if user reconnected (has a new socket)
    const userReconnected = Array.from(io.sockets.sockets.values()).some(
      s => s.user && s.user.id === user.id && s.id !== socket.id
    );

    if (userReconnected) {
      console.log(`[Socket] User ${user.name} reconnected, not removing from rooms`);
      return;
    }

    // User didn't reconnect, remove from all rooms
    memoryStore.getAllRooms().forEach(room => {
      const userInRoom = room.users.find(u => u.socketId === socket.id);
      if (userInRoom) {
        handleLeaveRoom(io, socket, room.id);
      }
    });
  }, 5000); // 5 second grace period
};
