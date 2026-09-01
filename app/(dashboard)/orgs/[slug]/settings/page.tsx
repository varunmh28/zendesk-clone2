import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgSlug, orgRole } = await auth();

  const isAdmin = orgRole === "org:admin" || orgRole === "admin";
  if (!isAdmin) {
    redirect(`/orgs/${orgSlug || slug}/inbox`);
  }

  redirect(`/orgs/${orgSlug || slug}/settings/billing`);
}