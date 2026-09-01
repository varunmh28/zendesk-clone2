"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Users, Shield, User, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TeamClientPage() {
  const { orgId, orgSlug } = useAuth();
  const pathname = usePathname();

  const members = useQuery(api.users.listByOrgId, orgId ? { orgId } : "skip");
  const billingData = useQuery(api.billing.getBillingDetails, orgId ? { orgId } : "skip");

  const seatLimit = billingData?.seatLimit ?? 1;
  const isUnlimited = billingData?.plan === "enterprise" || seatLimit >= 999999;
  const seatsUsed = members?.length ?? 1;

  return (
    <div className="min-h-full bg-background p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Settings Navigation Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Workspace Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription, usage quotas, team seats, and invoices.
          </p>
        </div>

        <div className="flex border-b space-x-6 text-sm font-medium">
          <Link
            href={`/orgs/${orgSlug}/settings/billing`}
            className={cn(
              "pb-3 flex items-center gap-2 border-b-2 transition-colors",
              pathname?.endsWith("/billing")
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CreditCard className="h-4 w-4" />
            Billing & Plans
          </Link>
          <Link
            href={`/orgs/${orgSlug}/settings/team`}
            className={cn(
              "pb-3 flex items-center gap-2 border-b-2 transition-colors",
              pathname?.endsWith("/team")
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Team & Members
          </Link>
        </div>
      </div>

      {/* Team Seats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Team Seats</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {seatsUsed} / {isUnlimited ? "Unlimited" : `${seatLimit} Seats`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Synced automatically with your Clerk organization memberships.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Current Plan Tier</CardDescription>
            <CardTitle className="text-2xl font-bold capitalize">
              {billingData?.plan ?? "Free"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/orgs/${orgSlug}/settings/billing`}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              Manage Plan & Limits →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Member List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Team Members
          </CardTitle>
          <CardDescription>
            Members who have access to handle support conversations and manage workspace settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {members && members.length > 0 ? (
              members.map((member) => (
                <div key={member._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>{member.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{member.name || "Team Member"}</div>
                      {member.email && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "admin" ? "default" : "secondary"} className="capitalize text-xs">
                      {member.role === "admin" ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No team members loaded yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}