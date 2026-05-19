import type { ClipboardEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orders } from '@/mock-data';
import {
  type CellGroupSpec,
  type ChannelId,
  HELP_PANEL_TITLE,
  ORDER_LOOKUP_BY_ID,
  ORDER_LOOKUP_CHANNELS,
  composeExternalOrderRef,
  distributePastedOrderToCells,
  emptyCellsForChannel,
  orderEntryComplete,
  sanitizeCellChar,
  totalCellCount,
} from '@/pages/service/orderLookupFormat';
import {
  supportButtonPrimary,
  supportField,
  supportOrderLookupDigitCell,
  supportPanel,
  supportPageTitle,
} from '@/ui/supportTheme';
import { cn } from '@/utils/cn';
import { ORDER_LOOKUP_DEMO_HINT } from '@/features/orderLookup/orderLookupDemoHints';
import { OrderLookupChannelLogo } from '@/features/orderLookup/OrderLookupChannelLogo';

function cellInputMode(kind: 'digits' | 'letters' | 'alphanumeric'): 'numeric' | 'text' {
  return kind === 'digits' ? 'numeric' : 'text';
}

function Separator({ type }: { type: 'dash' | 'dot' }) {
  if (type === 'dot') {
    return (
      <span className="mx-1 flex h-10 shrink-0 items-center text-lg font-semibold leading-none text-slate-400" aria-hidden>
        ·
      </span>
    );
  }
  return (
    <span className="mx-1 flex h-10 shrink-0 items-center text-lg font-light text-slate-400" aria-hidden>
      –
    </span>
  );
}

export function OrderLookupPage() {
  const navigate = useNavigate();
  const [channelId, setChannelId] = useState<ChannelId>('myticktalk');
  const [cells, setCells] = useState<string[]>(() => emptyCellsForChannel('myticktalk'));
  const [postal, setPostal] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [helpOpen, setHelpOpen] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const format = ORDER_LOOKUP_BY_ID[channelId];
  const total = totalCellCount(format);

  const kindAtIndex = useCallback(
    (index: number) => {
      let o = 0;
      for (const g of format.cellGroups) {
        if (index < o + g.boxCount) return g.kind;
        o += g.boxCount;
      }
      return format.cellGroups[0]!.kind;
    },
    [format],
  );

  const setCellValue = useCallback(
    (index: number, raw: string) => {
      const kind = kindAtIndex(index);
      const next = sanitizeCellChar(raw, kind);
      setCells((prev) => {
        const copy = [...prev];
        copy[index] = next;
        return copy;
      });
      if (next && index < total - 1) {
        queueMicrotask(() => inputRefs.current[index + 1]?.focus());
      }
    },
    [kindAtIndex, total],
  );

  const onChannelChange = (id: ChannelId) => {
    setChannelId(id);
    setCells(emptyCellsForChannel(id));
    setError(undefined);
    queueMicrotask(() => inputRefs.current[0]?.focus());
  };

  const onCellKeyDown = (index: number, e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    const cur = cells[index] ?? '';
    if (cur) return;
    if (index > 0) {
      e.preventDefault();
      setCells((prev) => {
        const copy = [...prev];
        copy[index - 1] = '';
        return copy;
      });
      queueMicrotask(() => inputRefs.current[index - 1]?.focus());
    }
  };

  const onPasteRow = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    const parsed = distributePastedOrderToCells(channelId, text);
    if (!parsed) return;
    e.preventDefault();
    setCells(parsed);
    const last = parsed.reduce((acc, c, i) => (c ? i : acc), -1);
    queueMicrotask(() => inputRefs.current[Math.min(last + 1, total - 1)]?.focus());
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedRef = composeExternalOrderRef(channelId, cells);
    const trimmedPostal = postal.trim();
    const match = orders.find(
      (o) => o.channel === channelId && o.externalOrderRef === trimmedRef && o.shippingPostal === trimmedPostal,
    );

    if (!match) {
      setError('Check your order number and shipping ZIP or postal code and try again.');
      return;
    }

    setError(undefined);
    navigate(`/service/order/${match.id}`);
  };

  const entryOk = orderEntryComplete(channelId, cells);
  const canSubmit = entryOk && postal.trim().length > 0;

  useEffect(() => {
    inputRefs.current.length = total;
  }, [total, channelId]);

  const renderGroup = (group: CellGroupSpec, groupIndex: number, startIdx: number) => {
    const cellsSlice = (
      <>
        {Array.from({ length: group.boxCount }, (_, j) => {
          const idx = startIdx + j;
          return (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode={cellInputMode(group.kind)}
              autoComplete="off"
              spellCheck={false}
              maxLength={1}
              aria-label={`Order character ${idx + 1} of ${total}`}
              className={supportOrderLookupDigitCell}
              value={cells[idx] ?? ''}
              onChange={(e) => setCellValue(idx, e.target.value)}
              onKeyDown={(e) => onCellKeyDown(idx, e)}
            />
          );
        })}
      </>
    );

    if (groupIndex === 0) return <Fragment key={`g-${groupIndex}`}>{cellsSlice}</Fragment>;

    const sep = format.betweenGroupSep === 'dot' ? 'dot' : 'dash';
    return (
      <Fragment key={`g-${groupIndex}`}>
        <Separator type={sep} />
        {cellsSlice}
      </Fragment>
    );
  };

  let runningIndex = 0;
  const boxRow = format.cellGroups.map((group, gi) => {
    const start = runningIndex;
    runningIndex += group.boxCount;
    return renderGroup(group, gi, start);
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-2">
          <Link to="/service" className="text-sm font-medium text-support-navy hover:underline">
            ← Back
          </Link>
        </div>

        <h1 className={cn(supportPageTitle, 'text-center')}>Start Your Request</h1>

        <div className="mt-8">
          <label htmlFor="order-lookup-channel" className="sr-only">
            Where did you purchase
          </label>
          <select
            id="order-lookup-channel"
            value={channelId}
            onChange={(e) => onChannelChange(e.target.value as ChannelId)}
            className={cn(supportField, 'h-12 cursor-pointer font-medium')}
          >
            {ORDER_LOOKUP_CHANNELS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={onSubmit} className="mt-8">
          <div className={cn(supportPanel, 'px-5 py-6 sm:px-8 sm:py-7')}>
            <OrderLookupChannelLogo channelId={channelId} label={format.label} />

            <div className="mt-2 flex items-center justify-center gap-1 sm:mt-3">
              <span className="text-sm font-semibold text-support-navy">Enter Order Number</span>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-support-navy hover:bg-support-tint"
                aria-label="Help: how to find your order number"
              >
                ?
              </button>
            </div>

            <fieldset className="mt-4 border-0 p-0">
              <legend className="sr-only">Order number entry</legend>
              <div
                className="flex flex-wrap items-center justify-center gap-y-2"
                onPaste={onPasteRow}
                role="presentation"
              >
                {boxRow}
              </div>
            </fieldset>

            <p className="mt-3 text-center text-xs text-slate-500">
              Example format: <span className="font-medium text-slate-700">{format.exampleDisplay}</span>
            </p>

            <div className="mt-8">
              <label htmlFor="lookup-postal" className="sr-only">
                Shipping ZIP or postal code
              </label>
              <input
                id="lookup-postal"
                type="text"
                autoComplete="postal-code"
                placeholder="Enter Shipping ZIP Code"
                className={cn(supportField, 'text-center')}
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
              />
              <p className="mt-2 whitespace-pre-line text-center text-[10px] leading-relaxed text-slate-500">
                {ORDER_LOOKUP_DEMO_HINT}
              </p>
            </div>

            {error ? (
              <p className="mt-4 text-center text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex justify-center">
              <button type="submit" disabled={!canSubmit} className={cn(supportButtonPrimary, 'px-14')}>
                Next
              </button>
            </div>
          </div>
        </form>

        {helpOpen ? (
          <div className="relative mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-500 hover:bg-white hover:text-support-navy"
              aria-label="Close help"
            >
              ×
            </button>
            <div className="flex gap-3 pr-8">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-support-tint text-sm font-bold text-support-navy"
                aria-hidden
              >
                i
              </span>
              <div>
                <h2 className="text-base font-semibold text-support-navy">{HELP_PANEL_TITLE}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{format.helpBody}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
