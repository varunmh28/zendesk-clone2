import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Root home page.
 * - Authenticated + active org  → /orgs/[slug]/inbox
 * - Authenticated + no org      → /session-tasks/choose-organization
 * - Unauthenticated             → /sign-in
 *
 * Phase 6 will replace this with the animated marketing landing page.
 */
export default async function HomePage() {
  const { userId, orgSlug } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (orgSlug) {
    redirect(`/orgs/${orgSlug}/inbox`);
  }

  redirect("/session-tasks/choose-organization");
}
