/* ============================================================
   import-modal.js — Modal nhập JSON và chuyển về định dạng editor
   ============================================================ */

import { $, editor, renderHighlight, parseAndRender } from './editor.js';
import { t }             from './i18n.js';
import { jsonToEditor }  from './converter.js';
import { toast, setDirty } from './ui.js';

// ── DOM refs ──

const importModal = $('import-modal');
const importTa    = $('import-ta');
const importMsg   = $('import-msg');
const importOk    = $('import-ok');


// ── Open / Close ──

function openImportModal() {
  importTa.value      = '';
  importMsg.textContent = '';
  importMsg.className = 'import-msg';
  importOk.disabled   = true;
  importModal.setAttribute('aria-hidden', 'false');
  // Focus sau paint để bàn phím ảo mở đúng trên mobile
  requestAnimationFrame(() => importTa.focus());
}

function closeImportModal() {
  importModal.setAttribute('aria-hidden', 'true');
  $('btn-import').focus();
}


// ── Validate JSON khi người dùng gõ/dán ──

importTa.addEventListener('input', () => {
  const raw = importTa.value.trim();
  if (!raw) {
    importMsg.textContent = '';
    importMsg.className   = 'import-msg';
    importOk.disabled     = true;
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    const type   = Array.isArray(parsed) ? 'array' : typeof parsed;
    if (type === 'object' || type === 'array') {
      const count = Array.isArray(parsed)
        ? t('importValidArr')(parsed.length)
        : t('importValidObj')(Object.keys(parsed).length);
      importMsg.textContent = count;
      importMsg.className   = 'import-msg ok';
      importOk.disabled     = false;
    } else {
      importMsg.textContent = `✓ ${t('importValidScalar')}: ${raw.slice(0, 40)}`;
      importMsg.className   = 'import-msg ok';
      importOk.disabled     = false;
    }
  } catch (err) {
    const msg = err.message.replace(/^JSON\.parse: /, '').slice(0, 60);
    importMsg.textContent = `✗ ${msg}`;
    importMsg.className   = 'import-msg err';
    importOk.disabled     = true;
  }
});


// ── Chuyển đổi và áp dụng ──

importOk.addEventListener('click', () => {
  let parsed;
  try { parsed = JSON.parse(importTa.value.trim()); }
  catch { return; }

  editor.value = jsonToEditor(parsed, 0);
  renderHighlight();
  parseAndRender();
  setDirty(true);
  closeImportModal();
  toast(t('toastConverted'));
});


// ── Trigger ──

$('btn-import').addEventListener('click', openImportModal);
$('import-cancel').addEventListener('click', closeImportModal);
$('modal-close').addEventListener('click', closeImportModal);

// Đóng khi click vào backdrop (không phải modal box)
importModal.addEventListener('click', e => {
  if (e.target === importModal) closeImportModal();
});

// Escape đóng | Ctrl/Cmd+Enter xác nhận
importTa.addEventListener('keydown', e => {
  if (e.key === 'Escape') { e.preventDefault(); closeImportModal(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!importOk.disabled) importOk.click();
  }
});
