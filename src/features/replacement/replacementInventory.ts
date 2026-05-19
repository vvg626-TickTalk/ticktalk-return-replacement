import type { InventoryRow, OrderLine } from '@/types/models';
import { getProductById, listInventoryForProduct } from '@/mock-data';
import { lineRequiresImei } from '@/features/replacement/eligibility';
import {
  collectReplacementStockOptions,
  formatUnavailableReplacementLabel,
  type ReplacementStockOption,
} from '@/features/replacement/replacementResolution';

export type ReplacementSubmitAnalysis =
  | { kind: 'in_stock' }
  | { kind: 'all_oos'; productId: string; requestedLabel: string }
  | {
      kind: 'alternate_stock';
      productId: string;
      purchasedColor: string;
      lineIds: string[];
      options: ReplacementStockOption[];
    };

export type { ReplacementStockOption };

function inventoryAllUnavailable(rows: InventoryRow[]): boolean {
  return rows.length > 0 && rows.every((r) => r.onHand <= 0);
}

function inventoryRowsForLine(line: OrderLine): InventoryRow[] {
  return listInventoryForProduct(line.productId);
}

function purchasedRow(line: OrderLine, rows: InventoryRow[]): InventoryRow | undefined {
  const color = line.demoPurchasedColor ?? rows[0]?.color;
  if (!color) return undefined;
  return rows.find((r) => r.color === color);
}

/**
 * Decide replacement submit path from mock inventory + per-line purchased color (demo).
 * Order: (1) any selected product with all SKUs unavailable → waitlist; (2) any watch whose purchased variant is OOS
 * but replacement-eligible in-stock options exist → service resolution picker; (3) in stock.
 */
export function analyzeReplacementSubmit(
  selections: { orderLineId: string }[],
  lines: OrderLine[],
): ReplacementSubmitAnalysis {
  for (const sel of selections) {
    const line = lines.find((l) => l.id === sel.orderLineId);
    if (!line) continue;
    const rows = inventoryRowsForLine(line);
    if (rows.length === 0) continue;
    if (inventoryAllUnavailable(rows)) {
      const pColor = line.demoPurchasedColor ?? rows[0]?.color ?? '';
      return {
        kind: 'all_oos',
        productId: line.productId,
        requestedLabel: formatUnavailableReplacementLabel(line, pColor),
      };
    }
  }

  const affectedWatchLines: OrderLine[] = [];
  for (const sel of selections) {
    const line = lines.find((l) => l.id === sel.orderLineId);
    if (!line) continue;
    const product = getProductById(line.productId);
    if (!product || !lineRequiresImei(product)) continue;
    const rows = inventoryRowsForLine(line);
    if (rows.length === 0 || inventoryAllUnavailable(rows)) continue;

    const pr = purchasedRow(line, rows);
    const purchasedUnavailable = pr ? pr.onHand <= 0 : true;
    const options = collectReplacementStockOptions(line, rows);
    if (purchasedUnavailable && options.length > 0) {
      affectedWatchLines.push(line);
    }
  }

  if (affectedWatchLines.length > 0) {
    const first = affectedWatchLines[0];
    const rows = inventoryRowsForLine(first);
    const pr = purchasedRow(first, rows);
    const purchasedColor = pr?.color ?? first.demoPurchasedColor ?? rows[0]?.color ?? '';
    const productId = first.productId;
    const options = collectReplacementStockOptions(first, rows);

    if (options.length === 0) {
      return {
        kind: 'all_oos',
        productId,
        requestedLabel: formatUnavailableReplacementLabel(first, purchasedColor),
      };
    }

    const lineIds = selections
      .map((s) => lines.find((l) => l.id === s.orderLineId))
      .filter((l): l is OrderLine => !!l)
      .filter((l) => {
        if (l.productId !== productId) return false;
        const p = getProductById(l.productId);
        if (!p || !lineRequiresImei(p)) return false;
        const rws = inventoryRowsForLine(l);
        if (rws.length === 0 || inventoryAllUnavailable(rws)) return false;
        const pRow = purchasedRow(l, rws);
        const pu = pRow ? pRow.onHand <= 0 : true;
        const hasOpts = collectReplacementStockOptions(l, rws).length > 0;
        return pu && hasOpts;
      })
      .map((l) => l.id);

    return {
      kind: 'alternate_stock',
      productId,
      purchasedColor,
      lineIds: lineIds.length ? lineIds : [first.id],
      options,
    };
  }

  return { kind: 'in_stock' };
}
