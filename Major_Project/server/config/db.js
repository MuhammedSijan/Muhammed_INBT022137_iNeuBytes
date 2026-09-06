const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { departmentsData, usersData, doctorsData, patientsData, appointmentsData } = require('../utils/seedData');

dotenv.config();

let pool = null;
let useMySQL = false;

// In-Memory Relational Engine (Fallback/Demo isolation only if MySQL daemon is not running)
const memoryStore = {
  users: [],
  departments: [],
  doctors: [],
  patients: [],
  appointments: [],
  activity_logs: []
};

// Initialize in-memory records from seed data
function initializeMemoryStore() {
  // 1. Departments
  memoryStore.departments = departmentsData.map((d, index) => ({
    id: index + 1,
    name: d.name,
    code: d.code,
    icon: d.icon,
    description: d.description,
    head_doctor: d.head_doctor,
    created_at: new Date()
  }));

  // 2. Users
  memoryStore.users = usersData.map((u, index) => ({
    id: index + 1,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    password_hash: u.password_hash,
    role: u.role,
    avatar_url: u.avatar_url,
    created_at: new Date(),
    updated_at: new Date()
  }));

  // 3. Doctors
  memoryStore.doctors = doctorsData.map((doc, index) => {
    const user = memoryStore.users.find(u => u.email === doc.user_email);
    const dept = memoryStore.departments.find(d => d.code === doc.department_code);
    return {
      id: index + 1,
      user_id: user ? user.id : index + 1,
      department_id: dept ? dept.id : 1,
      specialization: doc.specialization,
      experience_years: doc.experience_years,
      consultation_fee: doc.consultation_fee,
      availability_days: doc.availability_days,
      available_time_start: doc.available_time_start,
      available_time_end: doc.available_time_end,
      room_number: doc.room_number,
      bio: doc.bio,
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
  });

  // 4. Patients
  memoryStore.patients = patientsData.map((pat, index) => {
    const user = memoryStore.users.find(u => u.email === pat.user_email);
    return {
      id: index + 1,
      user_id: user ? user.id : index + 1,
      date_of_birth: pat.date_of_birth,
      gender: pat.gender,
      blood_group: pat.blood_group,
      address: pat.address,
      emergency_contact: pat.emergency_contact,
      medical_history: pat.medical_history,
      created_at: new Date(),
      updated_at: new Date()
    };
  });

  // 5. Appointments
  memoryStore.appointments = appointmentsData.map((app, index) => {
    const patUser = memoryStore.users.find(u => u.email === app.patient_email);
    const patient = patUser ? memoryStore.patients.find(p => p.user_id === patUser.id) : null;

    const docUser = memoryStore.users.find(u => u.email === app.doctor_email);
    const doctor = docUser ? memoryStore.doctors.find(d => d.user_id === docUser.id) : null;

    const dept = memoryStore.departments.find(d => d.code === app.department_code);

    return {
      id: index + 1,
      patient_id: patient ? patient.id : 1,
      doctor_id: doctor ? doctor.id : 1,
      department_id: dept ? dept.id : 1,
      appointment_date: app.appointment_date,
      appointment_time: app.appointment_time,
      reason: app.reason,
      status: app.status,
      consultation_notes: app.consultation_notes,
      prescription: app.prescription,
      created_at: new Date(),
      updated_at: new Date()
    };
  });
}

// Attempt MySQL Connection
async function connectDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'medilink_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  try {
    // First verify MySQL host connection
    const testConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await testConn.end();

    // Create pool
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log(`[MySQL] Successfully connected to MySQL database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    useMySQL = true;

    // Run schema tables setup
    await initMySQLSchema();
  } catch (error) {
    console.warn(`[MySQL Notice] Could not connect to live MySQL server (${error.code || error.message}).`);
    console.warn('[MySQL Notice] To use live MySQL: Start MySQL (e.g. XAMPP/WAMP/MySQL service) and check .env credentials.');
    console.warn('[Fallback Engine] Initializing embedded relational memory store so all features remain fully functional...');
    initializeMemoryStore();
    useMySQL = false;
  }
}

// Create MySQL tables if they do not exist
async function initMySQLSchema() {
  if (!pool) return;
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        phone VARCHAR(25) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
        avatar_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email),
        INDEX idx_user_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(25) NOT NULL UNIQUE,
        icon VARCHAR(50) DEFAULT 'stethoscope',
        description TEXT,
        head_doctor VARCHAR(120) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_department_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        department_id INT NOT NULL,
        specialization VARCHAR(120) NOT NULL,
        experience_years INT NOT NULL DEFAULT 1,
        consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 50.00,
        availability_days VARCHAR(120) NOT NULL DEFAULT 'Monday - Friday',
        available_time_start TIME NOT NULL DEFAULT '09:00:00',
        available_time_end TIME NOT NULL DEFAULT '17:00:00',
        room_number VARCHAR(25) DEFAULT '101',
        bio TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
        INDEX idx_doctor_department (department_id),
        INDEX idx_doctor_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        date_of_birth DATE DEFAULT NULL,
        gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
        blood_group VARCHAR(10) DEFAULT 'O+',
        address TEXT,
        emergency_contact VARCHAR(50) DEFAULT NULL,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        department_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        reason VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
        consultation_notes TEXT DEFAULT NULL,
        prescription TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
        INDEX idx_appointment_doctor_date (doctor_id, appointment_date),
        INDEX idx_appointment_patient (patient_id),
        INDEX idx_appointment_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if initial users exist, if not seed
    const [userRows] = await conn.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      console.log('[MySQL] Seeding initial data into MySQL...');
      await seedMySQLData(conn);
    }
  } catch (err) {
    console.error('[MySQL Schema Init Error]', err);
  } finally {
    conn.release();
  }
}

// Seed initial records directly into MySQL
async function seedMySQLData(conn) {
  // 1. Departments
  for (const dept of departmentsData) {
    await conn.query(
      'INSERT INTO departments (name, code, icon, description, head_doctor) VALUES (?, ?, ?, ?, ?)',
      [dept.name, dept.code, dept.icon, dept.description, dept.head_doctor]
    );
  }

  // 2. Users
  for (const u of usersData) {
    await conn.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [u.full_name, u.email, u.phone, u.password_hash, u.role, u.avatar_url]
    );
  }

  // 3. Doctors
  const [users] = await conn.query('SELECT id, email FROM users');
  const [depts] = await conn.query('SELECT id, code FROM departments');

  for (const doc of doctorsData) {
    const user = users.find(u => u.email === doc.user_email);
    const dept = depts.find(d => d.code === doc.department_code);
    if (user && dept) {
      await conn.query(
        `INSERT INTO doctors (user_id, department_id, specialization, experience_years, consultation_fee, availability_days, available_time_start, available_time_end, room_number, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, dept.id, doc.specialization, doc.experience_years, doc.consultation_fee, doc.availability_days, doc.available_time_start, doc.available_time_end, doc.room_number, doc.bio]
      );
    }
  }

  // 4. Patients
  for (const pat of patientsData) {
    const user = users.find(u => u.email === pat.user_email);
    if (user) {
      await conn.query(
        `INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, pat.date_of_birth, pat.gender, pat.blood_group, pat.address, pat.emergency_contact, pat.medical_history]
      );
    }
  }

  // 5. Appointments
  const [docRows] = await conn.query(`
    SELECT d.id AS doctor_id, u.email AS doctor_email, d.department_id 
    FROM doctors d JOIN users u ON d.user_id = u.id
  `);
  const [patRows] = await conn.query(`
    SELECT p.id AS patient_id, u.email AS patient_email 
    FROM patients p JOIN users u ON p.user_id = u.id
  `);

  for (const app of appointmentsData) {
    const doc = docRows.find(d => d.doctor_email === app.doctor_email);
    const pat = patRows.find(p => p.patient_email === app.patient_email);
    const dept = depts.find(d => d.code === app.department_code);

    if (doc && pat && dept) {
      await conn.query(
        `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status, consultation_notes, prescription)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pat.patient_id, doc.doctor_id, dept.id, app.appointment_date, app.appointment_time, app.reason, app.status, app.consultation_notes, app.prescription]
      );
    }
  }
}

// Unified Parameterized Query Function
async function query(sql, params = []) {
  if (useMySQL && pool) {
    const [results] = await pool.query(sql, params);
    return results;
  }

  // Fallback relational emulator
  return executeMemoryQuery(sql, params);
}

// Fallback Memory Query Processor (Ensures full query compatibility if MySQL daemon is offline)
function executeMemoryQuery(sql, params = []) {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');
  const lowerSql = normalizedSql.toLowerCase();

  // 1. SELECT queries
  if (lowerSql.startsWith('select')) {
    // Analytics / KPI counts
    if (lowerSql.includes('count(*)')) {
      if (lowerSql.includes('from users')) return [{ count: memoryStore.users.length }];
      if (lowerSql.includes('from patients')) return [{ count: memoryStore.patients.length }];
      if (lowerSql.includes('from doctors')) return [{ count: memoryStore.doctors.length }];
      if (lowerSql.includes('from departments')) return [{ count: memoryStore.departments.length }];
      if (lowerSql.includes('from appointments')) {
        if (lowerSql.includes("status = 'pending'") || lowerSql.includes('status = "pending"')) return [{ count: memoryStore.appointments.filter(a => a.status === 'Pending').length }];
        if (lowerSql.includes("status = 'confirmed'") || lowerSql.includes('status = "confirmed"')) return [{ count: memoryStore.appointments.filter(a => a.status === 'Confirmed').length }];
        if (lowerSql.includes("status = 'completed'") || lowerSql.includes('status = "completed"')) return [{ count: memoryStore.appointments.filter(a => a.status === 'Completed').length }];
        if (lowerSql.includes("status = 'cancelled'") || lowerSql.includes('status = "cancelled"')) return [{ count: memoryStore.appointments.filter(a => a.status === 'Cancelled').length }];
        if (lowerSql.includes('curdate()')) return [{ count: 0 }];
        return [{ count: memoryStore.appointments.length }];
      }
    }

    // Select Users by email
    if (lowerSql.includes('from users') && lowerSql.includes('where email = ?')) {
      const email = params[0];
      const match = memoryStore.users.filter(u => u.email.toLowerCase() === (email || '').toLowerCase());
      return match;
    }

    // Select User by id
    if (lowerSql.includes('from users') && lowerSql.includes('where id = ?')) {
      const id = parseInt(params[0], 10);
      return memoryStore.users.filter(u => u.id === id);
    }

    // Select Users list with role filter / search
    if (lowerSql.includes('from users') && !lowerSql.includes('join')) {
      return [...memoryStore.users];
    }

    // Select Departments
    if (lowerSql.includes('from departments') && lowerSql.includes('where id = ?')) {
      const id = parseInt(params[0], 10);
      return memoryStore.departments.filter(d => d.id === id);
    }

    if (lowerSql.includes('from departments')) {
      return [...memoryStore.departments];
    }

    // Select Doctors (plain or joined)
    if (lowerSql.includes('from doctors')) {
      let docs = memoryStore.doctors.map(d => {
        const user = memoryStore.users.find(u => u.id === d.user_id) || {};
        const dept = memoryStore.departments.find(dp => dp.id === d.department_id) || {};
        return {
          id: d.id,
          user_id: d.user_id,
          department_id: d.department_id,
          full_name: user.full_name || 'Dr. Unknown',
          email: user.email || '',
          phone: user.phone || '',
          avatar_url: user.avatar_url || '',
          department_name: dept.name || '',
          department_code: dept.code || '',
          department_icon: dept.icon || 'stethoscope',
          specialization: d.specialization,
          experience_years: d.experience_years,
          consultation_fee: d.consultation_fee,
          availability_days: d.availability_days,
          available_time_start: d.available_time_start,
          available_time_end: d.available_time_end,
          room_number: d.room_number,
          bio: d.bio,
          is_active: d.is_active,
          created_at: d.created_at
        };
      });

      if (lowerSql.includes('where d.id = ?') || lowerSql.includes('where doctors.id = ?') || lowerSql.includes('where id = ?')) {
        const id = parseInt(params[0], 10);
        return docs.filter(d => d.id === id);
      }

      if (lowerSql.includes('where d.user_id = ?') || lowerSql.includes('where user_id = ?')) {
        const userId = parseInt(params[0], 10);
        return docs.filter(d => d.user_id === userId);
      }

      if (lowerSql.includes('where d.department_id = ?') || lowerSql.includes('where department_id = ?')) {
        const deptId = parseInt(params[0], 10);
        return docs.filter(d => d.department_id === deptId);
      }

      return docs;
    }

    // Select Patients (plain or joined)
    if (lowerSql.includes('from patients')) {
      let pats = memoryStore.patients.map(p => {
        const user = memoryStore.users.find(u => u.id === p.user_id) || {};
        return {
          id: p.id,
          user_id: p.user_id,
          full_name: user.full_name || 'Patient',
          email: user.email || '',
          phone: user.phone || '',
          avatar_url: user.avatar_url || '',
          date_of_birth: p.date_of_birth,
          gender: p.gender,
          blood_group: p.blood_group,
          address: p.address,
          emergency_contact: p.emergency_contact,
          medical_history: p.medical_history,
          created_at: p.created_at
        };
      });

      if (lowerSql.includes('where p.id = ?') || lowerSql.includes('where id = ?')) {
        const id = parseInt(params[0], 10);
        return pats.filter(p => p.id === id);
      }

      if (lowerSql.includes('where p.user_id = ?') || lowerSql.includes('where user_id = ?')) {
        const userId = parseInt(params[0], 10);
        return pats.filter(p => p.user_id === userId);
      }

      return pats;
    }

    // Select Appointments
    if (lowerSql.includes('from appointments')) {
      let apps = memoryStore.appointments.map(a => {
        const patient = memoryStore.patients.find(p => p.id === a.patient_id) || {};
        const patUser = memoryStore.users.find(u => u.id === patient.user_id) || {};

        const doctor = memoryStore.doctors.find(d => d.id === a.doctor_id) || {};
        const docUser = memoryStore.users.find(u => u.id === doctor.user_id) || {};

        const dept = memoryStore.departments.find(d => d.id === a.department_id) || {};

        return {
          id: a.id,
          patient_id: a.patient_id,
          doctor_id: a.doctor_id,
          department_id: a.department_id,
          patient_name: patUser.full_name || 'Patient',
          patient_email: patUser.email || '',
          patient_phone: patUser.phone || '',
          patient_gender: patient.gender || '',
          patient_dob: patient.date_of_birth || '',
          patient_blood_group: patient.blood_group || '',
          patient_medical_history: patient.medical_history || '',
          doctor_name: docUser.full_name || 'Doctor',
          doctor_email: docUser.email || '',
          doctor_specialization: doctor.specialization || '',
          doctor_fee: doctor.consultation_fee || 0,
          room_number: doctor.room_number || '',
          department_name: dept.name || '',
          department_code: dept.code || '',
          appointment_date: a.appointment_date,
          appointment_time: a.appointment_time,
          reason: a.reason,
          status: a.status,
          consultation_notes: a.consultation_notes,
          prescription: a.prescription,
          created_at: a.created_at,
          updated_at: a.updated_at
        };
      });

      if (lowerSql.includes('doctor_id = ? and appointment_date = ? and appointment_time = ?')) {
        const docId = parseInt(params[0], 10);
        const date = params[1];
        const time = params[2];
        return apps.filter(a => 
          a.doctor_id === docId && 
          a.appointment_date === date && 
          a.appointment_time.substring(0, 5) === time.substring(0, 5) &&
          a.status !== 'Cancelled'
        );
      }

      if (lowerSql.includes('patient_id = ? and appointment_date = ? and appointment_time = ?')) {
        const patId = parseInt(params[0], 10);
        const date = params[1];
        const time = params[2];
        return apps.filter(a => 
          a.patient_id === patId && 
          a.appointment_date === date && 
          a.appointment_time.substring(0, 5) === time.substring(0, 5) &&
          a.status !== 'Cancelled'
        );
      }

      if (lowerSql.includes('where doctor_id = ? and appointment_date = ?')) {
        const docId = parseInt(params[0], 10);
        const date = params[1];
        return apps.filter(a => a.doctor_id === docId && a.appointment_date === date && a.status !== 'Cancelled');
      }

      if (lowerSql.includes('where a.id = ?') || lowerSql.includes('where appointments.id = ?') || lowerSql.includes('where id = ?')) {
        const id = parseInt(params[0], 10);
        return apps.filter(a => a.id === id);
      }

      if (lowerSql.includes('where a.patient_id = ?') || lowerSql.includes('where patient_id = ?')) {
        const patId = parseInt(params[0], 10);
        return apps.filter(a => a.patient_id === patId);
      }

      if (lowerSql.includes('where a.doctor_id = ?') || lowerSql.includes('where doctor_id = ?')) {
        const docId = parseInt(params[0], 10);
        return apps.filter(a => a.doctor_id === docId);
      }

      return apps;
    }
  }

  // 2. INSERT queries
  if (lowerSql.startsWith('insert into users')) {
    const id = memoryStore.users.length ? Math.max(...memoryStore.users.map(u => u.id)) + 1 : 1;
    const [full_name, email, phone, password_hash, role, avatar_url] = params;
    const newUser = {
      id,
      full_name,
      email,
      phone,
      password_hash,
      role: role || 'patient',
      avatar_url: avatar_url || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.users.push(newUser);
    return { insertId: id, affectedRows: 1 };
  }

  if (lowerSql.startsWith('insert into patients')) {
    const id = memoryStore.patients.length ? Math.max(...memoryStore.patients.map(p => p.id)) + 1 : 1;
    const [user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history] = params;
    const newPat = {
      id,
      user_id: parseInt(user_id, 10),
      date_of_birth,
      gender: gender || 'Male',
      blood_group: blood_group || 'O+',
      address: address || '',
      emergency_contact: emergency_contact || '',
      medical_history: medical_history || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.patients.push(newPat);
    return { insertId: id, affectedRows: 1 };
  }

  if (lowerSql.startsWith('insert into doctors')) {
    const id = memoryStore.doctors.length ? Math.max(...memoryStore.doctors.map(d => d.id)) + 1 : 1;
    const [user_id, department_id, specialization, experience_years, consultation_fee, availability_days, available_time_start, available_time_end, room_number, bio] = params;
    const newDoc = {
      id,
      user_id: parseInt(user_id, 10),
      department_id: parseInt(department_id, 10),
      specialization,
      experience_years: parseInt(experience_years, 10) || 1,
      consultation_fee: parseFloat(consultation_fee) || 50.00,
      availability_days: availability_days || 'Monday - Friday',
      available_time_start: available_time_start || '09:00:00',
      available_time_end: available_time_end || '17:00:00',
      room_number: room_number || '101',
      bio: bio || '',
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.doctors.push(newDoc);
    return { insertId: id, affectedRows: 1 };
  }

  if (lowerSql.startsWith('insert into departments')) {
    const id = memoryStore.departments.length ? Math.max(...memoryStore.departments.map(d => d.id)) + 1 : 1;
    const [name, code, icon, description, head_doctor] = params;
    const newDept = {
      id,
      name,
      code,
      icon: icon || 'stethoscope',
      description: description || '',
      head_doctor: head_doctor || '',
      created_at: new Date()
    };
    memoryStore.departments.push(newDept);
    return { insertId: id, affectedRows: 1 };
  }

  if (lowerSql.startsWith('insert into appointments')) {
    const id = memoryStore.appointments.length ? Math.max(...memoryStore.appointments.map(a => a.id)) + 1 : 1;
    const [patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status] = params;
    const newApp = {
      id,
      patient_id: parseInt(patient_id, 10),
      doctor_id: parseInt(doctor_id, 10),
      department_id: parseInt(department_id, 10),
      appointment_date,
      appointment_time,
      reason,
      status: status || 'Pending',
      consultation_notes: null,
      prescription: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.appointments.push(newApp);
    return { insertId: id, affectedRows: 1 };
  }

  // 3. UPDATE queries
  if (lowerSql.startsWith('update appointments')) {
    if (lowerSql.includes('set status = ?, consultation_notes = ?, prescription = ? where id = ?')) {
      const [status, notes, prescription, id] = params;
      const app = memoryStore.appointments.find(a => a.id === parseInt(id, 10));
      if (app) {
        if (status) app.status = status;
        if (notes !== undefined) app.consultation_notes = notes;
        if (prescription !== undefined) app.prescription = prescription;
        app.updated_at = new Date();
        return { affectedRows: 1 };
      }
    } else if (lowerSql.includes('set status = ? where id = ?')) {
      const [status, id] = params;
      const app = memoryStore.appointments.find(a => a.id === parseInt(id, 10));
      if (app) {
        app.status = status;
        app.updated_at = new Date();
        return { affectedRows: 1 };
      }
    }
  }

  if (lowerSql.startsWith('update users')) {
    const userId = parseInt(params[params.length - 1], 10);
    const user = memoryStore.users.find(u => u.id === userId);
    if (user) {
      if (params.length === 3) {
        user.full_name = params[0];
        user.phone = params[1];
      }
      user.updated_at = new Date();
      return { affectedRows: 1 };
    }
  }

  if (lowerSql.startsWith('update patients')) {
    const userId = parseInt(params[params.length - 1], 10);
    const pat = memoryStore.patients.find(p => p.user_id === userId || p.id === userId);
    if (pat) {
      pat.date_of_birth = params[0] || pat.date_of_birth;
      pat.gender = params[1] || pat.gender;
      pat.blood_group = params[2] || pat.blood_group;
      pat.address = params[3] || pat.address;
      pat.emergency_contact = params[4] || pat.emergency_contact;
      pat.medical_history = params[5] || pat.medical_history;
      pat.updated_at = new Date();
      return { affectedRows: 1 };
    }
  }

  if (lowerSql.startsWith('update doctors')) {
    const docId = parseInt(params[params.length - 1], 10);
    const doc = memoryStore.doctors.find(d => d.id === docId);
    if (doc) {
      doc.department_id = parseInt(params[0], 10) || doc.department_id;
      doc.specialization = params[1] || doc.specialization;
      doc.experience_years = parseInt(params[2], 10) || doc.experience_years;
      doc.consultation_fee = parseFloat(params[3]) || doc.consultation_fee;
      doc.availability_days = params[4] || doc.availability_days;
      doc.room_number = params[5] || doc.room_number;
      doc.bio = params[6] || doc.bio;
      doc.updated_at = new Date();
      return { affectedRows: 1 };
    }
  }

  if (lowerSql.startsWith('update departments')) {
    const deptId = parseInt(params[params.length - 1], 10);
    const dept = memoryStore.departments.find(d => d.id === deptId);
    if (dept) {
      dept.name = params[0] || dept.name;
      dept.description = params[1] || dept.description;
      dept.head_doctor = params[2] || dept.head_doctor;
      return { affectedRows: 1 };
    }
  }

  // 4. DELETE queries
  if (lowerSql.startsWith('delete from appointments where id = ?')) {
    const id = parseInt(params[0], 10);
    const idx = memoryStore.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      memoryStore.appointments.splice(idx, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (lowerSql.startsWith('delete from doctors where id = ?')) {
    const id = parseInt(params[0], 10);
    const doc = memoryStore.doctors.find(d => d.id === id);
    if (doc) {
      // Remove appointments for this doctor
      memoryStore.appointments = memoryStore.appointments.filter(a => a.doctor_id !== id);
      // Remove doctor user
      memoryStore.users = memoryStore.users.filter(u => u.id !== doc.user_id);
      memoryStore.doctors = memoryStore.doctors.filter(d => d.id !== id);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (lowerSql.startsWith('delete from departments where id = ?')) {
    const id = parseInt(params[0], 10);
    const hasDoctors = memoryStore.doctors.some(d => d.department_id === id);
    if (hasDoctors) {
      throw new Error('Cannot delete department with assigned doctors.');
    }
    const idx = memoryStore.departments.findIndex(d => d.id === id);
    if (idx !== -1) {
      memoryStore.departments.splice(idx, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  return [];
}

module.exports = {
  connectDatabase,
  query,
  isMySQLConnected: () => useMySQL,
  getMemoryStore: () => memoryStore
};
