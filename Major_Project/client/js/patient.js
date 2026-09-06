/**
 * MediLink Patient Portal Operations
 */

async function loadPatientDashboard() {
  const user = api.getUser();
  if (!user || user.role !== 'patient') return;

  // Set greeting
  const greetingEl = document.getElementById('patientGreeting');
  if (greetingEl) {
    greetingEl.textContent = `Welcome back, ${user.full_name}!`;
  }

  try {
    // 1. Fetch Patient's Appointments
    const res = await api.get('/appointments');
    const appointments = res.data || [];

    // Calculate metrics
    const totalCount = appointments.length;
    const upcomingList = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending');
    const completedList = appointments.filter(a => a.status === 'Completed');

    // Update KPI counters
    const totalEl = document.getElementById('statTotalAppointments');
    if (totalEl) totalEl.textContent = totalCount;

    const upcomingEl = document.getElementById('statUpcomingCount');
    if (upcomingEl) upcomingEl.textContent = upcomingList.length;

    const completedEl = document.getElementById('statCompletedCount');
    if (completedEl) completedEl.textContent = completedList.length;

    // Render Featured Upcoming Appointment
    const upcomingContainer = document.getElementById('upcomingAppointmentContainer');
    if (upcomingContainer) {
      if (upcomingList.length > 0) {
        const nextApp = upcomingList[0];
        upcomingContainer.innerHTML = `
          <div class="featured-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="badge badge-${nextApp.status.toLowerCase()}">${nextApp.status}</span>
              <span style="font-size:0.8rem; color:#A5B4FC;">Ref: MED-${String(nextApp.id).padStart(5, '0')}</span>
            </div>
            <h3>${nextApp.doctor_name}</h3>
            <p style="color:#C7D2FE; margin-top:0.2rem;">${nextApp.doctor_specialization} • ${nextApp.department_name}</p>

            <div class="featured-meta">
              <div class="featured-meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>${nextApp.appointment_date}</span>
              </div>
              <div class="featured-meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${formatTime(nextApp.appointment_time)}</span>
              </div>
              <div class="featured-meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Room ${nextApp.room_number || '101'}</span>
              </div>
            </div>

            <p style="font-size:0.88rem; color:#CBD5E1; margin-bottom:1rem;"><strong>Reason:</strong> ${nextApp.reason}</p>

            <div style="display:flex; gap:0.75rem;">
              <button class="btn btn-sm btn-outline-primary" style="color:#FFFFFF; border-color:rgba(255,255,255,0.4);" onclick="openCancelModal(${nextApp.id})">Cancel Appointment</button>
            </div>
          </div>
        `;
      } else {
        upcomingContainer.innerHTML = `
          <div class="card" style="text-align:center; padding:2.5rem 1.5rem;">
            <svg style="width:48px; height:48px; color:#94A3B8; margin-bottom:0.75rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <h4>No Upcoming Appointments</h4>
            <p style="margin-top:0.35rem; margin-bottom:1.25rem;">Stay proactive with your health. Book a consultation with our specialists.</p>
            <button class="btn btn-primary" onclick="openBookingModal()">Book Appointment</button>
          </div>
        `;
      }
    }

    // Render Recent Appointments Table
    const tableBody = document.getElementById('recentAppointmentsTable');
    if (tableBody) {
      if (appointments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No appointments found.</td></tr>`;
      } else {
        tableBody.innerHTML = appointments.slice(0, 5).map(app => `
          <tr>
            <td><strong>#${app.id}</strong></td>
            <td>
              <div style="font-weight:600;">${app.doctor_name}</div>
              <div style="font-size:0.78rem; color:#64748B;">${app.doctor_specialization}</div>
            </td>
            <td>${app.department_name}</td>
            <td>
              <div>${app.appointment_date}</div>
              <div style="font-size:0.78rem; color:#64748B;">${formatTime(app.appointment_time)}</div>
            </td>
            <td><span class="badge badge-${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
              ${app.status === 'Completed' && app.consultation_notes ? 
                `<button class="btn btn-sm btn-secondary" onclick="viewNotesModal('${encodeURIComponent(app.doctor_name)}', '${encodeURIComponent(app.consultation_notes)}', '${encodeURIComponent(app.prescription || 'None')}')">View Notes</button>` : 
                (app.status !== 'Cancelled' ? `<button class="btn btn-sm btn-secondary" style="color:#EF5350;" onclick="openCancelModal(${app.id})">Cancel</button>` : `<span style="color:#94A3B8; font-size:0.85rem;">None</span>`)}
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Format 24h to 12h
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour % 12 || 12;
  return `${displayH}:${m} ${period}`;
}

// Booking Modal Logic
let availableDoctorsCache = [];

async function openBookingModal(preselectedDoctorId = null) {
  let modal = document.getElementById('bookingModal');
  if (!modal) {
    createBookingModalMarkup();
    modal = document.getElementById('bookingModal');
  }

  // Load departments
  const deptSelect = document.getElementById('bookDepartment');
  const docSelect = document.getElementById('bookDoctor');
  const dateInput = document.getElementById('bookDate');

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;

  try {
    const deptRes = await api.get('/departments');
    const docRes = await api.get('/doctors');

    availableDoctorsCache = docRes.data || [];

    deptSelect.innerHTML = '<option value="">-- All Departments --</option>' + 
      (deptRes.data || []).map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    renderDoctorOptions(availableDoctorsCache, preselectedDoctorId);

    // If preselected, select it
    if (preselectedDoctorId) {
      docSelect.value = preselectedDoctorId;
      const selectedDoc = availableDoctorsCache.find(d => d.id === parseInt(preselectedDoctorId, 10));
      if (selectedDoc) {
        deptSelect.value = selectedDoc.department_id;
      }
      loadTimeSlotsForSelectedDoctor();
    }

    modal.classList.add('active');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderDoctorOptions(doctors, selectedId = null) {
  const docSelect = document.getElementById('bookDoctor');
  if (!docSelect) return;

  if (doctors.length === 0) {
    docSelect.innerHTML = '<option value="">No doctors available</option>';
    return;
  }

  docSelect.innerHTML = '<option value="">-- Select a Doctor --</option>' + 
    doctors.map(d => `<option value="${d.id}" ${selectedId && d.id === parseInt(selectedId, 10) ? 'selected' : ''}>${d.full_name} (${d.specialization}) - $${d.consultation_fee}</option>`).join('');
}

function handleDepartmentChange() {
  const deptId = document.getElementById('bookDepartment').value;
  if (!deptId) {
    renderDoctorOptions(availableDoctorsCache);
  } else {
    const filtered = availableDoctorsCache.filter(d => d.department_id === parseInt(deptId, 10));
    renderDoctorOptions(filtered);
  }
  loadTimeSlotsForSelectedDoctor();
}

async function loadTimeSlotsForSelectedDoctor() {
  const docId = document.getElementById('bookDoctor').value;
  const date = document.getElementById('bookDate').value;
  const slotContainer = document.getElementById('timeSlotsContainer');

  if (!docId || !date) {
    if (slotContainer) slotContainer.innerHTML = '<p style="color:#94A3B8; font-size:0.85rem;">Please select a doctor and date to view available time slots.</p>';
    return;
  }

  try {
    slotContainer.innerHTML = '<p style="color:#64748B; font-size:0.85rem;">Checking doctor availability...</p>';
    const res = await api.get(`/doctors/${docId}/availability`, { date });
    const slots = res.slots || [];

    if (slots.length === 0) {
      slotContainer.innerHTML = '<p style="color:#EF5350; font-size:0.85rem;">No slots available for this date.</p>';
      return;
    }

    slotContainer.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:0.5rem; margin-top:0.5rem;">
        ${slots.map(s => `
          <button type="button" 
            class="btn btn-sm ${s.available ? 'btn-secondary slot-btn' : 'btn-secondary'}" 
            style="${!s.available ? 'opacity:0.4; text-decoration:line-through; cursor:not-allowed;' : ''}"
            ${!s.available ? 'disabled' : ''}
            onclick="selectSlot(this, '${s.time}')"
          >
            ${s.display_time}
          </button>
        `).join('')}
      </div>
    `;
  } catch (error) {
    slotContainer.innerHTML = `<p style="color:#EF5350; font-size:0.85rem;">${error.message}</p>`;
  }
}

let selectedSlotTime = null;
function selectSlot(btn, time) {
  document.querySelectorAll('.slot-btn').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-secondary');
  });
  btn.classList.remove('btn-secondary');
  btn.classList.add('btn-primary');
  selectedSlotTime = time;
}

// Submit Appointment Booking
async function submitBookingForm(e) {
  e.preventDefault();
  const doctor_id = document.getElementById('bookDoctor').value;
  const department_id = document.getElementById('bookDepartment').value;
  const appointment_date = document.getElementById('bookDate').value;
  const reason = document.getElementById('bookReason').value.trim();

  if (!doctor_id || !appointment_date || !selectedSlotTime || !reason) {
    showToast('Please select a doctor, date, available time slot, and enter a reason.', 'warning');
    return;
  }

  const submitBtn = document.getElementById('submitBookingBtn');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Securing appointment...';

    const res = await api.post('/appointments', {
      doctor_id: parseInt(doctor_id, 10),
      department_id: department_id ? parseInt(department_id, 10) : undefined,
      appointment_date,
      appointment_time: selectedSlotTime,
      reason
    });

    if (res.success) {
      showToast(res.message || 'Appointment booked successfully!', 'success');
      closeModal('bookingModal');
      // Reload dashboard or appointments list
      loadPatientDashboard();
      if (typeof loadAppointmentsPage === 'function') {
        loadAppointmentsPage();
      }
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';
  }
}

// Cancel Modal
function openCancelModal(appId) {
  if (confirm(`Are you sure you want to cancel appointment #${appId}?`)) {
    cancelAppointmentAction(appId);
  }
}

async function cancelAppointmentAction(appId) {
  try {
    const res = await api.put(`/appointments/${appId}/cancel`, {});
    showToast(res.message || 'Appointment cancelled.', 'info');
    loadPatientDashboard();
    if (typeof loadAppointmentsPage === 'function') {
      loadAppointmentsPage();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// View Notes Modal
function viewNotesModal(docName, notes, prescription) {
  alert(`Consultation Notes from ${decodeURIComponent(docName)}:\n\nDiagnosis & Notes:\n${decodeURIComponent(notes)}\n\nPrescription:\n${decodeURIComponent(prescription)}`);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Create DOM Modal Markup
function createBookingModalMarkup() {
  const div = document.createElement('div');
  div.id = 'bookingModal';
  div.className = 'modal-backdrop';
  div.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>Book Medical Appointment</h3>
        <button class="close-modal-btn" onclick="closeModal('bookingModal')">&times;</button>
      </div>
      <form id="bookingForm" onsubmit="submitBookingForm(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Department</label>
            <select id="bookDepartment" class="form-control" onchange="handleDepartmentChange()">
              <option value="">Loading departments...</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Specialist / Doctor *</label>
            <select id="bookDoctor" class="form-control" required onchange="loadTimeSlotsForSelectedDoctor()">
              <option value="">Select a doctor</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Appointment Date *</label>
            <input type="date" id="bookDate" class="form-control" required onchange="loadTimeSlotsForSelectedDoctor()">
          </div>

          <div class="form-group">
            <label class="form-label">Available Time Slots *</label>
            <div id="timeSlotsContainer">
              <p style="color:#94A3B8; font-size:0.85rem;">Select doctor and date to view open slots.</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Reason for Consultation *</label>
            <textarea id="bookReason" class="form-control" rows="3" required placeholder="Describe your symptoms, checkup reason, or follow-up details..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('bookingModal')">Cancel</button>
          <button type="submit" id="submitBookingBtn" class="btn btn-primary">Confirm Booking</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}
