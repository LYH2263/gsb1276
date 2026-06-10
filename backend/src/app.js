require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./models');
const { registerSocket } = require('./sockets');
const { waitForDb } = require('./utils/waitForDb');
const { logger } = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: false,
  })
);
app.use(express.json({ limit: '2mb' }));

app.use('/api', routes);
app.use(errorHandler);

async function main() {
  await waitForDb({ retries: 60, delayMs: 2000 });
  await sequelize.sync();

  const port = Number(process.env.PORT || 8276);
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
  });
  registerSocket(io);

  server.listen(port, () => {
    logger.info('backend_started', { port });
  });
}

main().catch((error) => {
  logger.error('backend_boot_failed', {
    message: error?.message,
    stack: error?.stack,
  });
  process.exit(1);
});
