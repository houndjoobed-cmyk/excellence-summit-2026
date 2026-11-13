import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { getAdminSession } from "@/lib/auth";
import { loadDashboardLiveBundle } from "@/lib/realtime-queries";
import { getPublicRealtimeUrl } from "@/lib/realtime-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login");
  }

  const [liveBundle, realtimeUrl] = await Promise.all([
    loadDashboardLiveBundle(),
    Promise.resolve(getPublicRealtimeUrl()),
  ]);

  return (
    <DashboardClient
      realtimeUrl={realtimeUrl}
      initialLiveBundle={liveBundle}
    />
  );
}

