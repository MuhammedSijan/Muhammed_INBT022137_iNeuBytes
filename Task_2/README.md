# MedoraCare | Doctor Appointment Booking System

**iNeuBytes Internship Program — Task 2 Project**

A modern, responsive, application-style Doctor Appointment Booking System built strictly using **HTML5, CSS3, and Vanilla JavaScript** with **browser `localStorage` persistence**.

---

## 1. Project Overview & Objective

The objective of this project is to develop a self-contained, client-side healthcare web application that allows patients to:
1. Search and filter verified medical doctors across multiple departments.
2. View detailed doctor profiles, credentials, consultation fees, and available schedules.
3. Schedule appointments via a dynamic multi-step booking form with client-side validation.
4. Prevent past-date bookings and interactively select time slots.
5. Generate a unique appointment reference ID (e.g., `MDC-2026-XXXX`) with an instant confirmation receipt.
6. Manage and persist appointment records in browser `localStorage` with options to view slips and cancel bookings.

---

## 2. Technology Stack & Constraints Adherence

This project is built from scratch strictly adhering to the technical constraints of iNeuBytes Task 2:

- **HTML5**: Semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<dialog>` / modal structures), ARIA attributes (`aria-expanded`, `aria-controls`, `aria-modal`, `aria-live`, `role="dialog"`), accessible form inputs with native constraint attributes.
- **CSS3**: Modern custom properties (design tokens), flexbox and CSS grid layouts, system font stack (no external font downloads or CDNs), fluid typography, custom scrollbars, print stylesheet (`@media print`), and responsive media queries across 6 breakpoints.
- **Vanilla JavaScript (ES6+)**: Self-executing modular architecture (`IIFE`), state management, array manipulation (`filter`, `map`, `sort`), DOM manipulation, input validation regex, event delegation, and `localStorage` synchronization.
- **Zero External Dependencies**: No frameworks (React, Vue, Angular), no CSS libraries (Bootstrap, Tailwind), no jQuery, no backend servers (Node, PHP), no cloud databases (Firebase, MySQL), and no external font/icon CDNs.
- **Local Vector Graphics**: All doctor avatars and interface icons are implemented as clean, scalable SVG assets stored locally in the `images/` directory.

---

## 3. Key Features & Functionality

### 3.1. Responsive Navigation & Brand Identity
- Fictional healthcare brand: **MedoraCare**.
- Sticky navigation bar with subtle scroll shadow.
- Responsive mobile hamburger menu with accessible ARIA toggle states.
- Smooth anchor scrolling with active section indicator.

### 3.2. Hero & Quick Doctor Lookup
- Application introduction with neutral healthcare labels (*"Verified Doctors"*, *"Flexible Scheduling"*, *"Easy Booking"*).
- Interactive quick search card embedded directly in the hero to search by department and doctor name.

### 3.3. Clinical Departments Showcase
- Six primary medical departments:
  - **Cardiology**
  - **Dermatology**
  - **Neurology**
  - **Pediatrics**
  - **Orthopedics**
  - **General Medicine**
- Interactive department cards that dynamically filter the doctor listings and smoothly scroll to the directory.

### 3.4. Dynamic Doctor Directory & Search Engine
- **Live Search**: Case-insensitive instant search matching doctor name, department, specialization, and clinical biography.
- **Department Filters**: Interactive pill tabs with active state indicators.
- **Sorting Options**: Sort doctors by featured order, years of experience, consultation fee (low to high / high to low), or alphabetical name.
- **Real-Time Results Counter**: Dynamically displays matching doctor count.
- **Clean Empty State**: Helpful message and one-click filter reset button when no records match.

### 3.5. Interactive Doctor Profile Modal
- Modal dialog displaying full credentials, education, consultation fee, biography, and weekly consultation days.
- Keyboard accessible (`Escape` key close, close button, backdrop click dismissal).
- Direct *"Book Appointment with This Doctor"* CTA that auto-populates the booking form.

### 3.6. Dynamic Appointment Booking Engine
- **Patient Details**: Full name, email address, phone number, and optional reason for visit.
- **Doctor & Department Synchronization**:
  - Selecting a department automatically filters doctors in the dropdown.
  - Selecting a doctor auto-syncs the department and updates the live sidebar summary.
- **Date Picker Protection**: Dynamically enforces the `min` attribute to today's local date (`YYYY-MM-DD`), preventing past date bookings.
- **Interactive Time Slot Chips**: Dynamically renders available slots for the selected doctor with active selection highlights.
- **Live Booking Summary Sidebar**: Displays a live preview of the selected doctor, date, time slot, and estimated consultation fee breakdown.

### 3.7. Robust Client-Side Validation
- Real-time and on-submit validation:
  - Patient Name: Minimum 2 characters, letters and spaces only.
  - Email: Standard RFC email format verification.
  - Phone: Standard phone number formatting with digit length check.
  - Department & Doctor: Required selections.
  - Date: Present or future date constraint.
  - Time Slot: Required slot selection.
- Clear inline error messages and red border highlights (`.is-invalid`, `aria-invalid="true"`).

### 3.8. Instant Confirmation & Printable Slip
- Generates a unique reference ID (e.g. `MDC-2026-8492`).
- Modal confirmation displaying full patient and appointment metadata.
- **Print / Save Slip** button triggering a clean, dedicated print layout (`@media print`).

### 3.9. Appointment History Management & Persistence
- Automatically persists bookings in browser `localStorage` under `medoracare_appointments`.
- Renders responsive table on desktop and compact card view on mobile.
- **View Slip**: Re-opens the confirmation modal for any past booking.
- **Cancellation**: Allows users to cancel scheduled appointments with a confirmation modal and visual badge update (*"Cancelled"*).
- **Clear History**: Option to reset demo records safely.
- Safe error handling for corrupt or disabled `localStorage`.

---

## 4. Application Architecture & Data Flow

```
[User Interaction]
       │
       ├─► [Search / Filter / Sort] ──► [Filter DOCTORS_DATA Array] ──► [Render Doctor Cards Grid]
       │
       ├─► [View Profile Modal] ──────► [Display Doctor Bio & Schedule] ──► [Select for Booking]
       │
       └─► [Booking Form Submission]
                 │
                 ▼
          [Validate Form Inputs]
                 │
           ┌─────┴─────┐
           ▼           ▼
       [Invalid]    [Valid]
           │           │
       [Show Errors]   ├─► [Generate Reference: MDC-2026-XXXX]
                       ├─► [Update LocalStorage State]
                       ├─► [Open Confirmation Modal / Slip]
                       └─► [Update Appointment History Table]
```

---

## 5. LocalStorage Data Schema

Appointments are stored in `localStorage` under the key `medoracare_appointments` as a JSON array of objects:

```json
[
  {
    "id": "MDC-2026-4821",
    "patientName": "John Doe",
    "patientEmail": "john.doe@example.com",
    "patientPhone": "+1 (555) 234-5678",
    "patientReason": "Routine cardiac screening",
    "doctorId": "dr-sarah-jenkins",
    "doctorName": "Dr. Sarah Jenkins",
    "department": "Cardiology",
    "specialization": "Interventional Cardiology & Heart Health",
    "date": "2026-09-10",
    "timeSlot": "10:30 AM",
    "fee": 120,
    "status": "Confirmed",
    "createdAt": "2026-09-06T04:15:30.000Z"
  }
]
```

---

## 6. Project Structure

```
Task_2/
└── Doctor-Appointment-Booking-System/
    ├── index.html        # Semantic HTML5 markup, accessible forms & modals
    ├── style.css         # Self-contained CSS3 design tokens, responsive grid & print styles
    ├── script.js         # Modular Vanilla JS application logic & state management
    ├── README.md         # Complete internship project documentation
    └── images/           # High-quality local SVG doctor avatars
        ├── doctor-sarah.svg
        ├── doctor-marcus.svg
        ├── doctor-elena.svg
        ├── doctor-david.svg
        ├── doctor-olivia.svg
        ├── doctor-arthur.svg
        ├── doctor-amara.svg
        └── doctor-liam.svg
```

---

## 7. How to Run the Project

1. Clone or download the repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd Task_2/Doctor-Appointment-Booking-System
   ```
3. Open `index.html` directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
4. No build step, `npm install`, or local server setup is required because the application is 100% self-contained.

---

## 8. Responsive Design & Breakpoints Tested

The design is fluid and tested across standard device viewports:

| Breakpoint | Target Devices | Layout Behavior |
|---|---|---|
| **1440px+** | Large Desktop | Two-column hero, 3-column doctor grid, sticky live booking summary |
| **1024px** | Laptops / Tablets (Landscape) | Stacked hero card, 2-column doctor grid, flexible sidebar |
| **768px** | Tablets (Portrait) | Hamburger menu toggle, single-column forms, history table switches to mobile cards |
| **480px** | Large Mobile Phones | Full-width buttons, 2-column slot grid, optimized modal spacing |
| **390px / 375px** | Standard Mobile Phones | Zero horizontal scroll, fluid typography, stacked profile modal |

---

## 9. Self-Audit & Verification Checklist

- [x] **Strict Tech Stack**: Pure HTML5, CSS3, Vanilla JS. Zero frameworks or CDNs.
- [x] **System Font Stack**: Standard `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` without Google Fonts.
- [x] **Realistic Demo Data**: Fictional doctors, neutral healthcare labels, and realistic consultation scenarios.
- [x] **Live Doctor Search**: Case-insensitive filtering across name, department, specialization, and bio.
- [x] **Department Filter**: 6 medical departments with multi-filter synchronization.
- [x] **Doctor Profile Modal**: Opens with full details; closes via 'X', backdrop, or `Escape` key.
- [x] **Date Validation**: Past dates cannot be selected (`min` attribute + JS verification).
- [x] **Dynamic Time Slots**: Slot chips generated per doctor with interactive active state.
- [x] **Form Validation**: Strict regex and required checks with accessible inline error messages.
- [x] **Instant Confirmation**: Generates unique `MDC-2026-XXXX` reference with printable slip.
- [x] **LocalStorage Persistence**: Bookings persist across page refreshes and browser restarts.
- [x] **Cancellation Support**: Status updates to *"Cancelled"* with confirmation prompt.
- [x] **Zero Console Errors**: Clean execution with defensive null checking.

---

## 10. Future Enhancement Ideas

1. **Email / SMS Reminders**: Integration with Web Notification API or backend SMS gateways.
2. **Doctor Schedule Calendar**: Full monthly calendar view showing blocked vacation dates.
3. **Multi-Language Localization**: Internationalization (i18n) for multilingual patient portals.
4. **Telehealth Video Room Integration**: Direct WebRTC links for remote virtual consultations.

---

## 11. Project Attribution

Developed by **Muhammed Sijan** as part of the **iNeuBytes Internship Program** (Task 2: Doctor Appointment Booking System).
