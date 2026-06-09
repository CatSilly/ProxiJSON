/* ============================================================
   app.js — Entry point: khởi tạo ứng dụng
   ============================================================ */

import { applyLang }                              from './modules/i18n.js';
import { editor, renderHighlight, parseAndRender } from './modules/editor.js';
import { SAMPLE }                                  from './modules/samples.js';
import { initUnsavedGuard }                        from './modules/ui.js';

// Side-effect import: đăng ký tất cả event listeners của modal
import './modules/import-modal.js';


// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────

// Fix: 100vh không chính xác trên Android khi URL bar ẩn/hiện.
// Dùng --vh = 1% của window.innerHeight thực tế (fallback cho dvh).
function updateVh() {
  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
}
updateVh();
window.addEventListener('resize', updateVh);

editor.value = SAMPLE;
renderHighlight();
parseAndRender();
applyLang('vi');

// Phải gọi sau khi editor.value đã được set để initialValue khớp với SAMPLE
initUnsavedGuard(SAMPLE);
