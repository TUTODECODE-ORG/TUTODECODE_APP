/**
 * Content Watermarking System
 * Embeds invisible signatures in course content for copyright verification
 */

// Unicode zero-width characters for invisible watermarking
const _ZW = {
  ZWSP: '\u200B',  // Zero Width Space
  ZWNJ: '\u200C',  // Zero Width Non-Joiner
  ZWJ: '\u200D',   // Zero Width Joiner
  WJ: '\u2060',    // Word Joiner
};

// Origin encoding
const _O = {
  t: [116, 117, 116, 111, 100, 101, 99, 111, 100, 101],
  d: [46, 111, 114, 103],
  a: [119, 105, 110, 97, 110, 99, 104, 101, 114],
  y: 2024
};

// Convert bytes to binary string
const _toBin = (bytes: number[]): string => {
  return bytes.map(b => b.toString(2).padStart(8, '0')).join('');
};

// Encode binary to zero-width characters
const _encodeZW = (binary: string): string => {
  const chars = Object.values(_ZW);
  return binary.split('').map((bit, i) => {
    const idx = (parseInt(bit) + (i % 2)) % chars.length;
    return chars[idx];
  }).join('');
};

// Generate signature from origin
const _genSig = (): string => {
  const combined = [..._O.t, ..._O.d];
  return _encodeZW(_toBin(combined));
};

// Compute CRC-16 for verification
const _crc16 = (data: number[]): number => {
  let crc = 0xFFFF;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xFFFF;
};

/**
 * Embeds invisible watermark in text content
 * Used for copyright verification without visual impact
 */
export function embedWatermark(text: string): string {
  if (!text || text.length < 10) return text;
  
  const sig = _genSig();
  const crc = _crc16([..._O.t, ..._O.d]).toString(16);
  
  // Insert signature at strategic points
  const midPoint = Math.floor(text.length / 2);
  const quarterPoint = Math.floor(text.length / 4);
  
  // Embed at natural word boundaries
  let result = text;
  const insertPoints = [quarterPoint, midPoint, midPoint + quarterPoint];
  
  for (const point of insertPoints) {
    // Find next space after point
    let insertIdx = result.indexOf(' ', point);
    if (insertIdx === -1) insertIdx = point;
    
    // Insert zero-width signature
    result = result.slice(0, insertIdx) + sig.slice(0, 4) + result.slice(insertIdx);
  }
  
  return result;
}

/**
 * Extracts watermark from text for verification
 */
export function extractWatermark(text: string): { found: boolean; origin?: string } {
  const zwChars = Object.values(_ZW).join('');
  const zwPattern = new RegExp(`[${zwChars}]{4,}`, 'g');
  
  const matches = text.match(zwPattern);
  if (!matches || matches.length === 0) {
    return { found: false };
  }
  
  // Verify against expected signature
  const expectedSig = _genSig().slice(0, 4);
  const found = matches.some(m => m.includes(expectedSig.slice(0, 2)));
  
  if (found) {
    return { 
      found: true, 
      origin: String.fromCharCode(..._O.t, ..._O.d)
    };
  }
  
  return { found: false };
}

/**
 * Verifies content authenticity
 */
export function verifyContentAuth(content: string): { 
  authentic: boolean; 
  signature: string;
  crc: string;
} {
  const result = extractWatermark(content);
  const crc = _crc16([..._O.t, ..._O.d]).toString(16).padStart(4, '0');
  
  return {
    authentic: result.found,
    signature: result.origin || 'unknown',
    crc
  };
}

// DOM watermarking for rendered content
export function watermarkElement(element: HTMLElement): void {
  if (!element) return;
  
  const sig = _genSig().slice(0, 8);
  const crc = _crc16([..._O.t, ..._O.d]);
  
  // Add invisible attributes
  element.setAttribute('data-wm', btoa(String.fromCharCode(..._O.t)));
  element.dataset['_c'] = crc.toString(36);
  
  // Add zero-width content to text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  let count = 0;
  while ((node = walker.nextNode()) && count < 3) {
    const text = node.textContent;
    if (text && text.length > 20) {
      node.textContent = text.slice(0, 10) + sig + text.slice(10);
      count++;
    }
  }
}

// CSS variable watermark
export function injectCSSWatermark(): void {
  if (typeof document === 'undefined') return;
  
  const crc = _crc16([..._O.t, ..._O.d]);
  const sig = btoa(String.fromCharCode(..._O.t, ..._O.d));
  
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --_wm: "${sig}";
      --_wc: ${crc};
      --_wy: ${_O.y};
    }
  `;
  style.setAttribute('data-wm', 'core');
  document.head.appendChild(style);
}

// Initialize on import
if (typeof window !== 'undefined') {
  injectCSSWatermark();
  
  // Register verification functions globally
  Object.defineProperty(window, '_wm', {
    value: Object.freeze({
      verify: verifyContentAuth,
      extract: extractWatermark,
      crc: () => _crc16([..._O.t, ..._O.d])
    }),
    writable: false,
    configurable: false
  });
}
