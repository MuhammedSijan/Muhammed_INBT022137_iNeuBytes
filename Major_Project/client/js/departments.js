/**
 * MediLink Departments Directory Operations
 */

async function loadDepartmentsPage() {
  try {
    const res = await api.get('/departments');
    const departments = res.data || [];

    const container = document.getElementById('departmentsGridContainer');
    if (!container) return;

    const user = api.getUser();
    const adminControls = document.getElementById('adminDeptControls');
    if (adminControls && user && user.role === 'admin') {
      adminControls.style.display = 'block';
    }

    if (departments.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#94A3B8;">No medical departments registered.</div>`;
      return;
    }

    container.innerHTML = departments.map(dept => `
      <div class="department-card">
        <div class="department-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <h3 style="font-size:1.25rem;">${dept.name}</h3>
          <span class="badge" style="background:#EEEAFE; color:#7667E8;">${dept.code}</span>
        </div>

        <p style="color:#64748B; font-size:0.9rem; line-height:1.45; margin-bottom:1.25rem; flex:1;">${dept.description}</p>

        <div style="border-top:1px solid #F1F5F9; padding-top:1rem; margin-top:auto;">
          <div style="font-size:0.85rem; color:#475569; margin-bottom:0.25rem;">
            <strong>Head of Dept:</strong> ${dept.head_doctor || 'Specialist Panel'}
          </div>
          <div style="font-size:0.85rem; color:#7667E8; font-weight:600; margin-bottom:1rem;">
            ${dept.doctor_count || 0} Registered Physicians
          </div>

          <div style="display:flex; gap:0.5rem;">
            <a href="doctors.html?dept=${dept.id}" class="btn btn-sm btn-primary" style="flex:1;">View Specialists</a>
            ${user && user.role === 'admin' ? `
              <button class="btn btn-sm btn-secondary" style="color:#EF5350;" onclick="handleAdminDeleteDepartment(${dept.id})">Delete</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleAdminDeleteDepartment(id) {
  if (confirm(`Are you sure you want to delete department #${id}?`)) {
    try {
      await api.delete(`/departments/${id}`);
      showToast('Department removed successfully.', 'info');
      loadDepartmentsPage();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
}
