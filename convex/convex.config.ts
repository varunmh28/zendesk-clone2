import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import presence from "@convex-dev/presence/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(agent);
app.use(presence);
app.use(rateLimiter);

export default app;
