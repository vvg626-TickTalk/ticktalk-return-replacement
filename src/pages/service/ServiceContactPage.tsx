import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { ServiceToast } from '@/components/ServiceToast';
import { appendDemoContactMessage } from '@/features/serviceOrder/demoServiceLog';
import { useServiceOrderAccount } from '@/features/serviceOrder/ServiceOrderAccountContext';
import {
  SERVICE_ACCOUNT_FOOTNOTE,
  TICKTALK_WIRELESS_ACCOUNT_EMAIL_PLACEHOLDER,
  TICKTALK_WIRELESS_ACCOUNT_TITLE,
} from '@/features/serviceOrder/serviceAuthCopy';
import { supportModalTitle } from '@/ui/supportTheme';
import { fieldControl } from '@/ui/formControls';
import { cn } from '@/utils/cn';

export function ServiceContactPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useServiceOrderAccount();

  const defaultSubject = useMemo(() => {
    const s = searchParams.get('subject')?.trim();
    if (s) return s;
    const rma = searchParams.get('rma')?.trim();
    return rma ? `RMA #${rma}` : '';
  }, [searchParams]);

  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    setSubject(defaultSubject);
  }, [defaultSubject]);

  const accountEmail = profile?.email ?? '';
  const signedInLine = accountEmail;
  const showEmailField = !accountEmail;

  const onSend = () => {
    const rmaParam = searchParams.get('rma')?.trim() ?? '';
    const fromSubject = subject.replace(/^RMA\s*#?\s*/i, '').trim();
    appendDemoContactMessage({
      rmaCode: rmaParam || fromSubject || '—',
      subject: subject.trim(),
      body: message.trim(),
    });
    setToastOpen(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <ServiceToast
        open={toastOpen}
        message="Thanks — your message was saved locally (demo)."
        onClose={() => {
          setToastOpen(false);
          navigate(-1);
        }}
        durationMs={2500}
      />

      <div className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-8 shadow-xl shadow-slate-900/8 sm:px-10">
        <h1 className={supportModalTitle}>Contact Us</h1>
        <p className="mt-2 text-sm text-slate-600">
          Send a note to our service team. This form does not connect to a live inbox in the demo.
        </p>
        <p className="mt-2 text-xs leading-snug text-slate-500">{SERVICE_ACCOUNT_FOOTNOTE}</p>

        <div className="mt-6 space-y-4">
          <FormField id="ct-subject" label="Subject">
            <input
              id="ct-subject"
              className={fieldControl}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormField>
          {showEmailField ? (
            <FormField id="ct-email" label={TICKTALK_WIRELESS_ACCOUNT_TITLE}>
              <input
                id="ct-email"
                className={fieldControl}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder={TICKTALK_WIRELESS_ACCOUNT_EMAIL_PLACEHOLDER}
              />
            </FormField>
          ) : (
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-medium text-slate-800">{signedInLine}</span>
            </p>
          )}
          <FormField id="ct-msg" label="Message">
            <textarea
              id="ct-msg"
              className={cn(fieldControl, 'min-h-[8rem] resize-y')}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="button" className="w-full sm:w-auto" disabled={!subject.trim() || !message.trim()} onClick={onSend}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}