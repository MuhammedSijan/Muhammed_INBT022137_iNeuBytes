const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/authMiddleware');

// Public & Patient routes
router.get('/', optionalAuth, doctorController.getAllDoctors);
router.get('/:id', optionalAuth, doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getDoctorAvailability);

// Admin & Doctor management
router.post('/', verifyToken, requireRole(['admin']), doctorController.createDoctor);
router.put('/:id', verifyToken, requireRole(['admin', 'doctor']), doctorController.updateDoctor);
router.delete('/:id', verifyToken, requireRole(['admin']), doctorController.deleteDoctor);

module.exports = router;
