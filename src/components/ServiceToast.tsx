import { useEffect } from 'react';
import { cn } from '@/utils/cn';

/** Lightweight top toast — PPT-aligned, auto-dismiss. */
export function ServiceToast({
  message,
  open,
  onClose,
  durationMs = 3000,
}: {
  message: string;
  open: boolean;
  onClose: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [open, onClose, durationMs]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed left-1/2 top-4 z-[60] w-[min(92vw,24rem)] -translate-x-1/2 rounded-2xl',
        'border border-support-navy/10 bg-white px-4 py-3 text-center text-sm font-medium text-support-navy shadow-xl shadow-slate-900/10',
      )}
      role="status"
    >
      {message}
    </div>
  );
}
