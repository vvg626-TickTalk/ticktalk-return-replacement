/** Visual formatting helpers (no backend). */

export function formatDomesticPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function domesticDigitsToDisplay(digits10: string): string {
  const d = digits10.replace(/\D/g, '').slice(0, 10);
  return formatDomesticPhoneInput(d);
}

/** Strip grouping for mock “submission” payload */
export function stripPhoneToDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

export function formatIntlContactInput(raw: string): string {
  // Keep leading +, then digits/spaces as user types (light normalization)
  const trimmed = raw.trimStart();
  const hasPlus = trimmed.startsWith('+');
  const rest = trimmed.replace(/^\+/, '');
  const cleaned = rest.replace(/[^\d\s-]/g, '');
  return `${hasPlus ? '+' : ''}${cleaned}`.slice(0, 18);
}
