import { useState } from 'react';
import amazonLogo from '@/assets/logos/amazon-logo.svg';
import bestbuyLogo from '@/assets/logos/bestbuy-logo.svg';
import ticktalkLogo from '@/assets/logos/ticktalk-logo.svg';
import walmartLogo from '@/assets/logos/walmart-logo.svg';
import type { ChannelId } from '@/pages/service/orderLookupFormat';
import { cn } from '@/utils/cn';

const CHANNEL_LOGO_SRC: Partial<Record<ChannelId, string>> = {
  myticktalk: ticktalkLogo,
  amazon: amazonLogo,
  walmart: walmartLogo,
  bestbuy: bestbuyLogo,
};

/** Matches SR-visible branding; image uses the same phrase for consistency. */
const CHANNEL_LOGO_ALT: Record<ChannelId, string> = {
  myticktalk: 'TickTalk',
  amazon: 'Amazon',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  tiktok: 'TikTok Shop',
};

export type OrderLookupChannelLogoProps = {
  channelId: ChannelId;
  /** Plain label used if the image fails to load (matches select + format.label). */
  label: string;
  className?: string;
};

export function OrderLookupChannelLogo({ channelId, label, className }: OrderLookupChannelLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = CHANNEL_LOGO_SRC[channelId];
  const alt = CHANNEL_LOGO_ALT[channelId];

  if (failed || !src) {
    return (
      <p
        className={cn(
          'text-center text-xs font-semibold uppercase tracking-wide text-slate-500',
          className,
        )}
      >
        {label}
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-3 sm:py-4', className)}>
      <img
        src={src}
        alt={alt}
        width={220}
        height={36}
        decoding="async"
        className="mx-auto h-[26px] w-auto max-w-[min(100%,280px)] object-contain object-center sm:h-8"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
