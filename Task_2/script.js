/**
 * MedoraCare - Doctor Appointment Booking System
 * Vanilla JavaScript Application Logic
 * Self-contained - LocalStorage Persistence - Zero Dependencies
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Doctor & Department Mock Database
     ========================================================================== */
  const DOCTORS_DATA = [
    {
      id: 'dr-sarah-jenkins',
      name: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      specialization: 'Interventional Cardiology & Heart Health',
      experience: 14,
      fee: 120,
      image: 'images/doctor-sarah.svg',
      bio: 'Senior cardiologist specializing in cardiovascular wellness, hypertension management, and preventive heart care with over a decade of clinical excellence.',
      education: 'MD - Johns Hopkins University School of Medicine | Board Certified in Cardiology',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']
    },
    {
      id: 'dr-marcus-vance',
      name: 'Dr. Marcus Vance',
      department: 'Dermatology',
      specialization: 'Clinical Dermatology & Skin Aesthetics',
      experience: 11,
      fee: 95,
      image: 'images/doctor-marcus.svg',
      bio: 'Expert in adult and pediatric dermatological treatments, acne therapies, allergic skin conditions, and diagnostic skin evaluations.',
      education: 'MD - Stanford University School of Medicine | Fellow, American Academy of Dermatology',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableSlots: ['09:30 AM', '11:00 AM', '01:30 PM', '04:00 PM']
    },
    {
      id: 'dr-elena-rostova',
      name: 'Dr. Elena Rostova',
      department: 'Neurology',
      specialization: 'Neurodegenerative Disorders & Cognitive Health',
      experience: 16,
      fee: 150,
      image: 'images/doctor-elena.svg',
      bio: 'Renowned neurologist with extensive background in migraine therapies, neuropathy diagnostics, stroke recovery, and comprehensive neurological evaluations.',
      education: 'MD, PhD - Harvard Medical School | Member, American Neurological Association',
      availableDays: ['Monday', 'Tuesday', 'Thursday'],
      availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM']
    },
    {
      id: 'dr-david-chen',
      name: 'Dr. David Chen',
      department: 'Pediatrics',
      specialization: 'Pediatric Primary Care & Child Development',
      experience: 9,
      fee: 80,
      image: 'images/doctor-david.svg',
      bio: 'Dedicated pediatrician focusing on infant wellness, developmental milestone tracking, routine immunizations, and adolescent healthcare.',
      education: 'MD - Columbia University Vagelos College of Physicians | Certified Pediatrician',
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      availableSlots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:00 PM']
    },
    {
      id: 'dr-olivia-martinez',
      name: 'Dr. Olivia Martinez',
      department: 'Orthopedics',
      specialization: 'Sports Medicine & Joint Reconstruction',
      experience: 13,
      fee: 135,
      image: 'images/doctor-olivia.svg',
      bio: 'Board-certified orthopedic surgeon focusing on athletic injuries, arthroscopic procedures, cartilage rehabilitation, and mobility restoration.',
      education: 'MD - University of Pennsylvania Perelman School of Medicine | Orthopedic Surgery Specialist',
      availableDays: ['Tuesday', 'Wednesday', 'Friday'],
      availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
    },
    {
      id: 'dr-arthur-pendelton',
      name: 'Dr. Arthur Pendelton',
      department: 'General Medicine',
      specialization: 'Internal Medicine & Preventive Wellness',
      experience: 18,
      fee: 75,
      image: 'images/doctor-arthur.svg',
      bio: 'General practitioner offering thorough diagnostic workups, chronic illness supervision, preventive screenings, and routine annual physical examinations.',
      education: 'MD - Yale School of Medicine | American College of Physicians',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableSlots: ['08:00 AM', '10:30 AM', '01:30 PM', '03:30 PM', '05:30 PM']
    },
    {
      id: 'dr-amara-okafor',
      name: 'Dr. Amara Okafor',
      department: 'Cardiology',
      specialization: 'Electrophysiology & Arrhythmia Care',
      experience: 10,
      fee: 125,
      image: 'images/doctor-amara.svg',
      bio: 'Cardiologist specializing in rhythm disorders, clinical electrophysiology, cardiac monitoring, and personalized hypertension therapies.',
      education: 'MD - Oxford University / Baylor College of Medicine | Cardiology Specialist',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']
    },
    {
      id: 'dr-liam-gallagher',
      name: 'Dr. Liam Gallagher',
      department: 'Dermatology',
      specialization: 'Pediatric Dermatology & Eczema Specialist',
      experience: 8,
      fee: 90,
      image: 'images/doctor-liam.svg',
      bio: 'Focused on childhood eczema, sensitive skin disorders, gentle dermatological therapies, and environmental allergy diagnosis.',
      education: 'MD - University of Toronto Faculty of Medicine | Certified Dermatologist',
      availableDays: ['Monday', 'Wednesday', 'Thursday'],
      availableSlots: ['10:00 AM', '01:00 PM', '03:30 PM', '05:00 PM']
    }
  ];

  const STORAGE_KEY = 'medoracare_appointments';

  /* ==========================================================================
     2. Application State
     ========================================================================== */
  const state = {
    searchQuery: '',
    selectedDepartment: 'all',
    sortBy: 'featured',
    selectedDoctorId: '',
    selectedSlot: '',
    appointments: []
  };

  /* ==========================================================================
     3. DOM Element References
     ========================================================================== */
  const elements = {
    // Navigation & Header
    header: document.getElementById('header'),
    mobileToggle: document.getElementById('mobile-toggle'),
    mobileNav: document.getElementById('mobile-nav'),
    navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),

    // Hero quick lookup
    heroDeptSelect: document.getElementById('hero-dept-select'),
    heroDoctorSearch: document.getElementById('hero-doctor-search'),
    heroSearchBtn: document.getElementById('hero-search-btn'),

    // Department cards
    deptCards: document.querySelectorAll('.dept-card'),
    deptFooterLinks: document.querySelectorAll('.dept-footer-link'),

    // Search & Filter
    searchInput: document.getElementById('doctor-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    sortSelect: document.getElementById('sort-select'),
    resultsCount: document.getElementById('results-count'),
    resetAllFiltersBtn: document.getElementById('reset-all-filters-btn'),
    doctorsGrid: document.getElementById('doctors-grid'),
    noDoctorsFound: document.getElementById('no-doctors-found'),
    emptyResetBtn: document.getElementById('empty-reset-btn'),

    // Doctor Profile Modal
    doctorModal: document.getElementById('doctor-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalBookBtn: document.getElementById('modal-book-btn'),
    modalDocImage: document.getElementById('modal-doc-image'),
    modalDocDept: document.getElementById('modal-doc-dept'),
    modalDocName: document.getElementById('modal-doc-name'),
    modalDocSpec: document.getElementById('modal-doc-spec'),
    modalDocExp: document.getElementById('modal-doc-exp'),
    modalDocFee: document.getElementById('modal-doc-fee'),
    modalDocBio: document.getElementById('modal-doc-bio'),
    modalDocEdu: document.getElementById('modal-doc-edu'),
    modalDocSchedule: document.getElementById('modal-doc-schedule'),

    // Appointment Form
    appointmentForm: document.getElementById('appointment-form'),
    patientName: document.getElementById('patient-name'),
    patientEmail: document.getElementById('patient-email'),
    patientPhone: document.getElementById('patient-phone'),
    patientReason: document.getElementById('patient-reason'),
    bookingDept: document.getElementById('booking-dept'),
    bookingDoctor: document.getElementById('booking-doctor'),
    bookingDate: document.getElementById('booking-date'),
    timeSlotsContainer: document.getElementById('time-slots-container'),
    selectedTimeSlotInput: document.getElementById('selected-time-slot'),
    submitBookingBtn: document.getElementById('submit-booking-btn'),

    // Errors
    errors: {
      patientName: document.getElementById('patient-name-error'),
      patientEmail: document.getElementById('patient-email-error'),
      patientPhone: document.getElementById('patient-phone-error'),
      bookingDept: document.getElementById('booking-dept-error'),
      bookingDoctor: document.getElementById('booking-doctor-error'),
      bookingDate: document.getElementById('booking-date-error'),
      bookingSlot: document.getElementById('booking-slot-error')
    },

    // Live Summary Sidebar
    summaryDocImg: document.getElementById('summary-doc-img'),
    summaryDocName: document.getElementById('summary-doc-name'),
    summaryDocDept: document.getElementById('summary-doc-dept'),
    summaryDocSpec: document.getElementById('summary-doc-spec'),
    summaryDateDisplay: document.getElementById('summary-date-display'),
    summarySlotDisplay: document.getElementById('summary-slot-display'),
    summaryFeeDisplay: document.getElementById('summary-fee-display'),
    summaryTotalDisplay: document.getElementById('summary-total-display'),

    // Confirmation Modal
    confirmationModal: document.getElementById('confirmation-modal'),
    confirmModalCloseBtn: document.getElementById('confirm-modal-close-btn'),
    confirmRefCode: document.getElementById('confirm-ref-code'),
    confirmPatientName: document.getElementById('confirm-patient-name'),
    confirmPatientEmail: document.getElementById('confirm-patient-email'),
    confirmPatientPhone: document.getElementById('confirm-patient-phone'),
    confirmDoctorName: document.getElementById('confirm-doctor-name'),
    confirmDeptName: document.getElementById('confirm-dept-name'),
    confirmDatetimeVal: document.getElementById('confirm-datetime-val'),
    confirmFeeVal: document.getElementById('confirm-fee-val'),
    confirmPrintBtn: document.getElementById('confirm-print-btn'),
    confirmViewHistoryBtn: document.getElementById('confirm-view-history-btn'),

    // Appointment History
    historyContentArea: document.getElementById('history-content-area'),
    historyHeaderActions: document.getElementById('history-header-actions'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  /* ==========================================================================
     4. Utility Functions
     ========================================================================== */
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(dateStr) {
    if (!dateStr) return 'Not selected';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function generateReferenceId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `MDC-2026-${randomNum}`;
  }

  function showToast(message, type = 'info', duration = 3500) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-message">${escapeHtml(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     5. LocalStorage Management
     ========================================================================== */
  function loadStoredAppointments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state.appointments = JSON.parse(stored);
        if (!Array.isArray(state.appointments)) {
          state.appointments = [];
        }
      } else {
        state.appointments = [];
      }
    } catch (e) {
      console.warn('LocalStorage is inaccessible or corrupt, defaulting to empty list:', e);
      state.appointments = [];
    }
  }

  function saveAppointmentsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.appointments));
    } catch (e) {
      console.error('Could not save to LocalStorage:', e);
      showToast('Warning: Could not persist booking to browser storage', 'danger');
    }
  }

  /* ==========================================================================
     6. Doctor Search, Filter & Render Logic
     ========================================================================== */
  function getFilteredDoctors() {
    return DOCTORS_DATA.filter(doc => {
      // Department filter
      const matchesDept = state.selectedDepartment === 'all' || doc.department.toLowerCase() === state.selectedDepartment.toLowerCase();

      // Search query filter (matches name, department, specialization, or bio)
      const query = state.searchQuery.trim().toLowerCase();
      const matchesQuery = !query ||
        doc.name.toLowerCase().includes(query) ||
        doc.department.toLowerCase().includes(query) ||
        doc.specialization.toLowerCase().includes(query) ||
        doc.bio.toLowerCase().includes(query);

      return matchesDept && matchesQuery;
    }).sort((a, b) => {
      if (state.sortBy === 'experience-desc') {
        return b.experience - a.experience;
      } else if (state.sortBy === 'fee-asc') {
        return a.fee - b.fee;
      } else if (state.sortBy === 'fee-desc') {
        return b.fee - a.fee;
      } else if (state.sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0; // 'featured' order
    });
  }

  function renderDoctors() {
    const filtered = getFilteredDoctors();

    // Update count display
    elements.resultsCount.textContent = `Showing ${filtered.length} of ${DOCTORS_DATA.length} doctors`;

    // Show/hide clear reset buttons
    const isFiltered = state.selectedDepartment !== 'all' || state.searchQuery.trim() !== '';
    elements.resetAllFiltersBtn.style.display = isFiltered ? 'inline-block' : 'none';

    if (filtered.length === 0) {
      elements.doctorsGrid.innerHTML = '';
      elements.noDoctorsFound.style.display = 'block';
      return;
    }

    elements.noDoctorsFound.style.display = 'none';

    elements.doctorsGrid.innerHTML = filtered.map(doc => {
      return `
        <div class="doctor-card" data-doctor-id="${escapeHtml(doc.id)}">
          <div class="doctor-card-header">
            <div class="doctor-avatar">
              <img src="${escapeHtml(doc.image)}" alt="Portrait of ${escapeHtml(doc.name)}" loading="lazy">
            </div>
            <div class="doctor-primary-info">
              <span class="doctor-dept-badge">${escapeHtml(doc.department)}</span>
              <h3 class="doctor-name">${escapeHtml(doc.name)}</h3>
              <p class="doctor-spec">${escapeHtml(doc.specialization)}</p>
            </div>
          </div>

          <div class="doctor-meta-grid">
            <div>
              <span class="meta-box-label">Experience</span>
              <span class="meta-box-val">${doc.experience} Years</span>
            </div>
            <div>
              <span class="meta-box-label">Consultation Fee</span>
              <span class="meta-box-val fee">$${doc.fee}</span>
            </div>
          </div>

          <p class="doctor-bio-excerpt">${escapeHtml(doc.bio)}</p>

          <div class="doctor-card-actions">
            <button type="button" class="btn btn-secondary btn-sm view-profile-btn" data-doctor-id="${escapeHtml(doc.id)}">
              View Profile
            </button>
            <button type="button" class="btn btn-primary btn-sm book-doctor-btn" data-doctor-id="${escapeHtml(doc.id)}">
              Book Appointment
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners to newly rendered doctor card buttons
    elements.doctorsGrid.querySelectorAll('.view-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doctor-id');
        openDoctorProfileModal(docId);
      });
    });

    elements.doctorsGrid.querySelectorAll('.book-doctor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doctor-id');
        selectDoctorForBooking(docId, true);
      });
    });
  }

  function handleSearchInput(e) {
    state.searchQuery = e.target.value;
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderDoctors();
  }

  function clearSearch() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    renderDoctors();
    elements.searchInput.focus();
  }

  function handleDepartmentPillClick(pill) {
    const dept = pill.getAttribute('data-dept');
    state.selectedDepartment = dept;

    elements.filterPills.forEach(p => {
      const isActive = p === pill;
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderDoctors();
  }

  function resetAllFilters() {
    state.searchQuery = '';
    state.selectedDepartment = 'all';
    state.sortBy = 'featured';

    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.sortSelect.value = 'featured';

    elements.filterPills.forEach(pill => {
      const isAll = pill.getAttribute('data-dept') === 'all';
      pill.classList.toggle('active', isAll);
      pill.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });

    renderDoctors();
    showToast('Filters have been reset', 'info');
  }

  /* ==========================================================================
     7. Doctor Profile Modal
     ========================================================================== */
  let activeModalDoctor = null;

  function openDoctorProfileModal(doctorId) {
    const doc = DOCTORS_DATA.find(d => d.id === doctorId);
    if (!doc) return;

    activeModalDoctor = doc;

    elements.modalDocImage.src = doc.image;
    elements.modalDocImage.alt = `Portrait of ${doc.name}`;
    elements.modalDocDept.textContent = doc.department;
    elements.modalDocName.textContent = doc.name;
    elements.modalDocSpec.textContent = doc.specialization;
    elements.modalDocExp.textContent = `${doc.experience} Years Experience`;
    elements.modalDocFee.textContent = `$${doc.fee} Consultation Fee`;
    elements.modalDocBio.textContent = doc.bio;
    elements.modalDocEdu.textContent = doc.education;

    // Render schedule pills
    elements.modalDocSchedule.innerHTML = doc.availableDays.map(day => {
      return `<span class="sched-pill">${escapeHtml(day)}</span>`;
    }).join('');

    elements.doctorModal.style.display = 'flex';
    requestAnimationFrame(() => {
      elements.doctorModal.classList.add('active');
      elements.doctorModal.setAttribute('aria-hidden', 'false');
    });

    document.body.style.overflow = 'hidden';
    elements.modalCloseBtn.focus();
  }

  function closeDoctorProfileModal() {
    elements.doctorModal.classList.remove('active');
    elements.doctorModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      elements.doctorModal.style.display = 'none';
      document.body.style.overflow = '';
      activeModalDoctor = null;
    }, 200);
  }

  /* ==========================================================================
     8. Appointment Booking Controller & Dynamic Sync
     ========================================================================== */
  function initializeBookingForm() {
    // Set min date to today
    const todayStr = getTodayDateString();
    elements.bookingDate.min = todayStr;

    // Populate Doctor Dropdown on Department selection
    populateDoctorDropdown();

    // Default select first doctor for live preview
    if (DOCTORS_DATA.length > 0) {
      updateLiveSummary(DOCTORS_DATA[0]);
    }
  }

  function populateDoctorDropdown(selectedDept = '', preselectedDocId = '') {
    const currentDept = selectedDept || elements.bookingDept.value;
    
    let doctorsToOption = DOCTORS_DATA;
    if (currentDept) {
      doctorsToOption = DOCTORS_DATA.filter(d => d.department.toLowerCase() === currentDept.toLowerCase());
    }

    elements.bookingDoctor.innerHTML = '<option value="">Select Doctor...</option>' +
      doctorsToOption.map(d => {
        return `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} (${escapeHtml(d.department)}) - $${d.fee}</option>`;
      }).join('');

    if (preselectedDocId) {
      elements.bookingDoctor.value = preselectedDocId;
    }
  }

  function selectDoctorForBooking(doctorId, scrollToForm = true) {
    const doc = DOCTORS_DATA.find(d => d.id === doctorId);
    if (!doc) return;

    // Close any open profile modal
    closeDoctorProfileModal();

    // Set Department dropdown
    elements.bookingDept.value = doc.department;
    clearError('bookingDept');

    // Populate and set Doctor dropdown
    populateDoctorDropdown(doc.department, doc.id);
    clearError('bookingDoctor');

    // Update Live Summary Card
    updateLiveSummary(doc);

    // Refresh dynamic time slots
    renderTimeSlots(doc);

    if (scrollToForm) {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function handleDepartmentDropdownChange() {
    const dept = elements.bookingDept.value;
    clearError('bookingDept');

    populateDoctorDropdown(dept);
    elements.bookingDoctor.value = '';

    // Clear slot
    state.selectedSlot = '';
    elements.selectedTimeSlotInput.value = '';
    renderTimeSlots(null);

    // If a doctor is currently visible in summary from another dept, fallback
    const firstMatching = DOCTORS_DATA.find(d => d.department.toLowerCase() === dept.toLowerCase());
    if (firstMatching) {
      updateLiveSummary(firstMatching);
    }
  }

  function handleDoctorDropdownChange() {
    const docId = elements.bookingDoctor.value;
    clearError('bookingDoctor');

    if (!docId) {
      state.selectedSlot = '';
      elements.selectedTimeSlotInput.value = '';
      renderTimeSlots(null);
      return;
    }

    const doc = DOCTORS_DATA.find(d => d.id === docId);
    if (doc) {
      // Sync Department if not already matched
      if (elements.bookingDept.value !== doc.department) {
        elements.bookingDept.value = doc.department;
      }
      updateLiveSummary(doc);
      renderTimeSlots(doc);
    }
  }

  function renderTimeSlots(doctor) {
    if (!doctor) {
      elements.timeSlotsContainer.innerHTML = `<div class="slots-placeholder">Please select a doctor to view available time slots</div>`;
      state.selectedSlot = '';
      elements.selectedTimeSlotInput.value = '';
      elements.summarySlotDisplay.textContent = 'Not selected';
      return;
    }

    const slots = doctor.availableSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

    elements.timeSlotsContainer.innerHTML = slots.map(slot => {
      const isSelected = state.selectedSlot === slot;
      return `
        <button type="button" class="time-slot-btn ${isSelected ? 'selected' : ''}" data-slot="${escapeHtml(slot)}">
          ${escapeHtml(slot)}
        </button>
      `;
    }).join('');

    elements.timeSlotsContainer.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotVal = btn.getAttribute('data-slot');
        selectTimeSlot(slotVal);
      });
    });
  }

  function selectTimeSlot(slot) {
    state.selectedSlot = slot;
    elements.selectedTimeSlotInput.value = slot;
    clearError('bookingSlot');

    elements.timeSlotsContainer.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-slot') === slot);
    });

    elements.summarySlotDisplay.textContent = slot;
  }

  function updateLiveSummary(doc) {
    if (!doc) return;
    state.selectedDoctorId = doc.id;

    elements.summaryDocImg.src = doc.image;
    elements.summaryDocImg.alt = `Portrait preview of ${doc.name}`;
    elements.summaryDocName.textContent = doc.name;
    elements.summaryDocDept.textContent = doc.department;
    elements.summaryDocSpec.textContent = doc.specialization;
    elements.summaryFeeDisplay.textContent = `$${doc.fee}`;
    elements.summaryTotalDisplay.textContent = `$${doc.fee}`;
  }

  function handleDateChange() {
    const chosenDate = elements.bookingDate.value;
    clearError('bookingDate');

    if (!chosenDate) {
      elements.summaryDateDisplay.textContent = 'Not selected';
      return;
    }

    // Check if chosen date is in the past
    const todayStr = getTodayDateString();
    if (chosenDate < todayStr) {
      showError('bookingDate', 'Appointment date cannot be in the past');
      elements.summaryDateDisplay.textContent = 'Invalid date';
      return;
    }

    elements.summaryDateDisplay.textContent = formatDateForDisplay(chosenDate);
  }

  /* ==========================================================================
     9. Form Validation Engine
     ========================================================================== */
  function showError(fieldKey, message) {
    const errorElem = elements.errors[fieldKey];
    if (errorElem) {
      errorElem.textContent = message;
    }

    const inputElem = getInputElementByKey(fieldKey);
    if (inputElem) {
      inputElem.classList.add('is-invalid');
      inputElem.setAttribute('aria-invalid', 'true');
    }
  }

  function clearError(fieldKey) {
    const errorElem = elements.errors[fieldKey];
    if (errorElem) {
      errorElem.textContent = '';
    }

    const inputElem = getInputElementByKey(fieldKey);
    if (inputElem) {
      inputElem.classList.remove('is-invalid');
      inputElem.removeAttribute('aria-invalid');
    }
  }

  function getInputElementByKey(key) {
    switch (key) {
      case 'patientName': return elements.patientName;
      case 'patientEmail': return elements.patientEmail;
      case 'patientPhone': return elements.patientPhone;
      case 'bookingDept': return elements.bookingDept;
      case 'bookingDoctor': return elements.bookingDoctor;
      case 'bookingDate': return elements.bookingDate;
      case 'bookingSlot': return elements.timeSlotsContainer;
      default: return null;
    }
  }

  function validateBookingForm() {
    let isValid = true;

    // 1. Patient Name (Min 2 chars, letters/spaces)
    const nameVal = elements.patientName.value.trim();
    if (!nameVal) {
      showError('patientName', 'Please enter the patient’s full name');
      isValid = false;
    } else if (nameVal.length < 2) {
      showError('patientName', 'Name must be at least 2 characters');
      isValid = false;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameVal)) {
      showError('patientName', 'Please enter a valid name (letters only)');
      isValid = false;
    } else {
      clearError('patientName');
    }

    // 2. Patient Email
    const emailVal = elements.patientEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      showError('patientEmail', 'Please enter a valid email address');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      showError('patientEmail', 'Please enter a valid email format (e.g. name@domain.com)');
      isValid = false;
    } else {
      clearError('patientEmail');
    }

    // 3. Patient Phone (Min 8 digits)
    const phoneVal = elements.patientPhone.value.trim();
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneVal) {
      showError('patientPhone', 'Please enter a contact phone number');
      isValid = false;
    } else if (phoneVal.replace(/\D/g, '').length < 8) {
      showError('patientPhone', 'Please enter a valid phone number (at least 8-10 digits)');
      isValid = false;
    } else {
      clearError('patientPhone');
    }

    // 4. Department
    const deptVal = elements.bookingDept.value;
    if (!deptVal) {
      showError('bookingDept', 'Please select a medical department');
      isValid = false;
    } else {
      clearError('bookingDept');
    }

    // 5. Doctor
    const docVal = elements.bookingDoctor.value;
    if (!docVal) {
      showError('bookingDoctor', 'Please select a doctor');
      isValid = false;
    } else {
      clearError('bookingDoctor');
    }

    // 6. Date
    const dateVal = elements.bookingDate.value;
    const todayStr = getTodayDateString();
    if (!dateVal) {
      showError('bookingDate', 'Please select an appointment date');
      isValid = false;
    } else if (dateVal < todayStr) {
      showError('bookingDate', 'Appointment date cannot be in the past');
      isValid = false;
    } else {
      clearError('bookingDate');
    }

    // 7. Time Slot
    const slotVal = elements.selectedTimeSlotInput.value;
    if (!slotVal) {
      showError('bookingSlot', 'Please select an available time slot');
      isValid = false;
    } else {
      clearError('bookingSlot');
    }

    return isValid;
  }

  /* ==========================================================================
     10. Booking Submission & Confirmation Slip
     ========================================================================== */
  function handleBookingSubmit(e) {
    e.preventDefault();

    if (!validateBookingForm()) {
      showToast('Please correct the errors in the booking form', 'danger');
      return;
    }

    const doctorObj = DOCTORS_DATA.find(d => d.id === elements.bookingDoctor.value);
    if (!doctorObj) {
      showError('bookingDoctor', 'Selected doctor not found');
      return;
    }

    // UI Loading state
    const submitBtn = elements.submitBookingBtn;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Scheduling Consultation...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';

    setTimeout(() => {
      // Build appointment record
      const newAppointment = {
        id: generateReferenceId(),
        patientName: elements.patientName.value.trim(),
        patientEmail: elements.patientEmail.value.trim(),
        patientPhone: elements.patientPhone.value.trim(),
        patientReason: elements.patientReason.value.trim() || 'General Consultation',
        doctorId: doctorObj.id,
        doctorName: doctorObj.name,
        department: doctorObj.department,
        specialization: doctorObj.specialization,
        date: elements.bookingDate.value,
        timeSlot: elements.selectedTimeSlotInput.value,
        fee: doctorObj.fee,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };

      // Save to state & storage
      state.appointments.unshift(newAppointment);
      saveAppointmentsToStorage();

      // Reset submit button state
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Confirm & Book Appointment';
      if (btnSpinner) btnSpinner.style.display = 'none';

      // Reset form
      elements.appointmentForm.reset();
      state.selectedSlot = '';
      elements.selectedTimeSlotInput.value = '';
      elements.summaryDateDisplay.textContent = 'Not selected';
      elements.summarySlotDisplay.textContent = 'Not selected';
      renderTimeSlots(null);

      // Open Confirmation Modal
      showConfirmationModal(newAppointment);

      // Update History section
      renderAppointmentHistory();

      showToast('Appointment successfully scheduled!', 'success');
    }, 300);
  }

  function showConfirmationModal(appointment) {
    elements.confirmRefCode.textContent = appointment.id;
    elements.confirmPatientName.textContent = appointment.patientName;
    elements.confirmPatientEmail.textContent = appointment.patientEmail;
    elements.confirmPatientPhone.textContent = appointment.patientPhone;
    elements.confirmDoctorName.textContent = appointment.doctorName;
    elements.confirmDeptName.textContent = appointment.department;
    elements.confirmDatetimeVal.textContent = `${formatDateForDisplay(appointment.date)} at ${appointment.timeSlot}`;
    elements.confirmFeeVal.textContent = `$${appointment.fee} (Pay at clinic)`;

    elements.confirmationModal.style.display = 'flex';
    requestAnimationFrame(() => {
      elements.confirmationModal.classList.add('active');
      elements.confirmationModal.setAttribute('aria-hidden', 'false');
    });

    document.body.style.overflow = 'hidden';
    elements.confirmModalCloseBtn.focus();
  }

  function closeConfirmationModal() {
    elements.confirmationModal.classList.remove('active');
    elements.confirmationModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      elements.confirmationModal.style.display = 'none';
      document.body.style.overflow = '';
    }, 200);
  }

  /* ==========================================================================
     11. Appointment History Manager
     ========================================================================== */
  function renderAppointmentHistory() {
    loadStoredAppointments();
    const list = state.appointments;

    if (!list || list.length === 0) {
      if (elements.historyHeaderActions) {
        elements.historyHeaderActions.style.display = 'none';
      }
      if (elements.historyContentArea) {
        elements.historyContentArea.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>No Appointments Found</h3>
            <p>You haven't scheduled any doctor appointments yet. Select a doctor above to book your consultation.</p>
            <a href="#booking" class="btn btn-primary">Book an Appointment Now</a>
          </div>
        `;
      }
      return;
    }

    if (elements.historyHeaderActions) {
      elements.historyHeaderActions.style.display = 'block';
    }

    // Desktop Table HTML
    const tableRows = list.map(apt => {
      const isConfirmed = apt.status === 'Confirmed';
      const statusClass = isConfirmed ? 'status-confirmed' : 'status-cancelled';

      return `
        <tr>
          <td><span class="ref-tag">${escapeHtml(apt.id)}</span></td>
          <td>
            <strong>${escapeHtml(apt.patientName)}</strong><br>
            <small style="color: var(--slate-500);">${escapeHtml(apt.patientPhone)}</small>
          </td>
          <td>
            <strong>${escapeHtml(apt.doctorName)}</strong><br>
            <small style="color: var(--slate-500);">${escapeHtml(apt.department)}</small>
          </td>
          <td>
            <strong>${escapeHtml(formatDateForDisplay(apt.date))}</strong><br>
            <small style="color: var(--slate-500);">${escapeHtml(apt.timeSlot)}</small>
          </td>
          <td><strong>$${apt.fee}</strong></td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(apt.status)}</span></td>
          <td>
            <div class="history-row-actions">
              <button type="button" class="btn btn-secondary btn-sm view-slip-btn" data-apt-id="${escapeHtml(apt.id)}" title="View Receipt Slip">
                View Slip
              </button>
              ${isConfirmed ? `
                <button type="button" class="btn btn-outline-danger btn-sm cancel-apt-btn" data-apt-id="${escapeHtml(apt.id)}" title="Cancel Appointment">
                  Cancel Appointment
                </button>
              ` : `
                <span style="font-size: 0.75rem; color: var(--slate-400); font-weight: 600;">Cancelled</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Mobile Cards HTML
    const cardsList = list.map(apt => {
      const isConfirmed = apt.status === 'Confirmed';
      const statusClass = isConfirmed ? 'status-confirmed' : 'status-cancelled';

      return `
        <div class="history-card">
          <div class="history-card-header">
            <span class="ref-tag">${escapeHtml(apt.id)}</span>
            <span class="status-badge ${statusClass}">${escapeHtml(apt.status)}</span>
          </div>
          <div class="history-card-body">
            <div class="history-card-row">
              <span>Patient:</span>
              <strong>${escapeHtml(apt.patientName)}</strong>
            </div>
            <div class="history-card-row">
              <span>Doctor:</span>
              <strong>${escapeHtml(apt.doctorName)}</strong>
            </div>
            <div class="history-card-row">
              <span>Department:</span>
              <span>${escapeHtml(apt.department)}</span>
            </div>
            <div class="history-card-row">
              <span>Date &amp; Time:</span>
              <strong>${escapeHtml(formatDateForDisplay(apt.date))} @ ${escapeHtml(apt.timeSlot)}</strong>
            </div>
            <div class="history-card-row">
              <span>Fee:</span>
              <strong>$${apt.fee}</strong>
            </div>
          </div>
          <div class="history-card-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-block view-slip-btn" data-apt-id="${escapeHtml(apt.id)}">
              View Slip
            </button>
            ${isConfirmed ? `
              <button type="button" class="btn btn-outline-danger btn-sm btn-block cancel-apt-btn" data-apt-id="${escapeHtml(apt.id)}">
                Cancel Appointment
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (elements.historyContentArea) {
      elements.historyContentArea.innerHTML = `
        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date &amp; Time</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="history-cards-list">
          ${cardsList}
        </div>
      `;
    }
  }

  function cancelAppointment(aptId) {
    if (!aptId) {
      console.warn('cancelAppointment called with empty ID');
      return;
    }

    // Sync latest appointments from localStorage
    loadStoredAppointments();

    const normalizedId = String(aptId).trim().toLowerCase();
    const aptIndex = state.appointments.findIndex(a => String(a.id).trim().toLowerCase() === normalizedId);

    if (aptIndex === -1) {
      console.warn(`Appointment with ID ${aptId} not found.`);
      showToast('Appointment not found', 'danger');
      return;
    }

    const appointment = state.appointments[aptIndex];

    // Confirmation dialog
    let confirmed = true;
    try {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        confirmed = window.confirm(`Are you sure you want to cancel your appointment (${appointment.id}) with ${appointment.doctorName} on ${formatDateForDisplay(appointment.date)}?`);
      }
    } catch (e) {
      confirmed = true;
    }

    if (!confirmed) return;

    // Update status to Cancelled
    state.appointments[aptIndex].status = 'Cancelled';

    // Save updated array to localStorage using the same key
    saveAppointmentsToStorage();

    // Immediately re-render history UI
    renderAppointmentHistory();

    showToast(`Appointment ${appointment.id} has been cancelled`, 'info');
  }

  function clearAllHistory() {
    loadStoredAppointments();

    if (!state.appointments || state.appointments.length === 0) {
      return;
    }

    let confirmed = true;
    try {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        confirmed = window.confirm('Are you sure you want to clear your stored appointment history from this browser?');
      }
    } catch (e) {
      confirmed = true;
    }

    if (!confirmed) return;

    // Reset in-memory state
    state.appointments = [];

    // Remove from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error removing from localStorage:', e);
    }

    // Save empty state to ensure persistence
    saveAppointmentsToStorage();

    // Immediately re-render history UI to display empty state
    renderAppointmentHistory();

    showToast('Appointment history cleared', 'info');
  }

  /* ==========================================================================
     12. Navigation & Header Scroll State
     ========================================================================== */
  function initializeNavigation() {
    // Header shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        elements.header.classList.add('scrolled');
      } else {
        elements.header.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile Hamburger Toggle
    if (elements.mobileToggle) {
      elements.mobileToggle.addEventListener('click', () => {
        const isOpen = elements.mobileNav.classList.contains('open');
        elements.mobileNav.classList.toggle('open', !isOpen);
        elements.mobileToggle.classList.toggle('active', !isOpen);
        elements.mobileToggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        elements.mobileNav.setAttribute('aria-hidden', !isOpen ? 'false' : 'true');
      });
    }

    // Close mobile nav when clicking any nav link
    elements.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (elements.mobileNav && elements.mobileNav.classList.contains('open')) {
          elements.mobileNav.classList.remove('open');
          elements.mobileToggle.classList.remove('active');
          elements.mobileToggle.setAttribute('aria-expanded', 'false');
          elements.mobileNav.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          elements.navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { passive: true });
  }

  /* ==========================================================================
     13. Event Listeners Setup
     ========================================================================== */
  function attachEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.clearSearchBtn.addEventListener('click', clearSearch);

    // Department pills
    elements.filterPills.forEach(pill => {
      pill.addEventListener('click', () => handleDepartmentPillClick(pill));
    });

    // Sort select
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderDoctors();
    });

    // Reset buttons
    elements.resetAllFiltersBtn.addEventListener('click', resetAllFilters);
    elements.emptyResetBtn.addEventListener('click', resetAllFilters);

    // Hero quick lookup
    if (elements.heroSearchBtn) {
      elements.heroSearchBtn.addEventListener('click', () => {
        const dept = elements.heroDeptSelect.value;
        const query = elements.heroDoctorSearch.value.trim();

        state.selectedDepartment = dept;
        state.searchQuery = query;

        elements.searchInput.value = query;
        elements.clearSearchBtn.style.display = query ? 'block' : 'none';

        elements.filterPills.forEach(pill => {
          const isSelected = pill.getAttribute('data-dept').toLowerCase() === dept.toLowerCase();
          pill.classList.toggle('active', isSelected);
          pill.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });

        renderDoctors();

        // Scroll to Doctors section
        const doctorsSection = document.getElementById('doctors');
        if (doctorsSection) {
          doctorsSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Department cards click
    elements.deptCards.forEach(card => {
      const handleDeptSelect = () => {
        const dept = card.getAttribute('data-dept');
        state.selectedDepartment = dept;
        state.searchQuery = '';
        elements.searchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';

        elements.filterPills.forEach(pill => {
          const isSelected = pill.getAttribute('data-dept').toLowerCase() === dept.toLowerCase();
          pill.classList.toggle('active', isSelected);
          pill.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });

        renderDoctors();

        const doctorsSection = document.getElementById('doctors');
        if (doctorsSection) {
          doctorsSection.scrollIntoView({ behavior: 'smooth' });
        }
      };

      card.addEventListener('click', handleDeptSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDeptSelect();
        }
      });
    });

    // Footer department links
    elements.deptFooterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const dept = link.getAttribute('data-dept');
        if (dept) {
          state.selectedDepartment = dept;
          elements.filterPills.forEach(pill => {
            const isSelected = pill.getAttribute('data-dept').toLowerCase() === dept.toLowerCase();
            pill.classList.toggle('active', isSelected);
            pill.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          });
          renderDoctors();
        }
      });
    });

    // Doctor Profile Modal events
    elements.modalCloseBtn.addEventListener('click', closeDoctorProfileModal);
    elements.modalCancelBtn.addEventListener('click', closeDoctorProfileModal);
    elements.doctorModal.addEventListener('click', (e) => {
      if (e.target === elements.doctorModal) {
        closeDoctorProfileModal();
      }
    });

    elements.modalBookBtn.addEventListener('click', () => {
      if (activeModalDoctor) {
        selectDoctorForBooking(activeModalDoctor.id, true);
      }
    });

    // Confirmation Modal events
    elements.confirmModalCloseBtn.addEventListener('click', closeConfirmationModal);
    elements.confirmationModal.addEventListener('click', (e) => {
      if (e.target === elements.confirmationModal) {
        closeConfirmationModal();
      }
    });

    elements.confirmPrintBtn.addEventListener('click', () => {
      window.print();
    });

    elements.confirmViewHistoryBtn.addEventListener('click', () => {
      closeConfirmationModal();
      const historySection = document.getElementById('history');
      if (historySection) {
        historySection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Global Escape Key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.doctorModal.classList.contains('active')) {
          closeDoctorProfileModal();
        }
        if (elements.confirmationModal.classList.contains('active')) {
          closeConfirmationModal();
        }
      }
    });

    // Booking form field changes
    elements.bookingDept.addEventListener('change', handleDepartmentDropdownChange);
    elements.bookingDoctor.addEventListener('change', handleDoctorDropdownChange);
    elements.bookingDate.addEventListener('change', handleDateChange);

    // Clear inline errors on input
    elements.patientName.addEventListener('input', () => clearError('patientName'));
    elements.patientEmail.addEventListener('input', () => clearError('patientEmail'));
    elements.patientPhone.addEventListener('input', () => clearError('patientPhone'));

    // Booking form submit
    elements.appointmentForm.addEventListener('submit', handleBookingSubmit);

    // History section event delegation (Cancel, View Slip)
    if (elements.historyContentArea) {
      elements.historyContentArea.addEventListener('click', (e) => {
        const cancelBtn = e.target.closest('.cancel-apt-btn');
        if (cancelBtn) {
          e.preventDefault();
          const aptId = cancelBtn.getAttribute('data-apt-id');
          if (aptId) {
            cancelAppointment(aptId);
          }
          return;
        }

        const viewSlipBtn = e.target.closest('.view-slip-btn');
        if (viewSlipBtn) {
          e.preventDefault();
          const aptId = viewSlipBtn.getAttribute('data-apt-id');
          if (aptId) {
            loadStoredAppointments();
            const appointment = state.appointments.find(a => String(a.id).trim().toLowerCase() === String(aptId).trim().toLowerCase());
            if (appointment) {
              showConfirmationModal(appointment);
            }
          }
          return;
        }
      });
    }

    // Clear history button
    if (elements.clearHistoryBtn) {
      elements.clearHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearAllHistory();
      });
    }

    // Global delegation for clear history
    document.addEventListener('click', (e) => {
      const clearBtn = e.target.closest('#clear-history-btn, .clear-history-btn');
      if (clearBtn && clearBtn !== elements.clearHistoryBtn) {
        e.preventDefault();
        clearAllHistory();
      }
    });
  }

  /* ==========================================================================
     14. Application Initialization
     ========================================================================== */
  function init() {
    loadStoredAppointments();
    initializeNavigation();
    initializeBookingForm();
    renderDoctors();
    renderAppointmentHistory();
    attachEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
