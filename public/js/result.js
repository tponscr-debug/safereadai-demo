/**
 * SafeReadAI Demo — Result page logic
 * Fetches demo data from API, renders threat analysis, pipeline steps.
 */

'use strict';

(() => {
  // -------------------------------------------------------------------------
  // DOM refs
  // -------------------------------------------------------------------------
  const loadingEl   = document.getElementById('result-loading');
  const errorEl     = document.getElementById('result-error');
  const errorMsgEl  = document.getElementById('result-error-msg');
  const contentEl   = document.getElementById('result-content');

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------------------
  // Get token from URL
  // -------------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const token = params.get('demo');

  if (!token) {
    hide(loadingEl);
    show(errorEl);
    if (errorMsgEl) errorMsgEl.textContent = 'Aucun token de démo dans l\'URL. Lance la démo depuis la page d\'accueil.';
    return;
  }

  // -------------------------------------------------------------------------
  // Fetch demo data
  // -------------------------------------------------------------------------
  async function fetchDemoData(token) {
    try {
      const res = await fetch(`/api/demo/${encodeURIComponent(token)}`);
      return await res.json();
    } catch {
      return { success: false, error: 'Erreur réseau.' };
    }
  }

  // -------------------------------------------------------------------------
  // Render threat bar with animation
  // -------------------------------------------------------------------------
  function animateThreatBar(score) {
    const fill = document.getElementById('threat-bar-fill');
    if (!fill) return;
    // Trigger after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = score + '%';
      });
    });
  }

  // -------------------------------------------------------------------------
  // Render pipeline steps with staggered animation
  // -------------------------------------------------------------------------
  const STEP_ICONS = {
    threat:     '⚠',
    processing: '⟳',
    safe:       '✓',
  };

  function renderPipeline(steps) {
    const container = document.getElementById('pipeline-steps');
    if (!container) return;

    container.innerHTML = '';

    steps.forEach((step, index) => {
      const icon = STEP_ICONS[step.status] || '·';
      const el = document.createElement('div');
      el.className = `pipeline-step status-${step.status}`;
      el.setAttribute('role', 'listitem');
      el.innerHTML = `
        <div class="pipeline-step-icon" aria-hidden="true">${icon}</div>
        <div class="pipeline-step-content">
          <div class="pipeline-step-name">${escapeHtml(step.name)}</div>
          <div class="pipeline-step-desc">${escapeHtml(step.description)}</div>
          <div class="pipeline-step-detail">${escapeHtml(step.detail)}</div>
        </div>
        <div style="font-family:var(--font-mono); font-size:10px; color:var(--color-text-3); margin-left:auto; flex-shrink:0;">
          step ${step.step}/${steps.length}
        </div>
      `;

      container.appendChild(el);

      // Staggered entrance animation
      setTimeout(() => {
        el.classList.add('visible');
      }, 200 + index * 150);
    });
  }

  // -------------------------------------------------------------------------
  // Render full result
  // -------------------------------------------------------------------------
  function render(demo) {
    // Threat score
    setText('threat-value', demo.threatScore);
    document.getElementById('threat-value').innerHTML =
      demo.threatScore + '<span>/100</span>';
    setText('threat-type', demo.injectionType);
    setText('threat-vector', '→ ' + demo.injectionVector);

    // Email
    setText('email-sender', demo.emailSender);
    setText('email-subject', demo.emailSubject);
    setText('email-preview-text', demo.emailPreview);
    setText('injection-raw', demo.injectionRaw);

    // Comparison
    setText('compromised-response', demo.compromisedResponse);
    setText('safe-output', demo.safeOutput);

    // Pipeline
    renderPipeline(demo.safereadaiSteps);

    // Data note
    setText('data-note', '🗑️ ' + demo.dataNote);

    // Show content
    hide(loadingEl);
    show(contentEl);

    // Animate threat bar after content is visible
    setTimeout(() => animateThreatBar(demo.threatScore), 300);

    // Update page title with threat score
    document.title = `Menace ${demo.threatScore}/100 — SafeReadAI Demo`;
  }

  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------
  fetchDemoData(token).then((result) => {
    if (result.success && result.demo) {
      render(result.demo);
    } else {
      hide(loadingEl);
      show(errorEl);
      if (errorMsgEl) {
        errorMsgEl.textContent =
          result.error || 'Session introuvable ou expirée.';
      }
    }
  });
})();
