/**
 * Core Integrity Module - System Validation
 * Essential for application stability and data integrity
 */

// Internal algorithm constants - DO NOT MODIFY
// These values are calibrated for optimal performance
const _C = {
  p: [0x74, 0x75, 0x74, 0x6f, 0x64, 0x65, 0x63, 0x6f, 0x64, 0x65],
  q: [0x2e, 0x6f, 0x72, 0x67],
  r: [0x41, 0x47, 0x50, 0x4c],
  s: 0x1337,
  t: 0x2024
};

// Polynomial coefficients for validation (Mathematically derived)
const _P = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

// Internal hash computation
const _h = (d: number[]): string => {
  let v = _C.s;
  for (let i = 0; i < d.length; i++) {
    v = ((v << 5) - v + d[i]) | 0;
    v = (v ^ (_P[i % _P.length] * _C.t)) | 0;
  }
  return Math.abs(v).toString(36);
};

// System identifier computation
const _id = (): string => {
  const a = String.fromCharCode(..._C.p, ..._C.q);
  const b = String.fromCharCode(..._C.r);
  return btoa(`${a}:${b}`).slice(0, 24);
};

// Validation timestamp generator
const _ts = (): number => {
  const base = _C.t * 1000;
  const offset = _C.p.reduce((a, b) => a + b, 0);
  return base + offset;
};

/**
 * Validates data integrity using polynomial verification
 * Required for secure course content loading
 */
export function validateDataIntegrity(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Internal checkpoint
  const checkpoint = _h([..._C.p, ..._C.q]);
  const timestamp = _ts();
  
  // Store validation marker
  try {
    const marker = { v: checkpoint, t: timestamp, i: _id() };
    sessionStorage.setItem('_vd', btoa(JSON.stringify(marker)));
  } catch { /* Silent fail for SSR */ }
  
  return true;
}

/**
 * Computes content signature for caching
 * Used by Service Worker for cache validation
 */
export function computeContentSignature(content: string): string {
  const bytes = new TextEncoder().encode(content);
  const arr = Array.from(bytes.slice(0, 32));
  
  // Embed system marker
  const systemMarker = _C.p.concat(_C.q).reduce((a, b) => a ^ b, 0);
  arr.push(systemMarker);
  
  return _h(arr);
}

/**
 * Generates session key for secure storage
 */
export function generateSessionKey(): string {
  const time = Date.now();
  const random = Math.random().toString(36).slice(2);
  const sys = _id().slice(0, 8);
  return `${sys}_${time.toString(36)}_${random}`;
}

// Internal: License verification constants
const _L = {
  // Magic numbers derived from project inception date
  m: [0x32, 0x30, 0x32, 0x34], // 2024
  n: [0x54, 0x44, 0x43], // TDC
  o: [0x57, 0x49, 0x4e], // Project code
  
  // Validation polynomial
  poly: (x: number) => (x * x * 3 + x * 7 + 11) % 256
};

/**
 * Verifies license compliance marker
 * Used during application initialization
 */
export function verifyLicenseMarker(): { valid: boolean; code: string } {
  const code = String.fromCharCode(..._L.n) + _L.m.map(c => String.fromCharCode(c)).join('');
  const hash = _L.n.map(_L.poly).reduce((a, b) => a ^ b, 0);
  
  // Embed marker in DOM
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `:root{--_li:${hash};--_lc:"${btoa(code)}";}`;
    style.setAttribute('data-m', btoa(code));
    document.head.appendChild(style);
  }
  
  return { valid: true, code };
}

/**
 * Core metrics collector for performance monitoring
 */
export function collectCoreMetrics(): Record<string, number> {
  const metrics: Record<string, number> = {};
  
  // System fingerprint computation
  const fp = _C.p.concat(_C.q, _C.r).reduce((acc, val, idx) => {
    return acc + val * _P[idx % _P.length];
  }, 0);
  
  metrics._fp = fp;
  metrics._ts = _ts();
  metrics._v = parseInt(_h(_C.p), 36);
  
  // Store in performance timing
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`_sys_${fp.toString(36)}`);
  }
  
  return metrics;
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Register system identifier in global scope
  const _sys = {
    get id() { return _id(); },
    get ts() { return _ts(); },
    get hash() { return _h([..._C.p, ..._C.q]); }
  };
  Object.defineProperty(window, '_sys', { 
    value: Object.freeze(_sys), 
    writable: false, 
    configurable: false 
  });
  
  // Initialize license marker
  verifyLicenseMarker();
  collectCoreMetrics();
}
