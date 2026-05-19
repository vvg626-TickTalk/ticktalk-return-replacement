import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { tradeInRequests } from '@/mock-data';

export function AdminTradeInsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Trade-ins" description="Quoted/applied states from checkout mock data." />

      <div className="space-y-3">
        {tradeInRequests.map((t) => (
          <Card key={t.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-ink">
                  {t.brand} {t.imei ? <span className="font-mono text-slate-700">· {t.imei}</span> : null}
                </p>
                <p className="text-xs text-slate-600">
                  State: <span className="font-semibold">{t.state}</span>
                  {t.orderId ? <span className="font-mono"> · {t.orderId}</span> : null}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  t.quotedValueCents / 100,
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
