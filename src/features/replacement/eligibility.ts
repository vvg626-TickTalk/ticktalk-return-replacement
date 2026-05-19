import type { OrderLine } from '@/types/models';
import type { Product } from '@/types/models';
import { getProductById } from '@/mock-data';

export function isLineReplaceEligible(line: OrderLine, product: Product | undefined): boolean {
  if (line.status !== 'shipped') return false;
  if (!product) return false;
  if (product.kind === 'watch' || product.kind === 'accessory') return true;
  return false;
}

export function lineRequiresImei(product: Product | undefined): boolean {
  return product?.kind === 'watch';
}

export function isPlausibleImei(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 15;
}

export function normalizeImei(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 15);
}

/** Order-level Replace CTA: disabled when nothing shipped or nothing replace-eligible (demo). */
export function getOrderReplaceSummary(lines: OrderLine[]): { enabled: boolean; reason?: string } {
  const shipped = lines.filter((l) => l.status === 'shipped');
  if (shipped.length === 0) {
    return { enabled: false, reason: 'Replacement is available after your order ships.' };
  }
  const eligible = shipped.filter((l) => isLineReplaceEligible(l, getProductById(l.productId)));
  if (eligible.length > 0) {
    return { enabled: true };
  }
  return { enabled: false, reason: 'No replace-eligible items on this order in our demo.' };
}
