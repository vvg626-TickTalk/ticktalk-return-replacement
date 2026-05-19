import type { ReplacementReasonDef, ReplacementReasonId } from '@/features/replacement/replacementReasons';
import { getReplacementReason } from '@/features/replacement/replacementReasons';

const CARE_PLUS_REASONS: ReplacementReasonId[] = ['screen_cracked', 'water_damage'];

export type MockUploadItem = { id: string; label: string };

export type PerItemReasonForm = {
  reasonId: ReplacementReasonId | '';
  /** Legacy — unused in guided UX; kept for typing stability */
  followUps: Record<string, string>;
  description: string;
  photoAck: boolean;
  mockUploads: MockUploadItem[];
  uploadSectionOpen: boolean;
};

export function emptyReasonForm(): PerItemReasonForm {
  return {
    reasonId: '',
    followUps: {},
    description: '',
    photoAck: false,
    mockUploads: [],
    uploadSectionOpen: false,
  };
}

function carePlusReasonSatisfied(def: ReplacementReasonDef, carePlusVerified: boolean): boolean {
  if (!def.carePlusOnly) return true;
  return carePlusVerified;
}

export function isReasonFormComplete(
  def: ReplacementReasonDef | undefined,
  state: PerItemReasonForm,
  carePlusVerified: boolean,
): boolean {
  if (!def) return false;
  if (!state.reasonId) return false;
  if (!carePlusReasonSatisfied(def, carePlusVerified)) return false;

  if (def.completion.requireDescription && !state.description.trim()) return false;

  if (def.completion.requireDescriptionOrUpload) {
    const hasDesc = state.description.trim().length > 0;
    const hasU = state.mockUploads.length > 0;
    if (!hasDesc && !hasU) return false;
  }

  if (def.description.mode === 'required' && !state.description.trim()) return false;

  return true;
}

export function allSelectionsHaveCompleteReasons(
  lineIds: string[],
  reasonByLineId: Record<string, PerItemReasonForm>,
  carePlusVerified: boolean,
): boolean {
  return lineIds.every((id) => {
    const st = reasonByLineId[id] ?? emptyReasonForm();
    const def = getReplacementReason(st.reasonId);
    return isReasonFormComplete(def, st, carePlusVerified);
  });
}

/** Reasons that require global Care+ verification before selection sticks */
export function isCarePlusGatedReason(id: ReplacementReasonId | ''): boolean {
  return id !== '' && CARE_PLUS_REASONS.includes(id as ReplacementReasonId);
}
