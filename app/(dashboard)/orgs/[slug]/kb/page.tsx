import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { KBClientPage } from "./kb-client-page";

export default async function KBPage({
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

  return <KBClientPage slug={slug} orgId={orgId} />;
}