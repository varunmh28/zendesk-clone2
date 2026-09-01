"use client";

import { OrganizationSwitcher, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  MessageSquare,
  Globe,
  BookOpen,
  Users,
  Sliders,
  Settings,
  BarChart3,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const allNavItems = [
  { label: "Inbox",          href: "inbox",       icon: MessageSquare, adminOnly: false },
  { label: "Sample Site",    href: "sample-site", icon: Globe,         adminOnly: false },
  { label: "Knowledge Base", href: "kb",          icon: BookOpen,      adminOnly: true  },
  { label: "Leads",          href: "leads",       icon: Users,         adminOnly: true  },
  { label: "Customizer",     href: "customizer",  icon: Sliders,       adminOnly: true  },
  { label: "Analytics",      href: "analytics",   icon: BarChart3,     adminOnly: true  },
  { label: "Settings",       href: "settings",    icon: Settings,      adminOnly: true  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { orgSlug, orgRole } = useAuth();
  const pathname = usePathname();
  const base = `/orgs/${orgSlug}`;
  const isAdmin = orgRole === "org:admin" || orgRole === "admin";

  const navItems = allNavItems.filter((item) => isAdmin || !item.adminOnly);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 border-r bg-card">
        {/* Org switcher */}
        <div className="flex items-center px-4 py-3 border-b h-14">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                  "w-full justify-start text-sm font-medium",
              },
            }}
          />
        </div>

        {/* Role indicator */}
        <div className="px-4 py-2 border-b bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">Your Role</span>
          <Badge variant={isAdmin ? "default" : "secondary"} className="text-[10px] px-2 py-0 h-4 capitalize font-medium flex items-center gap-1">
            {isAdmin ? (
              <Shield className="h-2.5 w-2.5 text-primary-foreground" />
            ) : (
              <User className="h-2.5 w-2.5 text-muted-foreground" />
            )}
            {isAdmin ? "Admin" : "Member"}
          </Badge>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const fullHref = `${base}/${href}`;
            const isActive = pathname?.startsWith(fullHref);
            return (
              <Link
                key={href}
                href={fullHref}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t px-4 py-3">
          <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
