/** Replacement issue taxonomy — PPT pages 14–39 (per-reason UX; not a generic form). */

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

/** Photo-only vs photo/video for progressive CTA copy and thumbnails. */
export type ProgressiveUploadKind = 'photo' | 'file';

export type ReplacementReasonDef = {
  id: ReplacementReasonId;
  label: string;
  subtitle?: string;
  previewSummary: string;
  carePlusOnly?: boolean;
  /** Shown in bordered follow-up block (above textarea). */
  introLines?: string[];
  policyNote?: string;
  footerDisclaimer?: string;
  description: {
    mode: 'hidden' | 'optional' | 'required';
    placeholder: string;
  };
  /** Hint above textarea (e.g. Care+ sections). */
  descriptionHelper?: string;
  /** Secondary line under radio; omitted when Care+ modal handles gating. */
  shortHint?: string;
  upload: {
    type: ReasonUploadType;
    helper?: string;
    primaryCta?: string;
    addAnotherCta?: string;
    linkText?: string;
    recommended?: boolean;
    progressiveKind?: ProgressiveUploadKind;
  };
  completion: {
    requireDescription?: boolean;
    requireDescriptionOrUpload?: boolean;
  };
  /** After Care+ verify — badge in expanded section. */
  showCarePlusBadge?: boolean;
};

export const REPLACEMENT_REASONS: ReplacementReasonDef[] = [
  {
    id: 'screen_spot_line',
    label: 'Pixelated Screen / Lines on Screen',
    subtitle: '(No physical damage)',
    previewSummary: 'Display shows pixels or lines without physical damage.',
    introLines: ['When did the issue start?', 'Have you tried restarting the watch?'],
    description: { mode: 'optional', placeholder: 'Describe the issue…' },
    upload: {
      type: 'progressive',
      helper: 'Clear photo of the screen while powered on.',
      primaryCta: '+ Add photo',
      addAnotherCta: '+ Add another upload',
      progressiveKind: 'photo',
      recommended: false,
    },
    completion: { requireDescriptionOrUpload: true },
  },
  {
    id: 'screen_cracked',
    label: 'Cracked or Broken Screen',
    previewSummary: 'Cracked or broken screen.',
    carePlusOnly: true,
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    descriptionHelper: 'Briefly describe how the damage occurred.',
    upload: { type: 'none' },
    completion: { requireDescription: true },
    showCarePlusBadge: true,
  },
  {
    id: 'no_power',
    label: 'Power or Charging Failure',
    subtitle: '(Won’t turn on)',
    previewSummary: 'Won’t power on or charge.',
    introLines: [
      'Does the screen respond when plugged in?',
      'Have you tried another original charging cable?',
    ],
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: { type: 'none' },
    footerDisclaimer: 'Our support team may request additional photos later if needed.',
    completion: { requireDescription: true },
  },
  {
    id: 'hardware_io',
    label: 'Hardware Component Failure',
    subtitle: '(Buttons / Speaker / Mic)',
    previewSummary: 'Button, speaker, or microphone problem.',
    introLines: ['Which function is failing?', '(button, speaker, microphone, etc.)'],
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: { type: 'none' },
    footerDisclaimer: 'Our team may request additional media later if needed.',
    completion: { requireDescription: true },
  },
  {
    id: 'battery_hot',
    label: 'Battery Overheating',
    previewSummary: 'Battery runs hot.',
    introLines: [
      'Does it overheat while charging or during use?',
      'Any odor or casing deformation?',
    ],
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: { type: 'none' },
    completion: { requireDescription: true },
  },
  {
    id: 'water_damage',
    label: 'Water Damage',
    previewSummary: 'Liquid or water damage.',
    carePlusOnly: true,
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    descriptionHelper: 'Describe how the water exposure happened.',
    upload: { type: 'none' },
    completion: { requireDescription: true },
    showCarePlusBadge: true,
  },
  {
    id: 'band_wristband_only',
    label: 'Broken Wristband Only',
    previewSummary: 'Wristband damage only.',
    policyNote: 'Wristbands are wearable accessories with limited warranty coverage.',
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: {
      type: 'progressive',
      helper: 'Photo optional but recommended.',
      primaryCta: '+ Add photo',
      addAnotherCta: '+ Add another upload',
      progressiveKind: 'photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'band_connector_body',
    label: 'Connector / Watch Body Damage',
    previewSummary: 'Connector or body damage.',
    policyNote:
      'Coverage differs for standard warranty and TickTalk Care+. All requests are reviewed by our support team individually.',
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: {
      type: 'progressive',
      helper: 'Photo optional.',
      primaryCta: '+ Add photo',
      addAnotherCta: '+ Add another upload',
      progressiveKind: 'photo',
      recommended: false,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'wrong_item',
    label: 'Wrong Item / Color / Quantity',
    previewSummary: 'Wrong item, color, or quantity.',
    introLines: ['What did you receive and what is missing?'],
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: {
      type: 'progressive',
      helper: 'Photo of all received items and the shipping label.',
      primaryCta: '+ Add photo',
      addAnotherCta: '+ Add another upload',
      progressiveKind: 'photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'damaged_arrival',
    label: 'Damaged Upon Arrival',
    subtitle: '(Product & packaging)',
    previewSummary: 'Damage when the package arrived.',
    introLines: ['Was the packaging visibly damaged?'],
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: {
      type: 'progressive',
      helper: 'Damaged product and packaging.',
      primaryCta: '+ Add photo',
      addAnotherCta: '+ Add another upload',
      progressiveKind: 'photo',
      recommended: true,
    },
    completion: { requireDescription: true },
  },
  {
    id: 'other',
    label: 'Other Issue',
    previewSummary: 'Other issue.',
    introLines: ['Describe the issue in detail.'],
    description: { mode: 'required', placeholder: 'Describe the issue…' },
    upload: {
      type: 'behind_link',
      linkText: '+ Add file',
      primaryCta: '+ Add file',
      addAnotherCta: '+ Add another upload',
      helper: 'Photos or videos if they help explain.',
      progressiveKind: 'file',
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
