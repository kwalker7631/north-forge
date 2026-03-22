// utils.js — Shared utilities for North Forge rooms

/**
 * HTML-escape a string for safe injection into innerHTML.
 * Covers &, <, >, and " — the four characters that matter in HTML attribute/text contexts.
 * @param {string|null|undefined} s
 * @returns {string}
 */
export const esc = (s) =>
  (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
