const { query } = require('../config/db');

/**
 * Get all departments with assigned doctor counts
 */
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await query('SELECT * FROM departments ORDER BY name ASC');
    const doctors = await query('SELECT department_id FROM doctors WHERE is_active = 1');

    const result = departments.map(d => {
      const docCount = doctors.filter(doc => doc.department_id === d.id).length;
      return {
        ...d,
        doctor_count: docCount
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single department by ID with full doctor roster
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const departments = await query('SELECT * FROM departments WHERE id = ?', [id]);

    if (!departments || departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    const department = departments[0];

    // Fetch doctors in this department
    const doctors = await query(`
      SELECT d.*, u.full_name, u.email, u.phone, u.avatar_url
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.department_id = ? AND d.is_active = 1
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...department,
        doctors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Department (Admin Only)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, icon, description, head_doctor } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and unique code are required.'
      });
    }

    // Check duplicate code or name
    const existing = await query('SELECT id FROM departments WHERE code = ? OR name = ?', [code.trim(), name.trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name or code already exists.'
      });
    }

    const result = await query(
      'INSERT INTO departments (name, code, icon, description, head_doctor) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), code.trim().toUpperCase(), icon || 'stethoscope', description || '', head_doctor || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: {
        id: result.insertId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        icon: icon || 'stethoscope',
        description,
        head_doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Department (Admin Only)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, head_doctor, icon } = req.body;

    const existing = await query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    await query(
      'UPDATE departments SET name = ?, description = ?, head_doctor = ? WHERE id = ?',
      [name, description, head_doctor, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Department (Admin Only - Safe check)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    // Check if doctors are assigned
    const doctors = await query('SELECT id FROM doctors WHERE department_id = ?', [id]);
    if (doctors && doctors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${doctors.length} active doctors assigned to it. Please reassign them first.`
      });
    }

    await query('DELETE FROM departments WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
