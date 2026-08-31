import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InboxClientPage } from "./inbox-client-page";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgId, orgSlug } = await auth();

  if (!orgId || orgSlug !== slug) {
    redirect("/dashboard");
  }

  return <InboxClientPage orgId={orgId} slug={slug} />;
}