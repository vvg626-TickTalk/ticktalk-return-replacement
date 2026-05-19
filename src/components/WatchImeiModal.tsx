import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { isPlausibleImei, normalizeImei } from '@/features/replacement/eligibility';
import { validateWatchImeiForLine } from '@/features/serviceOrder/imeiValidation';
import { supportButtonPrimary, supportButtonSecondary, supportFieldMono, supportLabel } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

type Phase = 'enter' | 'unknown' | 'invalid';

export type WatchImeiModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called with normalized 15-digit IMEI */
  onConfirm: (imei: string) => void;
  /** When set, IMEI must exist on this order line and pass demo service rules */
  validation?: { orderId: string; lineId: string };
};

export function WatchImeiModal({ open, onClose, onConfirm, validation }: WatchImeiModalProps) {
  const [phase, setPhase] = useState<Phase>('enter');
  const [value, setValue] = useState('');

  const reset = () => {
    setPhase('enter');
    setValue('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const trimmed = normalizeImei(value);

  const submit = () => {
    const v = trimmed;
    if (!v) {
      setPhase('unknown');
      return;
    }
    if (!isPlausibleImei(v)) {
      setPhase('invalid');
      return;
    }
    if (validation) {
      const res = validateWatchImeiForLine({ rawImei: v, orderId: validation.orderId, lineId: validation.lineId });
      if (res === 'unknown') {
        setPhase('unknown');
        return;
      }
      if (res === 'invalid') {
        setPhase('invalid');
        return;
      }
    }
    onConfirm(v);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={phase === 'unknown' ? 'IMEI Unknown' : phase === 'invalid' ? 'Invalid IMEI' : 'Watch IMEI'}
      description={undefined}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {phase === 'enter' ? (
            <>
              <button type="button" className={supportButtonSecondary} onClick={handleClose}>
                Cancel
              </button>
              <button type="button" className={supportButtonPrimary} onClick={submit}>
                Next
              </button>
            </>
          ) : (
            <button
              type="button"
              className={supportButtonPrimary}
              onClick={() => {
                setPhase('enter');
              }}
            >
              Back
            </button>
          )}
        </div>
      }
    >
      {phase === 'enter' ? (
        <div className="space-y-4">
          <p className="text-[15px] leading-6 text-slate-600">
            You can find the IMEI on the packaging box or in Settings &gt; About Me on the watch. If your watch is
            already paired, open the Parent App and go to Parent Portal to view the IMEI.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="watch-imei-input" className={supportLabel}>
              Watch IMEI
            </label>
            <input
              id="watch-imei-input"
              className={cn(supportFieldMono, 'min-h-11')}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="15-digit IMEI"
            />
          </div>
        </div>
      ) : (
        <p className="text-[15px] leading-6 text-slate-600">
          {phase === 'unknown' ? 'Enter the IMEI on your watch or packaging to continue.' : 'Check the IMEI and try again.'}
        </p>
      )}
    </Modal>
  );
}
