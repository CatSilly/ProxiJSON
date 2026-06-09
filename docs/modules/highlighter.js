/* ============================================================
   highlighter.js — Tô màu cú pháp cho input và JSON output
   ============================================================ */

// ── Dùng chung ──

export function escHl(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


// ── Tô màu JSON output ──

export function highlightJSON(json) {
  let s = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return s.replace(
    /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g,
    (match) => {
      if (/^"/.test(match)) {
        return /:$/.test(match)
          ? `<span class="j-key">${match}</span>`
          : `<span class="j-str">${match}</span>`;
      }
      if (match === 'true' || match === 'false') return `<span class="j-bool">${match}</span>`;
      if (match === 'null')         return `<span class="j-null">${match}</span>`;
      if (/^-?\d/.test(match))      return `<span class="j-num">${match}</span>`;
      return `<span class="j-punc">${match}</span>`;
    }
  );
}


// ── Tô màu input editor ──

function hlVal(v) {
  if (v === undefined || v === null || v === '') return '';
  const tok = v.trim();
  if (!tok) return escHl(v);

  if ((tok.startsWith('"') && tok.endsWith('"')) ||
      (tok.startsWith("'") && tok.endsWith("'")))
    return `<span class="i-str">${escHl(v)}</span>`;

  if (tok === 'null' || tok === '~')
    return `<span class="i-null">${escHl(v)}</span>`;

  if (['true','false','yes','no','on','off'].includes(tok))
    return `<span class="i-bool">${escHl(v)}</span>`;

  if (tok !== '' && !isNaN(tok))
    return `<span class="i-num">${escHl(v)}</span>`;

  if ((tok.startsWith('[') && tok.endsWith(']')) ||
      (tok.startsWith('{') && tok.endsWith('}')))
    return `<span class="i-inline">${escHl(v)}</span>`;

  return `<span class="i-str">${escHl(v)}</span>`;
}

export function highlightInput(text) {
  const lines = text.split('\n');
  const out   = [];

  for (const raw of lines) {
    const stripped  = raw.trimStart();
    const indentLen = raw.length - stripped.length;
    const pre       = escHl(raw.slice(0, indentLen));

    if (stripped === '') { out.push(''); continue; }

    // Comment
    if (stripped.startsWith('#')) {
      out.push(pre + `<span class="i-cmt">${escHl(stripped)}</span>`);
      continue;
    }

    // Bare array dash "  -"
    if (stripped === '-') {
      out.push(pre + `<span class="i-dash">-</span>`);
      continue;
    }

    // Array item "  - value"
    if (stripped.startsWith('- ')) {
      const val = stripped.slice(2);
      out.push(pre + `<span class="i-dash">-</span> ` + hlVal(val));
      continue;
    }

    // Key: value
    const ci = stripped.indexOf(':');
    if (ci !== -1) {
      const key        = stripped.slice(0, ci);
      const afterColon = stripped.slice(ci + 1);
      const keyHtml    = `<span class="i-key">${escHl(key)}</span>`;
      const colonHtml  = `<span class="i-colon">:</span>`;

      if (afterColon.trim() === '') {
        out.push(pre + keyHtml + colonHtml + escHl(afterColon));
      } else {
        const spaceMatch = afterColon.match(/^(\s*)/);
        const spaces     = spaceMatch ? spaceMatch[1] : '';
        const val        = afterColon.slice(spaces.length);
        out.push(pre + keyHtml + colonHtml + escHl(spaces) + hlVal(val));
      }
      continue;
    }

    // Fallback: plain text
    out.push(escHl(raw));
  }

  // trailing newline để dòng cuối render đúng trong <pre>
  return out.join('\n') + '\n';
}
