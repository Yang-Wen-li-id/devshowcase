const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All analytics routes are protected for Administrator
router.get('/overview', requireAuth, requireAdmin, analyticsController.getOverview);
router.get('/trend', requireAuth, requireAdmin, analyticsController.getVisitsTrend);
router.get('/logs', requireAuth, requireAdmin, analyticsController.getRawLogs);

module.exports = router;
