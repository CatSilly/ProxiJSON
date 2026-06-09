/* ============================================================
   parser.js — Phân tích cú pháp tối giản → JSON
   ============================================================ */

export class MinJSONParser {
  constructor(text) {
    this.errors = [];
    this.tokens = this._tokenize(text);
  }

  _tokenize(text) {
    const tokens = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const stripped = raw.trimStart();

      // bỏ dòng trống và comment
      if (!stripped || stripped.startsWith('#')) continue;

      const indent  = raw.length - stripped.length;
      const content = stripped.trimEnd();

      if (content === '-') {
        // item mảng dạng block (object theo sau)
        tokens.push({ type: 'item-block', indent, lineNum: i + 1 });

      } else if (content.startsWith('- ')) {
        // item mảng có giá trị
        tokens.push({ type: 'item', indent, value: content.slice(2), lineNum: i + 1 });

      } else {
        const ci = content.indexOf(':');
        if (ci === -1) {
          // giá trị đơn (fallback)
          tokens.push({ type: 'bare', indent, value: content, lineNum: i + 1 });
        } else {
          const key   = content.slice(0, ci).trim();
          const rest  = content.slice(ci + 1);
          const value = rest.trimStart() || null;
          tokens.push({ type: 'kv', indent, key, value, lineNum: i + 1 });
        }
      }
    }
    return tokens;
  }

  // ── Phân tích giá trị scalar ──
  _scalar(v) {
    if (v === null || v === undefined) return null;
    v = v.trim();
    if (v === '') return null;

    // string được ép bằng dấu nháy
    if ((v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }

    if (v === 'null' || v === '~')                        return null;
    if (v === 'true'  || v === 'yes' || v === 'on')       return true;
    if (v === 'false' || v === 'no'  || v === 'off')      return false;
    if (v !== '' && !isNaN(v))                            return Number(v);

    // inline array [a, b, c]
    if (v.startsWith('[') && v.endsWith(']')) {
      const inner = v.slice(1, -1).trim();
      if (!inner) return [];
      return this._splitComma(inner).map(s => this._scalar(s.trim()));
    }

    // inline object {k: v, k2: v2}
    if (v.startsWith('{') && v.endsWith('}')) {
      const inner = v.slice(1, -1).trim();
      if (!inner) return {};
      const obj = {};
      this._splitComma(inner).forEach(pair => {
        const ci = pair.indexOf(':');
        if (ci !== -1) {
          const k   = pair.slice(0, ci).trim();
          const val = pair.slice(ci + 1).trim();
          obj[k] = this._scalar(val);
        }
      });
      return obj;
    }

    return v; // string thuần
  }

  // tách phẩy ngoài cùng (bỏ qua bên trong ngoặc)
  _splitComma(str) {
    const parts = [];
    let depth = 0;
    let cur   = '';
    for (const ch of str) {
      if (ch === '[' || ch === '{') depth++;
      else if (ch === ']' || ch === '}') depth--;
      else if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    if (cur) parts.push(cur);
    return parts;
  }

  // ── Entry point ──
  parse() {
    if (this.tokens.length === 0) return {};
    try {
      const [result] = this._block(0, this.tokens[0].indent);
      return result ?? {};
    } catch (e) {
      this.errors.push(typeof e === 'string' ? { message: e, lineNum: null } : e);
      return null;
    }
  }

  // dispatch: object hoặc array?
  _block(pos, indent) {
    if (pos >= this.tokens.length) return [{}, pos];
    const tok = this.tokens[pos];
    if (tok.type === 'item' || tok.type === 'item-block') {
      return this._array(pos, indent);
    }
    return this._object(pos, indent);
  }

  _object(pos, indent) {
    const obj = {};
    while (pos < this.tokens.length) {
      const tok = this.tokens[pos];
      if (tok.indent < indent) break;
      if (tok.indent > indent) throw { message: 'ERR_INDENT', lineNum: tok.lineNum };
      if (tok.type  !== 'kv') throw { message: 'ERR_KV',     lineNum: tok.lineNum };

      pos++;

      if (tok.value !== null && tok.value !== '') {
        obj[tok.key] = this._scalar(tok.value);
      } else {
        if (pos < this.tokens.length && this.tokens[pos].indent > indent) {
          const childIndent    = this.tokens[pos].indent;
          const [nested, np]   = this._block(pos, childIndent);
          obj[tok.key] = nested;
          pos = np;
        } else {
          obj[tok.key] = null;
        }
      }
    }
    return [obj, pos];
  }

  _array(pos, indent) {
    const arr = [];
    while (pos < this.tokens.length) {
      const tok = this.tokens[pos];
      if (tok.indent < indent) break;
      if (tok.indent > indent) throw { message: 'ERR_INDENT', lineNum: tok.lineNum };

      if (tok.type === 'item') {
        arr.push(this._scalar(tok.value));
        pos++;
      } else if (tok.type === 'item-block') {
        pos++;
        if (pos < this.tokens.length && this.tokens[pos].indent > indent) {
          const childIndent  = this.tokens[pos].indent;
          const [nested, np] = this._block(pos, childIndent);
          arr.push(nested);
          pos = np;
        } else {
          arr.push({});
        }
      } else {
        throw { message: 'ERR_ITEM', lineNum: tok.lineNum };
      }
    }
    return [arr, pos];
  }
}
