function registerSocket(io) {
  const roomContent = new Map();

  io.on('connection', (socket) => {
    socket.on('join-room', (payload) => {
      const roomId = String(payload?.roomId || 'default-room');
      socket.join(roomId);
      const code = roomContent.get(roomId);
      if (code) {
        socket.emit('sync-code', { code });
      }
    });

    socket.on('code-change', (payload) => {
      const roomId = String(payload?.roomId || 'default-room');
      const code = String(payload?.code || '');
      roomContent.set(roomId, code);
      socket.to(roomId).emit('remote-code-change', { code });
    });
  });
}

module.exports = { registerSocket };
