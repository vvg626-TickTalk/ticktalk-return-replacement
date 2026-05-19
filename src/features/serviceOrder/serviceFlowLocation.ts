/** `useLocation().state` for service flows started from order detail. */
export type ServiceOrderPrefill = {
  lineId: string;
  imei: string;
};

export type ServiceFlowLocationState = {
  prefillReplace?: ServiceOrderPrefill;
  prefillReturn?: ServiceOrderPrefill;
};
