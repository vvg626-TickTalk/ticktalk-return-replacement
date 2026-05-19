import type { ReactNode } from 'react';

/** Primary CTA for adding order lines across return / replacement / trade-in wizards */
export const ADD_ITEMS_CTA = 'Add item(s)';

/** Shown when the add CTA is disabled (no remaining eligible lines) */
export const NO_ADDITIONAL_ELIGIBLE_ITEMS = 'No additional eligible items available';

export const RETURN_ADD_ITEMS_EMPTY_HELPER = 'Tap Add item(s) to choose what to return.';

export const REPLACEMENT_ADD_ITEMS_EMPTY_HELPER =
  'Tap Add item(s) to pick items from this order for replacement.';

export const TRADE_IN_ADD_ITEMS_EMPTY_HELPER =
  'Tap Add item(s) to select eligible products for trade-in.';

export const ADD_ITEMS_MODAL_TITLE = 'Add item(s)';

export const RETURN_ADD_ITEMS_MODAL_DESCRIPTION = 'Only eligible items from this order appear here.';

export const REPLACEMENT_ADD_ITEMS_MODAL_DESCRIPTION =
  'Eligible items from this order. Watches require a 15-digit IMEI.';

/** Sticky-toolbar slot: optional helper under the button when nothing left to add */
export function AddItemsToolbarSlot({
  disabled,
  children,
}: {
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      {children}
      {disabled ? (
        <p className="max-w-[18rem] text-center text-[10px] leading-snug text-slate-500 sm:text-left">
          {NO_ADDITIONAL_ELIGIBLE_ITEMS}
        </p>
      ) : null}
    </div>
  );
}
