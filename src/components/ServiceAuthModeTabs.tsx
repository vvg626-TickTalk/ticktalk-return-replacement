import { cn } from '@/utils/cn';

export function ServiceAuthModeTabs({
  mode,
  onModeChange,
}: {
  mode: 'email' | 'phone';
  onModeChange: (m: 'email' | 'phone') => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-slate-100/90 p-1 ring-1 ring-slate-200/80">
      {(['email', 'phone'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onModeChange(m)}
          className={cn(
            'min-h-11 flex-1 rounded-full px-3 text-sm font-semibold transition-colors',
            mode === m
              ? 'bg-support-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-support-navy',
          )}
        >
          {m === 'email' ? 'Email' : 'Phone'}
        </button>
      ))}
    </div>
  );
}
