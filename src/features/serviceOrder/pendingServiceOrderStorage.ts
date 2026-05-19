import type { PostReplacementPrefill } from '@/features/serviceOrder/types';

const LS_KEY = 'tt_pending_service_order_v1';
const LEGACY_SESSION_KEY = 'tt_post_replace_service_flow';

function readLegacySession(): PostReplacementPrefill | null {
  try {
    const raw = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PostReplacementPrefill;
  } catch {
    return null;
  }
}

function clearLegacySession() {
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

/** Persist after Return or Replacement submit — consumed by Sign Up / attach on Sign In. */
export function savePendingServiceOrder(payload: PostReplacementPrefill) {
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
  clearLegacySession();
}

export function readPendingServiceOrder(): PostReplacementPrefill | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      return JSON.parse(raw) as PostReplacementPrefill;
    }
  } catch {
    return null;
  }
  const migrated = readLegacySession();
  if (migrated) {
    savePendingServiceOrder(migrated);
    clearLegacySession();
    return migrated;
  }
  return null;
}

export function clearPendingServiceOrder() {
  localStorage.removeItem(LS_KEY);
  clearLegacySession();
}
