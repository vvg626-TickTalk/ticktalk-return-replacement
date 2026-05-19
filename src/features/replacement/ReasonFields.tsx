import type { ReplacementReasonDef, ReplacementReasonId } from '@/features/replacement/replacementReasons';
import { REPLACEMENT_REASONS } from '@/features/replacement/replacementReasons';
import type { MockUploadItem, PerItemReasonForm } from '@/features/replacement/reasonValidation';
import { emptyReasonForm, normalizePerItemReasonForm } from '@/features/replacement/reasonValidation';
import { supportTextarea } from '@/ui/supportPortalLayout';
import { cn } from '@/utils/cn';

const MAX_UPLOADS = 3;

function createMockUpload(index: number): MockUploadItem {
  return { id: `demo-${index}-${Math.random().toString(36).slice(2, 7)}`, label: String(index) };
}

function ProgressiveUploadBlock({
  value,
  onChange,
  primaryCta,
  addAnotherLabel = 'Add another file',
  helper,
  isVideo,
}: {
  value: PerItemReasonForm;
  onChange: (next: PerItemReasonForm) => void;
  primaryCta: string;
  addAnotherLabel?: string;
  helper?: string;
  isVideo?: boolean;
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

  return (
    <div className="mt-2 space-y-2">
      {helper ? (
        <p className="text-[11px] leading-snug text-slate-500">{helper}</p>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        {value.mockUploads.map((u, i) => (
          <div
            key={u.id}
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-slate-300 bg-slate-100 text-[10px] font-medium text-slate-600"
          >
            <span className="sr-only">
              {isVideo ? 'Video' : 'Photo'} {u.label}
            </span>
            <span aria-hidden className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
              {isVideo ? 'Vid' : 'Img'}
            </span>
            <button
              type="button"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] leading-none text-slate-600 shadow-sm"
              aria-label="Remove"
              onClick={() => remove(i)}
            >
              ×
            </button>
          </div>
        ))}
        {value.mockUploads.length < MAX_UPLOADS ? (
          <button
            type="button"
            onClick={add}
            className="min-h-10 rounded-sm border border-dashed border-slate-300 bg-white px-3 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            {value.mockUploads.length === 0 ? primaryCta : addAnotherLabel}
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
}: {
  def: ReplacementReasonDef;
  value: PerItemReasonForm;
  onChange: (next: PerItemReasonForm) => void;
}) {
  const patch = (partial: Partial<PerItemReasonForm>) => onChange({ ...value, ...partial });

  const showDesc = def.description.mode !== 'hidden';
  const up = def.upload;

  const progressive = (primary: string, helper?: string, isVideo?: boolean) => (
    <ProgressiveUploadBlock
      value={value}
      onChange={onChange}
      primaryCta={primary}
      helper={helper}
      isVideo={isVideo}
    />
  );

  return (
    <div className="mt-2 space-y-3 border-l-2 border-slate-200 pl-3">
      {def.policyNote ? (
        <p className="text-[11px] leading-snug text-slate-600">{def.policyNote}</p>
      ) : null}
      {def.introLines?.length ? (
        <div className="space-y-1">
          {def.introLines.map((line) => (
            <p key={line} className="text-[11px] leading-snug text-slate-700">
              {line}
            </p>
          ))}
        </div>
      ) : null}
      {showDesc ? (
        <div className="space-y-1">
          {def.whenStartedLabel ? (
            <p className="text-[10px] font-medium text-slate-500">
              {def.whenStartedLabel}{' '}
              <span className="font-normal text-slate-400">(Optional)</span>
            </p>
          ) : null}
          <label htmlFor={`desc-${def.id}`} className="sr-only">
            {def.description.placeholder}
          </label>
          <textarea
            id={`desc-${def.id}`}
            rows={3}
            placeholder={def.description.placeholder}
            value={value.description}
            onChange={(e) => patch({ description: e.target.value })}
            className={cn(
              supportTextarea,
              'min-h-[4.5rem] py-3 text-sm placeholder:text-slate-400',
            )}
          />
        </div>
      ) : null}

      {up.type === 'none' ? null : up.type === 'behind_link' ? (
        <div className="space-y-2">
          {!value.uploadSectionOpen ? (
            <button
              type="button"
              onClick={() => patch({ uploadSectionOpen: true })}
              className="text-left text-[11px] font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              {up.linkText ?? 'Add photos'}
            </button>
          ) : (
            progressive(up.primaryCta ?? 'Upload photo', up.helper, false)
          )}
        </div>
      ) : (
        progressive(up.primaryCta ?? 'Upload photo', up.helper, def.id === 'hardware_io')
      )}

      {def.footerDisclaimer ? (
        <p className="text-[10px] leading-snug text-slate-500">{def.footerDisclaimer}</p>
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
};

export function ReasonFields({
  orderLineId,
  value,
  onChange,
  onCarePlusReasonAttempt,
  carePlusVerified,
  supportPortal,
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
    <div className="space-y-1">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Issue for this item</legend>
        <div className="space-y-0 divide-y divide-slate-200">
          {REPLACEMENT_REASONS.map((r) => {
            const selected = safeValue.reasonId === r.id;
            return (
              <div key={r.id} className="py-2 first:pt-0">
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-sm p-1.5 transition-colors',
                    selected ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50/80',
                  )}
                >
                  <input
                    type="radio"
                    name={`issue-${orderLineId}`}
                    className="mt-1 h-3.5 w-3.5 shrink-0 border-slate-300 text-blue-600"
                    checked={selected}
                    onChange={() => selectReason(r.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-xs font-medium leading-snug text-slate-900">{r.label}</span>
                    {r.subtitle ? (
                      <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">{r.subtitle}</span>
                    ) : null}
                    {r.carePlusOnly ? (
                      <span className="mt-1 inline-flex sm:hidden">
                        <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 ring-1 ring-slate-200/90">
                          Care+ Required
                        </span>
                      </span>
                    ) : null}
                    {r.carePlusOnly ? (
                      <span className="mt-1 hidden sm:inline-flex">
                        <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/90">
                          TickTalk Care+ Required
                        </span>
                      </span>
                    ) : null}
                  </span>
                </label>
                {selected ? <ExpandedReasonBody def={r} value={safeValue} onChange={onChange} /> : null}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
