const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRole(['admin', 'doctor']));

router.get('/dashboard', analyticsController.getDashboardSummary);
router.get('/reports', analyticsController.getAnalyticsReports);

module.exports = router;
