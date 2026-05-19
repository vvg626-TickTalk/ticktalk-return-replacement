import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

const kpis = [
  { label: 'Open RMAs', value: '12', hint: 'mock' },
  { label: 'Awaiting reply', value: '3', hint: 'mock' },
  { label: 'Backorder', value: '2', hint: 'mock' },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Operations dashboard"
        description="Skeleton only. No analytics pipeline or auth."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className="mt-2 text-3xl font-semibold text-support-navy">{k.value}</p>
            <p className="mt-1 text-xs text-slate-600">{k.hint}</p>
          </Card>
        ))}
      </section>

      <Card>
        <p className="text-sm font-semibold text-support-navy">Quick links</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link className="font-semibold text-support-navy hover:underline" to="/admin/messages">
              Messages inbox
            </Link>
          </li>
          <li>
            <Link className="font-semibold text-support-navy hover:underline" to="/admin/inventory">
              Inventory overview
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
