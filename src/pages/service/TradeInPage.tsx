import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { TRADE_IN_ADD_ITEMS_EMPTY_HELPER } from '@/features/serviceFlowItemControls';

export function TradeInPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trade-in"
        title="Trade-in (preview)"
        description="Two common entry points: Care/App prompt and checkout module. This page is a neutral stub."
        actions={
          <Button variant="secondary" onClick={() => navigate('/service')}>
            Back
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-brand-ink">What you’ll see next</p>
          <p className="mt-3 text-sm leading-snug text-slate-600">{TRADE_IN_ADD_ITEMS_EMPTY_HELPER}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>Estimated value and old device name</li>
            <li>Short steps + policy link</li>
            <li>Agree returns you to purchase context</li>
          </ul>
        </Card>
        <Card className="bg-brand-mist/50">
          <p className="text-sm font-semibold text-brand-ink">Cart coupling</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Trade-in count should track new watch quantity (open question in docs).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" disabled>
              Join now
            </Button>
            <Button disabled>Agree</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
