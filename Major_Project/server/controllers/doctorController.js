const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * Get all doctors with filters (search query, department)
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const { department_id, search, is_active } = req.query;

    let sql = `
      SELECT 
        d.id, d.user_id, d.department_id, d.specialization, d.experience_years,
        d.consultation_fee, d.availability_days, d.available_time_start, d.available_time_end,
        d.room_number, d.bio, d.is_active, d.created_at,
        u.full_name, u.email, u.phone, u.avatar_url,
        dept.name AS department_name, dept.code AS department_code, dept.icon AS department_icon
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      WHERE 1=1
    `;

    const params = [];

    if (department_id) {
      sql += ' AND d.department_id = ?';
      params.push(parseInt(department_id, 10));
    }

    if (is_active !== undefined) {
      sql += ' AND d.is_active = ?';
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    } else {
      sql += ' AND d.is_active = 1';
    }

    let doctors = await query(sql, params);

    // Apply client-friendly text search if provided
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      doctors = doctors.filter(doc => 
        doc.full_name.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.department_name.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single doctor by ID
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        d.id, d.user_id, d.department_id, d.specialization, d.experience_years,
        d.consultation_fee, d.availability_days, d.available_time_start, d.available_time_end,
        d.room_number, d.bio, d.is_active, d.created_at,
        u.full_name, u.email, u.phone, u.avatar_url,
        dept.name AS department_name, dept.code AS department_code, dept.icon AS department_icon
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      WHERE d.id = ?
    `;

    const doctors = await query(sql, [id]);

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: doctors[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available time slots for a doctor on a specific date
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date (YYYY-MM-DD) to check availability.'
      });
    }

    // 1. Fetch Doctor details
    const doctors = await query('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    const doctor = doctors[0];

    // Standard clinical appointment slot templates (09:00 to 16:30)
    const standardSlots = [
      '09:00:00', '09:30:00', '10:00:00', '10:30:00',
      '11:00:00', '11:30:00', '14:00:00', '14:30:00',
      '15:00:00', '15:30:00', '16:00:00', '16:30:00'
    ];

    // 2. Fetch existing active appointments for this doctor on the selected date
    const bookedAppointments = await query(
      "SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'",
      [id, date]
    );

    const bookedTimes = bookedAppointments.map(a => a.appointment_time.substring(0, 5));

    // 3. Mark slot availability
    const slots = standardSlots.map(timeStr => {
      const shortTime = timeStr.substring(0, 5);
      const isBooked = bookedTimes.includes(shortTime);
      return {
        time: timeStr,
        display_time: formatDisplayTime(shortTime),
        available: !isBooked
      };
    });

    return res.status(200).json({
      success: true,
      doctor_id: parseInt(id, 10),
      date,
      slots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to format 24h to 12h AM/PM
 */
function formatDisplayTime(time24) {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${period}`;
}

/**
 * Create Doctor Profile & Account (Admin Only)
 */
const createDoctor = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, department_id, specialization, experience_years, consultation_fee, availability_days, room_number, bio } = req.body;

    if (!full_name || !email || !phone || !department_id || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, department, and specialization are required.'
      });
    }

    // Check email uniqueness
    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Default password or supplied password
    const rawPassword = password || 'Doctor@123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(rawPassword, salt);

    const avatar_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250';

    // 1. Create User
    const userRes = await query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name.trim(), email.toLowerCase().trim(), phone.trim(), password_hash, 'doctor', avatar_url]
    );

    const userId = userRes.insertId;

    // 2. Create Doctor entry
    const docRes = await query(
      `INSERT INTO doctors (user_id, department_id, specialization, experience_years, consultation_fee, availability_days, available_time_start, available_time_end, room_number, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        parseInt(department_id, 10),
        specialization.trim(),
        parseInt(experience_years, 10) || 1,
        parseFloat(consultation_fee) || 50.00,
        availability_days || 'Mon, Tue, Wed, Thu, Fri',
        '09:00:00',
        '17:00:00',
        room_number || '101',
        bio || ''
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Doctor created successfully.',
      doctor_id: docRes.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Doctor Profile
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, department_id, specialization, experience_years, consultation_fee, availability_days, room_number, bio, is_active } = req.body;

    const docRows = await query('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!docRows || docRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const doctor = docRows[0];

    // Authorization check: Admin or the Doctor themselves
    if (req.user.role === 'doctor' && req.user.doctor_id !== parseInt(id, 10)) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only edit your own doctor profile.' });
    }

    // Update users table name/phone if provided
    if (full_name || phone) {
      await query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name ? full_name.trim() : null, phone ? phone.trim() : null, doctor.user_id]
      );
    }

    // Update doctors table
    await query(
      `UPDATE doctors SET 
        department_id = COALESCE(?, department_id),
        specialization = COALESCE(?, specialization),
        experience_years = COALESCE(?, experience_years),
        consultation_fee = COALESCE(?, consultation_fee),
        availability_days = COALESCE(?, availability_days),
        room_number = COALESCE(?, room_number),
        bio = COALESCE(?, bio),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        department_id ? parseInt(department_id, 10) : null,
        specialization,
        experience_years ? parseInt(experience_years, 10) : null,
        consultation_fee ? parseFloat(consultation_fee) : null,
        availability_days,
        room_number,
        bio,
        is_active !== undefined ? is_active : null,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Deactivate Doctor (Admin Only)
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctors = await query('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Soft-deactivate or delete
    await query('DELETE FROM doctors WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Doctor removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
