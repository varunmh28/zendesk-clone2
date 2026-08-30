import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
type Props = { children: ReactNode; params: Promise<{ slug: string }> };
export default async function OrgLayout({ children, params }: Props) {
  const { slug } = await params;
  const { orgSlug } = await auth();
  if (orgSlug !== slug) redirect("/dashboard");
  return <>{children}</>;
}