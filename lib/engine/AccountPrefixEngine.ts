import type { NormalizedAccount } from './types';

export interface AccountPrefixes {
  prefix_1: string;
  prefix_2: string;
  prefix_3: string;
  prefix_4: string;
  prefix_5: string;
  prefix_6: string;
}

export function extractPrefixes(accountNumber: string): AccountPrefixes {
  const s = accountNumber.replace(/\s+/g, '');
  return {
    prefix_1: s.substring(0, 1),
    prefix_2: s.substring(0, 2),
    prefix_3: s.substring(0, 3),
    prefix_4: s.substring(0, 4),
    prefix_5: s.substring(0, 5),
    prefix_6: s.substring(0, 6),
  };
}

export function enrichWithPrefixes(account: NormalizedAccount): NormalizedAccount {
  const p = extractPrefixes(account.account_number);
  return { ...account, ...p };
}

export function enrichAllWithPrefixes(accounts: NormalizedAccount[]): NormalizedAccount[] {
  return accounts.map(enrichWithPrefixes);
}

/** Returns true if the account number starts with any of the given prefixes */
export function matchesPrefix(accountNumber: string, prefixes: string[]): boolean {
  const s = accountNumber.replace(/\s+/g, '');
  return prefixes.some((p) => s.startsWith(p));
}

/** Returns true if account number falls within a numeric range [from, to] inclusive */
export function matchesRange(accountNumber: string, from: string, to: string): boolean {
  const s = accountNumber.replace(/\s+/g, '');
  // Pad to same length for comparison
  const len = Math.max(s.length, from.length, to.length);
  const padded = s.padEnd(len, '0');
  const f = from.padEnd(len, '0');
  const t = to.padEnd(len, '9');
  return padded >= f && padded <= t;
}
