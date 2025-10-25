const logger = require('../utils/logger');

// In-memory storage for chat messages and users
let chatMessages = [];
let connectedUsers = new Map();

/**
 * Initialize Socket.io chat functionality
 * @param {Object} io - Socket.io server instance
 */
function initializeChat(io) {
  // Chat namespace
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    logger.info(`User connected to chat: ${socket.id}`);

    // Handle user joining
    socket.on('join_chat', (userData) => {
      try {
        const user = {
          id: socket.id,
          name: userData.name || 'Anonymous',
          email: userData.email || '',
          joinedAt: new Date()
        };

        connectedUsers.set(socket.id, user);
        
        // Join default room
        socket.join('general');
        
        // Send chat history to new user
        socket.emit('chat_history', chatMessages);
        
        // Broadcast user joined to all users
        chatNamespace.emit('user_joined', {
          user: user,
          connectedUsers: Array.from(connectedUsers.values())
        });

        logger.info(`User ${user.name} joined chat`);
      } catch (error) {
        logger.error('Error handling join_chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle new message
    socket.on('send_message', (messageData) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const message = {
          id: generateMessageId(),
          text: messageData.text,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          room: messageData.room || 'general',
          timestamp: new Date(),
          type: 'message'
        };

        // Store message in memory
        chatMessages.push(message);
        
        // Keep only last 100 messages
        if (chatMessages.length > 100) {
          chatMessages = chatMessages.slice(-100);
        }

        // Broadcast message to room
        if (messageData.room && messageData.room !== 'general') {
          chatNamespace.to(messageData.room).emit('new_message', message);
        } else {
          chatNamespace.emit('new_message', message);
        }

        logger.info(`Message sent by ${user.name} in room ${message.room}`);
      } catch (error) {
        logger.error('Error handling send_message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle joining specific room
    socket.on('join_room', (roomName) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        socket.join(roomName);
        
        const joinMessage = {
          id: generateMessageId(),
          text: `${user.name} joined the room`,
          user: {
            id: 'system',
            name: 'System',
            email: ''
          },
          room: roomName,
          timestamp: new Date(),
          type: 'system'
        };

        chatNamespace.to(roomName).emit('new_message', joinMessage);
        socket.emit('joined_room', { room: roomName });

        logger.info(`User ${user.name} joined room ${roomName}`);
      } catch (error) {
        logger.error('Error handling join_room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving room
    socket.on('leave_room', (roomName) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        socket.leave(roomName);
        
        const leaveMessage = {
          id: generateMessageId(),
          text: `${user.name} left the room`,
          user: {
            id: 'system',
            name: 'System',
            email: ''
          },
          room: roomName,
          timestamp: new Date(),
          type: 'system'
        };

        chatNamespace.to(roomName).emit('new_message', leaveMessage);
        socket.emit('left_room', { room: roomName });

        logger.info(`User ${user.name} left room ${roomName}`);
      } catch (error) {
        logger.error('Error handling leave_room:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle user typing
    socket.on('typing', (data) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user_typing', {
          user: user,
          room: data.room || 'general'
        });
      }
    });

    // Handle stop typing
    socket.on('stop_typing', (data) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user_stop_typing', {
          user: user,
          room: data.room || 'general'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        const user = connectedUsers.get(socket.id);
        if (user) {
          connectedUsers.delete(socket.id);
          
          // Broadcast user left to all users
          chatNamespace.emit('user_left', {
            user: user,
            connectedUsers: Array.from(connectedUsers.values())
          });

          logger.info(`User ${user.name} disconnected from chat`);
        }
      } catch (error) {
        logger.error('Error handling disconnect:', error);
      }
    });

    // Handle error
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.info('Chat socket handlers initialized');
}

/**
 * Generate unique message ID
 * @returns {string} Unique message ID
 */
function generateMessageId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get chat statistics
 * @returns {Object} Chat statistics
 */
function getChatStats() {
  return {
    connectedUsers: connectedUsers.size,
    totalMessages: chatMessages.length,
    users: Array.from(connectedUsers.values())
  };
}

/**
 * Clear chat history (admin function)
 */
function clearChatHistory() {
  chatMessages = [];
  logger.info('Chat history cleared');
}

module.exports = {
  initializeChat,
  getChatStats,
  clearChatHistory
};
