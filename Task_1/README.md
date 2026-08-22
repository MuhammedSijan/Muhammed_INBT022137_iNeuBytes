# CarePlus Clinic Landing Page
### iNeuBytes Web Development Internship — Task 1 Submission
**Course ID:** WBIN10726

---

## 📋 Project Objective
The objective of this project is to build a modern, fully responsive landing page for a fictional clinic named **CarePlus Clinic**. The website provides prospective patients with key information regarding clinic offerings, specialized medical services, doctor highlights, and patient testimonials, alongside an interactive, validated appointment enquiry form.

---

## 🛠️ Technologies Used
This project is built from scratch without any external CSS/JS libraries or backend components:
- **HTML5:** Semantic architecture (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<form>`, `<label>`).
- **CSS3:** Responsive grid/flex layouts, CSS variables, hover transition micro-animations, media queries, accessibility focus rings, and custom styles.
- **Vanilla JavaScript:** Responsive navbar drawer, outside-click close, IntersectionObserver active highlights, smooth window offsets scrolling, and real-time form input validations.

---

## ✨ Main Features
1. **Responsive Visual Branding:** Premium modern layout with custom HSL health themes, SVG icons, and generated high-resolution clinic photos.
2. **Dynamic Mobile Drawer:** Hamburger button collapses and expands the menu with clean CSS transitions; clicking a navigation link or outside the menu automatically closes the drawer.
3. **Smooth Scroll Intercepts:** Navigation elements intercept traditional hash-links to scroll smoothly while compensating for header height offsets.
4. **Active Navigation Observer:** Navbar links dynamically highlight active items by observing the scroll intersection positions of main sections.
5. **Robust Client-Side Validation:** 
   - Custom real-time input checks for Name (letters/min length), Email (regex pattern), Phone (regex digits/hyphens/length), Department, and Messages.
   - Distinct accessibility invalid/valid input states and visual error boundaries.
   - Interactive loading states showing a spinner and a success banner upon valid submit without reloading.
6. **Responsive Google Maps Integration:** Responsive iframe map showing a fictional clinic location without requiring an API key.

---

## 📂 Project Structure
```text
Healthcare-Clinic-Landing-Page/
├── index.html       # Primary HTML5 content page
├── style.css        # Theme variables, responsive styles, and layout styling
├── script.js        # Main JavaScript interactions and form validation logic
├── README.md        # Project documentation
└── images/          # Image assets directory
    ├── hero.jpg             # Clinic lobby backdrop
    ├── about.jpg            # Patient consultation graphic
    ├── doctor-jenkins.jpg   # Fictional Cardiologist headshot
    ├── doctor-chen.jpg      # Fictional Pediatrician headshot
    └── doctor-rostova.jpg   # Fictional Dermatologist headshot
```

---

## 🚀 How to Run the Project
1. Clone or download this repository folder onto your local machine.
2. Double-click the `index.html` file to open it directly in a standard web browser (Chrome, Firefox, Edge, Safari).
3. Alternatively, launch using a local web server tool for the best experience:
   - **VS Code:** Install "Live Server" extension, right-click `index.html`, and select *Open with Live Server*.
   - **Python:** Run the command `python -m http.server 8000` in the workspace directory, then open `http://localhost:8000` in your browser.

---

## 🧪 Testing Summary

### Layout & Responsiveness
- **Desktop (1200px+):** Standard side-by-side grids, floating cards, high-contrast layouts.
- **Tablet (768px - 1024px):** Cards reflow from 3-column to 2-column or single column. Margins scale down to maximize visibility.
- **Mobile (under 768px):** Navbar links fold into a toggleable slide drawer. Hero and contact panels stack vertically. Layout fits perfectly inside 320px width without horizontal overflows.

### Validation Checking
- **Empty Fields:** Submitting an empty form triggers specific required messages under all inputs.
- **Field Constraints:** Entering `< 3` characters for name or `< 15` characters for message details triggers length warnings. Invalid emails/phones trigger regex warnings.
- **Success State:** Submitting a valid form fires a 1.5s simulated loading sequence, shows a success feedback box containing the client name and department, clears errors, resets form fields, and focuses scroll back to the success banner.
