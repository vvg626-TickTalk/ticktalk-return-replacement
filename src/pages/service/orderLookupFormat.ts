/** Order lookup segment config — visual structure only; lookup still matches full `externalOrderRef` strings in mock data. */

export type ChannelId = 'myticktalk' | 'amazon' | 'walmart' | 'bestbuy';

export type SegmentKind = 'digits' | 'letters' | 'alphanumeric';

export type SegmentDef = {
  maxLength: number;
  kind: SegmentKind;
};

export type ChannelOrderFormat = {
  id: ChannelId;
  /** Shown in channel picker */
  label: string;
  segments: SegmentDef[];
  /** How segments compose into `externalOrderRef` for lookup */
  join: 'dashes' | 'none';
  /** Short shopper-facing example (no “demo” / dev wording) */
  exampleDisplay: string;
  helpTitle: string;
  helpBody: string;
};

export const ORDER_LOOKUP_CHANNELS: ChannelOrderFormat[] = [
  {
    id: 'myticktalk',
    label: 'myticktalk.com',
    segments: [
      { maxLength: 3, kind: 'letters' },
      { maxLength: 4, kind: 'digits' },
      { maxLength: 6, kind: 'digits' },
    ],
    join: 'dashes',
    exampleDisplay: 'MTT · 2405 · 009821',
    helpTitle: 'Where to find your TickTalk order number',
    helpBody:
      'Open your order confirmation email or sign in at myticktalk.com and open your order. The order number is three groups: a short store prefix, then two number groups, separated by dashes.',
  },
  {
    id: 'amazon',
    label: 'Amazon',
    segments: [
      { maxLength: 3, kind: 'digits' },
      { maxLength: 7, kind: 'digits' },
      { maxLength: 7, kind: 'digits' },
    ],
    join: 'dashes',
    exampleDisplay: '111 · 2959942 · 5172257',
    helpTitle: 'Where to find your Amazon order ID',
    helpBody:
      'In the Amazon app or site, go to Your Orders and open the order. The order ID is three number groups separated by dashes. The same ID appears in your shipment confirmation email.',
  },
  {
    id: 'walmart',
    label: 'Walmart',
    segments: [
      { maxLength: 5, kind: 'digits' },
      { maxLength: 5, kind: 'digits' },
      { maxLength: 5, kind: 'digits' },
    ],
    join: 'none',
    exampleDisplay: '12910 · 38252 · 24007',
    helpTitle: 'Where to find your Walmart order number',
    helpBody:
      'Check your Walmart purchase history or your order confirmation email. The order number is fifteen digits. Enter it in three groups of five as shown above.',
  },
  {
    id: 'bestbuy',
    label: 'Best Buy',
    segments: [
      { maxLength: 5, kind: 'alphanumeric' },
      { maxLength: 12, kind: 'digits' },
      { maxLength: 1, kind: 'alphanumeric' },
    ],
    join: 'dashes',
    exampleDisplay: 'BBY03 · 807142006365 · A',
    helpTitle: 'Where to find your Best Buy order number',
    helpBody:
      'Use the order number from your Best Buy confirmation email or your account order details. It usually starts with a short store code, a long number, and one ending character—use dashes between the groups.',
  },
];

export const ORDER_LOOKUP_BY_ID: Record<ChannelId, ChannelOrderFormat> = ORDER_LOOKUP_CHANNELS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<ChannelId, ChannelOrderFormat>,
);

export function emptySegmentsForChannel(id: ChannelId): string[] {
  return ORDER_LOOKUP_BY_ID[id].segments.map(() => '');
}

export function sanitizeSegment(value: string, def: SegmentDef): string {
  if (def.kind === 'digits') {
    return value.replace(/\D/g, '').slice(0, def.maxLength);
  }
  if (def.kind === 'letters') {
    return value
      .replace(/[^A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, def.maxLength);
  }
  return value
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, def.maxLength);
}

export function composeExternalOrderRef(id: ChannelId, parts: string[]): string {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  const cleaned = fmt.segments.map((def, i) => sanitizeSegment(parts[i] ?? '', def));
  if (fmt.join === 'dashes') {
    return cleaned.join('-');
  }
  return cleaned.join('');
}

export function segmentsComplete(id: ChannelId, parts: string[]): boolean {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  return fmt.segments.every((def, i) => (parts[i] ?? '').length === def.maxLength);
}

/** Parse clipboard / pasted full order ref into segment values; returns null if unrecognized. */
export function parsePastedOrderRef(id: ChannelId, raw: string): string[] | null {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  const t = raw.trim();
  if (!t) return null;

  if (id === 'amazon') {
    const m = t.match(/^(\d{3})-(\d{7})-(\d{7})$/);
    if (m) return [m[1], m[2], m[3]];
    const d = t.replace(/\D/g, '');
    if (d.length === 17) return [d.slice(0, 3), d.slice(3, 10), d.slice(10, 17)];
    return null;
  }

  if (id === 'walmart') {
    const d = t.replace(/\D/g, '');
    if (d.length === 15) {
      return [d.slice(0, 5), d.slice(5, 10), d.slice(10, 15)];
    }
    return null;
  }

  if (id === 'bestbuy') {
    const m = t.match(/^([A-Za-z0-9]{5})-(\d{12})-([A-Za-z0-9])$/);
    if (m) {
      return [m[1].toUpperCase(), m[2], m[3].toUpperCase()];
    }
    const compact = t.replace(/[^A-Za-z0-9]/g, '');
    const m2 = compact.match(/^([A-Za-z0-9]{5})(\d{12})([A-Za-z0-9])$/i);
    if (m2) return [m2[1].toUpperCase(), m2[2], m2[3].toUpperCase()];
    return null;
  }

  // myticktalk
  const byDash = t.split('-').map((s) => s.trim());
  if (byDash.length === 3) {
    const a = sanitizeSegment(byDash[0] ?? '', fmt.segments[0]!);
    const b = sanitizeSegment(byDash[1] ?? '', fmt.segments[1]!);
    const c = sanitizeSegment(byDash[2] ?? '', fmt.segments[2]!);
    if (a.length === 3 && b.length === 4 && c.length === 6) return [a, b, c];
  }
  const compact = t.replace(/[^A-Za-z0-9]/g, '');
  const m3 = compact.match(/^([A-Za-z]{3})(\d{4})(\d{6})$/i);
  if (m3) return [m3[1].toUpperCase(), m3[2], m3[3]];
  return null;
}
