import type { ClipboardEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orders } from '@/mock-data';
import {
  type ChannelId,
  ORDER_LOOKUP_BY_ID,
  ORDER_LOOKUP_CHANNELS,
  composeExternalOrderRef,
  emptySegmentsForChannel,
  parsePastedOrderRef,
  sanitizeSegment,
  segmentsComplete,
} from '@/pages/service/orderLookupFormat';
import { cn } from '@/utils/cn';

type Phase = 'channel' | 'details';

function segmentInputMode(kind: 'digits' | 'letters' | 'alphanumeric'): 'numeric' | 'text' {
  return kind === 'digits' ? 'numeric' : 'text';
}

function HelpBubble({
  open,
  title,
  body,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close help"
        className="absolute inset-0 bg-slate-900/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-lookup-help-title"
        className="relative z-10 m-0 w-full max-w-[22rem] rounded-t-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:m-4 sm:rounded-2xl sm:pb-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="order-lookup-help-title" className="text-sm font-medium leading-snug text-slate-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{body}</p>
      </div>
    </div>
  );
}

export function OrderLookupPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('channel');
  const [channelId, setChannelId] = useState<ChannelId>('myticktalk');
  const [segments, setSegments] = useState<string[]>(() => emptySegmentsForChannel('myticktalk'));
  const [postal, setPostal] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [helpOpen, setHelpOpen] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const format = ORDER_LOOKUP_BY_ID[channelId];

  const setSegment = useCallback(
    (index: number, value: string) => {
      const fmt = ORDER_LOOKUP_BY_ID[channelId];
      const def = fmt.segments[index];
      if (!def) return;
      const next = sanitizeSegment(value, def);
      setSegments((prev) => {
        const copy = [...prev];
        copy[index] = next;
        while (copy.length < fmt.segments.length) copy.push('');
        return copy;
      });
      if (next.length === def.maxLength && index < fmt.segments.length - 1) {
        queueMicrotask(() => inputRefs.current[index + 1]?.focus());
      }
    },
    [channelId],
  );

  const goToDetails = () => {
    setSegments(emptySegmentsForChannel(channelId));
    setPostal('');
    setError(undefined);
    setPhase('details');
    queueMicrotask(() => inputRefs.current[0]?.focus());
  };

  const backToChannel = () => {
    setPhase('channel');
    setSegments(emptySegmentsForChannel(channelId));
    setPostal('');
    setError(undefined);
    setHelpOpen(false);
  };

  const onSegmentKeyDown = (index: number, e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    if (segments[index]) return;
    if (index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onPasteCapture = (e: ClipboardEvent) => {
    if (phase !== 'details') return;
    const text = e.clipboardData.getData('text');
    const parsed = parsePastedOrderRef(channelId, text);
    if (!parsed) return;
    e.preventDefault();
    setSegments(parsed);
    const fmt = ORDER_LOOKUP_BY_ID[channelId];
    const firstShort = parsed.findIndex((p, i) => p.length < (fmt.segments[i]?.maxLength ?? 0));
    const focusIdx = firstShort === -1 ? parsed.length - 1 : firstShort;
    queueMicrotask(() => inputRefs.current[focusIdx]?.focus());
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phase === 'channel') return;

    const trimmedRef = composeExternalOrderRef(channelId, segments);
    const trimmedPostal = postal.trim();
    const match = orders.find(
      (o) =>
        o.channel === channelId &&
        o.externalOrderRef === trimmedRef &&
        o.shippingPostal === trimmedPostal,
    );

    if (!match) {
      setError('Check your order number and shipping ZIP or postal code and try again.');
      return;
    }

    setError(undefined);
    navigate(`/service/order/${match.id}`);
  };

  const orderComplete = segmentsComplete(channelId, segments);
  const canSubmit = phase === 'details' && orderComplete && postal.trim().length > 0;

  return (
    <div className="mx-auto min-h-[65vh] w-full max-w-[24rem] px-4 pb-16 pt-6 text-slate-800 sm:pt-10">
      {phase === 'channel' ? (
        <>
          <button
            type="button"
            onClick={() => navigate('/service')}
            className="mb-8 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            ← Back
          </button>

          <h1 className="text-center text-[17px] font-medium leading-snug tracking-tight text-slate-900">
            Where did you purchase?
          </h1>
          <p className="mx-auto mt-2 max-w-[20rem] text-center text-xs leading-relaxed text-slate-500">
            Choose your store. Next you’ll enter your order number the same way it appears on your receipt or email.
          </p>

          <ul className="mx-auto mt-10 max-w-[20rem] space-y-2" role="radiogroup" aria-label="Purchase channel">
            {ORDER_LOOKUP_CHANNELS.map((ch) => {
              const selected = channelId === ch.id;
              return (
                <li key={ch.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setChannelId(ch.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-colors',
                      selected
                        ? 'border-slate-800/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.06)]'
                        : 'border-slate-200/90 bg-white hover:border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border-2',
                        selected ? 'border-slate-800' : 'border-slate-300',
                      )}
                      aria-hidden
                    >
                      {selected ? <span className="h-2 w-2 rounded-full bg-slate-800 leading-none" /> : null}
                    </span>
                    <span className="text-sm font-normal text-slate-800">{ch.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mx-auto mt-12 flex justify-center">
            <button
              type="button"
              onClick={goToDetails}
              className="min-h-11 rounded-full bg-slate-900 px-10 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <button
            type="button"
            onClick={backToChannel}
            className="mb-6 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            ← Change store
          </button>

          <p className="text-center text-xs text-slate-500">{format.label}</p>

          <fieldset className="mt-12 border-0 p-0">
            <legend className="mx-auto mb-10 flex w-full max-w-[20rem] items-center justify-center gap-2 px-1 text-center">
              <span className="text-xs font-normal text-slate-500">Enter order number</span>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-medium text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.04)] hover:border-slate-300 hover:text-slate-700"
                aria-label="Where do I find my order number?"
              >
                ?
              </button>
            </legend>

            <div
              className="mx-auto flex max-w-[20rem] flex-wrap items-center justify-center gap-x-1 gap-y-3 py-6 sm:gap-x-1.5 sm:py-8"
              onPasteCapture={onPasteCapture}
            >
              {format.segments.map((def, i) => (
                <Fragment key={i}>
                  {i > 0 ? (
                    <span
                      className="mx-0.5 select-none text-lg font-light text-slate-300 sm:text-xl"
                      aria-hidden
                    >
                      {format.join === 'dashes' ? '–' : '·'}
                    </span>
                  ) : null}
                  <div
                    className={cn(
                      'flex min-h-[2.75rem] min-w-0 flex-1 items-center justify-center rounded-xl border px-2 transition-[border-color,box-shadow]',
                      'border-slate-200/95 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]',
                      'focus-within:border-slate-400 focus-within:shadow-[0_0_0_1px_rgba(71,85,105,0.2)]',
                      def.maxLength >= 10 ? 'basis-[62%] sm:basis-auto' : 'basis-[26%] sm:basis-auto',
                    )}
                    style={{ minWidth: `${Math.max(2.75, def.maxLength * 0.58 + 1.5)}rem` }}
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode={segmentInputMode(def.kind)}
                      autoComplete="off"
                      autoCapitalize={def.kind === 'digits' ? 'off' : 'characters'}
                      spellCheck={false}
                      aria-label={`Order number part ${i + 1} of ${format.segments.length}`}
                      maxLength={def.maxLength}
                      className={cn(
                        'w-full min-w-0 border-0 bg-transparent text-center font-mono text-[0.9375rem] tabular-nums tracking-wide text-slate-900 outline-none',
                        'placeholder:text-slate-300',
                      )}
                      value={segments[i] ?? ''}
                      onChange={(e) => setSegment(i, e.target.value)}
                      onKeyDown={(e) => onSegmentKeyDown(i, e)}
                    />
                  </div>
                </Fragment>
              ))}
            </div>

            <p className="mx-auto mt-6 max-w-[19rem] text-center text-[11px] leading-relaxed text-slate-400">
              Example format: <span className="font-mono text-slate-500">{format.exampleDisplay}</span>
            </p>
          </fieldset>

          <div className="mx-auto mt-14 max-w-[20rem] border-t border-slate-100 pt-10">
            <label htmlFor="lookup-postal" className="block text-center text-[11px] font-normal text-slate-400">
              Shipping ZIP or postal code
            </label>
            <input
              id="lookup-postal"
              className="mx-auto mt-2 block min-h-11 w-full rounded-full border border-slate-200/90 bg-slate-50/50 px-4 text-center text-sm font-normal text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              autoComplete="postal-code"
            />
          </div>

          {error ? (
            <p className="mx-auto mt-4 max-w-[20rem] text-center text-xs leading-snug text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mx-auto mt-10 flex justify-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'min-h-11 min-w-[11rem] rounded-full px-12 text-sm font-medium transition-colors',
                canSubmit
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400',
              )}
            >
              Next
            </button>
          </div>
        </form>
      )}

      <HelpBubble
        open={helpOpen}
        title={format.helpTitle}
        body={format.helpBody}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
}
