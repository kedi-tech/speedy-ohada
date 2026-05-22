import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const computed = createHash('sha256').update(salt + password).digest('hex');
  const expected = Buffer.from(hash, 'hex');
  const actual = Buffer.from(computed, 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
