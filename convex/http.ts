import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let payload: unknown;
    try {
      const body = await req.text();
      const wh = new Webhook(webhookSecret);
      payload = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const event = payload as { type: string; data: Record<string, unknown> };

    await ctx.runMutation(internal.webhooks.recordAndProcess, {
      svixId,
      eventType: event.type,
      eventData: JSON.stringify(event.data),
    });

    return new Response(null, { status: 200 });
  }),
});

export default http;
