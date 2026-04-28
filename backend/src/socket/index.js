const User = require('../models/User');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('leaderboard:request', async () => {
      try {
        const leaderboard = await User.find({}).sort({ score: -1 }).limit(20).select('name picture score streak');
        socket.emit('leaderboard:update', leaderboard);
      } catch (error) {
        console.error('Socket leaderboard error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
