const bcrypt = require('bcryptjs');

// Pre-computed bcrypt hashes (10 rounds):
// Admin@123:   $2a$10$RzN4nS9fV.P9a2lXQd/t8.qRz0rUZZO4H5Uv5FfP9M2K6QcZ5N1x.
// Doctor@123:  $2a$10$9.0qS2qT1VwM2N3X4Y5Z6.7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O.
// Patient@123: $2a$10$v1B2C3D4E5F6G7H8I9J0K.1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6.

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const adminPasswordHash = hashPassword('Admin@123');
const doctorPasswordHash = hashPassword('Doctor@123');
const patientPasswordHash = hashPassword('Patient@123');

const departmentsData = [
  {
    name: 'Cardiology',
    code: 'CARD-01',
    icon: 'heart-pulse',
    description: 'Comprehensive cardiovascular diagnosis, advanced echocardiography, interventional cardiology, and heart rhythm management.',
    head_doctor: 'Dr. Sarah Mitchell'
  },
  {
    name: 'Neurology',
    code: 'NEUR-02',
    icon: 'brain',
    description: 'Specialized neurological assessments, stroke rehabilitation, migraine clinic, and central nervous system therapeutics.',
    head_doctor: 'Dr. David Chen'
  },
  {
    name: 'Pediatrics',
    code: 'PEDI-03',
    icon: 'baby',
    description: 'Dedicated neonatal, infant, and adolescent child healthcare, developmental tracking, and pediatric immunizations.',
    head_doctor: 'Dr. Elena Rostova'
  },
  {
    name: 'Orthopedics',
    code: 'ORTH-04',
    icon: 'bone',
    description: 'Advanced joint replacement, sports injury rehabilitation, arthroscopic surgery, and spine disorders management.',
    head_doctor: 'Dr. Marcus Vance'
  },
  {
    name: 'Dermatology',
    code: 'DERM-05',
    icon: 'sparkles',
    description: 'Clinical dermatology, cosmetic laser treatments, skin cancer screenings, and chronic eczema/psoriasis management.',
    head_doctor: 'Dr. Priya Sharma'
  },
  {
    name: 'General Medicine',
    code: 'GENM-06',
    icon: 'stethoscope',
    description: 'Primary health consultations, preventive screenings, chronic disease management, and family medicine services.',
    head_doctor: 'Dr. James Wilson'
  }
];

const usersData = [
  // Admin Demo Account
  {
    full_name: 'Dr. Arthur Kingsley (Admin)',
    email: 'admin@medilink.com',
    phone: '+1 (555) 019-2834',
    password_hash: adminPasswordHash,
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250'
  },
  // Doctor Demo Accounts
  {
    full_name: 'Dr. Sarah Mitchell',
    email: 'dr.sarah@medilink.com',
    phone: '+1 (555) 019-5481',
    password_hash: doctorPasswordHash,
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Dr. David Chen',
    email: 'dr.david@medilink.com',
    phone: '+1 (555) 019-9238',
    password_hash: doctorPasswordHash,
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Dr. Elena Rostova',
    email: 'dr.elena@medilink.com',
    phone: '+1 (555) 019-6127',
    password_hash: doctorPasswordHash,
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1594824813591-9a74b0f44359?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Dr. Marcus Vance',
    email: 'dr.marcus@medilink.com',
    phone: '+1 (555) 019-7744',
    password_hash: doctorPasswordHash,
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Dr. Priya Sharma',
    email: 'dr.priya@medilink.com',
    phone: '+1 (555) 019-3390',
    password_hash: doctorPasswordHash,
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Dr. James Wilson',
    email: 'dr.james@medilink.com',
    phone: '+1 (555) 019-4821',
    password_hash: doctorPasswordHash,
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'
  },
  // Patient Demo Accounts
  {
    full_name: 'John Doe',
    email: 'john.doe@medilink.com',
    phone: '+1 (555) 012-3456',
    password_hash: patientPasswordHash,
    role: 'patient',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Emily Watson',
    email: 'emily.watson@medilink.com',
    phone: '+1 (555) 012-7890',
    password_hash: patientPasswordHash,
    role: 'patient',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'
  },
  {
    full_name: 'Michael Chang',
    email: 'michael.c@medilink.com',
    phone: '+1 (555) 012-4411',
    password_hash: patientPasswordHash,
    role: 'patient',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  }
];

const doctorsData = [
  {
    user_email: 'dr.sarah@medilink.com',
    department_code: 'CARD-01',
    specialization: 'Consultant Cardiologist & Heart Specialist',
    experience_years: 14,
    consultation_fee: 90.00,
    availability_days: 'Mon, Tue, Wed, Thu, Fri',
    available_time_start: '09:00:00',
    available_time_end: '16:30:00',
    room_number: 'Wing A - 302',
    bio: 'Board-certified cardiologist specializing in preventive cardiology, coronary artery disease management, hypertension control, and cardiac imaging.'
  },
  {
    user_email: 'dr.david@medilink.com',
    department_code: 'NEUR-02',
    specialization: 'Senior Neurologist & Stroke Consultant',
    experience_years: 12,
    consultation_fee: 95.00,
    availability_days: 'Mon, Tue, Thu, Fri',
    available_time_start: '10:00:00',
    available_time_end: '17:00:00',
    room_number: 'Wing B - 405',
    bio: 'Extensive fellowship training in neurophysiology, neuromuscular disorders, epilepsy management, and chronic migraine therapies.'
  },
  {
    user_email: 'dr.elena@medilink.com',
    department_code: 'PEDI-03',
    specialization: 'Chief Pediatrician & Child Health Specialist',
    experience_years: 10,
    consultation_fee: 75.00,
    availability_days: 'Mon, Wed, Thu, Fri, Sat',
    available_time_start: '08:30:00',
    available_time_end: '15:30:00',
    room_number: 'Wing C - 108',
    bio: 'Passionate child health advocate with extensive background in neonatal intensive care, pediatric allergy treatments, and developmental milestones.'
  },
  {
    user_email: 'dr.marcus@medilink.com',
    department_code: 'ORTH-04',
    specialization: 'Orthopedic Surgeon & Sports Medicine',
    experience_years: 16,
    consultation_fee: 110.00,
    availability_days: 'Tue, Wed, Thu, Fri',
    available_time_start: '09:30:00',
    available_time_end: '16:00:00',
    room_number: 'Wing D - 210',
    bio: 'Recognized orthopedic surgeon with over 2,000 successful arthroscopic and joint reconstruction procedures. Team physician for regional athletic clubs.'
  },
  {
    user_email: 'dr.priya@medilink.com',
    department_code: 'DERM-05',
    specialization: 'Consultant Dermatologist & Aesthetician',
    experience_years: 9,
    consultation_fee: 80.00,
    availability_days: 'Mon, Tue, Wed, Sat',
    available_time_start: '10:00:00',
    available_time_end: '18:00:00',
    room_number: 'Wing E - 114',
    bio: 'Expertise in clinical dermatology, acne therapies, pediatric dermatology, and non-invasive dermatological cosmetic treatments.'
  },
  {
    user_email: 'dr.james@medilink.com',
    department_code: 'GENM-06',
    specialization: 'Internal Medicine & Family Physician',
    experience_years: 11,
    consultation_fee: 65.00,
    availability_days: 'Mon, Tue, Wed, Thu, Fri',
    available_time_start: '08:00:00',
    available_time_end: '16:00:00',
    room_number: 'Wing A - 101',
    bio: 'Dedicated primary care physician focusing on holistic wellness, diabetes management, geriatric health, and lifestyle intervention plans.'
  }
];

const patientsData = [
  {
    user_email: 'john.doe@medilink.com',
    date_of_birth: '1992-05-14',
    gender: 'Male',
    blood_group: 'O+',
    address: '742 Evergreen Terrace, Springfield, OR',
    emergency_contact: '+1 (555) 998-1122 (Jane Doe - Spouse)',
    medical_history: 'Mild seasonal allergies. No history of surgical operations. Blood pressure normal.'
  },
  {
    user_email: 'emily.watson@medilink.com',
    date_of_birth: '1988-11-23',
    gender: 'Female',
    blood_group: 'A+',
    address: '124 Conch Street, Pacific Grove, CA',
    emergency_contact: '+1 (555) 887-2233 (Robert Watson - Father)',
    medical_history: 'Past history of migraine. Prescribed sumatriptan as needed. Non-smoker.'
  },
  {
    user_email: 'michael.c@medilink.com',
    date_of_birth: '1995-02-18',
    gender: 'Male',
    blood_group: 'B+',
    address: '404 Innovation Way, Austin, TX',
    emergency_contact: '+1 (555) 776-3344 (Sarah Chang - Sister)',
    medical_history: 'Knee ligament strain in 2023. Undergoing physical rehabilitation.'
  }
];

const appointmentsData = [
  {
    patient_email: 'john.doe@medilink.com',
    doctor_email: 'dr.sarah@medilink.com',
    department_code: 'CARD-01',
    appointment_date: '2026-09-12',
    appointment_time: '10:00:00',
    reason: 'Routine annual cardiovascular checkup and ECG review.',
    status: 'Confirmed',
    consultation_notes: 'Patient reports mild fatigue after heavy workouts. Baseline ECG scheduled for review.',
    prescription: 'Maintain low-sodium diet and stay well hydrated.'
  },
  {
    patient_email: 'john.doe@medilink.com',
    doctor_email: 'dr.david@medilink.com',
    department_code: 'NEUR-02',
    appointment_date: '2026-08-20',
    appointment_time: '11:30:00',
    reason: 'Recurring tension headaches and neck stiffness.',
    status: 'Completed',
    consultation_notes: 'Physical exam unremarkable. Diagnosed with occupational tension headache from desk posture.',
    prescription: 'Ergonomic adjustments + Magnesium glycinate 400mg daily at bedtime.'
  },
  {
    patient_email: 'emily.watson@medilink.com',
    doctor_email: 'dr.priya@medilink.com',
    department_code: 'DERM-05',
    appointment_date: '2026-09-15',
    appointment_time: '14:00:00',
    reason: 'Skin rash evaluation on forearm.',
    status: 'Pending',
    consultation_notes: null,
    prescription: null
  },
  {
    patient_email: 'michael.c@medilink.com',
    doctor_email: 'dr.marcus@medilink.com',
    department_code: 'ORTH-04',
    appointment_date: '2026-09-18',
    appointment_time: '09:30:00',
    reason: 'Follow-up consultation for right knee arthroscopy rehab.',
    status: 'Confirmed',
    consultation_notes: 'Progressing nicely through stage 2 physical therapy.',
    prescription: 'Continue eccentric quad strengthening 3x weekly.'
  }
];

module.exports = {
  adminPasswordHash,
  doctorPasswordHash,
  patientPasswordHash,
  departmentsData,
  usersData,
  doctorsData,
  patientsData,
  appointmentsData
};
