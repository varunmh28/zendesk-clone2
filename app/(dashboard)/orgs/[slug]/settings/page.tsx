import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
export default async function SettingsPage() {
  const { orgSlug } = await auth();
  redirect(`/orgs/${orgSlug}/settings/billing`);
}