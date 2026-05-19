const KEY = 'tt_account_requests_open_service_tab_v1';

/** Call when a service request was just added so the next /account/requests visit opens the Service Orders tab. */
export function preferServiceOrdersTabOnNextAccountRequestsVisit() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

export function consumePreferServiceOrdersTab(): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== '1') return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
