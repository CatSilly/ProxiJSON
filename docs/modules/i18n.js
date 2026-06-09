/* ============================================================
   i18n.js — Chuỗi dịch và áp dụng ngôn ngữ
   ============================================================ */

export const STRINGS = {
  vi: {
    helpBtnTitle:       'Cú pháp',
    downloadBtnTitle:   'Tải về',
    tabEdit:            '✎ soạn',
    tabView:            '{ } xem',
    importBtnTitle:     'Dán JSON và chuyển về định dạng editor',
    helpPanelTitle:     'cú pháp',
    helpDataTypes:      'kiểu dữ liệu',
    helpNested:         'object lồng nhau',
    helpNotes:          'lưu ý',
    helpAutoDetect:     '# tự nhận dạng kiểu',
    helpForceStr:       '→ ép string',
    helpNoteComment:    '# dòng này là comment',
    helpNoteIndent:     '# thụt lề dùng 2 spaces',
    helpNoteYesNo:      '# yes/no = true/false',
    helpNoteNull:       '# ~ = null',
    importCancelBtn:    'Huỷ',
    importOkBtn:        'Chuyển đổi',
    closeAria:          'Đóng',
    langBtnText:        'EN',
    lineWord:           'dòng',
    statusErr:          (line) => line ? `✗ lỗi dòng ${line}` : '✗ lỗi',
    statusOk:           '✓ ok',
    parseErrIndent:     'thụt lề không đúng',
    parseErrKV:         'mong đợi "key: value"',
    parseErrItem:       'mong đợi item mảng (-)',
    parseErrSyntax:     'cú pháp sai',
    outputErr:          (line) => line ? `// lỗi phân tích dòng ${line}` : '// lỗi phân tích',
    importValidObj:     (n) => `✓ JSON hợp lệ — ${n} khoá`,
    importValidArr:     (n) => `✓ JSON hợp lệ — ${n} phần tử`,
    importValidScalar:  'Scalar',
    toastSyntaxErr:     'Có lỗi cú pháp!',
    toastCopied:        '✓ Đã copy JSON',
    toastDownloaded:    '↓ Đã tải output.json',
    toastConverted:     '✓ Đã chuyển đổi JSON → editor',
  },
  en: {
    helpBtnTitle:       'Syntax',
    downloadBtnTitle:   'Download',
    tabEdit:            '✎ edit',
    tabView:            '{ } view',
    importBtnTitle:     'Paste JSON and convert to editor format',
    helpPanelTitle:     'syntax',
    helpDataTypes:      'data types',
    helpNested:         'nested object',
    helpNotes:          'notes',
    helpAutoDetect:     '# auto-detect type',
    helpForceStr:       '→ force string',
    helpNoteComment:    '# this line is a comment',
    helpNoteIndent:     '# use 2-space indentation',
    helpNoteYesNo:      '# yes/no = true/false',
    helpNoteNull:       '# ~ = null',
    importCancelBtn:    'Cancel',
    importOkBtn:        'Convert',
    closeAria:          'Close',
    langBtnText:        'VI',
    lineWord:           'line',
    statusErr:          (line) => line ? `✗ error line ${line}` : '✗ error',
    statusOk:           '✓ ok',
    parseErrIndent:     'incorrect indentation',
    parseErrKV:         'expected "key: value"',
    parseErrItem:       'expected array item (-)',
    parseErrSyntax:     'invalid syntax',
    outputErr:          (line) => line ? `// parse error line ${line}` : '// parse error',
    importValidObj:     (n) => `✓ Valid JSON — ${n} keys`,
    importValidArr:     (n) => `✓ Valid JSON — ${n} elements`,
    importValidScalar:  'Scalar',
    toastSyntaxErr:     'Syntax error!',
    toastCopied:        '✓ Copied JSON',
    toastDownloaded:    '↓ Downloaded output.json',
    toastConverted:     '✓ Converted JSON → editor',
  },
};

let currentLang = 'vi';

export const getLang = () => currentLang;
export const t = key => STRINGS[currentLang][key];

export function applyLang(lang) {
  currentLang = lang;
  document.getElementById('html-root').lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = STRINGS[lang][key];
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = STRINGS[lang][key];
    if (val !== undefined) el.title = val;
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const val = STRINGS[lang][key];
    if (val !== undefined) el.setAttribute('aria-label', val);
  });

  const btnLang = document.getElementById('btn-lang');
  if (btnLang) btnLang.textContent = STRINGS[lang].langBtnText;
}
