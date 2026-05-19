import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

export function ServiceHubPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="After-sales"
        title="Service hub"
        description="Pick a path. Flows are skeletons—navigation and layout come first."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-brand-ink">First visit</p>
          <p className="mt-2 text-sm text-slate-600">
            Short CTAs: New here / Have an Account (see docs/copy-notes.md).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => navigate('/service/new')}>
              New here
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              onClick={() => navigate('/service/login')}
            >
              Have an Account
            </Button>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-brand-ink">Order tools</p>
          <p className="mt-2 text-sm text-slate-600">Lookup without logging in (demo stub).</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/service/order-lookup')}>
              Order lookup
            </Button>
          </div>
        </Card>
      </div>

      <Card className="bg-brand-mist/60">
        <p className="text-sm font-semibold text-brand-ink">More demos</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="ghost" className="ring-1 ring-brand-line" onClick={() => navigate('/service/trade-in')}>
            Trade-in
          </Button>
          <Button variant="ghost" className="ring-1 ring-brand-line" onClick={() => navigate('/service/preview')}>
            Preview
          </Button>
          <Button
            variant="ghost"
            className="ring-1 ring-brand-line"
            onClick={() => navigate('/service/confirmation')}
          >
            Confirmation
          </Button>
        </div>
      </Card>
    </div>
  );
}
