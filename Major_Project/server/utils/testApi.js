const http = require('http');

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('       MEDILINK AUTOMATED REST API TEST SUITE        ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('[1/12] Testing Health Check endpoint...');
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data.status === 'online', 'GET /api/health returned 200 online');

    // 2. Auth Login Admin
    console.log('\n[2/12] Testing Admin Login...');
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@medilink.com',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login succeeded with JWT token');
    const adminToken = adminLogin.data.token;

    // 3. Auth Login Doctor
    console.log('\n[3/12] Testing Doctor Login...');
    const docLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'dr.sarah@medilink.com',
      password: 'Doctor@123'
    });
    assert(docLogin.status === 200 && docLogin.data.user.role === 'doctor', 'Doctor login succeeded with role="doctor"');
    const docToken = docLogin.data.token;

    // 4. Auth Login Patient
    console.log('\n[4/12] Testing Patient Login...');
    const patLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'john.doe@medilink.com',
      password: 'Patient@123'
    });
    assert(patLogin.status === 200 && patLogin.data.user.role === 'patient', 'Patient login succeeded with role="patient"');
    const patToken = patLogin.data.token;

    // 5. Auth Invalid Login
    console.log('\n[5/12] Testing Invalid Credentials...');
    const invalidLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'john.doe@medilink.com',
      password: 'WrongPassword'
    });
    assert(invalidLogin.status === 401, 'Invalid login rejected with 401 Unauthorized');

    // 6. Patient Registration
    console.log('\n[6/12] Testing New Patient Registration...');
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      full_name: 'Test Patient User',
      email: `testpatient.${Date.now()}@example.com`,
      phone: '+1 (555) 012-7788',
      password: 'Password@123',
      confirm_password: 'Password@123',
      role: 'patient',
      gender: 'Female',
      blood_group: 'B+'
    });
    assert(regRes.status === 201 && regRes.data.token, 'Patient registration succeeded with 201 Created and JWT');
    const newPatToken = regRes.data.token;

    // 7. Doctors List & Search & Slots
    console.log('\n[7/12] Testing Doctor Browsing & Availability Slots...');
    const docs = await makeRequest('/api/doctors?department_id=1');
    assert(docs.status === 200 && docs.data.data.length > 0, `GET /api/doctors returned ${docs.data.data.length} doctors for Cardiology`);

    const slots = await makeRequest('/api/doctors/1/availability?date=2026-09-25');
    assert(slots.status === 200 && slots.data && Array.isArray(slots.data.slots), `Doctor availability slots returned ${slots.data && slots.data.slots ? slots.data.slots.length : 0} time slots`);

    // 8. Appointment Booking Engine
    console.log('\n[8/12] Testing Appointment Booking Engine...');
    const bookRes = await makeRequest('/api/appointments', 'POST', {
      doctor_id: 1,
      department_id: 1,
      appointment_date: '2026-09-25',
      appointment_time: '14:00:00',
      reason: 'Regular consultation and blood pressure evaluation'
    }, patToken);
    assert(bookRes.status === 201 && bookRes.data.appointment_id, `Appointment booked successfully (ID: #${bookRes.data.appointment_id})`);
    const newAppId = bookRes.data.appointment_id;

    // 9. Appointment Double-Booking Conflict Prevention Test
    console.log('\n[9/12] Testing Double-Booking Conflict Prevention...');
    const conflictRes = await makeRequest('/api/appointments', 'POST', {
      doctor_id: 1,
      department_id: 1,
      appointment_date: '2026-09-25',
      appointment_time: '14:00:00',
      reason: 'Attempting conflicting booking in same slot'
    }, newPatToken);
    assert(conflictRes.status === 409, 'Double-booking rejected with 409 Conflict status code');

    // 10. Role-Based Access Control (RBAC) Test
    console.log('\n[10/12] Testing RBAC Security Enforcements...');
    const unauthorizedAccess = await makeRequest('/api/analytics/dashboard', 'GET', null, patToken);
    assert(unauthorizedAccess.status === 403, 'Patient token blocked from /api/analytics/dashboard with 403 Forbidden');

    const authorizedAdmin = await makeRequest('/api/analytics/dashboard', 'GET', null, adminToken);
    assert(authorizedAdmin.status === 200 && authorizedAdmin.data.data.total_patients !== undefined, 'Admin token successfully accessed /api/analytics/dashboard');

    // 11. Doctor Updating Consultation Status & Notes
    console.log('\n[11/12] Testing Doctor Consultation Notes & Triage...');
    const triageRes = await makeRequest(`/api/appointments/${newAppId}/status`, 'PUT', {
      status: 'Completed',
      consultation_notes: 'Patient examined. BP 118/76. Clear heart sounds.',
      prescription: 'Hydration + routine daily vitamins.'
    }, docToken);
    assert(triageRes.status === 200, `Doctor updated appointment #${newAppId} status to Completed with clinical notes`);

    // 12. Analytics Reports
    console.log('\n[12/12] Testing Analytics Aggregation Reports...');
    const reports = await makeRequest('/api/analytics/reports', 'GET', null, adminToken);
    assert(reports.status === 200 && reports.data.data.appointments_by_status.length > 0, 'Analytics reports returned status breakdown data');

    console.log('\n====================================================');
    console.log(` API TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite Error:', err);
    process.exit(1);
  }
}

runTests();
