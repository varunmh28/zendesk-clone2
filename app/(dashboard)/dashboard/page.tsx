import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  const { orgSlug } = await auth();
  if (orgSlug) redirect(`/orgs/${orgSlug}/inbox`);
  redirect("/session-tasks/choose-organization");
}