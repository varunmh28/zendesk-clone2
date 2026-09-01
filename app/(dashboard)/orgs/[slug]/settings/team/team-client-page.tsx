"use client";

import { useState } from "react";
import { useAuth, Show } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Users,
  Shield,
  User,
  Mail,
  UserPlus,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TeamClientPage() {
  const { orgId, orgSlug } = useAuth();
  const pathname = usePathname();

  const members = useQuery(api.users.listByOrgId, orgId ? { orgId } : "skip");
  const billingData = useQuery(api.billing.getBillingDetails, orgId ? { orgId } : "skip");

  const seatLimit = billingData?.seatLimit ?? 1;
  const isUnlimited = billingData?.plan === "enterprise" || seatLimit >= 999999;
  const seatsUsed = members?.length ?? 1;
  const isSeatLimitReached = !isUnlimited && seatsUsed >= seatLimit;

  // Invite dialog state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteStatus(`Invitation prepared for ${inviteEmail} as ${inviteRole}. Please confirm through your Clerk Organization settings.`);
  };

  return (
    <div className="min-h-full bg-background p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Settings Navigation Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Workspace Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your subscription, usage quotas, team seats, and invoices.
            </p>
          </div>

          <Button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
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

      {/* Seat Limit Warning Banner when cap is reached */}
      {isSeatLimitReached && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">Seat Limit Reached ({seatsUsed}/{seatLimit} Seats Allocated)</h4>
              <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                Your current {billingData?.plan ? billingData.plan.toUpperCase() : "FREE"} plan includes {seatLimit} seat. Upgrade to Pro or Enterprise to add more team members.
              </p>
            </div>
          </div>
          <Show when="signed-in">
            <CheckoutButton
              planId="pro"
              planPeriod="month"
              for="organization"
              newSubscriptionRedirectUrl={`/orgs/${orgSlug}/settings/team`}
            >
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0 shadow-sm gap-1.5 cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                Purchase Seats (Checkout)
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </CheckoutButton>
          </Show>
        </div>
      )}

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

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Seat Availability</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {isUnlimited ? "Unlimited" : Math.max(0, seatLimit - seatsUsed) + " Available"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">
              {isSeatLimitReached ? "Upgrade required to add seats" : "Ready to invite new team members"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Member List */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Team Members
              </CardTitle>
              <CardDescription>
                Members who have access to handle support conversations and collaborate in the team inbox.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {seatsUsed} Active
            </Badge>
          </div>
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

      {/* Invite Member Modal / Upgrade Seat Checkout Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isSeatLimitReached ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Seat Limit Reached</h3>
                    <p className="text-xs text-muted-foreground">
                      You have reached the maximum seat capacity (<strong>{seatLimit} seat</strong>) included on your <strong>{billingData?.plan ? billingData.plan.toUpperCase() : "Free"}</strong> plan.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Allocation:</span>
                    <span className="font-bold text-foreground">{seatsUsed} / {seatLimit} Seats</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pro Plan Includes:</span>
                    <span className="font-bold text-primary">5 Team Seats + 2,000 AI Msgs</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Show when="signed-in">
                    <CheckoutButton
                      planId="pro"
                      planPeriod="month"
                      for="organization"
                      newSubscriptionRedirectUrl={`/orgs/${orgSlug}/settings/team`}
                    >
                      <Button className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold gap-1.5 cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        Upgrade to Pro (5 Seats)
                      </Button>
                    </CheckoutButton>
                  </Show>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Invite Team Member</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Send an invitation to join your workspace support queue ({seatsUsed}/{seatLimit} seats used).
                  </p>
                </div>

                {inviteStatus && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{inviteStatus}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="agent@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs">Role</Label>
                    <select
                      id="role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="member">Member (Inbox Access)</option>
                      <option value="admin">Admin (Full Access & Settings)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Send Invitation
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}