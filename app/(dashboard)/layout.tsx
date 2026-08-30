import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { orgId } = await auth();
  if (!orgId) redirect("/session-tasks/choose-organization");
  return <DashboardShell>{children}</DashboardShell>;
}