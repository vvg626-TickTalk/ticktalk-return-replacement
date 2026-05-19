import type { ClipboardEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orders } from '@/mock-data';
import {
  type ChannelId,
  ORDER_LOOKUP_BY_ID,
  ORDER_LOOKUP_CHANNELS,
  composeExternalOrderRef,
  emptyPartsForChannel,
  orderEntryComplete,
  parsePastedOrderRef,
  sanitizeFlexNumeric,
  sanitizeSegment,
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
        className="absolute inset-0 bg-brand-ink/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-lookup-help-title"
        className="relative z-10 m-0 w-full max-w-md rounded-t-3xl border border-slate-200/90 bg-white px-6 py-5 shadow-2xl shadow-brand-ink/10 sm:m-4 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="order-lookup-help-title" className="text-base font-semibold leading-snug text-support-navy">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl leading-none text-slate-400 transition hover:bg-support-tint hover:text-support-navy"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{body}</p>
      </div>
    </div>
  );
}

const cardShell =
  'w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white px-6 py-8 shadow-xl shadow-slate-900/8 sm:px-10';

const ctaBase =
  'inline-flex min-h-12 w-full items-center justify-center rounded-full px-8 text-sm font-semibold transition sm:w-auto';

export function OrderLookupPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('channel');
  const [channelId, setChannelId] = useState<ChannelId>('myticktalk');
  const [parts, setParts] = useState<string[]>(() => emptyPartsForChannel('myticktalk'));
  const [postal, setPostal] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [helpOpen, setHelpOpen] = useState(false);

  const segmentInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const flexInputRef = useRef<HTMLInputElement | null>(null);
  const format = ORDER_LOOKUP_BY_ID[channelId];

  const focusFirstEntry = useCallback(() => {
    queueMicrotask(() => {
      if (format.flexNumeric) {
        flexInputRef.current?.focus();
        return;
      }
      segmentInputRefs.current[0]?.focus();
    });
  }, [format.flexNumeric]);

  const setPart = useCallback(
    (index: number, value: string) => {
      const fmt = ORDER_LOOKUP_BY_ID[channelId];
      if (fmt.flexNumeric) {
        const next = sanitizeFlexNumeric(value, fmt.flexNumeric);
        setParts(() => [next]);
        return;
      }
      const segments = fmt.segments;
      if (!segments?.[index]) return;
      const next = sanitizeSegment(value, segments[index]);
      setParts((prev) => {
        const copy = [...prev];
        copy[index] = next;
        while (copy.length < segments.length) copy.push('');
        return copy;
      });
      if (next.length === segments[index].maxLength && index < segments.length - 1) {
        queueMicrotask(() => segmentInputRefs.current[index + 1]?.focus());
      }
    },
    [channelId],
  );

  const goToDetails = () => {
    setParts(emptyPartsForChannel(channelId));
    setPostal('');
    setError(undefined);
    setPhase('details');
    focusFirstEntry();
  };

  const backToChannel = () => {
    setPhase('channel');
    setParts(emptyPartsForChannel(channelId));
    setPostal('');
    setError(undefined);
    setHelpOpen(false);
  };

  const onSegmentKeyDown = (index: number, e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    if (parts[index]) return;
    if (index > 0) {
      e.preventDefault();
      segmentInputRefs.current[index - 1]?.focus();
    }
  };

  const onPasteCapture = (e: ClipboardEvent) => {
    if (phase !== 'details') return;
    const text = e.clipboardData.getData('text');
    const parsed = parsePastedOrderRef(channelId, text);
    if (!parsed) return;
    e.preventDefault();
    setParts(parsed);
    const fmt = ORDER_LOOKUP_BY_ID[channelId];
    if (fmt.flexNumeric) {
      queueMicrotask(() => flexInputRef.current?.focus());
      return;
    }
    const segments = fmt.segments ?? [];
    const firstShort = parsed.findIndex((p, i) => p.length < (segments[i]?.maxLength ?? 0));
    const focusIdx = firstShort === -1 ? parsed.length - 1 : firstShort;
    queueMicrotask(() => segmentInputRefs.current[focusIdx]?.focus());
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phase === 'channel') return;

    const trimmedRef = composeExternalOrderRef(channelId, parts);
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

  const orderComplete = orderEntryComplete(channelId, parts);
  const canSubmit = phase === 'details' && orderComplete && postal.trim().length > 0;

  const isFlex = Boolean(format.flexNumeric);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-mist">
      <div className="mx-auto flex min-h-[inherit] w-full max-w-lg flex-col items-center justify-center px-4 py-10 sm:py-14">
        {phase === 'channel' ? (
          <div className={cardShell}>
            <button
              type="button"
              onClick={() => navigate('/service')}
              className="mb-6 text-sm font-medium text-slate-500 transition hover:text-support-navy"
            >
              ← Back
            </button>

            <h1 className="text-center text-xl font-semibold tracking-tight text-brand-ink sm:text-[1.375rem]">
              Where did you purchase?
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-center text-[15px] leading-relaxed text-slate-600">
              Choose your store. You’ll enter your order number on the next step.
            </p>

            <ul className="mt-8 space-y-3" role="radiogroup" aria-label="Purchase channel">
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
                        'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition',
                        selected
                          ? 'border-support-navy/30 bg-support-tint/60 ring-2 ring-support-navy/20'
                          : 'border-slate-200/90 bg-white hover:border-slate-300',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                          selected ? 'border-support-navy bg-support-navy' : 'border-slate-300 bg-white',
                        )}
                        aria-hidden
                      >
                        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                      </span>
                      <span className={cn('text-[15px] font-medium', selected ? 'text-brand-ink' : 'text-slate-800')}>
                        {ch.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={goToDetails}
                className={cn(ctaBase, 'bg-support-navy text-white shadow-md shadow-support-navy/15 hover:bg-support-navy-hover')}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <form className={cardShell} onSubmit={onSubmit}>
            <button
              type="button"
              onClick={backToChannel}
              className="mb-6 text-sm font-medium text-slate-500 transition hover:text-support-navy"
            >
              ← Change store
            </button>

            <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{format.label}</p>
            <h2 className="mt-2 text-center text-xl font-semibold text-brand-ink">Find your order</h2>

            <fieldset className="mt-8 border-0 p-0">
              <legend className="mx-auto mb-6 flex w-full items-center justify-center gap-2 text-center">
                <span className="text-sm font-medium text-slate-700">Order number</span>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-support-navy shadow-sm hover:bg-support-tint"
                  aria-label="Where do I find my order number?"
                >
                  ?
                </button>
              </legend>

              <div onPasteCapture={onPasteCapture}>
                {isFlex && format.flexNumeric ? (
                  <div className="rounded-2xl border border-slate-200/95 bg-slate-50/40 px-4 py-3 ring-1 ring-slate-100 focus-within:border-support-navy/35 focus-within:bg-white focus-within:ring-support-navy/15">
                    <input
                      ref={flexInputRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label="myticktalk.com order number, 5 to 7 digits"
                      maxLength={format.flexNumeric.maxDigits}
                      placeholder="Enter 5–7 digits"
                      className="w-full border-0 bg-transparent text-center text-2xl font-semibold tabular-nums tracking-wider text-brand-ink outline-none placeholder:text-slate-400 placeholder:text-lg sm:text-[1.75rem]"
                      value={parts[0] ?? ''}
                      onChange={(e) => setPart(0, e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3 py-2 sm:gap-x-1.5">
                    {(format.segments ?? []).map((def, i) => (
                      <Fragment key={i}>
                        {i > 0 ? (
                          <span className="mx-0.5 select-none text-xl font-light text-slate-300" aria-hidden>
                            {format.join === 'dashes' ? '–' : '·'}
                          </span>
                        ) : null}
                        <div
                          className={cn(
                            'flex min-h-[3rem] min-w-0 flex-1 items-center justify-center rounded-xl border px-2 transition',
                            'border-slate-200/95 bg-white shadow-sm focus-within:border-support-navy/40 focus-within:ring-2 focus-within:ring-support-navy/15',
                            def.maxLength >= 10 ? 'basis-[62%] sm:basis-auto' : 'basis-[26%] sm:basis-auto',
                          )}
                          style={{ minWidth: `${Math.max(2.75, def.maxLength * 0.58 + 1.5)}rem` }}
                        >
                          <input
                            ref={(el) => {
                              segmentInputRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode={segmentInputMode(def.kind)}
                            autoComplete="off"
                            autoCapitalize={def.kind === 'digits' ? 'off' : 'characters'}
                            spellCheck={false}
                            aria-label={`Order number part ${i + 1} of ${format.segments?.length ?? 0}`}
                            maxLength={def.maxLength}
                            className="w-full min-w-0 border-0 bg-transparent text-center font-mono text-base tabular-nums tracking-wide text-brand-ink outline-none placeholder:text-slate-300"
                            value={parts[i] ?? ''}
                            onChange={(e) => setPart(i, e.target.value)}
                            onKeyDown={(e) => onSegmentKeyDown(i, e)}
                          />
                        </div>
                      </Fragment>
                    ))}
                  </div>
                )}
              </div>

              <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-relaxed text-slate-500">
                Example: <span className="font-medium text-slate-700">{format.exampleDisplay}</span>
              </p>
            </fieldset>

            <div className="mt-10 border-t border-slate-100 pt-8">
              <label htmlFor="lookup-postal" className="block text-center text-sm font-medium text-slate-600">
                Shipping ZIP or postal code
              </label>
              <input
                id="lookup-postal"
                className="mt-3 block min-h-12 w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 text-center text-[15px] text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-support-navy/35 focus:bg-white focus:ring-2 focus:ring-support-navy/10"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                autoComplete="postal-code"
                placeholder="e.g. 92118"
              />
            </div>

            {error ? (
              <p className="mt-4 text-center text-sm leading-snug text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  ctaBase,
                  canSubmit
                    ? 'bg-support-navy text-white shadow-md shadow-support-navy/15 hover:bg-support-navy-hover'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500',
                )}
              >
                Next
              </button>
            </div>
          </form>
        )}

        <HelpBubble open={helpOpen} title={format.helpTitle} body={format.helpBody} onClose={() => setHelpOpen(false)} />
      </div>
    </div>
  );
}
