/** Order lookup — channel-specific entry; composed value must match mock `externalOrderRef`. */

export type ChannelId = 'myticktalk' | 'amazon' | 'walmart' | 'bestbuy';

export type SegmentKind = 'digits' | 'letters' | 'alphanumeric';

export type SegmentDef = {
  maxLength: number;
  kind: SegmentKind;
};

/** myticktalk.com: one continuous numeric code (see `OrderLookupPage`). */
export type FlexNumericSpec = {
  minDigits: number;
  maxDigits: number;
};

export type ChannelOrderFormat = {
  id: ChannelId;
  label: string;
  /** Amazon / Walmart / Best Buy — fixed-width segment groups. */
  segments?: SegmentDef[];
  /** How segments compose into `externalOrderRef` (segment channels only). */
  join?: 'dashes' | 'none';
  /** myticktalk.com only — 5–7 digits, no letters or dashes in stored ref. */
  flexNumeric?: FlexNumericSpec;
  exampleDisplay: string;
  helpTitle: string;
  helpBody: string;
};

export const ORDER_LOOKUP_CHANNELS: ChannelOrderFormat[] = [
  {
    id: 'myticktalk',
    label: 'myticktalk.com',
    flexNumeric: { minDigits: 5, maxDigits: 7 },
    exampleDisplay: 'e.g. 92118 — 5–7 digits',
    helpTitle: 'Where to find your TickTalk order number',
    helpBody:
      'Check your order confirmation email or your myticktalk.com account. The order number is a short numeric code (5–7 digits). Enter digits only — no spaces or dashes.',
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

export function emptyPartsForChannel(id: ChannelId): string[] {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  if (fmt.flexNumeric) return [''];
  const segs = fmt.segments ?? [];
  return segs.map(() => '');
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

export function sanitizeFlexNumeric(value: string, spec: FlexNumericSpec): string {
  return value.replace(/\D/g, '').slice(0, spec.maxDigits);
}

export function flexNumericEntryComplete(part: string, spec: FlexNumericSpec): boolean {
  const d = (part ?? '').replace(/\D/g, '');
  return d.length >= spec.minDigits && d.length <= spec.maxDigits;
}

export function composeExternalOrderRef(id: ChannelId, parts: string[]): string {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  if (fmt.flexNumeric) {
    return sanitizeFlexNumeric(parts[0] ?? '', fmt.flexNumeric);
  }
  const segments = fmt.segments;
  const join = fmt.join ?? 'none';
  if (!segments?.length) return '';
  const cleaned = segments.map((def, i) => sanitizeSegment(parts[i] ?? '', def));
  if (join === 'dashes') {
    return cleaned.join('-');
  }
  return cleaned.join('');
}

export function segmentsComplete(id: ChannelId, parts: string[]): boolean {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  const segments = fmt.segments;
  if (!segments?.length) return false;
  return segments.every((def, i) => (parts[i] ?? '').length === def.maxLength);
}

export function orderEntryComplete(id: ChannelId, parts: string[]): boolean {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  if (fmt.flexNumeric) {
    return flexNumericEntryComplete(parts[0] ?? '', fmt.flexNumeric);
  }
  return segmentsComplete(id, parts);
}

/** Parse clipboard / pasted full order ref into parts.; returns null if unrecognized. */
export function parsePastedOrderRef(id: ChannelId, raw: string): string[] | null {
  const fmt = ORDER_LOOKUP_BY_ID[id];
  const t = raw.trim();
  if (!t) return null;

  if (id === 'myticktalk') {
    const spec = fmt.flexNumeric;
    if (!spec) return null;
    const d = t.replace(/\D/g, '');
    if (d.length >= spec.minDigits && d.length <= spec.maxDigits) return [d];
    return null;
  }

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

  return null;
}
