/**
 * MediLink Doctor Directory Operations
 */

let allDoctorsList = [];

async function loadDoctorsPage() {
  try {
    // 1. Load departments for filter dropdown
    const deptRes = await api.get('/departments');
    const depts = deptRes.data || [];
    const filterSelect = document.getElementById('doctorDeptFilter');
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All Departments</option>' + 
        depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    // 2. Fetch doctors
    const docRes = await api.get('/doctors');
    allDoctorsList = docRes.data || [];

    renderDoctorsGrid(allDoctorsList);

    // Show Admin Add Doctor button if admin
    const user = api.getUser();
    const adminControls = document.getElementById('adminDoctorControls');
    if (adminControls && user && user.role === 'admin') {
      adminControls.style.display = 'block';
    }

  } catch (error) {
    showToast(error.message, 'error');
  }
}

function renderDoctorsGrid(doctors) {
  const container = document.getElementById('doctorsGridContainer');
  if (!container) return;

  if (doctors.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:#94A3B8;">
        <svg style="width:48px; height:48px; margin-bottom:0.75rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h4>No Doctors Found</h4>
        <p style="margin-top:0.35rem;">Try adjusting your search query or department filter.</p>
      </div>
    `;
    return;
  }

  const user = api.getUser();

  container.innerHTML = doctors.map(doc => `
    <div class="doctor-card">
      <div class="doctor-header">
        <img src="${doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'}" alt="${doc.full_name}" class="doctor-photo">
        <div class="doctor-meta">
          <div class="doctor-name">${doc.full_name}</div>
          <div class="doctor-specialty">${doc.specialization}</div>
          <div class="doctor-dept">${doc.department_name} • ${doc.experience_years} yrs exp</div>
        </div>
      </div>

      <p class="doctor-bio">${doc.bio || 'Experienced healthcare specialist committed to personalized clinical excellence.'}</p>

      <div style="font-size:0.8rem; color:#64748B; margin-bottom:1rem;">
        <div><strong>Schedule:</strong> ${doc.availability_days}</div>
        <div><strong>Hours:</strong> ${doc.available_time_start.substring(0,5)} - ${doc.available_time_end.substring(0,5)} • Room ${doc.room_number || '101'}</div>
      </div>

      <div class="doctor-footer">
        <div class="doctor-fee">$${doc.consultation_fee} <span>/ consult</span></div>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-sm btn-primary" onclick="handleDoctorBookClick(${doc.id})">Book Now</button>
          ${user && user.role === 'admin' ? `<button class="btn btn-sm btn-secondary" style="color:#EF5350;" onclick="handleAdminDeleteDoctor(${doc.id})">Delete</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function filterDoctors() {
  const search = (document.getElementById('doctorSearchInput')?.value || '').toLowerCase().trim();
  const deptId = document.getElementById('doctorDeptFilter')?.value;

  let filtered = allDoctorsList;

  if (deptId) {
    filtered = filtered.filter(d => d.department_id === parseInt(deptId, 10));
  }

  if (search) {
    filtered = filtered.filter(d => 
      d.full_name.toLowerCase().includes(search) ||
      d.specialization.toLowerCase().includes(search) ||
      d.department_name.toLowerCase().includes(search)
    );
  }

  renderDoctorsGrid(filtered);
}

function handleDoctorBookClick(doctorId) {
  const token = api.getToken();
  if (!token) {
    showToast('Please sign in or create an account to book an appointment.', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  if (typeof openBookingModal === 'function') {
    openBookingModal(doctorId);
  } else {
    window.location.href = `patient-dashboard.html?bookDoctor=${doctorId}`;
  }
}

async function handleAdminDeleteDoctor(id) {
  if (confirm(`Are you sure you want to remove doctor #${id}?`)) {
    try {
      await api.delete(`/doctors/${id}`);
      showToast('Doctor record removed successfully.', 'info');
      loadDoctorsPage();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
}
