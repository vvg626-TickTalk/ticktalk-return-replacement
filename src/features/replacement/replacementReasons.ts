/** Replacement issue taxonomy — guided troubleshooting copy (PPT-aligned). */

export type ReplacementReasonId =
  | 'screen_spot_line'
  | 'screen_cracked'
  | 'no_power'
  | 'hardware_io'
  | 'battery_hot'
  | 'water_damage'
  | 'band_wristband_only'
  | 'band_connector_body'
  | 'wrong_item'
  | 'damaged_arrival'
  | 'other';

export type ReasonUploadType = 'none' | 'progressive' | 'behind_link';

export type ReplacementReasonDef = {
  id: ReplacementReasonId;
  /** Primary title (radio label) */
  label: string;
  subtitle?: string;
  previewSummary: string;
  carePlusOnly?: boolean;
  introLines?: string[];
  /** Reason 1 — optional micro-label above description */
  whenStartedLabel?: string;
  policyNote?: string;
  footerDisclaimer?: string;
  description: {
    mode: 'hidden' | 'optional' | 'required';
    placeholder: string;
  };
  upload: {
    type: ReasonUploadType;
    helper?: string;
    /** First CTA before any mock file (progressive) */
    primaryCta?: string;
    linkText?: string;
    recommended?: boolean;
  };
  completion: {
    requireDescription?: boolean;
    requireDescriptionOrUpload?: boolean;
  };
};

export const REPLACEMENT_REASONS: ReplacementReasonDef[] = [
  {
    id: 'screen_spot_line',
    label: 'Pixelated Screen / Lines on Screen',
    subtitle: '(No physical damage)',
    previewSummary: 'Display shows pixels or lines without physical damage.',
    whenStartedLabel: 'When did the issue start?',
    description: { mode: 'optional', placeholder: 'Briefly describe the issue' },
    upload: {
      type: 'progressive',
      helper: 'Clear photo of the screen while on. Optional.',
      primaryCta: 'Upload photo',
      recommended: false,
    },
    completion: {},
  },
  {
    id: 'screen_cracked',
    label: 'Cracked or Broken Screen',
    subtitle: '(Care+ only)',
    previewSummary: 'Cracked or broken screen.',
    carePlusOnly: true,
    description: { mode: 'optional', placeholder: 'Briefly describe how the damage happened' },
    upload: {
      type: 'progressive',
      primaryCta: 'Upload photo',
      recommended: false,
    },
    completion: {},
  },
  {
    id: 'no_power',
    label: 'Power or Charging Failure',
    subtitle: '(Won’t turn on)',
    previewSummary: 'Won’t power on or charge.',
    introLines: [
      'Does anything appear on screen while charging?',
      'Have you tried another original cable?',
    ],
    description: { mode: 'optional', placeholder: 'Describe what happens when charging' },
    upload: { type: 'behind_link', linkText: 'Add photos (optional)' },
    footerDisclaimer: 'Our team may request additional photos later if needed.',
    completion: {},
  },
  {
    id: 'hardware_io',
    label: 'Hardware Component Failure',
    subtitle: '(Buttons / Speaker / Mic)',
    previewSummary: 'Button, speaker, or microphone problem.',
    introLines: [
      'Which function is not working?',
      'Examples: button stuck · no sound · microphone issue',
    ],
    description: { mode: 'optional', placeholder: 'Describe the issue' },
    upload: {
      type: 'progressive',
      helper: 'Optional.',
      primaryCta: 'Add photo or video (optional)',
      recommended: false,
    },
    completion: {},
  },
  {
    id: 'battery_hot',
    label: 'Battery Overheating',
    previewSummary: 'Battery runs hot.',
    introLines: ['Does it overheat while charging or during use?'],
    description: { mode: 'optional', placeholder: 'Describe the overheating issue' },
    upload: { type: 'behind_link', linkText: 'Add photos (optional)' },
    completion: {},
  },
  {
    id: 'water_damage',
    label: 'Water Damage',
    subtitle: '(Care+ only)',
    previewSummary: 'Liquid or water damage.',
    carePlusOnly: true,
    description: { mode: 'optional', placeholder: 'Briefly describe what happened' },
    upload: { type: 'progressive', primaryCta: 'Upload photo', recommended: false },
    completion: {},
  },
  {
    id: 'band_wristband_only',
    label: 'Broken wristband only',
    previewSummary: 'Wristband damage only.',
    policyNote:
      'Wristbands are wearable accessories. Standard coverage is limited.',
    description: { mode: 'optional', placeholder: 'Describe the damaged area' },
    upload: {
      type: 'progressive',
      helper: 'Photos recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: {},
  },
  {
    id: 'band_connector_body',
    label: 'Connector / body damage',
    previewSummary: 'Connector or watch body damage.',
    policyNote:
      'You can submit this for review. Final eligibility is decided by support.',
    description: { mode: 'optional', placeholder: 'Describe the damaged area' },
    upload: {
      type: 'progressive',
      helper: 'Photos recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: {},
  },
  {
    id: 'wrong_item',
    label: 'Wrong Item / Color / Quantity',
    previewSummary: 'Wrong item, color, or quantity.',
    introLines: ['What was incorrect or missing?'],
    description: { mode: 'optional', placeholder: 'Describe what you received' },
    upload: {
      type: 'progressive',
      helper: 'Items and shipping label. Recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: {},
  },
  {
    id: 'damaged_arrival',
    label: 'Damaged Upon Arrival',
    subtitle: '(Product & packaging)',
    previewSummary: 'Damage when the package arrived.',
    introLines: ['Was the package visibly damaged when received?'],
    description: { mode: 'optional', placeholder: 'Describe the damage' },
    upload: {
      type: 'progressive',
      helper: 'Product and packaging photos help us file a shipping claim.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: {},
  },
  {
    id: 'other',
    label: 'Other Issue',
    previewSummary: 'Other issue.',
    introLines: ['Please describe the issue'],
    description: { mode: 'required', placeholder: 'Describe your issue' },
    upload: {
      type: 'behind_link',
      linkText: 'Add photos or videos',
    },
    completion: { requireDescription: true },
  },
];

export const REPLACEMENT_REASON_MAP: Record<ReplacementReasonId, ReplacementReasonDef> =
  REPLACEMENT_REASONS.reduce(
    (acc, r) => {
      acc[r.id] = r;
      return acc;
    },
    {} as Record<ReplacementReasonId, ReplacementReasonDef>,
  );

export function getReplacementReason(id: ReplacementReasonId | ''): ReplacementReasonDef | undefined {
  if (!id) return undefined;
  return REPLACEMENT_REASON_MAP[id];
}
