const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Get patients list (Admin & Doctor)
router.get('/', verifyToken, requireRole(['admin', 'doctor']), patientController.getAllPatients);

// Patient profile details
router.get('/:id', verifyToken, patientController.getPatientById);
router.put('/:id', verifyToken, patientController.updatePatient);

// Admin-only patient delete
router.delete('/:id', verifyToken, requireRole(['admin']), patientController.deletePatient);

module.exports = router;
