const { query } = require('../config/db');

/**
 * Get all patients with search filter (Admin and Doctor access)
 */
const getAllPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    let sql = `
      SELECT 
        p.id, p.user_id, p.date_of_birth, p.gender, p.blood_group,
        p.address, p.emergency_contact, p.medical_history, p.created_at,
        u.full_name, u.email, u.phone, u.avatar_url
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    let patients = await query(sql);

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      patients = patients.filter(pat => 
        pat.full_name.toLowerCase().includes(q) ||
        pat.email.toLowerCase().includes(q) ||
        pat.phone.includes(q) ||
        (pat.blood_group && pat.blood_group.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient by ID with full appointment and medical history
 */
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.id, p.user_id, p.date_of_birth, p.gender, p.blood_group,
        p.address, p.emergency_contact, p.medical_history, p.created_at,
        u.full_name, u.email, u.phone, u.avatar_url
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;

    const patients = await query(sql, [id]);

    if (!patients || patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.'
      });
    }

    const patient = patients[0];

    // Authorization: Admin, Doctor, or the patient themselves
    if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only view your own patient profile.'
      });
    }

    // Fetch appointment history
    const history = await query(`
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.reason, a.status,
        a.consultation_notes, a.prescription,
        u.full_name AS doctor_name, d.specialization AS doctor_specialization,
        dept.name AS department_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON a.department_id = dept.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...patient,
        appointments: history
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Patient Profile (Admin or Patient self)
 */
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, date_of_birth, gender, blood_group, address, emergency_contact, medical_history } = req.body;

    const patients = await query('SELECT * FROM patients WHERE id = ?', [id]);
    if (!patients || patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const patient = patients[0];

    if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id, 10)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Cannot update another patient profile.' });
    }

    if (full_name || phone) {
      await query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name ? full_name.trim() : null, phone ? phone.trim() : null, patient.user_id]
      );
    }

    await query(
      `UPDATE patients SET 
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group),
        address = COALESCE(?, address),
        emergency_contact = COALESCE(?, emergency_contact),
        medical_history = COALESCE(?, medical_history)
       WHERE id = ?`,
      [date_of_birth || null, gender || null, blood_group || null, address || null, emergency_contact || null, medical_history || null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Patient Record (Admin only)
 */
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patients = await query('SELECT * FROM patients WHERE id = ?', [id]);
    if (!patients || patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const patient = patients[0];
    await query('DELETE FROM users WHERE id = ?', [patient.user_id]);

    return res.status(200).json({
      success: true,
      message: 'Patient record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
