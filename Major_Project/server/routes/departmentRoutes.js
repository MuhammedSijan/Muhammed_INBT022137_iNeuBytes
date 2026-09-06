const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public access: list and view departments
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin-only management
router.post('/', verifyToken, requireRole(['admin']), departmentController.createDepartment);
router.put('/:id', verifyToken, requireRole(['admin']), departmentController.updateDepartment);
router.delete('/:id', verifyToken, requireRole(['admin']), departmentController.deleteDepartment);

module.exports = router;
