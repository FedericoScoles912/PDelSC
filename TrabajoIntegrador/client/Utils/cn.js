/**
 * cn.js
 * Une clases de NativeWind condicionalmente (equivalente a clsx).
 * @param {...(string|false|null|undefined|Record<string,boolean>)} parts
 * @returns {string}
 */
export function cn(...parts) {
  const out = [];
  for (const p of parts) {
    if (!p) continue;
    if (typeof p === 'string') out.push(p);
    else if (typeof p === 'object') {
      for (const [k, v] of Object.entries(p)) if (v) out.push(k);
    }
  }
  return out.join(' ');
}

export default cn;
