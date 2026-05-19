/**
 * @deprecated Import from `pendingServiceOrderStorage` — kept for backwards-compatible imports.
 */
export {
  savePendingServiceOrder as savePostReplacementPrefill,
  readPendingServiceOrder as readPostReplacementPrefill,
  clearPendingServiceOrder as clearPostReplacementPrefill,
} from '@/features/serviceOrder/pendingServiceOrderStorage';
