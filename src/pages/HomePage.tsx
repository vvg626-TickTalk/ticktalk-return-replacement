import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-brand-line bg-white p-8 shadow-card sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-support-navy/80">
          TickTalk Service Portal Demo
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-support-navy sm:text-4xl">
          Returns, replacements, and trade-in—without the clutter.
        </h1>
        <p className="mt-4 max-w-prose text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          This is a UI scaffold with mock data only. Short copy, mobile-first spacing, and clear next steps.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" onClick={() => navigate('/service')}>
            Start a request
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/account/requests')}>
            My requests
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-support-navy">Customer portal</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Order lookup, sign-in, and service wizards are stubbed for navigation and layout.
          </p>
          <div className="mt-4">
            <Link to="/service" className="text-sm font-semibold text-support-navy hover:underline">
              Open /service
            </Link>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-support-navy">Account</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Request history and per-RMA detail pages use reusable cards and status badges.
          </p>
          <div className="mt-4">
            <Link
              to="/account/requests"
              className="text-sm font-semibold text-support-navy hover:underline"
            >
              Open /account/requests
            </Link>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-support-navy">Admin preview</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            A separate chrome with sidebar links—still mock-only, no integrations.
          </p>
          <div className="mt-4">
            <Link to="/admin" className="text-sm font-semibold text-support-navy hover:underline">
              Open /admin
            </Link>
          </div>
        </Card>
      </section>

      <Card className="border-dashed">
        <p className="text-sm font-semibold text-support-navy">Try mock IDs</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>
            <span className="font-semibold">In transit (not received):</span>{' '}
            <Link className="font-mono text-support-navy hover:underline" to="/service/order/ord-103">
              ord-103
            </Link>
          </li>
          <li>
            <span className="font-semibold">Order:</span>{' '}
            <Link className="font-mono text-support-navy hover:underline" to="/service/order/ord-101">
              ord-101
            </Link>
          </li>
          <li>
            <span className="font-semibold">Trade-in eligible (OOW, no Care+):</span>{' '}
            <Link className="font-mono text-support-navy hover:underline" to="/service/order/ord-201">
              ord-201
            </Link>
          </li>
          <li>
            <span className="font-semibold">Trade-in demo (Care / web):</span>{' '}
            <Link className="font-mono text-support-navy hover:underline" to="/trade-in/app-entry">
              /trade-in/app-entry
            </Link>
          </li>
          <li>
            <span className="font-semibold">RMA:</span>{' '}
            <Link className="font-mono text-support-navy hover:underline" to="/account/rma/rma-5002">
              rma-5002
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
