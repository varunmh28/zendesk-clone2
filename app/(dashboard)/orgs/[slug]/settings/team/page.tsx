import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TeamClientPage } from "./team-client-page";

export default async function TeamPage({
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

  return <TeamClientPage />;
}