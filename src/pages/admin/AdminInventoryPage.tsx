import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { inventory, products } from '@/mock-data';

export function AdminInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Per-SKU rows from mock fixtures (not live stock)." />

      <Card padding="sm" className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">SKU label</th>
              <th className="px-3 py-2">Color</th>
              <th className="px-3 py-2 text-right">On hand</th>
              <th className="px-3 py-2">Waitlist</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((row) => {
              const p = products.find((x) => x.id === row.productId);
              return (
                <tr key={`${row.productId}-${row.color}`} className="bg-brand-mist/40 ring-1 ring-brand-line">
                  <td className="px-3 py-3">{p?.name ?? row.productId}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{row.skuLabel}</td>
                  <td className="px-3 py-3">{row.color}</td>
                  <td className="px-3 py-3 text-right font-semibold">{row.onHand}</td>
                  <td className="px-3 py-3">{row.allowWaitlist ? 'Yes' : 'No'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
