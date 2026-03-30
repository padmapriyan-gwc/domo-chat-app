import { ENCRYPTION_KEY } from '../constants';

// ─── AES-256 using Web Crypto API (built into browser) ────────────────────────

const getKey = async () => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const base64ToBuffer = (base64) =>
  Uint8Array.from(atob(base64), c => c.charCodeAt(0));

// Encrypt a plain text string → returns base64 string
export const encryptMessage = async (plainText) => {
  try {
    const key     = await getKey();
    const encoder = new TextEncoder();
    const iv      = crypto.getRandomValues(new Uint8Array(12)); // random IV

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plainText)
    );

    // Store IV + ciphertext together: iv:ciphertext
    const ivBase64   = bufferToBase64(iv);
    const dataBase64 = bufferToBase64(encrypted);
    return `${ivBase64}:${dataBase64}`;
  } catch (err) {
    console.error('[Encrypt] failed:', err);
    return plainText; // fallback — return plain if encryption fails
  }
};

// Decrypt a base64 string → returns plain text
export const decryptMessage = async (encryptedText) => {
  try {
    if (!encryptedText?.includes(':')) return encryptedText; // not encrypted

    const [ivBase64, dataBase64] = encryptedText.split(':');
    const key     = await getKey();
    const decoder = new TextDecoder();

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuffer(ivBase64) },
      key,
      base64ToBuffer(dataBase64)
    );

    return decoder.decode(decrypted);
  } catch (err) {
    console.error('[Decrypt] failed:', err);
    return '[Encrypted message]'; // fallback if key mismatch
  }
};

// Check if a string is encrypted (has iv:data format)
export const isEncrypted = (text) => {
  if (!text || typeof text !== 'string') return false;
  const parts = text.split(':');
  return parts.length === 2 && parts[0].length > 10;
};