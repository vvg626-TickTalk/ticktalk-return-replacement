import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderLine } from '@/types/models';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { ProductCard } from '@/components/ProductCard';
import { Stepper } from '@/components/Stepper';
import {
  ADD_ITEMS_CTA,
  ADD_ITEMS_MODAL_TITLE,
  NO_ADDITIONAL_ELIGIBLE_ITEMS,
  RETURN_ADD_ITEMS_EMPTY_HELPER,
  RETURN_ADD_ITEMS_MODAL_DESCRIPTION,
  AddItemsToolbarSlot,
} from '@/features/serviceFlowItemControls';
import { WizardStickyActions } from '@/features/replacement/WizardStickyActions';
import {
  isPlausibleImei,
  lineRequiresImei,
  normalizeImei,
} from '@/features/replacement/eligibility';
import {
  formatDomesticPhoneInput,
  formatIntlContactInput,
  stripPhoneToDigits,
} from '@/features/replacement/phoneFormat';
import { DEMO_RETURN_SHIPPING_FEE_CENTS } from '@/features/return/returnConstants';
import {
  expandPrimarySelection,
  getBundledGiftLines,
  getReturnEligibility,
  primaryIdsAfterRemoval,
} from '@/features/return/returnEligibility';
import {
  allReturnReasonsComplete,
  emptyReturnReasonForm,
  RETURN_REASONS,
  type PerLineReturnReason,
  type ReturnReasonId,
} from '@/features/return/returnReasons';
import { getCustomerById, getOrderLinesForOrder, getProductById } from '@/mock-data';
import { fieldControl, fieldControlMono, fieldTextarea } from '@/ui/formControls';
import { supportPanel, supportSectionHead, supportToolbarBtn } from '@/ui/supportPortalLayout';
import { cn } from '@/utils/cn';

type WizardStep = 'items' | 'reasons' | 'contact' | 'preview' | 'confirmation';

type ContactForm = {
  name: string;
  email: string;
  phoneDisplay: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

type AddressMode = 'domestic' | 'international';

function labelForLine(line: OrderLine): string {
  const p = getProductById(line.productId);
  const base = p?.name ?? line.productId;
  if (line.isGift) return `${base} (gift)`;
  return base;
}

function generateMockRma(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `TT-${n}`;
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function emptyContact(): ContactForm {
  return {
    name: '',
    email: '',
    phoneDisplay: '',
    address1: '',
    address2: '',
    city: '',
    region: '',
    postal: '',
    country: 'US',
  };
}

export function ReturnFlowWizard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const lines = getOrderLinesForOrder(order.id);
  const customer = order.customerId ? getCustomerById(order.customerId) : undefined;

  const [step, setStep] = useState<WizardStep>('items');
  const [primaryIds, setPrimaryIds] = useState<string[]>([]);
  const [reasonByLineId, setReasonByLineId] = useState<Record<string, PerLineReturnReason>>({});
  const [addressMode, setAddressMode] = useState<AddressMode>('domestic');
  const [contact, setContact] = useState<ContactForm>(() => {
    const base = emptyContact();
    if (!customer) return base;
    base.name = customer.name;
    base.email = customer.email ?? '';
    if (customer.phoneE164) {
      const d = customer.phoneE164.replace(/\D/g, '');
      const us = d.length === 11 && d.startsWith('1') ? d.slice(1) : d.length === 10 ? d : d;
      base.phoneDisplay = us.length === 10 ? formatDomesticPhoneInput(us) : customer.phoneE164;
    }
    return base;
  });

  const [rmaCode, setRmaCode] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [removePrimaryId, setRemovePrimaryId] = useState<string | null>(null);
  const [previewRemovePrimaryId, setPreviewRemovePrimaryId] = useState<string | null>(null);

  const [imeiByLineId, setImeiByLineId] = useState<Record<string, string>>({});

  const expandedLineIds = useMemo(() => expandPrimarySelection(primaryIds, lines), [lines, primaryIds]);

  useEffect(() => {
    const ids = expandPrimarySelection(primaryIds, lines);
    setImeiByLineId((prev) => {
      const next = { ...prev };
      for (const lid of ids) {
        const line = lines.find((l) => l.id === lid);
        const p = line ? getProductById(line.productId) : undefined;
        if (!line || !lineRequiresImei(p)) continue;
        if (next[lid] === undefined) {
          next[lid] = normalizeImei(line.imei ?? '');
        }
      }
      for (const k of Object.keys(next)) {
        if (!ids.includes(k)) delete next[k];
      }
      return next;
    });
  }, [lines, primaryIds]);

  const remainingAddablePrimaries = useMemo(() => {
    const selected = new Set(primaryIds);
    return lines.filter((l) => {
      if (selected.has(l.id)) return false;
      const p = getProductById(l.productId);
      return getReturnEligibility(l, p, order).selectable;
    });
  }, [lines, order, primaryIds]);

  const addItemsDisabled = remainingAddablePrimaries.length === 0;

  const canLeaveItems = useMemo(() => {
    if (primaryIds.length === 0) return false;
    for (const lid of expandedLineIds) {
      const line = lines.find((l) => l.id === lid);
      const p = line ? getProductById(line.productId) : undefined;
      if (!lineRequiresImei(p)) continue;
      const raw = imeiByLineId[lid] ?? '';
      if (!isPlausibleImei(raw)) return false;
    }
    return true;
  }, [expandedLineIds, imeiByLineId, lines, primaryIds.length]);

  const canLeaveReasons = useMemo(
    () => allReturnReasonsComplete(expandedLineIds, reasonByLineId),
    [expandedLineIds, reasonByLineId],
  );

  const phoneOk = useMemo(() => {
    const d = stripPhoneToDigits(contact.phoneDisplay);
    if (addressMode === 'domestic') return d.length >= 10;
    return d.length >= 8;
  }, [addressMode, contact.phoneDisplay]);

  const canLeaveContact = useMemo(() => {
    const base =
      contact.name.trim().length > 1 &&
      contact.email.includes('@') &&
      phoneOk &&
      contact.address1.trim().length > 2 &&
      contact.city.trim().length > 1 &&
      contact.postal.trim().length > 2;

    if (!base) return false;
    if (addressMode === 'international') return contact.country.trim().length > 1;
    return contact.region.trim().length > 1;
  }, [addressMode, contact, phoneOk]);

  const refundPreview = useMemo(() => {
    const subtotalCents = expandedLineIds.reduce((sum, id) => {
      const l = lines.find((x) => x.id === id);
      return sum + (l?.demoLineTotalCents ?? 0);
    }, 0);
    const fee = DEMO_RETURN_SHIPPING_FEE_CENTS;
    const afterFee = Math.max(0, subtotalCents - fee);
    return { subtotalCents, fee, afterFee };
  }, [expandedLineIds, lines]);

  const bundleRequiresGiftReturn = useMemo(() => {
    return primaryIds.some((pid) => {
      const line = lines.find((l) => l.id === pid);
      return line && getBundledGiftLines(lines, line).length > 0;
    });
  }, [lines, primaryIds]);

  const stepIndex =
    step === 'items' ? 0 : step === 'reasons' ? 1 : step === 'contact' ? 2 : step === 'preview' ? 3 : 3;

  const patchContact = (partial: Partial<ContactForm>) => setContact((c) => ({ ...c, ...partial }));

  const onPhoneChange = (raw: string) => {
    if (addressMode === 'domestic') {
      patchContact({ phoneDisplay: formatDomesticPhoneInput(raw) });
      return;
    }
    patchContact({ phoneDisplay: formatIntlContactInput(raw) });
  };

  const startAdd = () => setAddOpen(true);

  const addPrimary = (lineId: string) => {
    setPrimaryIds((prev) => (prev.includes(lineId) ? prev : [...prev, lineId]));
    setAddOpen(false);
  };

  const confirmRemovePrimary = (id: string) => {
    setRemovePrimaryId(null);
    setPreviewRemovePrimaryId(null);
    setPrimaryIds((prev) => {
      const next = primaryIdsAfterRemoval(prev, id, lines);
      if (next.length === 0) {
        window.setTimeout(() => navigate(`/service/order/${order.id}`), 0);
      }
      return next;
    });
  };

  const submitReturn = () => {
    setRmaCode(generateMockRma());
    setStep('confirmation');
  };

  const patchReason = (lineId: string, partial: Partial<PerLineReturnReason>) => {
    setReasonByLineId((prev) => ({
      ...prev,
      [lineId]: { ...(prev[lineId] ?? emptyReturnReasonForm()), ...partial },
    }));
  };

  const setReasonId = (lineId: string, id: ReturnReasonId | '') => {
    setReasonByLineId((prev) => ({
      ...prev,
      [lineId]: {
        reasonId: id,
        otherNote: id === 'other' ? (prev[lineId]?.otherNote ?? '') : '',
      },
    }));
  };

  const contactFields = (
    <>
      <div className="mt-5 flex gap-2 rounded-2xl bg-slate-100/80 p-1">
        <button
          type="button"
          className={cn(
            'min-h-12 flex-1 rounded-xl px-3 text-sm font-semibold transition',
            addressMode === 'domestic'
              ? 'bg-white text-brand-ink shadow-sm ring-1 ring-slate-200/90'
              : 'text-slate-700 hover:text-slate-900',
          )}
          onClick={() => {
            setAddressMode('domestic');
            patchContact({ country: 'US' });
          }}
        >
          US
        </button>
        <button
          type="button"
          className={cn(
            'min-h-12 flex-1 rounded-xl px-3 text-sm font-semibold transition',
            addressMode === 'international'
              ? 'bg-white text-brand-ink shadow-sm ring-1 ring-slate-200/90'
              : 'text-slate-700 hover:text-slate-900',
          )}
          onClick={() => setAddressMode('international')}
        >
          International
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FormField id="ret-c-name" label="Full name">
          <input
            id="ret-c-name"
            className={fieldControl}
            value={contact.name}
            onChange={(e) => patchContact({ name: e.target.value })}
            autoComplete="name"
          />
        </FormField>
        <FormField id="ret-c-email" label="Email">
          <input
            id="ret-c-email"
            className={fieldControl}
            inputMode="email"
            autoCapitalize="off"
            value={contact.email}
            onChange={(e) => patchContact({ email: e.target.value })}
            autoComplete="email"
          />
        </FormField>
        <FormField
          id="ret-c-phone"
          label="Phone"
          hint={addressMode === 'domestic' ? 'Formats as you type (display only).' : 'Include country code.'}
        >
          <input
            id="ret-c-phone"
            className={fieldControl}
            value={contact.phoneDisplay}
            onChange={(e) => onPhoneChange(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
        </FormField>
        {addressMode === 'international' ? (
          <FormField id="ret-c-country" label="Country / region">
            <input
              id="ret-c-country"
              className={fieldControl}
              value={contact.country}
              onChange={(e) => patchContact({ country: e.target.value })}
              autoComplete="country-name"
            />
          </FormField>
        ) : null}
        <FormField id="ret-c-a1" label="Street address" className="sm:col-span-2">
          <input
            id="ret-c-a1"
            className={fieldControl}
            value={contact.address1}
            onChange={(e) => patchContact({ address1: e.target.value })}
            autoComplete="address-line1"
          />
        </FormField>
        <FormField id="ret-c-a2" label="Apt / suite (optional)" className="sm:col-span-2">
          <input
            id="ret-c-a2"
            className={fieldControl}
            value={contact.address2}
            onChange={(e) => patchContact({ address2: e.target.value })}
            autoComplete="address-line2"
          />
        </FormField>
        <FormField id="ret-c-city" label="City">
          <input
            id="ret-c-city"
            className={fieldControl}
            value={contact.city}
            onChange={(e) => patchContact({ city: e.target.value })}
            autoComplete="address-level2"
          />
        </FormField>
        <FormField id="ret-c-region" label={addressMode === 'domestic' ? 'State' : 'State / province'}>
          <input
            id="ret-c-region"
            className={fieldControl}
            value={contact.region}
            onChange={(e) => patchContact({ region: e.target.value })}
            autoComplete="address-level1"
          />
        </FormField>
        <FormField id="ret-c-postal" label={addressMode === 'domestic' ? 'ZIP' : 'Postal code'}>
          <input
            id="ret-c-postal"
            className={fieldControl}
            value={contact.postal}
            onChange={(e) => patchContact({ postal: e.target.value })}
            autoComplete="postal-code"
          />
        </FormField>
      </div>
    </>
  );

  return (
    <div className={cn('space-y-5', step !== 'confirmation' && 'pb-[5.5rem] sm:pb-6')}>
      <PageHeader
        eyebrow="Return"
        title="Return request"
        description="Preview build—refund math is illustrative. We’ll email instructions after review."
        actions={
          <Button variant="secondary" onClick={() => navigate(`/service/order/${order.id}`)}>
            Exit
          </Button>
        }
      />

      {step !== 'confirmation' ? (
        <Stepper
          activeIndex={stepIndex}
          steps={[
            { id: 'items', label: 'Items', complete: stepIndex > 0 },
            { id: 'reasons', label: 'Reason', complete: stepIndex > 1 },
            { id: 'contact', label: 'Ship to', complete: stepIndex > 2 },
            { id: 'preview', label: 'Review', complete: false },
          ]}
        />
      ) : null}

      {step === 'items' ? (
        <Card>
          <div className="space-y-1">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">Your order</p>
            <p className="text-base font-semibold text-brand-ink">What are you returning?</p>
            <p className="text-sm leading-snug text-slate-600">
              Add a qualifying item. Watches need a <span className="font-medium text-slate-800">15-digit IMEI</span>. If
              it came with a free gift, we’ll include that gift automatically—you’ll ship them together.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100/90">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">On this order</p>
            <ul className="mt-2 space-y-2">
              {lines.map((line) => {
                const p = getProductById(line.productId);
                const el = getReturnEligibility(line, p, order);
                return (
                  <li key={line.id} className="flex flex-col gap-0.5 border-b border-slate-100/90 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="text-sm font-medium text-brand-ink">{labelForLine(line)}</span>
                    <span className="text-xs leading-snug text-slate-600 sm:text-right">
                      {el.selectable ? 'Eligible to start a return' : el.blockedReason}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {primaryIds.length === 0 ? (
            <p className="mt-5 text-sm leading-snug text-slate-600">{RETURN_ADD_ITEMS_EMPTY_HELPER}</p>
          ) : null}

          <div className="mt-5 space-y-4">
            {primaryIds.map((pid) => {
              const line = lines.find((l) => l.id === pid);
              const p = line ? getProductById(line.productId) : undefined;
              if (!line || !p) return null;
              const gifts = getBundledGiftLines(lines, line);
              return (
                <div
                  key={pid}
                  className="rounded-2xl border border-slate-100 bg-slate-50/35 p-4 ring-1 ring-slate-100/80"
                >
                  <ProductCard
                    flush
                    product={p}
                    meta={line.isGift ? labelForLine(line) : `${labelForLine(line)} · Returning`}
                    right={
                      <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={() => setRemovePrimaryId(pid)}>
                        Remove
                      </Button>
                    }
                  />
                  {lineRequiresImei(p) ? (
                    <div className="mt-4 border-t border-slate-100/90 pt-4">
                      <FormField
                        id={`ret-imei-${line.id}`}
                        label="IMEI"
                        hint="Matches the device you’re sending back (demo check)."
                        error={
                          (imeiByLineId[line.id] ?? '').length > 0 && !isPlausibleImei(imeiByLineId[line.id] ?? '')
                            ? 'Use 15 digits.'
                            : undefined
                        }
                      >
                        <input
                          id={`ret-imei-${line.id}`}
                          className={fieldControlMono}
                          value={imeiByLineId[line.id] ?? ''}
                          onChange={(e) =>
                            setImeiByLineId((prev) => ({
                              ...prev,
                              [line.id]: normalizeImei(e.target.value),
                            }))
                          }
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="15-digit IMEI"
                        />
                      </FormField>
                    </div>
                  ) : null}
                  {gifts.length ? (
                    <div className="mt-4 border-t border-slate-100/90 pt-3">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-teal-900/85">
                        Included with this return
                      </p>
                      <ul className="mt-2 space-y-2">
                        {gifts.map((g) => {
                          const gp = getProductById(g.productId);
                          if (!gp) return null;
                          return (
                            <li key={g.id}>
                              <ProductCard flush product={gp} meta={`${labelForLine(g)} · ships with item above`} />
                              {lineRequiresImei(gp) ? (
                                <div className="mt-3 border-t border-slate-100/80 pt-3">
                                  <FormField
                                    id={`ret-imei-${g.id}`}
                                    label="IMEI (gift watch)"
                                    hint="If this gift is a watch, confirm IMEI (demo)."
                                    error={
                                      (imeiByLineId[g.id] ?? '').length > 0 &&
                                      !isPlausibleImei(imeiByLineId[g.id] ?? '')
                                        ? 'Use 15 digits.'
                                        : undefined
                                    }
                                  >
                                    <input
                                      id={`ret-imei-${g.id}`}
                                      className={fieldControlMono}
                                      value={imeiByLineId[g.id] ?? ''}
                                      onChange={(e) =>
                                        setImeiByLineId((prev) => ({
                                          ...prev,
                                          [g.id]: normalizeImei(e.target.value),
                                        }))
                                      }
                                      inputMode="numeric"
                                      autoComplete="off"
                                      placeholder="15-digit IMEI"
                                    />
                                  </FormField>
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {step === 'reasons' ? (
        <Card>
          <div className="space-y-1">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">Return reason</p>
            <p className="text-sm leading-snug text-slate-600">One reason per item. Other needs a short note.</p>
          </div>

          <div className="mt-6 space-y-8">
            {expandedLineIds.map((lid) => {
              const line = lines.find((l) => l.id === lid);
              if (!line) return null;
              const label = labelForLine(line);
              const reasonForm = reasonByLineId[lid] ?? emptyReturnReasonForm();
              return (
                <div key={lid} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100/90 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <fieldset className="mt-4 space-y-2">
                    <legend className="sr-only">Return reason for {label}</legend>
                    {RETURN_REASONS.map((r) => {
                      const checked = reasonForm.reasonId === r.id;
                      return (
                        <label
                          key={r.id}
                          className={cn(
                            'flex min-h-[3rem] cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors',
                            checked
                              ? 'border-teal-600/80 bg-teal-50/35 ring-2 ring-teal-600/18'
                              : 'border-slate-200/95 bg-white ring-1 ring-slate-100/80',
                          )}
                        >
                          <input
                            type="radio"
                            className="mt-1 h-[1.125rem] w-[1.125rem] shrink-0 border-slate-300 text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                            name={`ret-reason-${lid}`}
                            checked={checked}
                            onChange={() => setReasonId(lid, r.id)}
                          />
                          <span className="text-base font-medium leading-snug text-brand-ink">{r.label}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                  {reasonForm.reasonId === 'other' ? (
                    <FormField id={`ret-other-${lid}`} label="Briefly describe" className="mt-4">
                      <textarea
                        id={`ret-other-${lid}`}
                        className={fieldTextarea}
                        rows={3}
                        placeholder="A sentence or two is enough."
                        value={reasonForm.otherNote}
                        onChange={(e) => patchReason(lid, { otherNote: e.target.value })}
                      />
                    </FormField>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {step === 'contact' ? (
        <Card>
          <div className="space-y-1">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">Shipping</p>
            <p className="text-base font-semibold text-brand-ink">Where should we send return instructions?</p>
            <p className="text-sm leading-snug text-slate-600">Phone formatting is for display only in this demo.</p>
          </div>
          {contactFields}
        </Card>
      ) : null}

      {step === 'preview' ? (
        <div className={supportPanel}>
          <div className={supportSectionHead}>Review</div>
          <div className="px-2 py-1.5">
            <p className="text-xs leading-snug text-slate-600">
              Check items, reasons, refund estimate, and ship-from address.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Button
                type="button"
                variant="secondary"
                className={cn(supportToolbarBtn, 'w-full sm:w-auto')}
                onClick={() => setStep('items')}
              >
                Edit items
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={cn(supportToolbarBtn, 'w-full sm:w-auto')}
                onClick={() => setStep('reasons')}
              >
                Edit reasons
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={cn(supportToolbarBtn, 'w-full sm:w-auto')}
                onClick={() => setStep('contact')}
              >
                Edit address
              </Button>
            </div>
          </div>

          <div className={supportSectionHead}>Items</div>
          <ul className="divide-y divide-slate-200">
            {expandedLineIds.map((lid) => {
              const line = lines.find((l) => l.id === lid);
              const p = line ? getProductById(line.productId) : undefined;
              const rf = reasonByLineId[lid] ?? emptyReturnReasonForm();
              const reasonLabel = RETURN_REASONS.find((r) => r.id === rf.reasonId)?.label ?? '—';
              if (!line || !p) return null;
              const primaryForGift = line.isGift ? lines.find((l) => l.bundleId === line.bundleId && !l.isGift) : undefined;
              return (
                <li key={lid} className="px-2 py-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-2">
                      <div
                        className={cn('h-10 w-10 shrink-0 rounded-sm ring-1 ring-slate-300/80', p.swatch ?? 'bg-slate-200')}
                        aria-hidden
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-xs font-semibold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-600">{labelForLine(line)}</p>
                        <p className="text-xs leading-snug text-slate-700">
                          <span className="font-semibold text-slate-800">Reason · </span>
                          {rf.reasonId === 'other' && rf.otherNote.trim() ? rf.otherNote.trim() : reasonLabel}
                        </p>
                        {lineRequiresImei(p) ? (
                          <p className="font-mono text-[11px] text-slate-500">IMEI {imeiByLineId[lid] ?? '—'}</p>
                        ) : null}
                        <p className="text-xs font-semibold text-slate-900">
                          Line estimate <span className="font-normal text-slate-600">(demo)</span>: {formatUsd(line.demoLineTotalCents ?? 0)}
                        </p>
                      </div>
                    </div>
                    {!line.isGift ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className={cn(supportToolbarBtn, 'w-full shrink-0 sm:w-auto')}
                        onClick={() => setPreviewRemovePrimaryId(lid)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <p className="max-w-[12rem] text-[11px] text-slate-500 sm:text-right">
                        Removed with {primaryForGift ? labelForLine(primaryForGift) : 'main item'}.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={supportSectionHead}>Refund estimate (demo)</div>
          <div className="px-2 py-2">
            <dl className="space-y-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Items subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatUsd(refundPreview.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Return shipping fee (deducted)</dt>
                <dd className="font-semibold text-amber-900/90">−{formatUsd(refundPreview.fee)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-slate-200 pt-1.5">
                <dt className="font-semibold text-slate-900">Estimated refund</dt>
                <dd className="font-semibold text-teal-950">{formatUsd(refundPreview.afterFee)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-snug text-slate-600">
              Original outbound shipping isn’t refunded. The fee above is a{' '}
              <span className="font-medium text-slate-800">demo estimate</span> for carrier label or inbound cost—we’ll
              confirm the final amount after your package is inspected. If the refund would be zero or negative, support may
              reach out with options.
            </p>
          </div>

          {bundleRequiresGiftReturn ? (
            <div className="border-t border-amber-200 bg-amber-50/60 px-2 py-2">
              <p className="text-xs font-semibold text-amber-950">Free gift</p>
              <p className="mt-0.5 text-[11px] leading-snug text-amber-950/90">
                Pack your promo gift in the same box as the qualifying item. If the gift is missing, it may delay or reduce
                your refund.
              </p>
            </div>
          ) : null}

          <div className={supportSectionHead}>Contact / ship-from</div>
          <div className="px-2 py-2 text-xs leading-snug text-slate-800">
            {contact.name}
            <br />
            {contact.address1}
            {contact.address2 ? (
              <>
                <br />
                {contact.address2}
              </>
            ) : null}
            <br />
            {contact.city}, {contact.region} {contact.postal}
            {addressMode === 'international' ? (
              <>
                <br />
                {contact.country}
              </>
            ) : null}
            <br />
            {contact.email}
            <br />
            {contact.phoneDisplay}
          </div>

          <div className={supportSectionHead}>Policy</div>
          <div className="px-2 py-2">
            <ul className="space-y-1 text-[11px] leading-snug text-slate-600">
              <li>We review every return for eligibility before approving a label.</li>
              <li>Refunds post to your original payment method after inspection.</li>
              <li>International returns may follow different rules—confirm in follow-up email.</li>
            </ul>
          </div>
        </div>
      ) : null}

      {step === 'confirmation' && rmaCode ? (
        <Card>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-teal-900/85">Request received</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-ink sm:text-2xl">
            Return <span className="font-mono text-[1.0625rem] font-semibold text-teal-950 sm:text-xl">{rmaCode}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Your return request is in our queue. Next we’ll check eligibility against your order (demo).
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-snug text-slate-700">
            <li className="flex gap-2">
              <span className="mt-0.5 text-teal-700" aria-hidden>
                ●
              </span>
              <span>We’ll review your items and reasons.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-teal-700" aria-hidden>
                ●
              </span>
              <span>Watch for email with return instructions or any questions.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-teal-700" aria-hidden>
                ●
              </span>
              <span>Your refund is issued after we receive and inspect the package—timing depends on your bank.</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(`/service/order/${order.id}`)}>
              Back to order
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={() => navigate('/account/requests')}>
              View requests
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 'items' ? (
        <WizardStickyActions>
          <Button
            type="button"
            variant="secondary"
            className="w-full min-h-12 sm:w-auto"
            onClick={() => navigate(`/service/order/${order.id}`)}
          >
            Back
          </Button>
          <AddItemsToolbarSlot disabled={addItemsDisabled}>
          <Button
            type="button"
            variant="secondary"
            className="w-full min-h-12 sm:w-auto"
              disabled={addItemsDisabled}
              title={addItemsDisabled ? NO_ADDITIONAL_ELIGIBLE_ITEMS : undefined}
            onClick={startAdd}
          >
              {ADD_ITEMS_CTA}
          </Button>
          </AddItemsToolbarSlot>
          <Button type="button" className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]" disabled={!canLeaveItems} onClick={() => setStep('reasons')}>
            Continue
          </Button>
        </WizardStickyActions>
      ) : null}

      {step === 'reasons' ? (
        <WizardStickyActions>
          <Button type="button" variant="secondary" className="w-full min-h-12 sm:w-auto" onClick={() => setStep('items')}>
            Back
          </Button>
          <Button
            type="button"
            className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]"
            disabled={!canLeaveReasons}
            onClick={() => setStep('contact')}
          >
            Continue
          </Button>
        </WizardStickyActions>
      ) : null}

      {step === 'contact' ? (
        <WizardStickyActions>
          <Button type="button" variant="secondary" className="w-full min-h-12 sm:w-auto" onClick={() => setStep('reasons')}>
            Back
          </Button>
          <Button
            type="button"
            className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]"
            disabled={!canLeaveContact}
            onClick={() => setStep('preview')}
          >
            Continue
          </Button>
        </WizardStickyActions>
      ) : null}

      {step === 'preview' ? (
        <WizardStickyActions>
          <Button type="button" variant="secondary" className="w-full min-h-12 sm:w-auto" onClick={() => setStep('contact')}>
            Back
          </Button>
          <Button type="button" className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]" onClick={submitReturn}>
            Submit return
          </Button>
        </WizardStickyActions>
      ) : null}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={ADD_ITEMS_MODAL_TITLE}
        description={RETURN_ADD_ITEMS_MODAL_DESCRIPTION}
        secondaryAction={{ label: 'Close', onClick: () => setAddOpen(false) }}
      >
        <div className="space-y-2">
          {remainingAddablePrimaries.length === 0 ? (
            <p className="text-sm text-slate-600">{NO_ADDITIONAL_ELIGIBLE_ITEMS}</p>
          ) : (
            remainingAddablePrimaries.map((l) => {
              const p = getProductById(l.productId);
              if (!p) return null;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => addPrimary(l.id)}
                  className="flex w-full min-h-[3.25rem] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm ring-1 ring-slate-100/80 transition hover:border-slate-300"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-ink">{p.name}</p>
                    <p className="text-xs text-slate-600">{labelForLine(l)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-teal-900">{ADD_ITEMS_CTA}</span>
                </button>
              );
            })
          )}
        </div>
      </Modal>

      <Modal
        open={removePrimaryId !== null}
        onClose={() => setRemovePrimaryId(null)}
        title="Remove this return?"
        description="We’ll drop this item—and any included gifts—from your return request."
        secondaryAction={{ label: 'Keep', onClick: () => setRemovePrimaryId(null) }}
        primaryAction={{
          label: 'Remove',
          onClick: () => removePrimaryId && confirmRemovePrimary(removePrimaryId),
        }}
      />

      <Modal
        open={previewRemovePrimaryId !== null}
        onClose={() => setPreviewRemovePrimaryId(null)}
        title="Remove from preview?"
        description={
          primaryIds.length <= 1
            ? 'Removing the last item cancels this return and takes you back to the order.'
            : 'This item and any bundled gifts will be removed from the return list.'
        }
        secondaryAction={{ label: 'Keep', onClick: () => setPreviewRemovePrimaryId(null) }}
        primaryAction={{
          label: 'Remove',
          onClick: () => {
            if (previewRemovePrimaryId === null) return;
            confirmRemovePrimary(previewRemovePrimaryId);
          },
        }}
      />
    </div>
  );
}
