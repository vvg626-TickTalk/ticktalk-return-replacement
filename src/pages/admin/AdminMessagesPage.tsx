import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { listMessagesNewestFirst } from '@/mock-data';

export function AdminMessagesPage() {
  const rows = listMessagesNewestFirst();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Prototype list sorted newest-first. Threading model is TBD (see docs/open-questions.md)."
      />

      <div className="space-y-3">
        {rows.map((m) => (
          <Card key={m.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-brand-ink">{m.subject}</p>
                <p className="text-sm text-slate-700">{m.preview}</p>
                <p className="text-xs text-slate-600">
                  {new Date(m.sentAt).toLocaleString()} · {m.direction}
                </p>
              </div>
              <Link className="text-sm font-semibold text-teal-900 hover:underline" to={`/admin/rma/${m.rmaId}`}>
                Open RMA
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
