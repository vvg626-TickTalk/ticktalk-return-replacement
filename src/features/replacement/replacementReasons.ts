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
    description: { mode: 'optional', placeholder: 'Briefly describe the issue (optional if you add a photo)' },
    upload: {
      type: 'progressive',
      helper: 'One clear photo can replace a written description.',
      primaryCta: 'Upload photo',
      recommended: false,
    },
    completion: { requireDescriptionOrUpload: true },
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
      'Does the screen respond when plugged in? Have you tried another original charging cable?',
    ],
    description: { mode: 'required', placeholder: 'Describe what happens when you charge it' },
    upload: { type: 'none' },
    footerDisclaimer: 'Our team may request additional photos if needed.',
    completion: { requireDescription: true },
  },
  {
    id: 'hardware_io',
    label: 'Hardware Component Failure',
    subtitle: '(Buttons / Speaker / Mic)',
    previewSummary: 'Button, speaker, or microphone problem.',
    introLines: ['Which button or function is not working?'],
    description: { mode: 'required', placeholder: 'Describe the issue' },
    upload: { type: 'none' },
    completion: { requireDescription: true },
  },
  {
    id: 'battery_hot',
    label: 'Battery Overheating',
    previewSummary: 'Battery runs hot.',
    introLines: ['Does it overheat while charging or during use?'],
    description: { mode: 'required', placeholder: 'Describe the overheating issue' },
    upload: { type: 'none' },
    completion: { requireDescription: true },
  },
  {
    id: 'water_damage',
    label: 'Water Damage',
    subtitle: '(Care+ only)',
    previewSummary: 'Liquid or water damage.',
    carePlusOnly: true,
    description: { mode: 'optional', placeholder: 'Briefly describe what happened' },
    upload: {
      type: 'behind_link',
      linkText: 'Add photo (optional)',
    },
    completion: {},
  },
  {
    id: 'band_wristband_only',
    label: 'Broken wristband only',
    previewSummary: 'Wristband damage only.',
    policyNote: 'Wristbands are wearable accessories and have limited coverage.',
    description: { mode: 'required', placeholder: 'Describe the damaged area' },
    upload: {
      type: 'progressive',
      helper: 'Photo recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'band_connector_body',
    label: 'Connector / body damage',
    previewSummary: 'Connector or watch body damage.',
    policyNote:
      'Coverage may differ for standard warranty and TickTalk Care+. You may still submit this request. Our support team will review it.',
    description: { mode: 'required', placeholder: 'Describe the damaged area' },
    upload: {
      type: 'progressive',
      helper: 'Photo recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'wrong_item',
    label: 'Wrong Item / Color / Quantity',
    previewSummary: 'Wrong item, color, or quantity.',
    introLines: ['What was incorrect or missing?'],
    description: { mode: 'required', placeholder: 'Describe what you received' },
    upload: {
      type: 'progressive',
      helper: 'Received items and shipping label — recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'damaged_arrival',
    label: 'Damaged Upon Arrival',
    subtitle: '(Product & packaging)',
    previewSummary: 'Damage when the package arrived.',
    introLines: ['Was the package visibly damaged when received?'],
    description: { mode: 'required', placeholder: 'Describe the damage' },
    upload: {
      type: 'progressive',
      helper: 'Damaged product and packaging — recommended.',
      primaryCta: 'Upload photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'other',
    label: 'Other Issue',
    previewSummary: 'Other issue.',
    introLines: ['Please describe the issue.'],
    description: { mode: 'required', placeholder: 'Describe your issue' },
    upload: {
      type: 'behind_link',
      linkText: 'Add upload (optional)',
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
