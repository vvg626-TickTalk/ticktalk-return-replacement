import {
  TRADE_IN_APP_ENTRY_DEVICE,
  TRADE_IN_CREDIT_CENTS,
  TRADE_IN_PROMO_VALID_UNTIL_ISO,
} from '@/features/tradeIn/tradeInConstants';

const STORAGE_KEY = 'tt_trade_in_demo_v1';

export type TradeInDemoSource = 'app' | 'order' | 'promo';

export type TradeInDemoState = {
  v: 1;
  source: TradeInDemoSource;
  oldDeviceName: string;
  /** e.g. "Gray / AT&T's Network" */
  oldDeviceSubtitle: string;
  imei: string;
  creditCents: number;
  promoValidUntilIso: string;
  careStatusLabel: string;
  newProductId: string | null;
  appliedToCart: boolean;
  /** Order detail trade-in seed (attach pending after signup) */
  sourceOrderId?: string | null;
  /** Purchase quantity when trade-in was applied (demo cap) */
  purchaseQty?: number;
  /** Devices covered by trade-in offers (demo); usually 1 */
  tradeInSlotCount?: number;
};

export function defaultTradeInDemoState(partial?: Partial<TradeInDemoState>): TradeInDemoState {
  return {
    v: 1,
    source: 'app',
    oldDeviceName: 'TickTalk Watch',
    oldDeviceSubtitle: '',
    imei: '',
    creditCents: TRADE_IN_CREDIT_CENTS,
    promoValidUntilIso: TRADE_IN_PROMO_VALID_UNTIL_ISO,
    careStatusLabel: 'Not enrolled',
    newProductId: null,
    appliedToCart: false,
    sourceOrderId: null,
    purchaseQty: 1,
    tradeInSlotCount: 0,
    ...partial,
  };
}

export function loadTradeInDemo(): TradeInDemoState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as TradeInDemoState;
    if (p?.v !== 1) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveTradeInDemo(state: TradeInDemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function patchTradeInDemo(patch: Partial<TradeInDemoState>) {
  const prev = loadTradeInDemo() ?? defaultTradeInDemoState();
  saveTradeInDemo({ ...prev, ...patch, v: 1 });
}

export function clearTradeInDemo() {
  localStorage.removeItem(STORAGE_KEY);
}

export function seedTradeInFromAppEntry(source: TradeInDemoSource = 'app') {
  const d = TRADE_IN_APP_ENTRY_DEVICE;
  saveTradeInDemo(
    defaultTradeInDemoState({
      source,
      oldDeviceName: d.deviceName,
      oldDeviceSubtitle: `${d.colorLabel} / ${d.carrierLabel}`,
      imei: d.imei,
      creditCents: TRADE_IN_CREDIT_CENTS,
      promoValidUntilIso: TRADE_IN_PROMO_VALID_UNTIL_ISO,
      careStatusLabel: 'TickTalk Care+ expired',
      newProductId: null,
      appliedToCart: false,
    }),
  );
}

export function seedTradeInFromOrderLine(params: {
  productName: string;
  colorLabel?: string;
  imei: string;
  careStatusLabel: string;
  orderId?: string;
}) {
  const sub = [params.colorLabel ?? '', "AT&T's Network"].filter(Boolean).join(' / ');
  saveTradeInDemo(
    defaultTradeInDemoState({
      source: 'order',
      oldDeviceName: params.productName,
      oldDeviceSubtitle: sub,
      imei: params.imei,
      careStatusLabel: params.careStatusLabel,
      creditCents: TRADE_IN_CREDIT_CENTS,
      promoValidUntilIso: TRADE_IN_PROMO_VALID_UNTIL_ISO,
      newProductId: null,
      appliedToCart: false,
      sourceOrderId: params.orderId ?? null,
      purchaseQty: 1,
      tradeInSlotCount: 0,
    }),
  );
}
