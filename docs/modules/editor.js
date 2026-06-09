/* ============================================================
   editor.js — Refs DOM, render, parse, keyboard/scroll events
   ============================================================ */

import { MinJSONParser }                  from './parser.js';
import { highlightInput, highlightJSON, escHl } from './highlighter.js';
import { t }                              from './i18n.js';

// ── Helpers ──

export const $ = id => document.getElementById(id);

// ── DOM refs ──

export const editor      = $('editor');
export const editorHl    = $('editor-hl');
export const output      = $('output');
export const statusEl    = $('status');

// ── State ──

export let compact = false;
export const setCompact = v => { compact = v; };

// ── Utilities ──

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Highlight ──

function syncHlScroll() {
  const x = editor.scrollLeft;
  const y = editor.scrollTop;
  // Chỉ update khi thay đổi để tránh forced reflow
  if (editorHl._sx !== x || editorHl._sy !== y) {
    editorHl._sx = x;
    editorHl._sy = y;
    editorHl.style.transform = `translate(${-x}px,${-y}px)`;
  }
}

export function renderHighlight() {
  editorHl.innerHTML = highlightInput(editor.value);
  syncHlScroll();
}

// ── Parse + Render output ──

export function parseAndRender() {
  const parser = new MinJSONParser(editor.value);
  const result = parser.parse();

  if (result === null || parser.errors.length > 0) {
    const err = parser.errors[0];
    statusEl.textContent = t('statusErr')(err?.lineNum ?? null);
    statusEl.className   = 'status error';
    const errMsgMap = {
      ERR_INDENT: t('parseErrIndent'),
      ERR_KV:     t('parseErrKV'),
      ERR_ITEM:   t('parseErrItem'),
    };
    const msg = errMsgMap[err?.message] || err?.message || t('parseErrSyntax');
    output.innerHTML = `<span class="j-err">${t('outputErr')(err?.lineNum ?? null)}\n// ${escapeHtml(msg)}</span>`;
    return;
  }

  statusEl.textContent = t('statusOk');
  statusEl.className   = 'status ok';

  const json = JSON.stringify(result, null, compact ? 0 : 2);
  output.innerHTML = highlightJSON(json);
}

export function getJSON() {
  const parser = new MinJSONParser(editor.value);
  const result = parser.parse();
  if (result === null) return null;
  return JSON.stringify(result, null, compact ? 0 : 2);
}

// ── Event listeners ──

// Sync scroll của highlight layer với textarea
editor.addEventListener('scroll', syncHlScroll, { passive: true });

// compositionend: cần thiết cho IME (Gboard, telex, bộ gõ CJK)
editor.addEventListener('compositionend', renderHighlight);

// Live update: highlight ngay (nhẹ), parse sau 120ms (nặng hơn)
let debounceTimer = null;
editor.addEventListener('input', () => {
  renderHighlight();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(parseAndRender, 120);
});

// Tab → 2 spaces | Enter → auto-indent
editor.addEventListener('keydown', e => {
  const start = editor.selectionStart;
  const end   = editor.selectionEnd;
  const val   = editor.value;

  if (e.key === 'Tab') {
    e.preventDefault();
    editor.value = val.slice(0, start) + '  ' + val.slice(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
    renderHighlight();
    parseAndRender();
    return;
  }

  if (e.key === 'Enter') {
    const lineStart   = val.lastIndexOf('\n', start - 1) + 1;
    const currentLine = val.slice(lineStart, start);
    const indentMatch = currentLine.match(/^([ \t]*)/);
    const indent      = indentMatch ? indentMatch[1] : '';

    if (indent.length > 0) {
      e.preventDefault();
      const insert = '\n' + indent;
      editor.value = val.slice(0, start) + insert + val.slice(end);
      editor.selectionStart = editor.selectionEnd = start + insert.length;
      renderHighlight();
      parseAndRender();
    }
    // else: để browser xử lý Enter bình thường
  }
});
