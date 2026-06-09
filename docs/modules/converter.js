/* ============================================================
   converter.js — Chuyển đổi JSON → định dạng editor
   ============================================================ */

// Quote một chuỗi chỉ khi cần thiết để tránh nhầm lẫn cú pháp
function quoteIfNeeded(s) {
  if (s === '') return '""';
  if (['null','~','true','false','yes','no','on','off'].includes(s)) return `"${s}"`;
  if (s !== '' && !isNaN(s)) return `"${s}"`;
  if (/[:#\[\]{}'"`,\\]/.test(s) || s !== s.trim() || /[\n\r\t]/.test(s)) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

function scalarLine(v) {
  if (v === null)             return 'null';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number')  return String(v);
  if (typeof v === 'string')  return quoteIfNeeded(v);
  return String(v);
}

function renderKV(k, v, depth) {
  const pad = '  '.repeat(depth);
  if (v === null || typeof v !== 'object') return `${pad}${k}: ${scalarLine(v)}`;
  if (Array.isArray(v) && v.length === 0)  return `${pad}${k}: []`;
  if (!Array.isArray(v) && Object.keys(v).length === 0) return `${pad}${k}: {}`;
  return `${pad}${k}:\n${jsonToEditor(v, depth + 1)}`;
}

export function jsonToEditor(value, depth) {
  const pad = '  '.repeat(depth);

  // Scalar
  if (value === null || typeof value !== 'object') return scalarLine(value);

  // Container rỗng
  if (Array.isArray(value) && value.length === 0)               return '[]';
  if (!Array.isArray(value) && Object.keys(value).length === 0) return '{}';

  // Array
  if (Array.isArray(value)) {
    return value.map(item => {
      if (item !== null && typeof item === 'object') {
        if (Array.isArray(item)) return `${pad}- ${JSON.stringify(item)}`;
        const inner = Object.entries(item)
          .map(([k, v]) => renderKV(k, v, depth + 1))
          .join('\n');
        return `${pad}-\n${inner}`;
      }
      return `${pad}- ${scalarLine(item)}`;
    }).join('\n');
  }

  // Object
  return Object.entries(value)
    .map(([k, v]) => renderKV(k, v, depth))
    .join('\n');
}
