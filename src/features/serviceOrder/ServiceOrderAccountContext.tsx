import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RegisteredServiceRma, ServiceOrderProfile } from '@/features/serviceOrder/types';

const LS_PROFILE = 'tt_service_order_profile_v1';
const LS_RMAS = 'tt_service_registered_rmas_v1';

type Ctx = {
  profile: ServiceOrderProfile | null;
  isAuthenticated: boolean;
  registeredRmas: RegisteredServiceRma[];
  signIn: (profile: ServiceOrderProfile) => void;
  signOut: () => void;
  addRegisteredRma: (rma: RegisteredServiceRma) => void;
  updateRegisteredRma: (localId: string, patch: Partial<RegisteredServiceRma>) => void;
};

const ServiceOrderAccountContext = createContext<Ctx | null>(null);

function loadProfile(): ServiceOrderProfile | null {
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as ServiceOrderProfile;
  } catch {
    return null;
  }
}

function loadRmas(): RegisteredServiceRma[] {
  try {
    const raw = localStorage.getItem(LS_RMAS);
    if (!raw) return [];
    return JSON.parse(raw) as RegisteredServiceRma[];
  } catch {
    return [];
  }
}

function saveProfile(p: ServiceOrderProfile | null) {
  if (!p) localStorage.removeItem(LS_PROFILE);
  else localStorage.setItem(LS_PROFILE, JSON.stringify(p));
}

function saveRmas(list: RegisteredServiceRma[]) {
  localStorage.setItem(LS_RMAS, JSON.stringify(list));
}

export function ServiceOrderAccountProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ServiceOrderProfile | null>(() => loadProfile());
  const [registeredRmas, setRegisteredRmas] = useState<RegisteredServiceRma[]>(() => loadRmas());

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveRmas(registeredRmas);
  }, [registeredRmas]);

  const signIn = useCallback((p: ServiceOrderProfile) => {
    setProfile(p);
  }, []);

  const signOut = useCallback(() => {
    setProfile(null);
  }, []);

  const addRegisteredRma = useCallback((rma: RegisteredServiceRma) => {
    setRegisteredRmas((prev) => {
      if (prev.some((r) => r.localId === rma.localId || r.code === rma.code)) return prev;
      return [rma, ...prev];
    });
  }, []);

  const updateRegisteredRma = useCallback((localId: string, patch: Partial<RegisteredServiceRma>) => {
    setRegisteredRmas((prev) => prev.map((r) => (r.localId === localId ? { ...r, ...patch } : r)));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isAuthenticated: profile !== null,
      registeredRmas,
      signIn,
      signOut,
      addRegisteredRma,
      updateRegisteredRma,
    }),
    [profile, registeredRmas, signIn, signOut, addRegisteredRma, updateRegisteredRma],
  );

  return <ServiceOrderAccountContext.Provider value={value}>{children}</ServiceOrderAccountContext.Provider>;
}

export function useServiceOrderAccount(): Ctx {
  const c = useContext(ServiceOrderAccountContext);
  if (!c) throw new Error('useServiceOrderAccount must be used within ServiceOrderAccountProvider');
  return c;
}
