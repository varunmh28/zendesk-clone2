import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgId, orgSlug } = await auth();

  if (!orgId || orgSlug !== slug) {
    redirect("/dashboard");
  }

  return <AnalyticsView orgId={orgId} />;
}
