import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BillingClientPage } from "./billing-client-page";

export default async function BillingPage({
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

  return <BillingClientPage />;
}
