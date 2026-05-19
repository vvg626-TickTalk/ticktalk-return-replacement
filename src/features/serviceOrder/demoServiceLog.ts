import type { RmaStatus } from '@/types/models';

const RMA_LS = 'tt_demo_rma_overrides_v1';
const CONTACT_LS = 'tt_demo_contact_messages_v1';

type RmaOverrides = Record<string, { status?: RmaStatus }>;

export type DemoContactMessage = {
  id: string;
  rmaCode: string;
  subject: string;
  body: string;
  sentAt: string;
};

function readRmaOverrides(): RmaOverrides {
  try {
    const raw = localStorage.getItem(RMA_LS);
    if (!raw) return {};
    return JSON.parse(raw) as RmaOverrides;
  } catch {
    return {};
  }
}

function writeRmaOverrides(next: RmaOverrides) {
  localStorage.setItem(RMA_LS, JSON.stringify(next));
}

export function getDemoRmaStatusOverride(rmaId: string): RmaStatus | undefined {
  return readRmaOverrides()[rmaId]?.status;
}

export function setDemoRmaStatusOverride(rmaId: string, status: RmaStatus) {
  const cur = readRmaOverrides();
  writeRmaOverrides({ ...cur, [rmaId]: { ...cur[rmaId], status } });
}

function readContact(): DemoContactMessage[] {
  try {
    const raw = localStorage.getItem(CONTACT_LS);
    if (!raw) return [];
    return JSON.parse(raw) as DemoContactMessage[];
  } catch {
    return [];
  }
}

function writeContact(rows: DemoContactMessage[]) {
  localStorage.setItem(CONTACT_LS, JSON.stringify(rows));
}

export function appendDemoContactMessage(entry: Omit<DemoContactMessage, 'id' | 'sentAt'> & { sentAt?: string }) {
  const row: DemoContactMessage = {
    id: `ct-${Date.now()}`,
    sentAt: entry.sentAt ?? new Date().toISOString(),
    rmaCode: entry.rmaCode,
    subject: entry.subject,
    body: entry.body,
  };
  writeContact([row, ...readContact()]);
}

export function listDemoContactMessagesForRma(rmaCode: string): DemoContactMessage[] {
  const c = rmaCode.trim();
  return readContact().filter((m) => m.rmaCode === c);
}
