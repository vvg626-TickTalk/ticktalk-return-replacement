import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Done"
        title="Request received"
        description="Mock confirmation. Real flow should bind RMA to the order in backend."
        actions={
          <Button variant="secondary" onClick={() => navigate('/account/requests')}>
            View requests
          </Button>
        }
      />

      <Card>
        <p className="text-sm font-semibold text-support-navy">RMA #TT-5099 (demo)</p>
        <p className="mt-2 text-sm text-slate-600">
          Next: email/SMS copy, operational follow-up, and inventory checks—see docs/user-flows.md.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Show modal sample
          </Button>
          <Button onClick={() => navigate('/service')}>Service hub</Button>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="RMA created"
        description="Your request is saved. We’ll follow up with next steps."
        primaryAction={{ label: 'OK', onClick: () => setOpen(false) }}
      />
    </div>
  );
}
