/**
 * Product-era naming: TT6 uses TickTalk Care+; TT5 / legacy watches use Plus+ Plan (demo copy).
 */

export function isTickTalkCarePlusEra(generation: string | undefined): boolean {
  return generation?.trim().toUpperCase() === 'TT6';
}

/** Muted subtitle directly under issue title (radio list). */
export function carePlanRequiredSubtitle(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation) ? '(TickTalk Care+ required)' : '(Plus+ Plan required)';
}

/** Small helper under subtitle for Care+/Plus-gated reasons. */
export function carePlanRequirementShortHint(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation)
    ? 'An active TickTalk Care+ plan is required on this device.'
    : 'An active Plus+ Plan is required on this device.';
}

/** Badge after successful verification (expanded issue body). */
export function carePlanCoveredBadgeLine(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation)
    ? 'Covered under your active TickTalk Care+ plan.'
    : 'Covered under your active Plus+ plan.';
}

export function carePlanGateModalTitle(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation) ? 'TickTalk Care+ Required' : 'Plus+ Plan Required';
}

export function carePlanGateModalDescription(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation)
    ? 'This issue needs an active TickTalk Care+ plan on this device.'
    : 'This issue needs an active Plus+ Plan on this device.';
}

export function carePlanNotAvailableTitle(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation) ? 'TickTalk Care+ Not Available' : 'Plus+ Plan Not Available';
}

export function carePlanNotAvailableBody(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation)
    ? 'This device does not have active TickTalk Care+ coverage for this issue.'
    : 'This device does not have active Plus+ Plan coverage for this issue.';
}

export function carePlanVerifyFormHeading(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation) ? 'TickTalk Care+' : 'Plus+ Plan';
}

export function carePlanVerifyFormDeviceBlurb(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation)
    ? 'TickTalk 6. We text a code to the watch number on file.'
    : 'TickTalk 5 and earlier. We text a code to the watch number on file.';
}

/** Gate modal primary action label. */
export function carePlanGateVerifyCtaLabel(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation) ? 'Verify TickTalk Care+' : 'Verify Plus+ Plan';
}

/** Full-screen verify step modal title. */
export function carePlanVerifyModalTitle(generation: string | undefined): string {
  return isTickTalkCarePlusEra(generation) ? 'Verify TickTalk Care+' : 'Verify Plus+ Plan';
}
