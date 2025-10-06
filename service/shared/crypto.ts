import nacl from 'tweetnacl';
import crypto from 'crypto';

function canonicalize(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  const keys = Object.keys(obj).sort();
  const out: any = {};
  for (const k of keys) out[k] = canonicalize(obj[k]);
  return out;
}

const DOMAIN_PREFIX = 'TradeGrid:v1:';

export function canonicalMessageBytes(payload: any): Uint8Array {
  const canon = canonicalize(payload);
  const json = JSON.stringify(canon);
  const prefixed = DOMAIN_PREFIX + json;
  return Buffer.from(prefixed, 'utf8');
}

export function hashMessageHex(payload: any): string {
  const bytes = canonicalMessageBytes(payload);
  const h = crypto.createHash('sha256').update(bytes).digest('hex');
  return '0x' + h;
}

export function signMessageHex(privateKeyHex: string, messageBytes: Uint8Array): string {
  let sk = hexToUint8(privateKeyHex);
  if (sk.length === 32) {
    sk = nacl.sign.keyPair.fromSeed(sk).secretKey;
  } else if (sk.length !== 64) {
    throw new Error('privateKeyHex must be 32-byte seed or 64-byte secretKey');
  }
  const sig = nacl.sign.detached(messageBytes, sk);
  return uint8ToHex(sig);
}

export function verifyMessageHex(pubKeyHex: string, messageBytes: Uint8Array, signatureHex: string): boolean {
  return nacl.sign.detached.verify(messageBytes, hexToUint8(signatureHex), hexToUint8(pubKeyHex));
}

export function uint8ToHex(b: Uint8Array): string { return '0x' + Buffer.from(b).toString('hex'); }
export function hexToUint8(h: string): Uint8Array { const clean = h.startsWith('0x') ? h.slice(2) : h; return new Uint8Array(Buffer.from(clean, 'hex')); }


