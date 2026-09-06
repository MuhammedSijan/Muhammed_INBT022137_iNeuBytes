/**
 * MediLink Authentication Controller & Page Guards
 */

// Initialize login form if present
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      const res = await api.post('/auth/login', { email, password });

      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);

        showToast(res.message || 'Login successful!', 'success');

        setTimeout(() => {
          redirectByRole(res.user.role);
        }, 600);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

// 1-Click Demo Login Helper
function fillDemoAccount(role) {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!emailInput || !passwordInput) return;

  if (role === 'admin') {
    emailInput.value = 'admin@medilink.com';
    passwordInput.value = 'Admin@123';
  } else if (role === 'doctor') {
    emailInput.value = 'dr.sarah@medilink.com';
    passwordInput.value = 'Doctor@123';
  } else if (role === 'patient') {
    emailInput.value = 'john.doe@medilink.com';
    passwordInput.value = 'Patient@123';
  }

  showToast(`Filled credentials for Demo ${role.toUpperCase()}`, 'info');
}

// Initialize Register form if present
function initRegisterPage() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const date_of_birth = document.getElementById('date_of_birth') ? document.getElementById('date_of_birth').value : '';
    const gender = document.getElementById('gender') ? document.getElementById('gender').value : 'Male';
    const blood_group = document.getElementById('blood_group') ? document.getElementById('blood_group').value : 'O+';
    const address = document.getElementById('address') ? document.getElementById('address').value.trim() : '';

    const submitBtn = registerForm.querySelector('button[type="submit"]');

    if (!full_name || !email || !phone || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (password !== confirm_password) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      const res = await api.post('/auth/register', {
        full_name,
        email,
        phone,
        password,
        confirm_password,
        role: 'patient',
        date_of_birth,
        gender,
        blood_group,
        address
      });

      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);

        showToast('Registration complete! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'patient-dashboard.html';
        }, 800);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

// Role redirection helper
function redirectByRole(role) {
  if (role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (role === 'doctor') {
    window.location.href = 'doctor-dashboard.html';
  } else {
    window.location.href = 'patient-dashboard.html';
  }
}

// Logout handler
function logoutUser() {
  api.removeToken();
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
}

// Route Protection Guard
function enforceAuthGuard(allowedRoles = []) {
  const token = api.getToken();
  const user = api.getUser();

  if (!token || !user) {
    window.location.href = 'login.html';
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    showToast(`Access restricted for ${user.role} role. Redirecting...`, 'error');
    setTimeout(() => {
      redirectByRole(user.role);
    }, 1000);
    return false;
  }

  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initRegisterPage();
});
