import type { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { supportButtonPrimary } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

export type AppShellMode = 'marketing' | 'service' | 'account' | 'admin';

type NavItem = { to: string; label: string; end?: boolean };

const serviceNav: NavItem[] = [
  { to: '/service', label: 'Overview', end: true },
  { to: '/service/new', label: 'New here' },
  { to: '/service/login', label: 'Sign in' },
  { to: '/service/order-lookup', label: 'Order lookup' },
];

const accountNav: NavItem[] = [{ to: '/account/requests', label: 'My requests', end: true }];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/returns', label: 'Returns' },
  { to: '/admin/replacements', label: 'Replacements' },
  { to: '/admin/trade-ins', label: 'Trade-ins' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/messages', label: 'Messages' },
];

function TickTalkMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl bg-support-navy text-xs font-black tracking-tight text-white',
        className,
      )}
      aria-hidden
    >
      TT
    </div>
  );
}

function HeaderLink({
  item,
}: {
  item: NavItem;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-white text-support-navy ring-1 ring-brand-line shadow-sm'
            : 'text-slate-700 hover:bg-black/[0.04]',
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

function MarketingTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-mist/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <TickTalkMark />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-support-navy">TickTalk</p>
            <p className="text-xs text-slate-600">Service portal (demo)</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/service" className={cn(supportButtonPrimary, 'text-sm')}>
            Start a request
          </Link>
        </div>
      </div>
    </header>
  );
}

function ShellTopBar({
  mode,
  title,
  rightSlot,
}: {
  mode: Exclude<AppShellMode, 'marketing'>;
  title?: string;
  rightSlot?: ReactNode;
}) {
  const nav = mode === 'admin' ? adminNav : mode === 'account' ? accountNav : serviceNav;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-mist/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <Link to={mode === 'admin' ? '/admin' : '/service'} className="flex items-center gap-3">
              <TickTalkMark />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-support-navy">
                  {mode === 'admin' ? 'TickTalk Admin' : 'TickTalk Service'}
                </p>
                <p className="text-xs text-slate-600">
                  {title ?? (mode === 'admin' ? 'Operations preview' : 'After-sales (demo)')}
                </p>
              </div>
            </Link>
            {mode !== 'admin' ? (
              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-brand-line hover:bg-white lg:hidden"
              >
                Staff
              </Link>
            ) : (
              <Link
                to="/service"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-brand-line hover:bg-white lg:hidden"
              >
                Customer
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <nav className="flex flex-wrap gap-1 overflow-x-auto pb-1 lg:pb-0">
              {nav.map((item) => (
                <HeaderLink key={item.to} item={item} />
              ))}
            </nav>
            {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-brand-line bg-white lg:block">
      <div className="sticky top-[4.5rem] space-y-2 px-3 py-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Navigate
        </p>
        <div className="space-y-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'block rounded-xl px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-brand-mist text-support-navy ring-1 ring-brand-line'
                    : 'text-slate-700 hover:bg-black/[0.04]',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="rounded-2xl bg-brand-mist p-3 text-xs text-slate-600">
          <p className="font-semibold text-support-navy">Demo data only</p>
          <p className="mt-1 leading-relaxed">No real orders, codes, or inventory.</p>
        </div>
      </div>
    </aside>
  );
}

export type AppShellProps = {
  mode: AppShellMode;
  title?: string;
  rightSlot?: ReactNode;
  /** When true (marketing), render `children` instead of an Outlet */
  children?: ReactNode;
};

/** Shared chrome for customer/service/account/admin route groups. */
export function AppShell({ mode, title, rightSlot, children }: AppShellProps) {
  const body = children ?? <Outlet />;

  if (mode === 'marketing') {
    return (
      <div className="min-h-dvh bg-brand-mist">
        <MarketingTopBar />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-5 sm:py-10">{body}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-brand-mist">
      <ShellTopBar mode={mode} title={title} rightSlot={rightSlot} />

      {mode === 'admin' ? (
        <div className="mx-auto flex w-full max-w-7xl">
          <AdminSidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-5 sm:py-10">{body}</main>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-5 sm:py-10 lg:max-w-5xl">{body}</main>
      )}
    </div>
  );
}
