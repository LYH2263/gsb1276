const express = require('express');

const authRoutes = require('./auth');
const homeRoutes = require('./home');
const labRoutes = require('./lab');
const learningRoutes = require('./learning');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'label-1276-backend' });
});

router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/lab', labRoutes);
router.use('/learning', learningRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
