/**
 * Order lookup — per-character “box” layout; composed value matches mock `externalOrderRef`.
 * Channel row formats follow PPT reference (single horizontal row of small boxes + inline separators).
 */

export type ChannelId = 'myticktalk' | 'amazon' | 'walmart' | 'bestbuy' | 'tiktok';

export type SegmentKind = 'digits' | 'letters' | 'alphanumeric';

/** One group of adjacent character boxes in the row. */
export type CellGroupSpec = {
  boxCount: number;
  kind: SegmentKind;
};

export type BetweenGroupSep = 'dash' | 'dot' | 'none';

export type ChannelOrderFormat = {
  id: ChannelId;
  label: string;
  cellGroups: CellGroupSpec[];
  /** Visual separator between box groups in the row */
  betweenGroupSep: BetweenGroupSep;
  /** How groups join for mock lookup string */
  storageJoin: 'dashes' | 'none';
  /** myticktalk.com only — 5–6 digits total, one digit per box, no gaps */
  minDigits?: number;
  maxDigits?: number;
  exampleDisplay: string;
  /** Copy for bottom help panel */
  helpBody: string;
};

export const HELP_PANEL_TITLE = 'How to find your order number';

export const ORDER_LOOKUP_CHANNELS: ChannelOrderFormat[] = [
  {
    id: 'myticktalk',
    label: 'myticktalk.com',
    cellGroups: [{ boxCount: 6, kind: 'digits' }],
    betweenGroupSep: 'none',
    storageJoin: 'none',
    minDigits: 5,
    maxDigits: 6,
    exampleDisplay: '92118 or 100001',
    helpBody:
      'Your myticktalk.com order number can be found in your order confirmation email. Enter 5 to 6 digits — no letters, dashes, or prefixes.',
  },
  {
    id: 'amazon',
    label: 'Amazon',
    cellGroups: [
      { boxCount: 3, kind: 'digits' },
      { boxCount: 7, kind: 'digits' },
      { boxCount: 7, kind: 'digits' },
    ],
    betweenGroupSep: 'dash',
    storageJoin: 'dashes',
    exampleDisplay: '111 - 2959942 - 5172257',
    helpBody: 'Your Amazon order number can be found in Your Orders on Amazon.',
  },
  {
    id: 'walmart',
    label: 'Walmart',
    cellGroups: [
      { boxCount: 8, kind: 'digits' },
      { boxCount: 7, kind: 'digits' },
    ],
    betweenGroupSep: 'dot',
    storageJoin: 'none',
    exampleDisplay: '129103825224007',
    helpBody: 'Your Walmart order number can be found in Purchase History on Walmart.',
  },
  {
    id: 'bestbuy',
    label: 'Best Buy',
    cellGroups: [
      { boxCount: 5, kind: 'alphanumeric' },
      { boxCount: 12, kind: 'digits' },
      { boxCount: 1, kind: 'alphanumeric' },
    ],
    betweenGroupSep: 'dash',
    storageJoin: 'dashes',
    exampleDisplay: 'BBY03 - 807142006365 - A',
    helpBody: 'Your Best Buy order number can be found in Order Details on BestBuy.com.',
  },
  {
    id: 'tiktok',
    label: 'TikTok Shop',
    cellGroups: [{ boxCount: 12, kind: 'digits' }],
    betweenGroupSep: 'none',
    storageJoin: 'none',
    exampleDisplay: '883322441100',
    helpBody: 'Your TikTok Shop order ID appears on your order details screen in the TikTok app (12 digits).',
  },
];

export const ORDER_LOOKUP_BY_ID: Record<ChannelId, ChannelOrderFormat> = ORDER_LOOKUP_CHANNELS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<ChannelId, ChannelOrderFormat>,
);

export function totalCellCount(fmt: ChannelOrderFormat): number {
  return fmt.cellGroups.reduce((s, g) => s + g.boxCount, 0);
}

export function emptyCellsForChannel(id: ChannelId): string[] {
  const n = totalCellCount(ORDER_LOOKUP_BY_ID[id]);
  return Array.from({ length: n }, () => '');
}

function sliceCellsIntoGroups(fmt: ChannelOrderFormat, cells: string[]): string[] {
  let offset = 0;
  return fmt.cellGroups.map((g) => {
    const part = cells.slice(offset, offset + g.boxCount).join('');
    offset += g.boxCount;
    return part;
  });
}

function myticktalkDigitsFromCells(cells: string[]): string {
  let s = '';
  for (const c of cells) {
    if (!c) break;
    s += c;
  }
  return s;
}

/** Single keystroke / paste cell: at most one character, normalized to kind. */
export function sanitizeCellChar(raw: string, kind: SegmentKind): string {
  const ch = raw.slice(-1) || '';
  if (!ch) return '';
  if (kind === 'digits') {
    return /\d/.test(ch) ? ch : '';
  }
  if (kind === 'letters') {
    return /^[A-Za-z]$/.test(ch) ? ch.toUpperCase() : '';
  }
  if (kind === 'alphanumeric') {
    return /^[A-Za-z0-9]$/.test(ch) ? ch.toUpperCase() : '';
  }
  return '';
}

function cellCharValid(c: string, kind: SegmentKind): boolean {
  return sanitizeCellChar(c, kind) === c && c.length === 1;
}

function myticktalkCellsComplete(cells: string[], min: number, max: number): boolean {
  const n = myticktalkDigitsFromCells(cells).length;
  if (n < min || n > max) return false;
  for (let i = 0; i < n; i++) {
    if (!/^\d$/.test(cells[i] ?? '')) return false;
  }
  for (let i = n; i < cells.length; i++) {
    if (cells[i]) return false;
  }
  return true;
}

export function composeExternalOrderRef(id: ChannelId, cells: string[]): string {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  if (id === 'myticktalk') {
    return myticktalkDigitsFromCells(cells);
  }
  if (id === 'tiktok') {
    return cells.join('');
  }
  const groups = sliceCellsIntoGroups(fmt, cells);
  if (fmt.storageJoin === 'dashes') {
    return groups.join('-');
  }
  return groups.join('');
}

export function orderEntryComplete(id: ChannelId, cells: string[]): boolean {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  if (id === 'myticktalk' && fmt.minDigits != null && fmt.maxDigits != null) {
    return myticktalkCellsComplete(cells, fmt.minDigits, fmt.maxDigits);
  }
  if (id === 'tiktok') {
    return cells.length === totalCellCount(fmt) && cells.every((c) => cellCharValid(c, 'digits'));
  }
  let idx = 0;
  for (const g of fmt.cellGroups) {
    for (let i = 0; i < g.boxCount; i++) {
      const c = cells[idx++] ?? '';
      if (!cellCharValid(c, g.kind)) return false;
    }
  }
  return cells.length === totalCellCount(fmt);
}

/** Paste / autofill: returns full cell array or null if unrecognized. */
export function distributePastedOrderToCells(id: ChannelId, raw: string): string[] | null {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  const t = raw.trim();
  if (!t) return null;
  const total = totalCellCount(fmt);

  if (id === 'myticktalk') {
    const d = t.replace(/\D/g, '');
    if (d.length < (fmt.minDigits ?? 5) || d.length > (fmt.maxDigits ?? 6)) return null;
    const cells = emptyCellsForChannel(id);
    for (let i = 0; i < d.length; i++) cells[i] = d[i]!;
    return cells;
  }

  if (id === 'amazon') {
    let a: string;
    let b: string;
    let c: string;
    const m = t.match(/^(\d{3})-(\d{7})-(\d{7})$/);
    if (m) {
      a = m[1];
      b = m[2];
      c = m[3];
    } else {
      const d = t.replace(/\D/g, '');
      if (d.length !== 17) return null;
      a = d.slice(0, 3);
      b = d.slice(3, 10);
      c = d.slice(10, 17);
    }
    const flat = [...a.split(''), ...b.split(''), ...c.split('')];
    if (flat.length !== total) return null;
    return flat;
  }

  if (id === 'walmart') {
    const d = t.replace(/\D/g, '');
    if (d.length !== 15) return null;
    return d.split('');
  }

  if (id === 'tiktok') {
    const d = t.replace(/\D/g, '');
    if (d.length !== 12) return null;
    return d.split('');
  }

  if (id === 'bestbuy') {
    const m = t.match(/^([A-Za-z0-9]{5})-(\d{12})-([A-Za-z0-9])$/);
    let a: string;
    let b: string;
    let c: string;
    if (m) {
      a = m[1].toUpperCase();
      b = m[2];
      c = m[3].toUpperCase();
    } else {
      const compact = t.replace(/[^A-Za-z0-9]/g, '');
      const m2 = compact.match(/^([A-Za-z0-9]{5})(\d{12})([A-Za-z0-9])$/i);
      if (!m2) return null;
      a = m2[1].toUpperCase();
      b = m2[2];
      c = m2[3].toUpperCase();
    }
    const flat = [...a.split(''), ...b.split(''), ...c.split('')];
    if (flat.length !== total) return null;
    return flat;
  }

  return null;
}
