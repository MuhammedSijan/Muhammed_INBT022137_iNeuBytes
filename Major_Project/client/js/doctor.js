/**
 * MediLink Doctor Portal Operations
 */

async function loadDoctorDashboard() {
  const user = api.getUser();
  if (!user || user.role !== 'doctor') return;

  const greetingEl = document.getElementById('doctorGreeting');
  if (greetingEl) {
    greetingEl.textContent = `Welcome, ${user.full_name}`;
  }

  try {
    const res = await api.get('/appointments');
    const appointments = res.data || [];

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
    const pendingAppointments = appointments.filter(a => a.status === 'Pending');
    const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed');

    // Update KPI Tiles
    const todayEl = document.getElementById('docStatToday');
    if (todayEl) todayEl.textContent = todayAppointments.length;

    const pendingEl = document.getElementById('docStatPending');
    if (pendingEl) pendingEl.textContent = pendingAppointments.length;

    const totalPatientsEl = document.getElementById('docStatTotalPatients');
    if (totalPatientsEl) {
      // Unique patient count
      const uniquePatients = new Set(appointments.map(a => a.patient_id));
      totalPatientsEl.textContent = uniquePatients.size;
    }

    const confirmedEl = document.getElementById('docStatConfirmed');
    if (confirmedEl) confirmedEl.textContent = confirmedAppointments.length;

    // Render Appointments Queue
    const queueTable = document.getElementById('doctorQueueTable');
    if (queueTable) {
      if (appointments.length === 0) {
        queueTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94A3B8;">No appointments scheduled.</td></tr>`;
      } else {
        queueTable.innerHTML = appointments.map(app => `
          <tr>
            <td><strong>#${app.id}</strong></td>
            <td>
              <div style="font-weight:600;">${app.patient_name}</div>
              <div style="font-size:0.78rem; color:#64748B;">${app.patient_gender || 'Patient'} • ${app.patient_blood_group || 'O+'}</div>
            </td>
            <td>
              <div>${app.appointment_date}</div>
              <div style="font-size:0.78rem; color:#64748B;">${formatTime(app.appointment_time)}</div>
            </td>
            <td><span style="font-size:0.88rem; color:#475569;">${app.reason}</span></td>
            <td><span class="badge badge-${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-sm btn-primary" onclick="openConsultationModal(${app.id}, '${encodeURIComponent(app.patient_name)}', '${app.status}', '${encodeURIComponent(app.consultation_notes || '')}', '${encodeURIComponent(app.prescription || '')}')">
                  Update / Notes
                </button>
                <button class="btn btn-sm btn-secondary" onclick="viewPatientDetailsModal('${encodeURIComponent(JSON.stringify(app))}')">
                  Patient Info
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Format Time helper
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour % 12 || 12;
  return `${displayH}:${m} ${period}`;
}

// Consultation & Status Update Modal
function openConsultationModal(appId, patientName, currentStatus, currentNotes, currentRx) {
  let modal = document.getElementById('consultationModal');
  if (!modal) {
    createConsultationModalMarkup();
    modal = document.getElementById('consultationModal');
  }

  document.getElementById('consultAppId').value = appId;
  document.getElementById('consultPatientName').textContent = decodeURIComponent(patientName);
  document.getElementById('consultStatus').value = currentStatus;
  document.getElementById('consultNotes').value = decodeURIComponent(currentNotes);
  document.getElementById('consultPrescription').value = decodeURIComponent(currentRx);

  modal.classList.add('active');
}

async function submitConsultationUpdate(e) {
  e.preventDefault();
  const appId = document.getElementById('consultAppId').value;
  const status = document.getElementById('consultStatus').value;
  const consultation_notes = document.getElementById('consultNotes').value.trim();
  const prescription = document.getElementById('consultPrescription').value.trim();

  const submitBtn = document.getElementById('submitConsultBtn');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving notes...';

    const res = await api.put(`/appointments/${appId}/status`, {
      status,
      consultation_notes,
      prescription
    });

    if (res.success) {
      showToast(res.message || 'Consultation updated successfully!', 'success');
      closeModal('consultationModal');
      loadDoctorDashboard();
      if (typeof loadAppointmentsPage === 'function') {
        loadAppointmentsPage();
      }
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
}

// Patient Details Modal
function viewPatientDetailsModal(encodedApp) {
  const app = JSON.parse(decodeURIComponent(encodedApp));
  alert(`Patient Summary:\n\nName: ${app.patient_name}\nEmail: ${app.patient_email}\nPhone: ${app.patient_phone || 'N/A'}\nGender: ${app.patient_gender || 'N/A'}\nBlood Group: ${app.patient_blood_group || 'N/A'}\nMedical History:\n${app.patient_medical_history || 'No recorded chronic conditions'}`);
}

function createConsultationModalMarkup() {
  const div = document.createElement('div');
  div.id = 'consultationModal';
  div.className = 'modal-backdrop';
  div.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div>
          <h3>Clinical Consultation</h3>
          <p style="font-size:0.85rem; color:#64748B;">Patient: <strong id="consultPatientName"></strong></p>
        </div>
        <button class="close-modal-btn" onclick="closeModal('consultationModal')">&times;</button>
      </div>
      <form id="consultationForm" onsubmit="submitConsultationUpdate(event)">
        <input type="hidden" id="consultAppId">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Appointment Status</label>
            <select id="consultStatus" class="form-control" required>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Clinical Diagnosis & Notes</label>
            <textarea id="consultNotes" class="form-control" rows="4" placeholder="Enter findings, physical exam observations, and clinical advice..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Prescription & Follow-up Instructions</label>
            <textarea id="consultPrescription" class="form-control" rows="3" placeholder="Medication dosage, frequency, lab tests or follow-up schedule..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('consultationModal')">Cancel</button>
          <button type="submit" id="submitConsultBtn" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}
