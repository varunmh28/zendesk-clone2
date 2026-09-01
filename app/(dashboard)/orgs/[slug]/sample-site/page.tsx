import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SampleSiteClient } from "./sample-site-client";

export default async function SampleSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/sign-in");
  }

  return <SampleSiteClient orgId={orgId} slug={slug} />;
}
