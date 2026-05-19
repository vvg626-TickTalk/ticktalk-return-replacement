import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { rmas } from '@/mock-data';

export function AdminReplacementsPage() {
  const rows = rmas.filter((r) => r.kind === 'replacement');

  return (
    <div className="space-y-6">
      <PageHeader title="Replacements" description="Queue scaffold for inspection/backorder states." />

      <Card padding="sm" className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">RMA</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="rounded-2xl bg-brand-mist/40 ring-1 ring-brand-line">
                <td className="px-3 py-3 font-mono">
                  <Link className="font-semibold text-teal-900 hover:underline" to={`/admin/rma/${r.id}`}>
                    {r.code}
                  </Link>
                </td>
                <td className="px-3 py-3 font-mono text-slate-700">{r.orderId}</td>
                <td className="px-3 py-3 text-slate-700">{new Date(r.updatedAt).toLocaleString()}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
