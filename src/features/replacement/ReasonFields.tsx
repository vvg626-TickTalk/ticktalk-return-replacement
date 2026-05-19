import type { ReplacementReasonDef, ReplacementReasonId } from '@/features/replacement/replacementReasons';
import { REPLACEMENT_REASONS } from '@/features/replacement/replacementReasons';
import {
  carePlanCoveredBadgeLine,
  carePlanRequiredSubtitle,
  carePlanRequirementShortHint,
} from '@/features/replacement/carePlanLabels';
import type { MockUploadItem, PerItemReasonForm } from '@/features/replacement/reasonValidation';
import { emptyReasonForm, normalizePerItemReasonForm } from '@/features/replacement/reasonValidation';
import { supportTextarea, supportUploadAddBtn, supportUploadRemoveBtn, supportUploadThumb } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

const MAX_UPLOADS = 3;

const followUpBox = 'rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 py-2.5';
const textareaShell = 'rounded-xl border border-slate-200/90 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-support-navy/10';
const disclaimerBox = 'rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2';

function createMockUpload(index: number): MockUploadItem {
  return { id: `demo-${index}-${Math.random().toString(36).slice(2, 7)}`, label: String(index) };
}

function ProgressiveUploadBlock({
  value,
  onChange,
  primaryCta,
  addAnotherCta = '+ Add another upload',
  helper,
  kind = 'photo',
}: {
  value: PerItemReasonForm;
  onChange: (next: PerItemReasonForm) => void;
  primaryCta: string;
  addAnotherCta?: string;
  helper?: string;
  kind?: 'photo' | 'file';
}) {
  const add = () => {
    if (value.mockUploads.length >= MAX_UPLOADS) return;
    const nextN = value.mockUploads.length + 1;
    onChange({
      ...value,
      mockUploads: [...value.mockUploads, createMockUpload(nextN)],
    });
  };

  const remove = (i: number) => {
    onChange({
      ...value,
      mockUploads: value.mockUploads.filter((_, j) => j !== i),
    });
  };

  const thumbLabel = kind === 'file' ? 'File' : 'Img';

  return (
    <div className="mt-2 space-y-2">
      {helper ? (
        <div className={disclaimerBox}>
          <p className="text-[11px] leading-snug text-slate-600">{helper}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        {value.mockUploads.map((u, i) => (
          <div
            key={u.id}
            className={cn(supportUploadThumb, 'flex flex-col text-[10px] font-medium text-slate-600')}
          >
            <span className="sr-only">
              {kind === 'file' ? 'File' : 'Photo'} {u.label}
            </span>
            <span aria-hidden className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
              {thumbLabel}
            </span>
            <button
              type="button"
              className={cn(supportUploadRemoveBtn, 'h-5 w-5 text-[11px]')}
              aria-label="Remove"
              onClick={() => remove(i)}
            >
              ×
            </button>
          </div>
        ))}
        {value.mockUploads.length < MAX_UPLOADS ? (
          <button type="button" onClick={add} className={cn(supportUploadAddBtn, 'min-h-10 py-2 text-[12px] font-semibold')}>
            {value.mockUploads.length === 0 ? primaryCta : addAnotherCta}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ExpandedReasonBody({
  def,
  value,
  onChange,
  carePlusVerified,
  watchGeneration,
}: {
  def: ReplacementReasonDef;
  value: PerItemReasonForm;
  onChange: (next: PerItemReasonForm) => void;
  carePlusVerified: boolean;
  watchGeneration?: string;
}) {
  const patch = (partial: Partial<PerItemReasonForm>) => onChange({ ...value, ...partial });

  const showDesc = def.description.mode !== 'hidden';
  const up = def.upload;

  const progressive = (primary: string, helper?: string, kind: 'photo' | 'file' = 'photo') => (
    <ProgressiveUploadBlock
      value={value}
      onChange={onChange}
      primaryCta={primary}
      addAnotherCta={up.addAnotherCta}
      helper={helper}
      kind={kind}
    />
  );

  return (
    <div className="mt-2 space-y-3 pl-0.5">
      {def.policyNote ? (
        <div className={followUpBox}>
          <p className="text-[11px] font-medium leading-snug text-slate-800">{def.policyNote}</p>
        </div>
      ) : null}

      {def.introLines?.length ? (
        <div className={followUpBox}>
          <div className="space-y-1">
            {def.introLines.map((line) => (
              <p key={line} className="text-[11px] leading-snug text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {def.showCarePlusBadge && carePlusVerified ? (
        <span className="inline-flex max-w-full rounded-lg bg-support-tint px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-support-navy ring-1 ring-support-navy/12">
          {carePlanCoveredBadgeLine(watchGeneration)}
        </span>
      ) : null}

      {showDesc ? (
        <div className="space-y-1.5">
          {def.descriptionHelper ? (
            <p className="text-[11px] leading-snug text-slate-600">{def.descriptionHelper}</p>
          ) : null}
          <div className={textareaShell}>
            <label htmlFor={`desc-${def.id}`} className="sr-only">
              {def.description.placeholder}
            </label>
            <textarea
              id={`desc-${def.id}`}
              rows={4}
              placeholder={def.description.placeholder}
              value={value.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={cn(
                supportTextarea,
                'min-h-[5.5rem] w-full border-0 bg-transparent p-0 text-[13px] leading-snug text-slate-900 shadow-none ring-0 focus:ring-0 placeholder:text-slate-400',
              )}
            />
          </div>
        </div>
      ) : null}

      {up.type === 'none' ? null : up.type === 'behind_link' ? (
        <div className="space-y-2">
          {!value.uploadSectionOpen ? (
            <button
              type="button"
              onClick={() => patch({ uploadSectionOpen: true })}
              className={cn(supportUploadAddBtn, 'min-h-10 py-2 text-[12px] font-semibold')}
            >
              {up.linkText ?? '+ Add file'}
            </button>
          ) : (
            progressive(
              up.primaryCta ?? '+ Add file',
              up.helper,
              up.progressiveKind === 'file' ? 'file' : 'photo',
            )
          )}
        </div>
      ) : (
        progressive(
          up.primaryCta ?? '+ Add photo',
          up.helper,
          up.progressiveKind === 'file' ? 'file' : 'photo',
        )
      )}

      {def.footerDisclaimer ? (
        <div className={disclaimerBox}>
          <p className="text-[10px] leading-snug text-slate-600">{def.footerDisclaimer}</p>
        </div>
      ) : null}
    </div>
  );
}

export type ReasonFieldsProps = {
  orderLineId: string;
  value: PerItemReasonForm;
  onChange: (next: PerItemReasonForm) => void;
  onCarePlusReasonAttempt: (lineId: string, reasonId: ReplacementReasonId) => void;
  carePlusVerified: boolean;
  supportPortal?: boolean;
  /** Watch product generation (e.g. TT5, TT6) for Care+/Plus+ labeling on gated reasons. */
  watchGeneration?: string;
};

export function ReasonFields({
  orderLineId,
  value,
  onChange,
  onCarePlusReasonAttempt,
  carePlusVerified,
  supportPortal,
  watchGeneration,
}: ReasonFieldsProps) {
  const safeValue = normalizePerItemReasonForm(value);

  const selectReason = (id: ReplacementReasonId) => {
    const def = REPLACEMENT_REASONS.find((r) => r.id === id);
    if (def?.carePlusOnly && !carePlusVerified) {
      onCarePlusReasonAttempt(orderLineId, id);
      return;
    }
    onChange({ ...emptyReasonForm(), reasonId: id });
  };

  if (!supportPortal) {
    return (
      <div className="rounded-sm border border-amber-200 bg-amber-50/50 p-2 text-xs text-amber-900">
        Use the replacement wizard to view guided issue options.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Issue for this item</legend>
        <div className="divide-y divide-slate-200">
          {REPLACEMENT_REASONS.map((r) => {
            const selected = safeValue.reasonId === r.id;
            const showExpanded = selected && (!r.carePlusOnly || carePlusVerified);
            const careSubtitle = r.carePlusOnly ? carePlanRequiredSubtitle(watchGeneration) : r.subtitle;
            const careHint = r.carePlusOnly ? carePlanRequirementShortHint(watchGeneration) : r.shortHint;
            return (
              <div key={r.id} className="py-2.5 first:pt-1">
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-0.5 transition-colors',
                    selected ? 'bg-support-tint/40 ring-1 ring-support-navy/12' : 'hover:bg-slate-50/60',
                  )}
                >
                  <input
                    type="radio"
                    name={`issue-${orderLineId}`}
                    className="mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-support-navy"
                    checked={selected}
                    onChange={() => selectReason(r.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-[13px] font-semibold leading-snug text-slate-900">{r.label}</span>
                    {careSubtitle ? (
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{careSubtitle}</span>
                    ) : null}
                    {careHint ? <p className="mt-1 text-[10px] leading-snug text-slate-500">{careHint}</p> : null}
                  </span>
                </label>
                {showExpanded ? (
                  <ExpandedReasonBody
                    def={r}
                    value={safeValue}
                    onChange={onChange}
                    carePlusVerified={r.carePlusOnly ? carePlusVerified : false}
                    watchGeneration={watchGeneration}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
