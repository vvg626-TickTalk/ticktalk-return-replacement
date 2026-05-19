import type { PostReplacementPrefill } from '@/features/serviceOrder/types';

const KEY = 'tt_post_replace_service_flow';

export function savePostReplacementPrefill(payload: PostReplacementPrefill) {
  sessionStorage.setItem(KEY, JSON.stringify(payload));
}

export function readPostReplacementPrefill(): PostReplacementPrefill | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PostReplacementPrefill;
  } catch {
    return null;
  }
}

export function clearPostReplacementPrefill() {
  sessionStorage.removeItem(KEY);
}
