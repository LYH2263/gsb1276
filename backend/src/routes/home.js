const express = require('express');
const { parseOptionalAuth } = require('../middleware/auth');
const homeController = require('../controllers/homeController');

const router = express.Router();

router.get('/overview', parseOptionalAuth, homeController.overview);

module.exports = router;
