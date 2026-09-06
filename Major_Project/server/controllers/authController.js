const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'medilink_jwt_super_secret_key_2026_ineubytes_internship';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new User / Patient
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, confirm_password, role, date_of_birth, gender, blood_group, address, emergency_contact } = req.body;

    // 1. Validation
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and password.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // 2. Check if user already exists
    const existingUsers = await query('SELECT id, email FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please login.'
      });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = (role && ['patient', 'doctor', 'admin'].includes(role)) ? role : 'patient';
    const avatar_url = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`;

    // 4. Insert into users table
    const userResult = await query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name.trim(), email.toLowerCase().trim(), phone.trim(), password_hash, userRole, avatar_url]
    );

    const userId = userResult.insertId;

    // 5. If role is patient, insert into patients table
    let patientId = null;
    if (userRole === 'patient') {
      const patientResult = await query(
        'INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          date_of_birth || null,
          gender || 'Male',
          blood_group || 'O+',
          address || '',
          emergency_contact || '',
          'Newly registered patient'
        ]
      );
      patientId = patientResult.insertId;
    }

    // 6. Generate JWT token
    const tokenPayload = {
      id: userId,
      email: email.toLowerCase().trim(),
      role: userRole,
      full_name: full_name.trim(),
      patient_id: patientId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to MediLink!',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        role: userRole,
        avatar_url,
        patient_id: patientId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 1. Fetch user by email
    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // 2. Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Load role-specific IDs
    let patientId = null;
    let doctorId = null;

    if (user.role === 'patient') {
      const patients = await query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      if (patients && patients.length > 0) {
        patientId = patients[0].id;
      }
    } else if (user.role === 'doctor') {
      const doctors = await query('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors && doctors.length > 0) {
        doctorId = doctors[0].id;
      }
    }

    // 4. Generate JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      patient_id: patientId,
      doctor_id: doctorId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: `Login successful. Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        patient_id: patientId,
        doctor_id: doctorId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user details
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const users = await query('SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?', [userId]);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const user = users[0];
    let profileData = {};

    if (user.role === 'patient') {
      const patients = await query('SELECT * FROM patients WHERE user_id = ?', [userId]);
      if (patients && patients.length > 0) {
        profileData = patients[0];
      }
    } else if (user.role === 'doctor') {
      const doctors = await query(`
        SELECT d.*, dept.name AS department_name, dept.code AS department_code
        FROM doctors d
        LEFT JOIN departments dept ON d.department_id = dept.id
        WHERE d.user_id = ?
      `, [userId]);
      if (doctors && doctors.length > 0) {
        profileData = doctors[0];
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        profile: profileData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, date_of_birth, gender, blood_group, address, emergency_contact, medical_history, bio, specialization, room_number } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and phone are required.'
      });
    }

    // 1. Update users master table
    await query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name.trim(), phone.trim(), userId]);

    // 2. Update role-specific table
    if (req.user.role === 'patient') {
      const existingPat = await query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (existingPat && existingPat.length > 0) {
        await query(
          'UPDATE patients SET date_of_birth = ?, gender = ?, blood_group = ?, address = ?, emergency_contact = ?, medical_history = ? WHERE user_id = ?',
          [date_of_birth || null, gender || 'Male', blood_group || 'O+', address || '', emergency_contact || '', medical_history || '', userId]
        );
      } else {
        await query(
          'INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, date_of_birth || null, gender || 'Male', blood_group || 'O+', address || '', emergency_contact || '', medical_history || '']
        );
      }
    } else if (req.user.role === 'doctor') {
      await query(
        'UPDATE doctors SET specialization = COALESCE(?, specialization), room_number = COALESCE(?, room_number), bio = COALESCE(?, bio) WHERE user_id = ?',
        [specialization || null, room_number || null, bio || null, userId]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Password
 */
const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    const users = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  updatePassword,
  logout
};
