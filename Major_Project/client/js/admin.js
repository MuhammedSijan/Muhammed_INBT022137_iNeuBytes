/**
 * MediLink Admin Portal Operations
 */

async function loadAdminDashboard() {
  const user = api.getUser();
  if (!user || user.role !== 'admin') return;

  try {
    // 1. Fetch Dashboard KPI Summary
    const summaryRes = await api.get('/analytics/dashboard');
    const kpis = summaryRes.data || {};

    const patEl = document.getElementById('adminStatPatients');
    if (patEl) patEl.textContent = kpis.total_patients || 0;

    const docEl = document.getElementById('adminStatDoctors');
    if (docEl) docEl.textContent = kpis.total_doctors || 0;

    const deptEl = document.getElementById('adminStatDepts');
    if (deptEl) deptEl.textContent = kpis.total_departments || 0;

    const appEl = document.getElementById('adminStatAppts');
    if (appEl) appEl.textContent = kpis.total_appointments || 0;

    // 2. Fetch Analytics Breakdown Reports for Visual Charts
    const reportRes = await api.get('/analytics/reports');
    const reports = reportRes.data || {};

    renderStatusChart(reports.appointments_by_status || [], reports.total_records || 1);
    renderDepartmentChart(reports.appointments_by_department || [], reports.total_records || 1);
    renderDoctorWorkloadChart(reports.doctor_workload || [], reports.total_records || 1);

    // 3. Load Patients Table if container exists
    loadAdminPatientsTable();

    // 4. Load Appointments Table if container exists
    loadAdminAppointmentsTable();

  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Render Status Progress Bars Chart
function renderStatusChart(statusList, total) {
  const container = document.getElementById('statusChartContainer');
  if (!container) return;

  const colorMap = {
    Pending: 'fill-peach',
    Confirmed: 'fill-sky',
    Completed: 'fill-mint',
    Cancelled: 'fill-danger'
  };

  container.innerHTML = statusList.map(item => {
    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
    const colorClass = colorMap[item.status] || 'fill-lavender';
    return `
      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>${item.status}</span>
          <span>${item.count} (${pct}%)</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${colorClass}" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Department Distribution Chart
function renderDepartmentChart(deptList, total) {
  const container = document.getElementById('departmentChartContainer');
  if (!container) return;

  container.innerHTML = deptList.map(item => {
    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
    return `
      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>${item.department}</span>
          <span>${item.count} bookings (${pct}%)</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill fill-lavender" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Doctor Workload Chart
function renderDoctorWorkloadChart(doctorList, total) {
  const container = document.getElementById('doctorWorkloadContainer');
  if (!container) return;

  container.innerHTML = doctorList.map(item => {
    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
    return `
      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>${item.doctor}</span>
          <span>${item.count} consults</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill fill-mint" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Load Admin Patients Table
async function loadAdminPatientsTable() {
  const tableBody = document.getElementById('adminPatientsTable');
  if (!tableBody) return;

  try {
    const res = await api.get('/patients');
    const patients = res.data || [];

    if (patients.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No registered patients.</td></tr>`;
      return;
    }

    tableBody.innerHTML = patients.map(pat => `
      <tr>
        <td><strong>#${pat.id}</strong></td>
        <td>
          <div style="font-weight:600;">${pat.full_name}</div>
          <div style="font-size:0.78rem; color:#64748B;">${pat.email}</div>
        </td>
        <td>${pat.phone || 'N/A'}</td>
        <td>${pat.gender || 'N/A'} (${pat.blood_group || 'O+'})</td>
        <td><span style="font-size:0.85rem; color:#64748B;">${pat.emergency_contact || 'None'}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewPatientFullRecord(${pat.id})">Details</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Load Admin Appointments Table
async function loadAdminAppointmentsTable() {
  const tableBody = document.getElementById('adminAppointmentsTable');
  if (!tableBody) return;

  try {
    const res = await api.get('/appointments');
    const appointments = res.data || [];

    if (appointments.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94A3B8;">No appointments found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = appointments.map(app => `
      <tr>
        <td><strong>#${app.id}</strong></td>
        <td>
          <div style="font-weight:600;">${app.patient_name}</div>
          <div style="font-size:0.78rem; color:#64748B;">${app.patient_phone || ''}</div>
        </td>
        <td>
          <div style="font-weight:600;">${app.doctor_name}</div>
          <div style="font-size:0.78rem; color:#64748B;">${app.department_name}</div>
        </td>
        <td>
          <div>${app.appointment_date}</div>
          <div style="font-size:0.78rem; color:#64748B;">${formatTime(app.appointment_time)}</div>
        </td>
        <td><span class="badge badge-${app.status.toLowerCase()}">${app.status}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            ${app.status !== 'Cancelled' ? `<button class="btn btn-sm btn-secondary" style="color:#EF5350;" onclick="adminCancelAppointment(${app.id})">Cancel</button>` : ''}
            <button class="btn btn-sm btn-secondary" onclick="adminDeleteAppointment(${app.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Admin Cancel & Delete
async function adminCancelAppointment(id) {
  if (confirm(`Cancel appointment #${id}?`)) {
    try {
      await api.put(`/appointments/${id}/cancel`, {});
      showToast('Appointment cancelled.', 'info');
      loadAdminDashboard();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
}

async function adminDeleteAppointment(id) {
  if (confirm(`Permanently delete appointment #${id}?`)) {
    try {
      await api.delete(`/appointments/${id}`);
      showToast('Appointment deleted.', 'info');
      loadAdminDashboard();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
}

// View Patient Full Record Modal
async function viewPatientFullRecord(id) {
  try {
    const res = await api.get(`/patients/${id}`);
    const pat = res.data;
    alert(`Patient #${pat.id} Record:\n\nName: ${pat.full_name}\nEmail: ${pat.email}\nPhone: ${pat.phone}\nDOB: ${pat.date_of_birth || 'N/A'}\nBlood Group: ${pat.blood_group || 'N/A'}\nAddress: ${pat.address || 'N/A'}\nEmergency: ${pat.emergency_contact || 'N/A'}\nHistory: ${pat.medical_history || 'N/A'}\nTotal Appointments: ${pat.appointments ? pat.appointments.length : 0}`);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Create Department Modal (Admin)
function openCreateDepartmentModal() {
  const name = prompt('Enter Department Name (e.g., Ophthalmology):');
  if (!name) return;
  const code = prompt('Enter Department Code (e.g., OPHT-07):');
  if (!code) return;
  const head_doctor = prompt('Enter Head Doctor Name:');
  const description = prompt('Enter Brief Description:');

  api.post('/departments', { name, code, head_doctor, description })
    .then(res => {
      showToast(res.message || 'Department created!', 'success');
      if (typeof loadDepartmentsPage === 'function') loadDepartmentsPage();
    })
    .catch(err => showToast(err.message, 'error'));
}

// Create Doctor Modal (Admin)
function openCreateDoctorModal() {
  const full_name = prompt('Enter Doctor Full Name (e.g., Dr. Alan Turing):');
  if (!full_name) return;
  const email = prompt('Enter Doctor Email (e.g., dr.alan@medilink.com):');
  if (!email) return;
  const phone = prompt('Enter Contact Phone:');
  const department_id = prompt('Enter Department ID (1 to 6):', '1');
  const specialization = prompt('Enter Specialization:');
  const consultation_fee = prompt('Enter Consultation Fee ($):', '80.00');

  api.post('/doctors', {
    full_name,
    email,
    phone,
    department_id,
    specialization,
    consultation_fee,
    experience_years: 8
  })
  .then(res => {
    showToast('Doctor profile created successfully!', 'success');
    if (typeof loadDoctorsPage === 'function') loadDoctorsPage();
  })
  .catch(err => showToast(err.message, 'error'));
}
