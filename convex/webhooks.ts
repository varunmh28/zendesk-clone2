import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const recordAndProcess = internalMutation({
  args: {
    svixId: v.string(),
    eventType: v.string(),
    eventData: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if already processed
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_svixId", (q) => q.eq("svixId", args.svixId))
      .unique();
    if (existing) return;

    await ctx.db.insert("webhookEvents", {
      svixId: args.svixId,
      eventType: args.eventType,
      processedAt: Date.now(),
    });

    const data = JSON.parse(args.eventData) as Record<string, unknown>;

    switch (args.eventType) {
      case "organization.created": {
        await ctx.runMutation(internal.workspaces.provisionWorkspace, {
          orgId: data.id as string,
          name: data.name as string,
          slug: data.slug as string,
        });
        break;
      }
      case "organizationMembership.created":
      case "organizationMembership.updated": {
        type MembershipData = {
          organization: { id: string };
          public_user_data: {
            user_id: string;
            first_name: string;
            last_name: string;
            image_url: string;
          };
          role: string;
        };
        const m = data as MembershipData;
        const roleMap: Record<string, "admin" | "agent" | "member"> = {
          "org:admin": "admin",
          "org:agent": "agent",
          "org:member": "member",
        };
        await ctx.runMutation(internal.users.upsertFromClerk, {
          orgId: m.organization.id,
          clerkUserId: m.public_user_data.user_id,
          tokenIdentifier: `${m.organization.id}|${m.public_user_data.user_id}`,
          name: `${m.public_user_data.first_name} ${m.public_user_data.last_name}`.trim(),
          email: "",
          avatarUrl: m.public_user_data.image_url,
          role: roleMap[m.role] ?? "member",
        });
        break;
      }
      case "subscription.created":
      case "subscription.updated": {
        const subData = data as Record<string, unknown>;
        const orgId = (subData.organization_id ||
          (subData.organization as { id?: string })?.id ||
          subData.org_id) as string | undefined;

        const planRaw = (
          (subData.plan as { key?: string; name?: string; slug?: string })?.slug ||
          (subData.plan as { key?: string; name?: string; slug?: string })?.key ||
          subData.plan_key ||
          subData.plan ||
          "pro"
        ) as string;

        let plan: "free" | "pro" | "enterprise" = "free";
        if (typeof planRaw === "string") {
          const lower = planRaw.toLowerCase();
          if (lower.includes("enterprise") || lower.includes("scale")) {
            plan = "enterprise";
          } else if (lower.includes("pro")) {
            plan = "pro";
          }
        }

        if (orgId) {
          await ctx.runMutation(internal.billing.updateWorkspacePlanInternal, {
            orgId,
            plan,
          });
        }
        break;
      }
      case "organization.updated": {
        const orgData = data as { id?: string; name?: string; slug?: string; public_metadata?: Record<string, unknown> };
        if (orgData.id && orgData.public_metadata?.plan) {
          const planStr = String(orgData.public_metadata.plan).toLowerCase();
          let plan: "free" | "pro" | "enterprise" = "free";
          if (planStr.includes("enterprise") || planStr.includes("scale")) {
            plan = "enterprise";
          } else if (planStr.includes("pro")) {
            plan = "pro";
          }
          await ctx.runMutation(internal.billing.updateWorkspacePlanInternal, {
            orgId: orgData.id,
            plan,
          });
        }
        break;
      }
      default:
        break;
    }
  },
});
