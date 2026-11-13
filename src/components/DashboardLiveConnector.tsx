"use client";

import type { SealedLiveQuery } from "@neon/realtime";
import { useLiveQuery } from "@neon/realtime-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DashboardLiveBundle,
  LiveCheckInRow,
  LiveRegistrationRow,
  LiveSupportMessageRow,
} from "@/lib/dashboard-snapshot";

export type LiveConnectionStatus =
  | "connecting"
  | "live"
  | "stale"
  | "error"
  | "closed";

export interface LiveDashboardState {
  registrations: readonly LiveRegistrationRow[];
  checkIns: readonly LiveCheckInRow[];
  supportMessages: readonly LiveSupportMessageRow[];
  status: LiveConnectionStatus;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

const LiveDashboardContext = createContext<LiveDashboardState | null>(null);

export function useLiveDashboardState(): LiveDashboardState | null {
  return useContext(LiveDashboardContext);
}

interface DashboardLiveConnectorProps {
  bundle: DashboardLiveBundle;
  children: ReactNode;
}

export function DashboardLiveConnector({
  bundle,
  children,
}: DashboardLiveConnectorProps) {
  const router = useRouter();
  const signedOutRef = useRef(false);

  // Keep the server-minted sealed queries in state so router.refresh()
  // does not re-subscribe or replace active live queries.
  const [registrationsSealed] = useState(
    () => bundle.registrations.sealedQuery,
  );
  const [checkInsSealed] = useState(() => bundle.checkIns.sealedQuery);
  const [supportSealed] = useState(
    () => bundle.supportMessages.sealedQuery,
  );

  const renewQuery = useCallback(
    async <Row,>(
      kind: "registrations" | "checkIns" | "supportMessages",
    ): Promise<SealedLiveQuery<Row>> => {
      if (signedOutRef.current) {
        throw new Error("Session administrateur expirée.");
      }

      const res = await fetch("/api/admin/realtime/seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });

      if (res.status === 401) {
        signedOutRef.current = true;
        router.push("/dashboard/login");
        throw new Error("Session administrateur expirée.");
      }

      if (!res.ok) {
        throw new Error(
          `Échec du renouvellement Neon Realtime (${kind}: HTTP ${res.status}).`,
        );
      }

      return (await res.json()) as SealedLiveQuery<Row>;
    },
    [router],
  );

  const refreshRegistrationsQuery = useCallback(
    () => renewQuery<LiveRegistrationRow>("registrations"),
    [renewQuery],
  );
  const refreshCheckInsQuery = useCallback(
    () => renewQuery<LiveCheckInRow>("checkIns"),
    [renewQuery],
  );
  const refreshSupportQuery = useCallback(
    () => renewQuery<LiveSupportMessageRow>("supportMessages"),
    [renewQuery],
  );

  const registrationsLive = useLiveQuery(registrationsSealed, {
    initialData: bundle.registrations.initialData,
    refreshQuery: refreshRegistrationsQuery,
  });

  const checkInsLive = useLiveQuery(checkInsSealed, {
    initialData: bundle.checkIns.initialData,
    refreshQuery: refreshCheckInsQuery,
  });

  const supportLive = useLiveQuery(supportSealed, {
    initialData: bundle.supportMessages.initialData,
    refreshQuery: refreshSupportQuery,
  });

  const status: LiveConnectionStatus = useMemo(() => {
    const statuses = [
      registrationsLive.status,
      checkInsLive.status,
      supportLive.status,
    ];
    if (statuses.includes("error")) return "error";
    if (statuses.includes("closed")) return "closed";
    if (statuses.every((s) => s === "live")) return "live";
    if (statuses.includes("stale")) return "stale";
    return "connecting";
  }, [registrationsLive.status, checkInsLive.status, supportLive.status]);

  const errorMessage =
    registrationsLive.error?.message ||
    checkInsLive.error?.message ||
    supportLive.error?.message ||
    null;

  const regRenew = registrationsLive.utils.renew;
  const checkInRenew = checkInsLive.utils.renew;
  const supportRenew = supportLive.utils.renew;

  const refresh = useCallback(async () => {
    const [nextRegs, nextChecks, nextSupport] = await Promise.all([
      refreshRegistrationsQuery(),
      refreshCheckInsQuery(),
      refreshSupportQuery(),
    ]);
    await Promise.all([
      regRenew(nextRegs),
      checkInRenew(nextChecks),
      supportRenew(nextSupport),
    ]);
  }, [
    refreshRegistrationsQuery,
    refreshCheckInsQuery,
    refreshSupportQuery,
    regRenew,
    checkInRenew,
    supportRenew,
  ]);

  const value = useMemo<LiveDashboardState>(
    () => ({
      registrations:
        registrationsLive.data ?? bundle.registrations.initialData,
      checkIns: checkInsLive.data ?? bundle.checkIns.initialData,
      supportMessages:
        supportLive.data ?? bundle.supportMessages.initialData,
      status,
      errorMessage,
      refresh,
    }),
    [
      registrationsLive.data,
      checkInsLive.data,
      supportLive.data,
      bundle.registrations.initialData,
      bundle.checkIns.initialData,
      bundle.supportMessages.initialData,
      status,
      errorMessage,
      refresh,
    ],
  );

  return (
    <LiveDashboardContext.Provider value={value}>
      {children}
    </LiveDashboardContext.Provider>
  );
}
