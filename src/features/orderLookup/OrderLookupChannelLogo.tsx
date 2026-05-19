import { useState } from 'react';
import type { ChannelId } from '@/pages/service/orderLookupFormat';
import { cn } from '@/utils/cn';

const CHANNEL_LOGO_SRC: Record<ChannelId, string> = {
  myticktalk: '/channel-logos/ticktalk.svg',
  amazon: '/channel-logos/amazon.svg',
  walmart: '/channel-logos/walmart.svg',
  bestbuy: '/channel-logos/bestbuy.svg',
  tiktok: '/channel-logos/tiktok.svg',
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
        width={200}
        height={36}
        decoding="async"
        className="mx-auto h-6 w-auto max-w-[min(100%,280px)] object-contain object-center sm:h-8 md:h-9"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
