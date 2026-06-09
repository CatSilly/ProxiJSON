/* ============================================================
   ui.js — Toast, tabs, compact, copy, download, help, divider,
           unsaved-changes guard
   ============================================================ */

import { $, editor, getJSON, renderHighlight, parseAndRender, setCompact } from './editor.js';
import { t, getLang, applyLang }  from './i18n.js';
import { SAMPLE_VI, SAMPLE_EN }   from './samples.js';


// ──────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────

const toastEl   = $('toast');
let   toastTimer = null;

export function toast(msg, isErr = false) {
  toastEl.textContent = msg;
  toastEl.className   = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 2200);
}


// ──────────────────────────────────────────────
// TABS (mobile)
// ──────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    $('pane-editor').classList.toggle('hidden', target !== 'editor');
    $('pane-preview').classList.toggle('hidden', target !== 'preview');
    if (target === 'preview') parseAndRender();
    if (target === 'editor')  renderHighlight();
  });
});


// ──────────────────────────────────────────────
// COMPACT TOGGLE
// ──────────────────────────────────────────────

$('compact').addEventListener('change', e => {
  setCompact(e.target.checked);
  parseAndRender();
});


// ──────────────────────────────────────────────
// COPY
// ──────────────────────────────────────────────

$('btn-copy').addEventListener('click', async () => {
  const json = getJSON();
  if (json === null) { toast(t('toastSyntaxErr'), true); return; }
  try {
    await navigator.clipboard.writeText(json);
    toast(t('toastCopied'));
  } catch {
    // Fallback cho trình duyệt không hỗ trợ Clipboard API
    const ta = document.createElement('textarea');
    ta.value = json;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast(t('toastCopied'));
  }
});


// ──────────────────────────────────────────────
// DOWNLOAD
// ──────────────────────────────────────────────

$('btn-download').addEventListener('click', () => {
  const json = getJSON();
  if (json === null) { toast(t('toastSyntaxErr'), true); return; }
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'output.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast(t('toastDownloaded'));
});


// ──────────────────────────────────────────────
// HELP PANEL
// ──────────────────────────────────────────────

const helpPanel   = $('help-panel');
const helpOverlay = $('help-overlay');

function openHelp() {
  helpPanel.classList.add('open');
  helpPanel.setAttribute('aria-hidden', 'false');
  helpOverlay.classList.add('visible');
}

function closeHelp() {
  helpPanel.classList.remove('open');
  helpPanel.setAttribute('aria-hidden', 'true');
  helpOverlay.classList.remove('visible');
}

$('btn-help').addEventListener('click', () => {
  helpPanel.classList.contains('open') ? closeHelp() : openHelp();
});

$('help-close').addEventListener('click', closeHelp);
helpOverlay.addEventListener('click', closeHelp);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeHelp();
});


// ──────────────────────────────────────────────
// DESKTOP DIVIDER DRAG
// ──────────────────────────────────────────────

(function setupDivider() {
  const divider     = $('divider');
  const paneEditor  = $('pane-editor');
  const panePreview = $('pane-preview');
  if (!divider) return;

  let dragging = false;
  let startX, startLeftW, totalW;

  divider.addEventListener('mousedown', e => {
    dragging   = true;
    startX     = e.clientX;
    startLeftW = paneEditor.offsetWidth;
    totalW     = paneEditor.parentElement.offsetWidth - divider.offsetWidth;
    divider.classList.add('dragging');
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx      = e.clientX - startX;
    const newLeft = Math.min(Math.max(startLeftW + dx, totalW * 0.2), totalW * 0.8);
    const pct     = (newLeft / totalW * 100).toFixed(2);
    paneEditor.style.flex  = `0 0 ${pct}%`;
    panePreview.style.flex = `0 0 ${(100 - parseFloat(pct)).toFixed(2)}%`;
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
  });
})();


// ──────────────────────────────────────────────
// LANGUAGE TOGGLE
// ──────────────────────────────────────────────

$('btn-lang').addEventListener('click', () => {
  const currentLang   = getLang();
  const newLang       = currentLang === 'vi' ? 'en' : 'vi';
  const currentSample = currentLang === 'vi' ? SAMPLE_VI : SAMPLE_EN;
  const newSample     = newLang     === 'vi' ? SAMPLE_VI : SAMPLE_EN;

  // Chỉ swap nội dung nếu editor vẫn chứa sample hiện tại
  if (editor.value === currentSample) {
    editor.value = newSample;
    renderHighlight();
    parseAndRender();
  }
  applyLang(newLang);
});


// ──────────────────────────────────────────────
// UNSAVED CHANGES GUARD
// ──────────────────────────────────────────────

let isDirty = false;

export const setDirty = v => { isDirty = v; };

// Gọi từ app.js sau khi editor.value đã được set
export function initUnsavedGuard(initialValue) {
  editor.addEventListener('input', () => {
    isDirty = editor.value !== initialValue;
  });

  // Đánh dấu sạch sau khi download (người dùng đã lưu file)
  $('btn-download').addEventListener('click', () => {
    setTimeout(() => { isDirty = false; }, 100);
  }, true /* capture: chạy trước download handler */);

  // beforeunload khi đóng tab / reload / navigate
  window.addEventListener('beforeunload', e => {
    if (!isDirty) return;
    e.preventDefault();
    e.returnValue = ''; // Legacy support
  });
}
