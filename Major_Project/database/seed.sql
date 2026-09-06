-- ==========================================================
-- MediLink – Healthcare & Clinic Management System
-- Database Seed Data (MySQL)
-- iNeuBytes Major Project
-- ==========================================================

USE medilink_db;

-- 1. Seed Departments
INSERT INTO departments (id, name, code, icon, description, head_doctor) VALUES
(1, 'Cardiology', 'CARD-01', 'heart-pulse', 'Comprehensive cardiovascular diagnosis, advanced echocardiography, interventional cardiology, and heart rhythm management.', 'Dr. Sarah Mitchell'),
(2, 'Neurology', 'NEUR-02', 'brain', 'Specialized neurological assessments, stroke rehabilitation, migraine clinic, and central nervous system therapeutics.', 'Dr. David Chen'),
(3, 'Pediatrics', 'PEDI-03', 'baby', 'Dedicated neonatal, infant, and adolescent child healthcare, developmental tracking, and pediatric immunizations.', 'Dr. Elena Rostova'),
(4, 'Orthopedics', 'ORTH-04', 'bone', 'Advanced joint replacement, sports injury rehabilitation, arthroscopic surgery, and spine disorders management.', 'Dr. Marcus Vance'),
(5, 'Dermatology', 'DERM-05', 'sparkles', 'Clinical dermatology, cosmetic laser treatments, skin cancer screenings, and chronic eczema/psoriasis management.', 'Dr. Priya Sharma'),
(6, 'General Medicine', 'GENM-06', 'stethoscope', 'Primary health consultations, preventive screenings, chronic disease management, and family medicine services.', 'Dr. James Wilson')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Users (Admin, Doctors, Patients)
-- Note: Pre-hashed bcrypt passwords:
-- Admin:   Admin@123   ($2a$10$tZ2R8q9mZ.. bcrypt hash)
-- Doctor:  Doctor@123  ($2a$10$tZ2R8q9mZ.. bcrypt hash)
-- Patient: Patient@123 ($2a$10$tZ2R8q9mZ.. bcrypt hash)
INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar_url) VALUES
(1, 'Dr. Arthur Kingsley (Admin)', 'admin@medilink.com', '+1 (555) 019-2834', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'admin', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250'),
(2, 'Dr. Sarah Mitchell', 'dr.sarah@medilink.com', '+1 (555) 019-5481', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'doctor', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'),
(3, 'Dr. David Chen', 'dr.david@medilink.com', '+1 (555) 019-9238', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'doctor', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'),
(4, 'Dr. Elena Rostova', 'dr.elena@medilink.com', '+1 (555) 019-6127', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'doctor', 'https://images.unsplash.com/photo-1594824813591-9a74b0f44359?auto=format&fit=crop&q=80&w=250'),
(5, 'Dr. Marcus Vance', 'dr.marcus@medilink.com', '+1 (555) 019-7744', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'doctor', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250'),
(6, 'Dr. Priya Sharma', 'dr.priya@medilink.com', '+1 (555) 019-3390', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'doctor', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'),
(7, 'Dr. James Wilson', 'dr.james@medilink.com', '+1 (555) 019-4821', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'doctor', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'),
(8, 'John Doe', 'john.doe@medilink.com', '+1 (555) 012-3456', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'patient', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
(9, 'Emily Watson', 'emily.watson@medilink.com', '+1 (555) 012-7890', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'patient', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'),
(10, 'Michael Chang', 'michael.c@medilink.com', '+1 (555) 012-4411', '$2a$10$Y1s5MvM3c4u8W1g8a9v6.eh8d1f7e4b2a5c8d7e9f1a2b3c4d5e6f', 'patient', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Seed Doctors Profile
INSERT INTO doctors (id, user_id, department_id, specialization, experience_years, consultation_fee, availability_days, available_time_start, available_time_end, room_number, bio) VALUES
(1, 2, 1, 'Consultant Cardiologist & Heart Specialist', 14, 90.00, 'Mon, Tue, Wed, Thu, Fri', '09:00:00', '16:30:00', 'Wing A - 302', 'Board-certified cardiologist specializing in preventive cardiology, coronary artery disease management, and cardiac imaging.'),
(2, 3, 2, 'Senior Neurologist & Stroke Consultant', 12, 95.00, 'Mon, Tue, Thu, Fri', '10:00:00', '17:00:00', 'Wing B - 405', 'Extensive fellowship training in neurophysiology, neuromuscular disorders, epilepsy management, and chronic migraine therapies.'),
(3, 4, 3, 'Chief Pediatrician & Child Health Specialist', 10, 75.00, 'Mon, Wed, Thu, Fri, Sat', '08:30:00', '15:30:00', 'Wing C - 108', 'Passionate child health advocate with extensive background in neonatal intensive care and pediatric developmental milestones.'),
(4, 5, 4, 'Orthopedic Surgeon & Sports Medicine', 16, 110.00, 'Tue, Wed, Thu, Fri', '09:30:00', '16:00:00', 'Wing D - 210', 'Recognized orthopedic surgeon with over 2,000 successful arthroscopic and joint reconstruction procedures.'),
(5, 6, 5, 'Consultant Dermatologist & Aesthetician', 9, 80.00, 'Mon, Tue, Wed, Sat', '10:00:00', '18:00:00', 'Wing E - 114', 'Expertise in clinical dermatology, acne therapies, pediatric dermatology, and non-invasive dermatological cosmetic treatments.'),
(6, 7, 6, 'Internal Medicine & Family Physician', 11, 65.00, 'Mon, Tue, Wed, Thu, Fri', '08:00:00', '16:00:00', 'Wing A - 101', 'Dedicated primary care physician focusing on holistic wellness, diabetes management, geriatric health, and lifestyle intervention.')
ON DUPLICATE KEY UPDATE specialization=VALUES(specialization);

-- 4. Seed Patients Profile
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history) VALUES
(1, 8, '1992-05-14', 'Male', 'O+', '742 Evergreen Terrace, Springfield, OR', '+1 (555) 998-1122 (Jane Doe - Spouse)', 'Mild seasonal allergies. No history of surgical operations. Blood pressure normal.'),
(2, 9, '1988-11-23', 'Female', 'A+', '124 Conch Street, Pacific Grove, CA', '+1 (555) 887-2233 (Robert Watson - Father)', 'Past history of migraine. Prescribed sumatriptan as needed. Non-smoker.'),
(3, 10, '1995-02-18', 'Male', 'B+', '404 Innovation Way, Austin, TX', '+1 (555) 776-3344 (Sarah Chang - Sister)', 'Knee ligament strain in 2023. Undergoing physical rehabilitation.')
ON DUPLICATE KEY UPDATE address=VALUES(address);

-- 5. Seed Appointments
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status, consultation_notes, prescription) VALUES
(1, 1, 1, 1, '2026-09-12', '10:00:00', 'Routine annual cardiovascular checkup and ECG review.', 'Confirmed', 'Patient reports mild fatigue after heavy workouts. Baseline ECG scheduled for review.', 'Maintain low-sodium diet and stay well hydrated.'),
(2, 1, 2, 2, '2026-08-20', '11:30:00', 'Recurring tension headaches and neck stiffness.', 'Completed', 'Physical exam unremarkable. Diagnosed with occupational tension headache from desk posture.', 'Ergonomic adjustments + Magnesium glycinate 400mg daily at bedtime.'),
(3, 2, 5, 5, '2026-09-15', '14:00:00', 'Skin rash evaluation on forearm.', 'Pending', NULL, NULL),
(4, 3, 4, 4, '2026-09-18', '09:30:00', 'Follow-up consultation for right knee arthroscopy rehab.', 'Confirmed', 'Progressing nicely through stage 2 physical therapy.', 'Continue eccentric quad strengthening 3x weekly.')
ON DUPLICATE KEY UPDATE status=VALUES(status);
