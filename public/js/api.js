/**
 * SafeReadAI Demo — API module
 * Handles all fetch calls to the backend.
 */

'use strict';

const API = (() => {
  /**
   * Submit opt-in form
   * @param {string} email
   * @param {boolean} consent
   * @returns {Promise<{success: boolean, token?: string, error?: string}>}
   */
  async function submitOptin(email, consent) {
    try {
      const response = await fetch('/api/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        error: 'Erreur réseau. Vérifie ta connexion et réessaie.',
      };
    }
  }

  /**
   * Fetch demo analysis data by token
   * @param {string} token
   * @returns {Promise<{success: boolean, demo?: object, error?: string}>}
   */
  async function fetchDemoData(token) {
    try {
      const response = await fetch(`/api/demo/${encodeURIComponent(token)}`);
      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        error: 'Erreur réseau lors de la récupération des données de démo.',
      };
    }
  }

  return { submitOptin, fetchDemoData };
})();
