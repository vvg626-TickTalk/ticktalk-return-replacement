/** Store phone without spaces/symbols (demo localStorage). */
export function sanitizePhoneForStorage(display: string): string {
  return display.replace(/\D/g, '');
}
