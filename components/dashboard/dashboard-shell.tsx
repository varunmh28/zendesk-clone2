"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  MessageSquare,
  BookOpen,
  Users,
  Sliders,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Inbox",          href: "inbox",      icon: MessageSquare },
  { label: "Knowledge Base", href: "kb",         icon: BookOpen      },
  { label: "Leads",          href: "leads",      icon: Users         },
  { label: "Customizer",     href: "customizer", icon: Sliders       },
  { label: "Analytics",      href: "analytics",  icon: BarChart3     },
  { label: "Settings",       href: "settings",   icon: Settings      },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { orgSlug } = useAuth();
  const pathname = usePathname();
  const base = `/orgs/${orgSlug}`;

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
