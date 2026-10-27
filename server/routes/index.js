const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const analyticsRoutes = require('./analyticsRoutes');

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
