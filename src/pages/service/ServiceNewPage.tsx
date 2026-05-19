import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

export function ServiceNewPage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Policy"
        title="Replacement terms"
        description="Agree to continue. (Placeholder—legal copy to be wired later.)"
      />

      <Card>
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
            Keep paragraphs short on mobile. Use bullets for scanability.
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
            Clear next step after acceptance (channel selection / order lookup).
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
            Care+ verification is a gated sub-flow (stubbed elsewhere).
          </li>
        </ul>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-line bg-brand-mist/50 p-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-night focus:ring-brand-accent"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span className="text-sm font-semibold text-brand-ink">I understand and agree</span>
        </label>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" disabled={!accepted} onClick={() => navigate('/service/order-lookup')}>
            Continue
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="secondary"
            type="button"
            onClick={() => navigate('/service/login')}
          >
            Have an Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
