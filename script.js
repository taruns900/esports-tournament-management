document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  document.getElementById('become-organizer-btn').addEventListener('click', () => {
    showSection('organizer-register');
  });

  document.getElementById('back-to-home').addEventListener('click', () => {
    showSection('home');
  });

  document.getElementById('return-home-success').addEventListener('click', () => {
    showSection('home');
  });

  // Form submission
  document.getElementById('organizer-registration-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('org-email').value;
    const mobile = document.getElementById('org-phone').value;
    const emailError = document.getElementById('email-error');
    const mobileError = document.getElementById('mobile-error');

    emailError.textContent = '';
    mobileError.textContent = '';

    let valid = true;

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      emailError.textContent = 'Please enter a valid email.';
      valid = false;
    }

    // Mobile validation (10 digits)
    if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      mobileError.textContent = 'Enter a valid 10-digit mobile number.';
      valid = false;
    }

    if (valid) {
      document.getElementById('organizer-registration-form').classList.add('hidden');
      document.getElementById('registration-success').classList.remove('hidden');
    }
  });
});

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}