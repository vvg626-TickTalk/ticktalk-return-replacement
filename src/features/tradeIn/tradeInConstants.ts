/** Fixed promo deadline shown in app-style modal (demo). */
export const TRADE_IN_PROMO_VALID_UNTIL_ISO = '2026-08-31';

export const TRADE_IN_CREDIT_CENTS = 5000;

/** “New watch” SKUs offered after trade-in preview (demo storefront). */
export const TRADE_IN_NEW_WATCH_PRODUCT_IDS = ['prod-tt-watch-6', 'prod-tt-watch-5'] as const;

/** Care / app entry — mock device row (always eligible story for demo). */
export const TRADE_IN_APP_ENTRY_DEVICE = {
  deviceName: 'TickTalk Watch 5',
  imei: '356789012345678',
  colorLabel: 'Gray',
  carrierLabel: "AT&T's Network",
} as const;
