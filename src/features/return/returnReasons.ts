export type ReturnReasonId =
  | 'ordered_by_mistake'
  | 'no_longer_needed'
  | 'better_price'
  | 'not_as_expected'
  | 'compatibility'
  | 'wrong_item'
  | 'arrived_damaged'
  | 'other';

export type PerLineReturnReason = {
  reasonId: ReturnReasonId | '';
  otherNote: string;
};

export const RETURN_REASONS: { id: ReturnReasonId; label: string }[] = [
  { id: 'ordered_by_mistake', label: 'Ordered by mistake' },
  { id: 'no_longer_needed', label: 'No longer needed' },
  { id: 'better_price', label: 'Better price available' },
  { id: 'not_as_expected', label: 'Product did not meet expectations' },
  { id: 'compatibility', label: 'Compatibility issue' },
  { id: 'wrong_item', label: 'Received wrong item' },
  { id: 'arrived_damaged', label: 'Arrived damaged' },
  { id: 'other', label: 'Other' },
];

export function emptyReturnReasonForm(): PerLineReturnReason {
  return { reasonId: '', otherNote: '' };
}

export function isReturnReasonComplete(form: PerLineReturnReason): boolean {
  if (!form.reasonId) return false;
  if (form.reasonId === 'other') return (form.otherNote ?? '').trim().length >= 3;
  return true;
}

export function allReturnReasonsComplete(lineIds: string[], byLine: Record<string, PerLineReturnReason>): boolean {
  if (lineIds.length === 0) return false;
  return lineIds.every((id) => isReturnReasonComplete(byLine[id] ?? emptyReturnReasonForm()));
}
