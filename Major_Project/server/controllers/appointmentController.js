const { query } = require('../config/db');

/**
 * Get appointments with role-based filtering and search
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, date, doctor_id, patient_id, search } = req.query;
    const user = req.user;

    let sql = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, a.department_id,
        a.appointment_date, a.appointment_time, a.reason, a.status,
        a.consultation_notes, a.prescription, a.created_at, a.updated_at,
        
        -- Patient Info
        pu.full_name AS patient_name,
        pu.email AS patient_email,
        pu.phone AS patient_phone,
        pu.avatar_url AS patient_avatar,
        p.gender AS patient_gender,
        p.date_of_birth AS patient_dob,
        p.blood_group AS patient_blood_group,
        p.medical_history AS patient_medical_history,

        -- Doctor Info
        du.full_name AS doctor_name,
        du.email AS doctor_email,
        d.specialization AS doctor_specialization,
        d.consultation_fee AS doctor_fee,
        d.room_number,

        -- Department Info
        dept.name AS department_name,
        dept.code AS department_code,
        dept.icon AS department_icon

      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN departments dept ON a.department_id = dept.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based restrictions
    if (user.role === 'patient') {
      // Patients only see their own appointments
      sql += ' AND a.patient_id = ?';
      params.push(user.patient_id);
    } else if (user.role === 'doctor') {
      // Doctors only see their assigned appointments unless admin
      sql += ' AND a.doctor_id = ?';
      params.push(user.doctor_id);
    }

    // Query Filters
    if (status && status !== 'all') {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (doctor_id && user.role === 'admin') {
      sql += ' AND a.doctor_id = ?';
      params.push(parseInt(doctor_id, 10));
    }

    if (patient_id && (user.role === 'admin' || user.role === 'doctor')) {
      sql += ' AND a.patient_id = ?';
      params.push(parseInt(patient_id, 10));
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    let appointments = await query(sql, params);

    // In-memory text search filtering for patient/doctor names or reason
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      appointments = appointments.filter(app => 
        (app.patient_name && app.patient_name.toLowerCase().includes(q)) ||
        (app.doctor_name && app.doctor_name.toLowerCase().includes(q)) ||
        (app.department_name && app.department_name.toLowerCase().includes(q)) ||
        (app.reason && app.reason.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single appointment by ID
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const sql = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, a.department_id,
        a.appointment_date, a.appointment_time, a.reason, a.status,
        a.consultation_notes, a.prescription, a.created_at, a.updated_at,
        pu.full_name AS patient_name, pu.email AS patient_email, pu.phone AS patient_phone,
        p.gender AS patient_gender, p.date_of_birth AS patient_dob, p.blood_group AS patient_blood_group,
        p.medical_history AS patient_medical_history, p.emergency_contact AS patient_emergency,
        du.full_name AS doctor_name, du.email AS doctor_email,
        d.specialization AS doctor_specialization, d.consultation_fee AS doctor_fee, d.room_number,
        dept.name AS department_name, dept.code AS department_code
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN departments dept ON a.department_id = dept.id
      WHERE a.id = ?
    `;

    const rows = await query(sql, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const app = rows[0];

    // Authorization checks
    if (user.role === 'patient' && app.patient_id !== user.patient_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. Cannot view other patients appointments.' });
    }
    if (user.role === 'doctor' && app.doctor_id !== user.doctor_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. This appointment is not assigned to you.' });
    }

    return res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment with Conflict Prevention
 */
const createAppointment = async (req, res, next) => {
  try {
    const { doctor_id, department_id, appointment_date, appointment_time, reason, patient_id } = req.body;
    const user = req.user;

    // 1. Determine target patient ID
    let targetPatientId = user.patient_id;
    if (user.role === 'admin' && patient_id) {
      targetPatientId = parseInt(patient_id, 10);
    }

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: 'A valid patient profile is required to book an appointment.'
      });
    }

    // 2. Validate mandatory fields
    if (!doctor_id || !appointment_date || !appointment_time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, time slot, and reason for visit are required.'
      });
    }

    // 3. Validate Date (Prevent booking past dates)
    const today = new Date().toISOString().split('T')[0];
    if (appointment_date < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past.'
      });
    }

    // 4. Verify Doctor & Department
    const doctorRows = await query('SELECT * FROM doctors WHERE id = ? AND is_active = 1', [doctor_id]);
    if (!doctorRows || doctorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Selected doctor is not available or does not exist.'
      });
    }
    const doctor = doctorRows[0];
    const targetDeptId = department_id ? parseInt(department_id, 10) : doctor.department_id;

    // 5. DOUBLE-BOOKING CONFLICT PREVENTION ENGINE:
    // Check if the doctor already has an active appointment at that date & time
    const conflicts = await query(
      "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'",
      [doctor_id, appointment_date, appointment_time]
    );

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Booking Conflict: Dr. is already booked for ${appointment_date} at ${appointment_time.substring(0, 5)}. Please select another time slot.`
      });
    }

    // Check if the patient already has an appointment at that same date & time
    const patientConflicts = await query(
      "SELECT id FROM appointments WHERE patient_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'",
      [targetPatientId, appointment_date, appointment_time]
    );

    if (patientConflicts && patientConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Schedule Conflict: You already have an active appointment scheduled on ${appointment_date} at ${appointment_time.substring(0, 5)}.`
      });
    }

    // 6. Insert Appointment Record
    const result = await query(
      'INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [targetPatientId, doctor_id, targetDeptId, appointment_date, appointment_time, reason.trim(), 'Confirmed']
    );

    // 7. Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'BOOK_APPOINTMENT', `Booked appointment #${result.insertId} with doctor #${doctor_id} on ${appointment_date}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment_id: result.insertId,
      reference_code: `MED-${String(result.insertId).padStart(5, '0')}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Appointment Status & Consultation Notes (Doctor & Admin)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, consultation_notes, prescription } = req.body;
    const user = req.user;

    const existing = await query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const app = existing[0];

    // Authorization
    if (user.role === 'doctor' && app.doctor_id !== user.doctor_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not assigned to this appointment.' });
    }

    // Validate Status Transitions
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    await query(
      'UPDATE appointments SET status = COALESCE(?, status), consultation_notes = COALESCE(?, consultation_notes), prescription = COALESCE(?, prescription) WHERE id = ?',
      [status || null, consultation_notes || null, prescription || null, id]
    );

    return res.status(200).json({
      success: true,
      message: `Appointment #${id} updated successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Appointment (Patient, Doctor, Admin)
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const existing = await query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const app = existing[0];

    if (user.role === 'patient' && app.patient_id !== user.patient_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. Cannot cancel appointments of other patients.' });
    }
    if (user.role === 'doctor' && app.doctor_id !== user.doctor_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not assigned to this appointment.' });
    }

    await query("UPDATE appointments SET status = 'Cancelled' WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: `Appointment #${id} has been cancelled.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Appointment (Admin Only)
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM appointments WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Appointment record deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment
};
