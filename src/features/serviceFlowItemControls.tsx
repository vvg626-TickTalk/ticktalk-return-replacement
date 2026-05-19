import type { ReactNode } from 'react';

/** Primary CTA for return / trade-in wizards */
export const ADD_ITEMS_CTA = 'Add item(s)';

/** Replacement flow (PPT) — use only in Replace wizard */
export const REPLACEMENT_ADD_ANOTHER_CTA = 'Add Another Item';

/** Shown when the add CTA is disabled (no remaining eligible lines) */
export const NO_ADDITIONAL_ELIGIBLE_ITEMS = 'No additional eligible items available';

export const RETURN_ADD_ITEMS_EMPTY_HELPER = 'Tap Add item(s) to choose what to return.';

export const REPLACEMENT_ADD_ITEMS_EMPTY_HELPER =
  'Next and Add Another Item stay off until the current item’s issue is valid.';

export const TRADE_IN_ADD_ITEMS_EMPTY_HELPER =
  'Tap Add item(s) to select eligible products for trade-in.';

export const ADD_ITEMS_MODAL_TITLE = 'Add item(s)';

export const REPLACEMENT_ADD_MODAL_TITLE = 'Add Another Item';

export const RETURN_ADD_ITEMS_MODAL_DESCRIPTION = 'Only eligible items from this order appear here.';

export const REPLACEMENT_ADD_ITEMS_MODAL_DESCRIPTION =
  'Eligible items from this order. Watches need a 15-digit IMEI.';

/** Sticky-toolbar slot: optional helper under the button when disabled */
export function AddItemsToolbarSlot({
  disabled,
  children,
  /** When set and disabled, shown instead of {@link NO_ADDITIONAL_ELIGIBLE_ITEMS}. Pass "" to hide. */
  disabledHint,
}: {
  disabled: boolean;
  children: ReactNode;
  disabledHint?: string;
}) {
  let footer: string | null = null;
  if (disabled) {
    if (disabledHint === '') footer = null;
    else if (disabledHint !== undefined) footer = disabledHint;
    else footer = NO_ADDITIONAL_ELIGIBLE_ITEMS;
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      {children}
      {footer ? (
        <p className="max-w-[18rem] text-center text-[10px] leading-snug text-slate-500 sm:text-left">{footer}</p>
      ) : null}
    </div>
  );
}
