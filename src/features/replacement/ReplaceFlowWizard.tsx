import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Order, OrderLine } from '@/types/models';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { ProductCard } from '@/components/ProductCard';
import { Stepper } from '@/components/Stepper';
import { CarePlusVerifyForm } from '@/features/replacement/CarePlusVerifyForm';
import { WizardStickyActions } from '@/features/replacement/WizardStickyActions';
import {
  isLineReplaceEligible,
  isPlausibleImei,
  lineRequiresImei,
  normalizeImei,
} from '@/features/replacement/eligibility';
import {
  formatDomesticPhoneInput,
  formatIntlContactInput,
  stripPhoneToDigits,
} from '@/features/replacement/phoneFormat';
import { getReplacementReason, type ReplacementReasonId } from '@/features/replacement/replacementReasons';
import { ReasonFields } from '@/features/replacement/ReasonFields';
import {
  REPLACEMENT_ADD_ANOTHER_CTA,
  REPLACEMENT_ADD_MODAL_TITLE,
  NO_ADDITIONAL_ELIGIBLE_ITEMS,
  REPLACEMENT_ADD_ITEMS_EMPTY_HELPER,
  REPLACEMENT_ADD_ITEMS_MODAL_DESCRIPTION,
  AddItemsToolbarSlot,
} from '@/features/serviceFlowItemControls';
import {
  allSelectionsHaveCompleteReasons,
  emptyReasonForm,
  normalizePerItemReasonForm,
  type PerItemReasonForm,
} from '@/features/replacement/reasonValidation';
import { analyzeReplacementSubmit, type ReplacementStockOption } from '@/features/replacement/replacementInventory';
import { formatUnavailableReplacementLabel } from '@/features/replacement/replacementResolution';
import {
  ReplacementOosResolveModal,
  ReplacementRmaQueuedModal,
} from '@/features/replacement/ReplacementStockModals';
import { buildReplacementPendingRma } from '@/features/serviceOrder/buildReplacementPendingRma';
import {
  clearPostReplacementPrefill,
  savePostReplacementPrefill,
} from '@/features/serviceOrder/postReplacementPrefill';
import type { ServiceFlowLocationState } from '@/features/serviceOrder/serviceFlowLocation';
import { useServiceOrderAccount } from '@/features/serviceOrder/ServiceOrderAccountContext';
import type { RegisteredServiceRma } from '@/features/serviceOrder/types';
import { getCustomerById, getOrderLinesForOrder, getProductById } from '@/mock-data';
import { fieldControl, fieldControlMono } from '@/ui/formControls';
import { supportPanel, supportSectionHead } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

type WizardStep = 'items' | 'reasons' | 'contact' | 'preview' | 'confirmation';
type AddressMode = 'domestic' | 'international';
type ConfirmationVariant = 'in_stock' | 'wait_restock' | 'replace' | 'all_oos';

type StockFlowState =
  | null
  | { phase: 'resolve'; requestedLabel: string; options: ReplacementStockOption[] }
  | { phase: 'confirm'; variant: 'wait_restock' | 'replace' | 'all_oos' };

type SelectionRow = { orderLineId: string; imei: string };

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

type CarePlusModalState =
  | null
  | { phase: 'gate' | 'verify'; lineId: string; reasonId: ReplacementReasonId };

function labelForLine(line: OrderLine): string {
  const p = getProductById(line.productId);
  const base = p?.name ?? line.productId;
  return line.isGift ? `${base} (gift)` : base;
}

function previewIssueHeading(form: PerItemReasonForm): string {
  const def = getReplacementReason(form.reasonId);
  if (!def) return '—';
  return def.subtitle ? `${def.label} ${def.subtitle}` : def.label;
}

function previewReasonLine(form: PerItemReasonForm): string {
  const def = getReplacementReason(form.reasonId);
  if (!def) return '—';
  if (form.description.trim()) return form.description.trim();
  return def.previewSummary;
}

function generateReplacementRmaCode(): string {
  const n = Math.floor(1 + Math.random() * 999999);
  return `RP${String(n).padStart(6, '0')}`;
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

export function ReplaceFlowWizard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, addRegisteredRma, profile } = useServiceOrderAccount();
  const lines = useMemo(() => getOrderLinesForOrder(order.id), [order.id]);
  const customer = order.customerId ? getCustomerById(order.customerId) : undefined;
  const prefillReplace = (location.state as ServiceFlowLocationState | null)?.prefillReplace;
  const prefillAppliedRef = useRef(false);

  const eligibleLines = useMemo(() => {
    return lines.filter((l) => {
      const p = getProductById(l.productId);
      return isLineReplaceEligible(l, p);
    });
  }, [lines]);

  const [step, setStep] = useState<WizardStep>('items');
  const [selections, setSelections] = useState<SelectionRow[]>([]);
  const [reasonByLineId, setReasonByLineId] = useState<Record<string, PerItemReasonForm>>({});
  const [carePlusVerified, setCarePlusVerified] = useState(() => {
    try {
      return sessionStorage.getItem(`tt-careplus:${order.id}`) === '1';
    } catch {
      return false;
    }
  });
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
  const [confirmationVariant, setConfirmationVariant] = useState<ConfirmationVariant>('in_stock');

  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<{ lineId: string; imei: string } | null>(null);

  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const [carePlus, setCarePlus] = useState<CarePlusModalState>(null);
  const carePlusRef = useRef<CarePlusModalState>(null);

  useEffect(() => {
    carePlusRef.current = carePlus;
  }, [carePlus]);

  const [previewDeleteIndex, setPreviewDeleteIndex] = useState<number | null>(null);

  const [stockFlow, setStockFlow] = useState<StockFlowState>(null);
  const [selectedStockOptionId, setSelectedStockOptionId] = useState<string | null>(null);

  const [policyDetailsOpen, setPolicyDetailsOpen] = useState(false);

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    if (!prefillReplace?.lineId) return;
    const line = lines.find((l) => l.id === prefillReplace.lineId);
    if (!line) return;
    const p = getProductById(line.productId);
    if (!isLineReplaceEligible(line, p)) return;
    const imeiNorm = lineRequiresImei(p) ? normalizeImei(prefillReplace.imei) : '';
    if (lineRequiresImei(p) && !isPlausibleImei(imeiNorm)) return;
    prefillAppliedRef.current = true;
    setSelections([{ orderLineId: line.id, imei: imeiNorm }]);
    setStep('reasons');
  }, [lines, prefillReplace]);

  const persistReplacementPrefill = useCallback((): Omit<RegisteredServiceRma, 'localId'> | null => {
    if (!rmaCode) return null;
    const pendingRma = buildReplacementPendingRma({
      order,
      lines,
      selections,
      reasonByLineId,
      contact: {
        name: contact.name,
        email: contact.email,
        phoneDisplay: contact.phoneDisplay,
        address1: contact.address1,
        address2: contact.address2,
        city: contact.city,
        region: contact.region,
        postal: contact.postal,
        country: contact.country,
      },
      addressMode,
      rmaCode,
    });
    savePostReplacementPrefill({
      name: contact.name,
      email: contact.email,
      phoneDisplay: contact.phoneDisplay,
      orderId: order.id,
      rmaCode,
      customerId: order.customerId,
      pendingRma,
    });
    return pendingRma;
  }, [rmaCode, order, lines, selections, reasonByLineId, contact, addressMode]);

  useEffect(() => {
    if (step !== 'confirmation' || !rmaCode) return;
    persistReplacementPrefill();
  }, [step, rmaCode, persistReplacementPrefill]);

  const continueToServiceOrders = useCallback(() => {
    const pending = persistReplacementPrefill();
    if (!pending || !rmaCode) return;
    setStockFlow(null);
    if (isAuthenticated && profile) {
      const localId = `reg-${Date.now()}`;
      addRegisteredRma({
        ...pending,
        localId,
        email: profile.email?.trim() || pending.email,
        phone: profile.phoneDisplay?.trim() || pending.phone,
        contactName: profile.name?.trim() || pending.contactName,
      });
      clearPostReplacementPrefill();
      navigate('/account/requests');
      return;
    }
    navigate('/service/signup');
  }, [persistReplacementPrefill, rmaCode, isAuthenticated, profile, addRegisteredRma, navigate]);

  const dismissRmaQueuedModal = useCallback(() => {
    setStockFlow(null);
  }, []);

  const remainingAddable = useMemo(() => {
    const selected = new Set(selections.map((s) => s.orderLineId));
    return eligibleLines.filter((l) => !selected.has(l.id));
  }, [eligibleLines, selections]);

  const addItemsDisabled = remainingAddable.length === 0;

  const canConfirmAdd = useMemo(() => {
    if (!addDraft) return false;
    const line = eligibleLines.find((l) => l.id === addDraft.lineId);
    const p = line ? getProductById(line.productId) : undefined;
    if (!lineRequiresImei(p)) return true;
    return isPlausibleImei(addDraft.imei);
  }, [addDraft, eligibleLines]);

  const canLeaveItems = useMemo(() => {
    if (selections.length === 0) return false;
    return selections.every((s) => {
      const line = lines.find((l) => l.id === s.orderLineId);
      const p = line ? getProductById(line.productId) : undefined;
      if (!lineRequiresImei(p)) return true;
      return isPlausibleImei(s.imei);
    });
  }, [lines, selections]);

  const addAnotherOnItemsStepDisabled = addItemsDisabled || (selections.length > 0 && !canLeaveItems);

  const canLeaveReasons = useMemo(() => {
    const ids = selections.map((s) => s.orderLineId);
    return allSelectionsHaveCompleteReasons(ids, reasonByLineId, carePlusVerified);
  }, [reasonByLineId, selections, carePlusVerified]);

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

  const stepIndex =
    step === 'items' ? 0 : step === 'reasons' ? 1 : step === 'contact' ? 2 : step === 'preview' ? 3 : 3;

  const startAdd = () => {
    setAddDraft(null);
    setAddOpen(true);
  };

  const pickLineToAdd = (line: OrderLine) => {
    const p = getProductById(line.productId);
    const needs = lineRequiresImei(p);
    setAddDraft({
      lineId: line.id,
      imei: needs ? normalizeImei(line.imei ?? '') : '',
    });
  };

  const confirmAdd = () => {
    if (!addDraft) return;
    const line = eligibleLines.find((l) => l.id === addDraft.lineId);
    if (!line) return;
    const p = getProductById(line.productId);
    if (lineRequiresImei(p) && !isPlausibleImei(addDraft.imei)) return;
    setSelections((prev) => [
      ...prev,
      { orderLineId: line.id, imei: lineRequiresImei(p) ? normalizeImei(addDraft.imei) : '' },
    ]);
    setAddOpen(false);
    setAddDraft(null);
  };

  const confirmRemoveAt = (idx: number) => {
    const lineId = selections[idx]?.orderLineId;
    setSelections((prev) => prev.filter((_, i) => i !== idx));
    if (lineId) {
      setReasonByLineId((prev) => {
        const next = { ...prev };
        delete next[lineId];
        return next;
      });
    }
    setRemoveIndex(null);

    const nextLen = selections.length - 1;
    if (nextLen <= 0) {
      navigate(`/service/order/${order.id}`);
    }
  };

  const submitReplacementFromPreview = () => {
    const analysis = analyzeReplacementSubmit(selections, lines);
    if (analysis.kind === 'in_stock') {
      const code = generateReplacementRmaCode();
      setRmaCode(code);
      setConfirmationVariant('in_stock');
      setStep('confirmation');
      return;
    }
    if (analysis.kind === 'all_oos') {
      const code = generateReplacementRmaCode();
      setRmaCode(code);
      setConfirmationVariant('all_oos');
      setStockFlow({ phase: 'confirm', variant: 'all_oos' });
      return;
    }
    if (analysis.kind === 'alternate_stock') {
      if (analysis.options.length === 0) {
        const code = generateReplacementRmaCode();
        setRmaCode(code);
        setConfirmationVariant('all_oos');
        setStockFlow({ phase: 'confirm', variant: 'all_oos' });
        return;
      }
      const anchorLine = lines.find((l) => l.id === analysis.lineIds[0]);
      const requestedLabel = anchorLine
        ? formatUnavailableReplacementLabel(anchorLine, analysis.purchasedColor)
        : analysis.purchasedColor;
      setSelectedStockOptionId(null);
      setStockFlow({
        phase: 'resolve',
        requestedLabel,
        options: analysis.options,
      });
    }
  };

  const closeStockResolve = () => {
    setStockFlow(null);
    setSelectedStockOptionId(null);
  };

  const onWaitForRestockFromResolve = () => {
    const code = generateReplacementRmaCode();
    setRmaCode(code);
    setConfirmationVariant('wait_restock');
    setStockFlow({ phase: 'confirm', variant: 'wait_restock' });
    setSelectedStockOptionId(null);
  };

  const onReplaceFromResolve = () => {
    if (!selectedStockOptionId) return;
    const code = generateReplacementRmaCode();
    setRmaCode(code);
    setConfirmationVariant('replace');
    setStockFlow({ phase: 'confirm', variant: 'replace' });
    setSelectedStockOptionId(null);
  };

  const patchContact = (partial: Partial<ContactForm>) => setContact((c) => ({ ...c, ...partial }));

  const onPhoneChange = (raw: string) => {
    if (addressMode === 'domestic') {
      patchContact({ phoneDisplay: formatDomesticPhoneInput(raw) });
      return;
    }
    patchContact({ phoneDisplay: formatIntlContactInput(raw) });
  };

  return (
    <div className={cn('space-y-5', step !== 'confirmation' && 'pb-[5.5rem] sm:pb-6')}>
      <PageHeader
        eyebrow="Replace"
        title="Request replacement"
        description="Pick one reason per product. Add Another Item and Next unlock when the current item is valid."
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
            { id: 'reasons', label: 'Issue', complete: stepIndex > 1 },
            { id: 'contact', label: 'Ship to', complete: stepIndex > 2 },
            { id: 'preview', label: 'Review', complete: false },
          ]}
        />
      ) : null}

      {step === 'items' ? (
        <Card>
          <div className="space-y-1">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">
              Your products
            </p>
            <p className="text-base font-semibold text-support-navy">What needs a replacement?</p>
            <p className="text-sm leading-snug text-slate-600">
              Watches need a <span className="font-medium text-slate-800">15-digit IMEI</span> before you continue.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100/90 sm:p-5">
            <p className="text-sm leading-snug text-slate-600">
              You already agreed to the return and replacement terms when you started this request. Need a refresher?
            </p>
            <button
              type="button"
              className="mt-2 text-left text-sm font-semibold text-support-navy underline decoration-support-navy/30 hover:decoration-support-navy"
              onClick={() => setPolicyDetailsOpen(true)}
            >
              View policy summary
            </button>
          </div>

          {eligibleLines.length === 0 ? (
            <p className="mt-4 text-sm text-slate-700">
              No eligible shipped items on this order in our mock data.
            </p>
          ) : null}

          <div className="mt-5 space-y-4">
            {selections.map((s, idx) => {
              const line = lines.find((l) => l.id === s.orderLineId);
              const p = line ? getProductById(line.productId) : undefined;
              if (!line || !p) return null;
              return (
                <div
                  key={s.orderLineId}
                  className="rounded-2xl border border-slate-100 bg-slate-50/35 p-4 ring-1 ring-slate-100/80"
                >
                  <ProductCard
                    flush
                    product={p}
                    meta={labelForLine(line)}
                    right={
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="min-h-9 w-9 shrink-0 px-0 text-lg font-normal"
                        onClick={() => setRemoveIndex(idx)}
                        aria-label="Remove item"
                      >
                        ×
                      </Button>
                    }
                  />
                  {lineRequiresImei(p) ? (
                    <div className="mt-4 border-t border-slate-100/90 pt-4">
                      <FormField
                        id={`imei-${line.id}`}
                        label="IMEI"
                        error={
                          s.imei.length > 0 && !isPlausibleImei(s.imei)
                            ? 'Use 15 digits.'
                            : undefined
                        }
                      >
                        <input
                          id={`imei-${line.id}`}
                          className={fieldControlMono}
                          value={s.imei}
                          onChange={(e) => {
                            const v = normalizeImei(e.target.value);
                            setSelections((prev) =>
                              prev.map((row, i) => (i === idx ? { ...row, imei: v } : row)),
                            );
                          }}
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="15-digit IMEI"
                        />
                      </FormField>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {selections.length === 0 ? (
            <p className="mt-5 text-sm leading-snug text-slate-600">{REPLACEMENT_ADD_ITEMS_EMPTY_HELPER}</p>
          ) : null}
        </Card>
      ) : null}

      {step === 'reasons' ? (
        <div className={supportPanel}>
          <div className={supportSectionHead}>Issue description</div>
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-[11px] leading-snug text-slate-600">
              {REPLACEMENT_ADD_ITEMS_EMPTY_HELPER}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-slate-600">
              A few choices require TickTalk Care+—we&apos;ll confirm only when it applies.
            </p>
          </div>
          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {selections.map((s) => {
              const line = lines.find((l) => l.id === s.orderLineId);
              if (!line) return null;
              const label = labelForLine(line);
              const st = normalizePerItemReasonForm(reasonByLineId[s.orderLineId]);
              return (
                <div key={s.orderLineId} className="px-2 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</p>
                  <div className="mt-2">
                    <ReasonFields
                      orderLineId={s.orderLineId}
                      value={st}
                      carePlusVerified={carePlusVerified}
                      supportPortal
                      onCarePlusReasonAttempt={(lineId, reasonId) => {
                        setCarePlus({ phase: 'gate', lineId, reasonId });
                      }}
                      onChange={(next) =>
                        setReasonByLineId((prev) => ({
                          ...prev,
                          [s.orderLineId]: next,
                        }))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 'contact' ? (
        <Card>
          <div className="space-y-1">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">Shipping</p>
            <p className="text-base font-semibold text-support-navy">Where should we follow up?</p>
            <p className="text-sm leading-snug text-slate-600">We’ll format your phone for display only in this demo.</p>
          </div>

          <div className="mt-5 flex gap-2 rounded-2xl bg-slate-100/80 p-1">
            <button
              type="button"
              className={cn(
                'min-h-12 flex-1 rounded-xl px-3 text-sm font-semibold transition',
                addressMode === 'domestic'
                  ? 'bg-white text-support-navy shadow-sm ring-1 ring-slate-200/90'
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
                  ? 'bg-white text-support-navy shadow-sm ring-1 ring-slate-200/90'
                  : 'text-slate-700 hover:text-slate-900',
              )}
              onClick={() => setAddressMode('international')}
            >
              International
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField id="c-name" label="Full name">
              <input
                id="c-name"
                className={fieldControl}
                value={contact.name}
                onChange={(e) => patchContact({ name: e.target.value })}
                autoComplete="name"
              />
            </FormField>
            <FormField id="c-email" label="Email">
              <input
                id="c-email"
                className={fieldControl}
                inputMode="email"
                autoCapitalize="off"
                value={contact.email}
                onChange={(e) => patchContact({ email: e.target.value })}
                autoComplete="email"
              />
            </FormField>
            <FormField
              id="c-phone"
              label="Phone"
              hint={addressMode === 'domestic' ? 'Formats as you type.' : 'Include country code.'}
            >
              <input
                id="c-phone"
                className={fieldControl}
                value={contact.phoneDisplay}
                onChange={(e) => onPhoneChange(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
              />
            </FormField>
            {addressMode === 'international' ? (
              <FormField id="c-country" label="Country / region">
                <input
                  id="c-country"
                  className={fieldControl}
                  value={contact.country}
                  onChange={(e) => patchContact({ country: e.target.value })}
                  autoComplete="country-name"
                />
              </FormField>
            ) : null}
            <FormField id="c-a1" label="Street address" className="sm:col-span-2">
              <input
                id="c-a1"
                className={fieldControl}
                value={contact.address1}
                onChange={(e) => patchContact({ address1: e.target.value })}
                autoComplete="address-line1"
              />
            </FormField>
            <FormField id="c-a2" label="Apt / suite (optional)" className="sm:col-span-2">
              <input
                id="c-a2"
                className={fieldControl}
                value={contact.address2}
                onChange={(e) => patchContact({ address2: e.target.value })}
                autoComplete="address-line2"
              />
            </FormField>
            <FormField id="c-city" label="City">
              <input
                id="c-city"
                className={fieldControl}
                value={contact.city}
                onChange={(e) => patchContact({ city: e.target.value })}
                autoComplete="address-level2"
              />
            </FormField>
            <FormField id="c-region" label={addressMode === 'domestic' ? 'State' : 'State / province'}>
              <input
                id="c-region"
                className={fieldControl}
                value={contact.region}
                onChange={(e) => patchContact({ region: e.target.value })}
                autoComplete="address-level1"
              />
            </FormField>
            <FormField id="c-postal" label={addressMode === 'domestic' ? 'ZIP' : 'Postal code'}>
              <input
                id="c-postal"
                className={fieldControl}
                value={contact.postal}
                onChange={(e) => patchContact({ postal: e.target.value })}
                autoComplete="postal-code"
              />
            </FormField>
          </div>
        </Card>
      ) : null}

      {step === 'preview' ? (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">Almost there</p>
              <p className="text-base font-semibold text-support-navy">Review your request</p>
              <p className="text-sm leading-snug text-slate-600">Edit any section before you submit.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setStep('items')}>
              Edit items
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setStep('reasons')}>
              Edit issues
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setStep('contact')}>
              Edit address
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {selections.map((s, idx) => {
              const line = lines.find((l) => l.id === s.orderLineId);
              const p = line ? getProductById(line.productId) : undefined;
              const st = normalizePerItemReasonForm(reasonByLineId[s.orderLineId]);
              if (!line || !p) return null;
              return (
                <div
                  key={s.orderLineId}
                  className="rounded-2xl border border-slate-100 bg-white p-4 ring-1 ring-slate-100/90 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <ProductCard flush product={p} meta={labelForLine(line)} />
                      <div className="space-y-1 text-sm leading-snug">
                        <p>
                          <span className="font-semibold text-slate-800">Issue · </span>
                          <span className="text-slate-700">{previewIssueHeading(st)}</span>
                        </p>
                        <p className="text-slate-700">
                          <span className="font-semibold text-slate-800">Note · </span>
                          {previewReasonLine(st)}
                        </p>
                        {lineRequiresImei(p) ? (
                          <p className="font-mono text-xs text-slate-500">IMEI {s.imei}</p>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full shrink-0 sm:w-auto"
                      onClick={() => setPreviewDeleteIndex(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100/90 sm:p-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500">Ship / contact</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
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
            </p>
          </div>
        </Card>
      ) : null}

      {step === 'confirmation' && rmaCode ? (
        <Card>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-support-navy/85">Request received</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-support-navy sm:text-2xl">
            RMA Number:{' '}
            <span className="font-mono text-[1.0625rem] font-semibold text-support-navy sm:text-xl">{rmaCode}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {confirmationVariant === 'in_stock'
              ? 'You’re all set. Watch your inbox for next steps and tracking (demo).'
              : confirmationVariant === 'wait_restock'
                ? 'We received your request and reserved queue priority by time. We’ll process it once your item is back in stock (demo).'
                : confirmationVariant === 'replace'
                  ? 'We received your replacement selection and will process it as soon as possible (demo).'
                  : 'We logged your request. Our support team will contact you as soon as possible (demo).'}
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-snug text-slate-700">
            <li className="flex gap-2">
              <span className="mt-0.5 text-support-navy" aria-hidden>
                ●
              </span>
              <span>Use this reference in the email subject if you write in.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-support-navy" aria-hidden>
                ●
              </span>
              <span>Ship only what we confirm—skip extra accessories unless we ask.</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(`/service/order/${order.id}`)}>
              Back to order
            </Button>
            {!isAuthenticated ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => navigate('/service/login?return=/account/requests')}
            >
              Sign in
            </Button>
            ) : null}
            <Button type="button" className="w-full sm:w-auto" onClick={continueToServiceOrders}>
              {isAuthenticated ? 'Continue to Service Orders' : 'Continue'}
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
          <AddItemsToolbarSlot
            disabled={addAnotherOnItemsStepDisabled}
            disabledHint={
              addItemsDisabled
                ? undefined
                : selections.length > 0 && !canLeaveItems
                  ? 'Finish the watch IMEI before adding another item.'
                  : ''
            }
          >
            <Button
              type="button"
              variant="secondary"
              className="w-full min-h-12 sm:w-auto"
              disabled={addAnotherOnItemsStepDisabled}
              title={
                addItemsDisabled
                  ? NO_ADDITIONAL_ELIGIBLE_ITEMS
                  : selections.length > 0 && !canLeaveItems
                    ? 'Enter a valid IMEI for the current item first'
                    : undefined
              }
              onClick={startAdd}
            >
              {REPLACEMENT_ADD_ANOTHER_CTA}
            </Button>
          </AddItemsToolbarSlot>
          <Button
            type="button"
            className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]"
            disabled={!canLeaveItems}
            onClick={() => setStep('reasons')}
          >
            Next
          </Button>
        </WizardStickyActions>
      ) : null}

      {step === 'reasons' ? (
        <WizardStickyActions>
          <Button
            type="button"
            variant="secondary"
            className="w-full min-h-12 sm:w-auto"
            onClick={() => {
              if (prefillAppliedRef.current) {
                navigate(`/service/order/${order.id}`);
                return;
              }
              setStep('items');
            }}
          >
            Back
          </Button>
          <AddItemsToolbarSlot
            disabled={addItemsDisabled || !canLeaveReasons}
            disabledHint={
              !canLeaveReasons
                ? 'Complete this item’s issue before adding another.'
                : addItemsDisabled
                  ? undefined
                  : ''
            }
          >
            <Button
              type="button"
              variant="secondary"
              className="w-full min-h-12 sm:w-auto"
              disabled={addItemsDisabled || !canLeaveReasons}
              title={
                addItemsDisabled
                  ? NO_ADDITIONAL_ELIGIBLE_ITEMS
                  : !canLeaveReasons
                    ? 'Complete this item’s issue first'
                    : undefined
              }
              onClick={startAdd}
            >
              {REPLACEMENT_ADD_ANOTHER_CTA}
            </Button>
          </AddItemsToolbarSlot>
          <Button
            type="button"
            className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]"
            disabled={!canLeaveReasons}
            onClick={() => setStep('contact')}
          >
            Next
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
            Next
          </Button>
        </WizardStickyActions>
      ) : null}

      {step === 'preview' ? (
        <WizardStickyActions>
          <Button type="button" variant="secondary" className="w-full min-h-12 sm:w-auto" onClick={() => setStep('contact')}>
            Back
          </Button>
          <Button
            type="button"
            className="w-full min-h-12 sm:flex-1 sm:min-w-[10rem]"
            onClick={submitReplacementFromPreview}
          >
            Submit request
          </Button>
        </WizardStickyActions>
      ) : null}

      <ReplacementOosResolveModal
        open={stockFlow?.phase === 'resolve'}
        requestedLabel={stockFlow?.phase === 'resolve' ? stockFlow.requestedLabel : ''}
        options={stockFlow?.phase === 'resolve' ? stockFlow.options : []}
        selectedId={selectedStockOptionId}
        onSelect={setSelectedStockOptionId}
        onClose={closeStockResolve}
        onWaitForRestock={onWaitForRestockFromResolve}
        onReplace={onReplaceFromResolve}
      />

      <ReplacementRmaQueuedModal
        open={Boolean(stockFlow?.phase === 'confirm' && rmaCode)}
        rmaCode={rmaCode ?? ''}
        variant={stockFlow?.phase === 'confirm' ? stockFlow.variant : 'all_oos'}
        onContinue={continueToServiceOrders}
        onDismiss={dismissRmaQueuedModal}
      />

      <Modal
        open={policyDetailsOpen}
        onClose={() => setPolicyDetailsOpen(false)}
        title="Replacement policy summary"
        description="Demo-friendly summary—confirm final wording with legal and the product deck."
        secondaryAction={{ label: 'Close', onClick: () => setPolicyDetailsOpen(false) }}
      >
        <ul className="list-disc space-y-2 pl-5 text-sm leading-snug text-slate-700">
          <li>You confirm the issue details you share are accurate to the best of your knowledge.</li>
          <li>Some damage types require an active TickTalk Care+ plan—we’ll guide you if it applies.</li>
          <li>Fulfillment depends on approval and inventory; color or timing may change.</li>
          <li>This preview doesn’t save data, ship hardware, or charge your card.</li>
        </ul>
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddDraft(null);
        }}
        title={REPLACEMENT_ADD_MODAL_TITLE}
        description={REPLACEMENT_ADD_ITEMS_MODAL_DESCRIPTION}
        primaryAction={
          addDraft
            ? {
                label: REPLACEMENT_ADD_ANOTHER_CTA,
                onClick: confirmAdd,
                disabled: !canConfirmAdd,
              }
            : undefined
        }
        secondaryAction={{
          label: 'Close',
          onClick: () => {
            setAddOpen(false);
            setAddDraft(null);
          },
        }}
      >
        {!addDraft ? (
          <div className="space-y-2">
            {remainingAddable.length === 0 ? (
              <p className="text-sm text-slate-600">{NO_ADDITIONAL_ELIGIBLE_ITEMS}</p>
            ) : (
              remainingAddable.map((l) => {
                const p = getProductById(l.productId);
                if (!p) return null;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => pickLineToAdd(l)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-brand-line bg-white p-3 text-left shadow-sm hover:border-slate-300"
                  >
                    <div>
                      <p className="text-sm font-semibold text-support-navy">{p.name}</p>
                      <p className="text-xs text-slate-600">{labelForLine(l)}</p>
                    </div>
                    <span className="text-sm font-semibold text-support-navy">Choose</span>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              const line = eligibleLines.find((l) => l.id === addDraft.lineId);
              const p = line ? getProductById(line.productId) : undefined;
              const needs = lineRequiresImei(p);
              return (
                <>
                  <p className="text-sm text-slate-700">
                    Adding <span className="font-semibold text-support-navy">{p?.name}</span>.
                  </p>
                  {needs ? (
                    <FormField
                      id="add-imei"
                      label="IMEI"
                      error={
                        addDraft.imei.length > 0 && !isPlausibleImei(addDraft.imei)
                          ? 'Enter 15 digits.'
                          : undefined
                      }
                    >
                      <input
                        id="add-imei"
                        className={fieldControlMono}
                        value={addDraft.imei}
                        onChange={(e) => setAddDraft({ ...addDraft, imei: normalizeImei(e.target.value) })}
                        inputMode="numeric"
                      />
                    </FormField>
                  ) : (
                    <p className="text-sm text-slate-600">No IMEI needed for this accessory.</p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      <Modal
        open={removeIndex !== null}
        onClose={() => setRemoveIndex(null)}
        title="Remove this product?"
        description="It will be dropped from this replacement request."
        secondaryAction={{ label: 'Keep', onClick: () => setRemoveIndex(null) }}
        primaryAction={{
          label: 'Remove',
          onClick: () => removeIndex !== null && confirmRemoveAt(removeIndex),
        }}
      />

      <Modal
        open={previewDeleteIndex !== null}
        onClose={() => setPreviewDeleteIndex(null)}
        title="Remove from preview?"
        description={
          selections.length <= 1
            ? 'Removing the last item cancels the request and returns you to the order.'
            : 'This line will be removed from the replacement list.'
        }
        secondaryAction={{ label: 'Keep', onClick: () => setPreviewDeleteIndex(null) }}
        primaryAction={{
          label: 'Remove',
          onClick: () => {
            if (previewDeleteIndex === null) return;
            const idx = previewDeleteIndex;
            setPreviewDeleteIndex(null);
            confirmRemoveAt(idx);
          },
        }}
      />

      <Modal
        open={!!carePlus && carePlus.phase === 'gate'}
        onClose={() => setCarePlus(null)}
        title="TickTalk Care+ Required"
        description="This issue needs an active TickTalk Care+ plan (TT5 in this demo)."
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setCarePlus(null),
        }}
        primaryAction={{
          label: 'Verify Care+',
          onClick: () => setCarePlus((c) => (c ? { ...c, phase: 'verify' } : c)),
        }}
      />

      <Modal
        open={!!carePlus && carePlus.phase === 'verify'}
        onClose={() => setCarePlus(null)}
        title="Verify TickTalk Care+"
        description={undefined}
      >
        <CarePlusVerifyForm
          onCancel={() => setCarePlus((c) => (c ? { ...c, phase: 'gate' } : c))}
          onVerified={() => {
            const c = carePlusRef.current;
            if (!c || c.phase !== 'verify') return;
            try {
              sessionStorage.setItem(`tt-careplus:${order.id}`, '1');
            } catch {
              /* ignore */
            }
            setReasonByLineId((prev) => ({
              ...prev,
              [c.lineId]: { ...emptyReasonForm(), reasonId: c.reasonId },
            }));
            setCarePlusVerified(true);
            setCarePlus(null);
          }}
        />
      </Modal>
    </div>
  );
}
