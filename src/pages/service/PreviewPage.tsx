import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ProductCard } from '@/components/ProductCard';
import { getProductById } from '@/mock-data';

export function PreviewPage() {
  const navigate = useNavigate();
  const product = getProductById('prod-tt-watch-5');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="Preview"
        description="Confirms items, reasons, and ship-from details. Edits should feel safe and reversible."
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card>
        <p className="text-sm font-semibold text-support-navy">Items</p>
        <div className="mt-3 space-y-3">
          {product ? <ProductCard product={product} meta="Replacement · mock" right="Remove (later)" /> : null}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-support-navy">Ship-from / contact</p>
        <p className="mt-2 text-sm text-slate-600">Placeholder fields. Phone normalization (strip symbols) is a backend+UI task.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-line bg-brand-mist/40 p-3 text-sm text-slate-700">
            Name · Ada Lovelace
          </div>
          <div className="rounded-2xl border border-brand-line bg-brand-mist/40 p-3 text-sm text-slate-700">
            Email · ada@example.com
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => navigate('/service/confirmation')}>
          Submit (mock)
        </Button>
        <Button onClick={() => navigate('/service/confirmation')}>Submit</Button>
      </div>
    </div>
  );
}
