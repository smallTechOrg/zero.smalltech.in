/**
 * FNV-1a hash of a string → 8-char hex.
 * Used to generate obfuscated, deterministic URL tokens for domain-specific
 * dashboard links (e.g. /dashboard/d?h=a3f1c9b2).
 */
export function domainHash(domain: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < domain.length; i++) {
    hash ^= domain.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
