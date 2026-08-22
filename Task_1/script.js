/* ==========================================================================
   CarePlus Clinic - Interactive Interactions & Validations (Task 1)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM Elements
    const header = document.querySelector('.main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const appointmentForm = document.getElementById('appointment-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-appointment-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    // ----------------------------------------------------------------------
    // 1. Mobile Menu Drawer Navigation
    // ----------------------------------------------------------------------
    function toggleMobileMenu() {
        const isOpen = mainNav.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mainNav.classList.add('open');
        menuToggle.classList.add('open');
        menuToggle.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        mainNav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    }

    // Toggle menu click
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close menu when clicking the CTA button in navbar
    const navCta = document.querySelector('.nav-cta-btn');
    if (navCta) {
        navCta.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    // Close menu when clicking outside of the header navigation
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target) && mainNav.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // ----------------------------------------------------------------------
    // 2. Active Section Highlight on Scroll (Intersection Observer)
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,         // Use viewport
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies core area
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                // Update active navigation link
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ----------------------------------------------------------------------
    // 3. Smooth Navigation Scroll Intercept
    // ----------------------------------------------------------------------
    const allScrollLinks = document.querySelectorAll('a[href^="#"]');
    allScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                return; // Let default behavior run or ignore dummy links
            }
            
            e.preventDefault();
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Deduct header height for perfect offset positioning
                    const headerHeight = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // If it is a regular navbar link, manually update active class
                    if (this.classList.contains('nav-link')) {
                        navLinks.forEach(item => item.classList.remove('active'));
                        this.classList.add('active');
                    }
                }
            } catch (err) {
                console.error("Error scrolling to target selector:", targetId, err);
            }
        });
    });

    // ----------------------------------------------------------------------
    // 4. Appointment Form Validation & Submission
    // ----------------------------------------------------------------------
    const formFields = {
        name: {
            input: document.getElementById('patient-name'),
            errorSpan: document.getElementById('name-error'),
            validate: (value) => {
                if (!value.trim()) return 'Patient name is required.';
                if (value.trim().length < 3) return 'Name must be at least 3 characters.';
                if (!/^[a-zA-Z\s.-]+$/.test(value.trim())) return 'Name contains invalid characters.';
                return '';
            }
        },
        email: {
            input: document.getElementById('patient-email'),
            errorSpan: document.getElementById('email-error'),
            validate: (value) => {
                if (!value.trim()) return 'Email address is required.';
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value.trim())) return 'Please enter a valid email address (e.g. name@example.com).';
                return '';
            }
        },
        phone: {
            input: document.getElementById('patient-phone'),
            errorSpan: document.getElementById('phone-error'),
            validate: (value) => {
                if (!value.trim()) return 'Phone number is required.';
                // Matches standard telephone patterns: allows spaces, dashes, parentheses, plus sign. Min 7, max 18 digits.
                const phonePattern = /^[\d\s+\-()]{7,18}$/;
                if (!phonePattern.test(value.trim())) return 'Please enter a valid phone number (min 7 digits).';
                return '';
            }
        },
        department: {
            input: document.getElementById('patient-dept'),
            errorSpan: document.getElementById('dept-error'),
            validate: (value) => {
                if (!value) return 'Please choose a medical department.';
                return '';
            }
        },
        message: {
            input: document.getElementById('patient-message'),
            errorSpan: document.getElementById('message-error'),
            validate: (value) => {
                if (!value.trim()) return 'Message or symptoms description is required.';
                if (value.trim().length < 15) return 'Please describe your request in more detail (min 15 characters).';
                return '';
            }
        }
    };

    // Inline field validation handler (fires on input blur or value change)
    function validateField(fieldName) {
        const field = formFields[fieldName];
        const value = field.input.value;
        const errorMessage = field.validate(value);
        
        const formGroup = field.input.closest('.form-group');
        
        if (errorMessage) {
            formGroup.classList.add('has-error');
            field.errorSpan.textContent = errorMessage;
            field.input.setAttribute('aria-invalid', 'true');
            return false;
        } else {
            formGroup.classList.remove('has-error');
            field.errorSpan.textContent = '';
            field.input.setAttribute('aria-invalid', 'false');
            return true;
        }
    }

    // Attach inline events for real-time validation feedback
    Object.keys(formFields).forEach(fieldName => {
        const field = formFields[fieldName];
        
        // Input event (when user types) - clears error once they fulfill requirement
        field.input.addEventListener('input', () => {
            if (field.input.closest('.form-group').classList.contains('has-error')) {
                validateField(fieldName);
            }
        });

        // Blur event (when user clicks away) - triggers immediate validation
        field.input.addEventListener('blur', () => {
            validateField(fieldName);
        });
    });

    // Form submit listener
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Trigger all validations
        let isFormValid = true;
        Object.keys(formFields).forEach(fieldName => {
            const isValid = validateField(fieldName);
            if (!isValid) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            // Find first error field and focus it for accessibility
            const firstErrorField = Object.keys(formFields).find(key => {
                return formFields[key].input.closest('.form-group').classList.contains('has-error');
            });
            if (firstErrorField) {
                formFields[firstErrorField].input.focus();
            }
            
            showFormFeedback('Please correct the highlighted errors before submitting.', 'error');
            return;
        }

        // Form is valid - initiate submission feedback
        setLoadingState(true);
        hideFormFeedback();

        // Simulate secure API/Client-Side database processing delay
        setTimeout(() => {
            setLoadingState(false);
            
            // Fictional success response
            const patientName = formFields.name.input.value;
            const chosenDept = formFields.department.input.value;
            
            showFormFeedback(`Thank you, <strong>${escapeHTML(patientName)}</strong>! Your appointment inquiry for the <strong>${escapeHTML(chosenDept)}</strong> department was submitted successfully. A care coordinator will contact you shortly.`, 'success');
            
            // Reset form
            appointmentForm.reset();
            
            // Clear focus states & validations
            Object.keys(formFields).forEach(fieldName => {
                const group = formFields[fieldName].input.closest('.form-group');
                group.classList.remove('has-error');
                formFields[fieldName].input.removeAttribute('aria-invalid');
            });

            // Scroll feedback into view
            formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }, 1500);
    });

    // Helper functions
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    }

    function showFormFeedback(message, type) {
        formFeedback.innerHTML = message;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.classList.remove('hidden');
    }

    function hideFormFeedback() {
        formFeedback.innerHTML = '';
        formFeedback.className = 'form-feedback hidden';
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
