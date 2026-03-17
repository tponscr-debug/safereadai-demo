/**
 * SafeReadAI Demo — UI module
 * Terminal typing effect, form interactions, animations.
 * Runs on index.html only.
 */

'use strict';

(() => {
  // -------------------------------------------------------------------------
  // Terminal typing effect
  // -------------------------------------------------------------------------
  const TYPED_STRINGS = [
    'lit déjà tes emails infectés.',
    'exécute les injections en silence.',
    'est vulnérable par défaut.',
    'a besoin de SafeReadAI.',
  ];

  let currentStringIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  const typedEl = document.getElementById('typed-line');

  function typeLoop() {
    if (!typedEl) return;

    const currentString = TYPED_STRINGS[currentStringIndex];

    if (isDeleting) {
      typedEl.textContent = currentString.substring(0, currentCharIndex - 1);
      currentCharIndex--;
    } else {
      typedEl.textContent = currentString.substring(0, currentCharIndex + 1);
      currentCharIndex++;
    }

    let speed = isDeleting ? 40 : 70;

    if (!isDeleting && currentCharIndex === currentString.length) {
      // Pause at end of string
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && currentCharIndex === 0) {
      isDeleting = false;
      currentStringIndex = (currentStringIndex + 1) % TYPED_STRINGS.length;
      speed = 400;
    }

    setTimeout(typeLoop, speed);
  }

  // Start typing effect after short delay
  setTimeout(typeLoop, 600);

  // -------------------------------------------------------------------------
  // Form validation & submission
  // -------------------------------------------------------------------------
  const form = document.getElementById('optin-form');
  const emailInput = document.getElementById('email-input');
  const emailError = document.getElementById('email-error');
  const formError = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');
  const consentCheckbox = document.getElementById('consent-checkbox');

  if (!form) return; // Guard — not on index page

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('visible');
  }

  function clearError(el) {
    el.textContent = '';
    el.classList.remove('visible');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  // Live validation
  emailInput.addEventListener('input', () => {
    clearError(emailError);
    emailInput.classList.remove('error');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    clearError(emailError);
    clearError(formError);
    emailInput.classList.remove('error');

    const email = emailInput.value.trim();
    const consent = consentCheckbox.checked;

    // Validate
    let valid = true;

    if (!email || !validateEmail(email)) {
      showError(emailError, 'Adresse email invalide.');
      emailInput.classList.add('error');
      emailInput.focus();
      valid = false;
    }

    if (!consent) {
      showError(formError, 'Tu dois accepter le consentement pour continuer.');
      if (valid) consentCheckbox.focus();
      valid = false;
    }

    if (!valid) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    const result = await API.submitOptin(email, consent);

    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');

    if (result.success) {
      // Redirect to confirm page with token (for fallback direct link)
      const confirmUrl = result.token
        ? `/confirm.html?token=${encodeURIComponent(result.token)}`
        : '/confirm.html';
      window.location.href = confirmUrl;
    } else {
      showError(formError, result.error || 'Une erreur est survenue. Réessaie.');
    }
  });

  // -------------------------------------------------------------------------
  // Scroll animation — flow steps fade in
  // -------------------------------------------------------------------------
  const flowSteps = document.querySelectorAll('.flow-step');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    flowSteps.forEach((step, i) => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(20px)';
      step.style.transition = `opacity 0.5s var(--ease-out) ${i * 0.08}s, transform 0.5s var(--ease-out) ${i * 0.08}s`;
      observer.observe(step);
    });
  }
})();
