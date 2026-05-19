/**
 * TickTalk service portal — PPT-aligned design system (reference: tradin return replace 260512).
 * Single source for consumer-facing service UI: navy CTAs, soft cards, calm badges.
 * Prefer importing from this file instead of ad-hoc Tailwind on pages.
 */
import { cn } from '@/utils/cn';

/** Raw palette (documentation, Figma/PPT parity) */
export const SUPPORT_PALETTE = {
  navy: '#071B53',
  navyHover: '#0B276F',
  white: '#FFFFFF',
  body: '#475569',
  slateBorder: '#E2E8F0',
  slateMuted: '#94A3B8',
  disabledBg: '#CBD5E1',
  disabledText: '#64748B',
  pageBg: '#F4F6FA',
  mintBg: '#ECFDF5',
  mintText: '#065F46',
  mintBorder: '#A7F3D0',
  danger: '#E11D48',
  dangerHover: '#BE123C',
} as const;

/* ——— Motion ——— */
export const supportTransition = 'transition-all duration-150 ease-out';

/* ——— Typography ——— */
export const supportFontSans = 'font-sans';

/** Page / screen H1 */
export const supportPageTitle = cn(
  supportFontSans,
  'text-balance text-[1.375rem] font-semibold leading-tight tracking-tight text-support-navy sm:text-[1.625rem]',
);

/** Modal & prominent titles (PPT: ~28px) */
export const supportModalTitle = cn(
  supportFontSans,
  'text-[1.75rem] font-semibold leading-tight tracking-tight text-support-navy',
);

export const supportEyebrow = cn(
  supportFontSans,
  'text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-slate-500',
);

/** Primary body (15px / leading-6) */
export const supportBody = cn(supportFontSans, 'text-[15px] leading-6 text-slate-600');

/** Smaller helper / secondary copy */
export const supportBodySmall = cn(supportFontSans, 'text-sm leading-snug text-slate-600');

export const supportLabel = cn(
  supportFontSans,
  'text-[0.8125rem] font-medium leading-snug text-slate-800',
);

export const supportLabelCompact = cn(
  supportFontSans,
  'text-[11px] font-medium uppercase tracking-wide text-slate-600',
);

/* ——— Buttons ——— Mobile ≥44px height; consistent pill shape ——— */
const supportButtonBase = cn(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight',
  supportTransition,
  'min-h-11 px-6 text-[0.9375rem]',
  'disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.99]',
);

export const supportButtonPrimary = cn(
  supportButtonBase,
  'bg-support-navy text-white',
  'shadow-sm shadow-support-navy/10',
  'hover:bg-support-navy-hover hover:shadow-md hover:shadow-support-navy/10',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-navy/25 focus-visible:ring-offset-2',
  'disabled:bg-slate-300 disabled:text-white/90 disabled:shadow-none disabled:hover:bg-slate-300 disabled:hover:shadow-none',
);

export const supportButtonSecondary = cn(
  supportButtonBase,
  'border border-support-navy bg-white text-support-navy',
  'shadow-sm shadow-slate-900/5',
  'hover:bg-support-tint',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-navy/20 focus-visible:ring-offset-2',
  'disabled:border-slate-200 disabled:bg-slate-200/70 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-200/70',
);

export const supportButtonGhost = cn(
  supportButtonBase,
  'border border-transparent bg-transparent px-5 text-support-navy shadow-none',
  'hover:bg-support-tint',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-navy/15 focus-visible:ring-offset-2',
  'disabled:text-slate-400 disabled:hover:bg-transparent',
);

/** Destructive (e.g. cancel RMA) — PPT-style rose, not loud admin red. */
export const supportButtonDanger = cn(
  supportButtonBase,
  'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/35 focus-visible:ring-offset-2',
  'disabled:bg-slate-300 disabled:text-white/90 disabled:shadow-none disabled:hover:bg-slate-300',
);

/** Dense row actions (wizards / toolbars) — still 44px min. */
export const supportToolbarBtn = cn(
  supportButtonSecondary,
  'px-4 text-xs font-semibold sm:px-5 sm:text-[13px]',
);

/* ——— Modal ——— */
export const supportModalBackdrop = 'bg-slate-900/40 backdrop-blur-[2px]';

export const supportModalShell = cn(
  'relative z-10 flex max-h-[min(92dvh,44rem)] w-full flex-col overflow-hidden',
  'rounded-t-[28px] border border-slate-200/80 bg-white',
  'shadow-xl shadow-slate-900/10',
  'sm:max-w-[40rem] sm:rounded-[28px] lg:max-w-[45rem]',
);

export const supportModalHeader = 'flex shrink-0 items-start gap-4 border-b border-slate-100 px-6 py-5 sm:px-8';

export const supportModalBody = 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8';

export const supportModalFooter = cn(
  'shrink-0 border-t border-slate-100 bg-white px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-5',
);

export const supportModalCloseBtn = cn(
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-light leading-none text-slate-500',
  'hover:bg-slate-100 active:bg-slate-200/80',
);

/** Order lookup per-digit cells (OrderLookupPage). */
export const supportOrderLookupDigitCell = cn(
  supportFontSans,
  'h-11 w-9 shrink-0 rounded-2xl border border-slate-200 bg-white text-center text-[15px] font-semibold text-support-navy tabular-nums outline-none transition sm:w-10',
  'focus:border-support-navy focus:ring-2 focus:ring-support-navy/12',
);

/* ——— Stepper pills ——— */
export const supportStepMeta = cn(supportEyebrow, 'text-slate-500');

export const supportStepCurrentLabel = cn(
  supportFontSans,
  'truncate text-right text-sm font-medium text-support-navy',
);

export const supportStepProgressTrack = 'h-1 w-full overflow-hidden rounded-full bg-slate-200/80';

export const supportStepProgressFill = cn('h-full rounded-full bg-support-navy transition-[width] duration-300 ease-out');

export const supportStepPillActive = cn(
  'bg-support-navy text-white ring-1 ring-inset ring-support-navy shadow-sm',
);

export const supportStepPillComplete = cn(
  'bg-support-mint text-support-mint-text ring-1 ring-inset ring-support-mint-border',
);

export const supportStepPillInactive = cn('bg-white text-slate-600 ring-1 ring-inset ring-slate-200');

export const supportStepPillBase = cn(
  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
);

/* ——— Form controls ——— */
export const supportField = cn(
  supportFontSans,
  'min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3',
  'text-[15px] text-slate-900 shadow-none outline-none',
  'placeholder:text-slate-400',
  'transition-colors duration-150',
  'focus:border-support-navy focus:ring-2 focus:ring-support-navy/10',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
  'sm:min-h-[3rem]',
);

export const supportFieldMono = cn(supportField, 'font-mono text-[15px]');

export const supportTextarea = cn(
  supportFontSans,
  'min-h-[6.5rem] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3',
  'text-[15px] leading-relaxed text-slate-900 shadow-none outline-none',
  'placeholder:text-slate-400',
  'transition-colors duration-150',
  'focus:border-support-navy focus:ring-2 focus:ring-support-navy/10',
);

export const supportRadioDotOuter = (selected: boolean) =>
  cn(
    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
    selected ? 'border-support-navy bg-support-navy shadow-[0_0_0_3px_rgba(7,27,83,0.12)]' : 'border-slate-300 bg-white',
  );

export const supportRadioDotInner = 'h-2 w-2 rounded-full bg-white';

/* ——— Issue list (replacement reasons) ——— */
export const supportReasonRow = (selected: boolean) =>
  cn(
    'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors',
    selected
      ? 'border-support-navy/25 bg-support-tint ring-1 ring-support-navy/15'
      : 'border-transparent hover:bg-slate-50/90',
  );

export const supportCareChip = cn(
  'inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/90',
);

/* ——— Upload (progressive) ——— */
export const supportUploadThumb = cn(
  'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50',
);

export const supportUploadRemoveBtn = cn(
  'absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full',
  'border border-slate-200 bg-white text-sm leading-none text-slate-500 shadow-sm',
  'hover:bg-slate-50 hover:text-slate-700',
);

export const supportUploadAddBtn = cn(
  'min-h-11 rounded-xl border border-dashed border-support-navy/35 bg-white px-4',
  'text-[13px] font-medium text-support-navy',
  'hover:border-support-navy/55 hover:bg-support-tint',
);

export const supportLinkSubtle = cn(
  'text-left text-[13px] font-medium text-support-navy underline decoration-support-navy/25 underline-offset-2',
  'hover:decoration-support-navy/50',
);

/* ——— Panels (support portal shell) ——— */
export const supportPanel = 'rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.03]';

export const supportSectionHead = cn(
  supportFontSans,
  'border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-slate-600',
);

export const supportErrorCallout = cn(
  'rounded-xl bg-red-50 px-3 py-2 text-sm font-medium leading-snug text-red-800 ring-1 ring-red-100',
);

export const supportToastInfo = cn(
  'rounded-2xl bg-support-tint px-4 py-3 text-sm font-medium text-support-navy ring-1 ring-support-navy/10',
);

export const supportCalloutCard = cn(
  'rounded-2xl border-0 bg-support-tint/50 shadow-none ring-1 ring-support-navy/10',
);

/** Success / confirmation callout (trade-in, replacement approved). */
export const supportSuccessCallout = cn(
  'rounded-2xl border border-support-navy/10 bg-support-tint/70 px-4 py-4 text-center ring-1 ring-support-navy/8',
);

/* ——— RMA status badges (calm, parent-friendly) ——— */
export const supportStatusBadgeBase = cn(
  supportFontSans,
  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset',
);

const DEFAULT_BADGE = 'bg-slate-100 text-slate-700 ring-slate-200/80';

/** Tailwind class bundle per internal RMA status key. */
export const SUPPORT_RMA_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-100 text-support-navy ring-slate-200/90',
  awaiting_your_reply: 'bg-amber-50 text-amber-950 ring-amber-200/70',
  rejected: 'bg-rose-50 text-rose-900 ring-rose-200/75',
  waiting_for_your_shipment: 'bg-support-tint text-support-navy ring-support-navy/12',
  shipment_deadline_passed: 'bg-orange-50 text-orange-950 ring-orange-200/70',
  shipped_by_customer: 'bg-sky-50 text-sky-950 ring-sky-200/70',
  inspection_in_progress: 'bg-slate-100 text-support-navy ring-slate-200/80',
  inspection_failed: 'bg-rose-50 text-rose-900 ring-rose-200/75',
  backorder: 'bg-amber-50/95 text-amber-950 ring-amber-200/65',
  preparing_shipment: 'bg-support-tint text-support-navy ring-support-navy/12',
  shipped: 'bg-emerald-50 text-emerald-950 ring-emerald-200/75',
  return_in_review: 'bg-support-tint/90 text-support-navy ring-support-navy/15',
  refunded: 'bg-emerald-50/90 text-emerald-950 ring-emerald-200/70',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200/80',
};

export function supportRmaStatusBadgeClasses(status: string): string {
  return SUPPORT_RMA_STATUS_BADGE[status] ?? DEFAULT_BADGE;
}

/* ——— Selection cards (OOS options, etc.) ——— */
export const supportOptionCard = (selected: boolean) =>
  cn(
    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
    selected
      ? 'border-support-navy/40 bg-support-tint ring-2 ring-support-navy/15'
      : 'border-slate-200 bg-white hover:border-slate-300',
  );
