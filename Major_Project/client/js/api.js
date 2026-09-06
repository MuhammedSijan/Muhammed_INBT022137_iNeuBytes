/**
 * MediLink Centralized API Client
 */
const API_BASE = '/api';

const api = {
  getToken() {
    return localStorage.getItem('medilink_token');
  },

  setToken(token) {
    localStorage.setItem('medilink_token', token);
  },

  removeToken() {
    localStorage.removeItem('medilink_token');
    localStorage.removeItem('medilink_user');
  },

  getUser() {
    const u = localStorage.getItem('medilink_user');
    try {
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('medilink_user', JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If unauthorized or token expired
        if (response.status === 401 && !url.includes('/auth/login')) {
          this.removeToken();
          if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
          }
        }
        throw new Error(data.message || 'An unexpected error occurred.');
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
