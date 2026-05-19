import type { InventoryRow, OrderLine, Product } from '@/types/models';
import { getProductById, listInventoryForProduct } from '@/mock-data';

/** Mock “backend” mapping: when no same-model stock, these product IDs may be offered as service replacements. */
export const REPLACEMENT_FALLBACK_PRODUCT_IDS: Record<string, string[]> = {
  'prod-tt-watch-5': ['prod-tt-watch-6'],
};

export type ReplacementStockOption = {
  id: string;
  productId: string;
  titleLine: string;
  color: string;
  subtitle?: string;
  swatchClass?: string;
};

export function productSupportShortName(p: Product | undefined): string {
  if (!p) return 'TickTalk device';
  if (p.generation?.match(/^TT\d+$/i)) {
    return `TickTalk ${p.generation.replace(/^TT/i, '')}`;
  }
  return p.name.replace(/^TickTalk Watch /i, 'TickTalk ');
}

export function formatUnavailableReplacementLabel(line: OrderLine, purchasedColor: string): string {
  const p = getProductById(line.productId);
  return `${productSupportShortName(p)} - ${purchasedColor}`;
}

function rowToOption(row: InventoryRow, anchorProductId: string): ReplacementStockOption | null {
  if (row.onHand <= 0) return null;
  if (row.replacementEligible === false) return null;
  const p = getProductById(row.productId);
  if (!p) return null;
  const isCrossGen = row.productId !== anchorProductId;
  return {
    id: `${row.productId}::${row.skuLabel}`,
    productId: row.productId,
    titleLine: productSupportShortName(p),
    color: row.color,
    subtitle: isCrossGen ? 'Equivalent replacement (service allocation)' : undefined,
    swatchClass: p.swatch,
  };
}

/**
 * Replacement-eligible, in-stock SKUs only — same generation first, then configured fallbacks (e.g. TT6 for TT5).
 */
export function collectReplacementStockOptions(line: OrderLine, productRows: InventoryRow[]): ReplacementStockOption[] {
  const purchasedColor =
    productRows.find((r) => r.color === line.demoPurchasedColor)?.color ??
    line.demoPurchasedColor ??
    productRows[0]?.color ??
    '';

  const out: ReplacementStockOption[] = [];
  const seen = new Set<string>();

  const pushRows = (rows: InventoryRow[]) => {
    for (const row of rows) {
      if (purchasedColor && row.color === purchasedColor && row.productId === line.productId) continue;
      const opt = rowToOption(row, line.productId);
      if (!opt || seen.has(opt.id)) continue;
      seen.add(opt.id);
      out.push(opt);
    }
  };

  pushRows(productRows);

  const fallbacks = REPLACEMENT_FALLBACK_PRODUCT_IDS[line.productId] ?? [];
  for (const pid of fallbacks) {
    pushRows(listInventoryForProduct(pid));
  }

  return out;
}
