const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All appointment routes require authentication
router.use(verifyToken);

router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id/status', requireRole(['doctor', 'admin']), appointmentController.updateAppointmentStatus);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.delete('/:id', requireRole(['admin']), appointmentController.deleteAppointment);

module.exports = router;
