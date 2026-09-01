import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgId, orgSlug, orgRole } = await auth();

  if (!orgId || orgSlug !== slug) {
    redirect("/dashboard");
  }

  const isAdmin = orgRole === "org:admin" || orgRole === "admin";
  if (!isAdmin) {
    redirect(`/orgs/${slug}/inbox`);
  }

  return <AnalyticsView orgId={orgId} />;
}
