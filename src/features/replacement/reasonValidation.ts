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

/** Merge partial / recovered state into a complete form (avoids stale checkpoint shapes). */
export function normalizePerItemReasonForm(state: Partial<PerItemReasonForm> | undefined): PerItemReasonForm {
  const base = emptyReasonForm();
  if (!state) return base;
  return {
    ...base,
    ...state,
    followUps: state.followUps ?? base.followUps,
    mockUploads: Array.isArray(state.mockUploads) ? state.mockUploads : base.mockUploads,
    uploadSectionOpen: state.uploadSectionOpen ?? base.uploadSectionOpen,
    photoAck: state.photoAck ?? base.photoAck,
    description: state.description ?? base.description,
    reasonId: state.reasonId ?? base.reasonId,
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
  const st = normalizePerItemReasonForm(state);
  if (!def) return false;
  if (!st.reasonId) return false;
  if (!carePlusReasonSatisfied(def, carePlusVerified)) return false;

  if (def.completion.requireDescription && !st.description.trim()) return false;

  if (def.completion.requireDescriptionOrUpload) {
    const hasDesc = st.description.trim().length > 0;
    const hasU = st.mockUploads.length > 0;
    if (!hasDesc && !hasU) return false;
  }

  if (def.description.mode === 'required' && !st.description.trim()) return false;

  return true;
}

export function allSelectionsHaveCompleteReasons(
  lineIds: string[],
  reasonByLineId: Record<string, PerItemReasonForm>,
  carePlusVerified: boolean,
): boolean {
  return lineIds.every((id) => {
    const st = normalizePerItemReasonForm(reasonByLineId[id]);
    const def = getReplacementReason(st.reasonId);
    return isReasonFormComplete(def, st, carePlusVerified);
  });
}

/** Reasons that require global Care+ verification before selection sticks */
export function isCarePlusGatedReason(id: ReplacementReasonId | ''): boolean {
  return id !== '' && CARE_PLUS_REASONS.includes(id as ReplacementReasonId);
}
