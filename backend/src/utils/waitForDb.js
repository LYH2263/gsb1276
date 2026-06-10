const { sequelize } = require('../config/database');

async function waitForDb({ retries = 40, delayMs = 2000 } = {}) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

module.exports = { waitForDb };
