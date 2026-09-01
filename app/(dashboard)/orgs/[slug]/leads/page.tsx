import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LeadsClientPage } from "./leads-client-page";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgId, orgSlug, orgRole } = await auth();

  if (!orgId || orgSlug !== slug) {
    redirect("/dashboard");
  }

  return <LeadsClientPage slug={slug} orgId={orgId} />;
}