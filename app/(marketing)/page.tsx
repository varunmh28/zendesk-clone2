import Link from "next/link";
import {
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  BookOpen,
  Sliders,
  Users,
  CheckCircle2,
  Lock,
  ChevronRight,
  Star,
  Activity,
  Clock,
  Check,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveWidgetSimulation } from "@/components/marketing/live-widget-simulation";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "SupportHub — Next-Generation AI Customer Support Platform",
  description:
    "Resolve customer inquiries instantly with autonomous Gemini 2.0 AI agents grounded in your knowledge base. Realtime team inbox and 2-minute embed widget.",
};

const SOCIAL_METRICS = [
  { value: "< 1.2s", label: "Median AI Response Time", icon: Clock },
  { value: "73%", label: "Autonomous Resolution Rate", icon: Zap },
  { value: "99.9%", label: "Uptime & Realtime Sync", icon: Activity },
  { value: "100%", label: "Grounded RAG (No Hallucinations)", icon: ShieldCheck },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Realtime Shared Team Inbox",
    description:
      "Collaborative multi-agent inbox powered by Convex WebSockets. Features live typing indicators, agent collision detection, internal staff notes, and instant assignment routing.",
    badge: "Realtime Sync",
  },
  {
    icon: Bot,
    title: "Gemini 2.0 AI Agent with RAG",
    description:
      "Autonomous support agent powered by Google Gemini 2.0 Flash and 768-dimensional vector embeddings. Provides accurate, instant answers with clickable source citations.",
    badge: "Gemini 2.0 AI",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base & Auto-Chunking",
    description:
      "Upload PDFs, Markdown documents, or author help center articles. Automated background chunking and vector indexing keep your AI grounded without manual tuning.",
    badge: "Auto-Indexing",
  },
  {
    icon: Sliders,
    title: "Embeddable Widget & Customizer",
    description:
      "Live visual widget customizer with custom brand colors, border radius, proactive welcome popups, sound alerts, and pre/mid-chat lead capture forms.",
    badge: "2-Min Embed",
  },
  {
    icon: Users,
    title: "Fair Seat-Based Pricing",
    description:
      "No hidden per-resolution fees or punitive overages. Generous monthly AI allowances, included team seats, and transparent flat-rate scaling for growing teams.",
    badge: "Zero Penalties",
  },
  {
    icon: Lock,
    title: "Enterprise Multi-Tenancy & RBAC",
    description:
      "Built on Clerk Organizations with role-based permissions (Admin, Agent, Member), per-workspace public keys, and strict data isolation per organization.",
    badge: "SOC2 Ready",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "SupportHub transformed our customer operations. Over 70% of inbound tier-1 tickets are now resolved within 2 seconds by the AI, and our human agents only step in for nuanced escalations.",
    author: "Elena Rostova",
    role: "Head of Customer Experience",
    company: "HyperScale SaaS",
    avatar: "ER",
    rating: 5,
  },
  {
    quote:
      "Embedding the widget took literally 2 minutes on our Next.js store. The citations give our customers complete confidence because every answer links directly to our verified docs.",
    author: "Marcus Vance",
    role: "VP of Engineering",
    company: "DevFlow Cloud",
    avatar: "MV",
    rating: 5,
  },
  {
    quote:
      "The shared inbox presence and collision prevention are game-changers. No more two reps accidentally replying to the same customer ticket.",
    author: "Sarah Lin",
    role: "Support Team Lead",
    company: "Acme Logistics",
    avatar: "SL",
    rating: 5,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect Your Knowledge Base",
    desc: "Upload product documentation, FAQs, or author help center articles. Our system automatically chunks and indexes them into 768-dim vector embeddings.",
  },
  {
    step: "02",
    title: "Embed Widget in 2 Minutes",
    desc: "Copy your single script tag snippet into your website, React app, or CMS. Customize colors, position, and lead capture behavior in real-time.",
  },
  {
    step: "03",
    title: "Instant AI Resolutions & Human Handoff",
    desc: "Gemini 2.0 resolves questions with grounded citations. When complex edge cases arise, human agents seamlessly take over in the realtime inbox.",
  },
];

export default function MarketingLandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36 bg-gradient-to-b from-background via-background to-muted/20">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-xs animate-fadeIn">
            <Sparkles className="size-3.5" />
            <span>Powered by Gemini 2.0 Flash & Realtime Vector RAG</span>
            <ChevronRight className="size-3 text-primary/70" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
            The Next-Generation <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              AI Customer Support
            </span>{" "}
            Platform
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Resolve 70%+ of customer inquiries instantly with autonomous AI agents grounded in your knowledge base.
            Seamless human handoff, realtime team inbox, and embeddable in 2 minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto font-semibold gap-2 shadow-md h-12 px-7 text-sm"
              )}
            >
              Start Free 14-Day Trial
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#simulation"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-12 px-6 text-sm"
              )}
            >
              <Bot className="size-4 text-primary mr-2" />
              View Interactive Simulator
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-border/50">
            {SOCIAL_METRICS.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-card/40 border border-border/40">
                  <div className="flex items-center gap-1.5 text-lg sm:text-2xl font-bold text-foreground">
                    <Icon className="size-4 text-primary" />
                    {metric.value}
                  </div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="simulation" className="py-16 md:py-24 bg-muted/20 border-y border-border/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Bot className="size-3.5" /> Experience Live RAG Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Try the Interactive SupportHub Simulator
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Test real questions, inspect vector citation sources, and witness seamless human agent takeover in real-time.
            </p>
          </div>

          <LiveWidgetSimulation />
        </div>
      </section>

      {/* Features Highlights Grid */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-primary/5 text-primary border-primary/20">
              Enterprise Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Engineered for Modern Support Operations
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              From autonomous AI answers with zero hallucinations to real-time agent collision detection, every feature is built to scale your customer success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 transition-transform group-hover:scale-105">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted">
                        {feature.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Flow */}
      <section className="py-16 md:py-24 bg-muted/30 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Fast Implementation</span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Live in your production app in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border/70 bg-card p-6 space-y-3 shadow-xs"
              >
                <div className="text-3xl font-black text-primary/30 font-mono">{step.step}</div>
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-primary/5 text-primary border-primary/20">
              Trusted Worldwide
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Loved by Fast-Growing Support Teams
            </h2>
            <p className="text-sm text-muted-foreground">
              See how companies resolve support inquiries 10x faster with SupportHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, r) => (
                      <Star key={r} className="size-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">{t.author}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {t.role}, <span className="font-medium text-foreground">{t.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/10 via-background to-indigo-500/10 border-t border-border/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Ready to modernise your customer support?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Get started today with our full-featured free plan or explore custom enterprise SLAs for large teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto font-semibold gap-2 shadow-lg h-12 px-8 text-sm"
              )}
            >
              Get Started for Free — No Credit Card
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-12 px-6 text-sm"
              )}
            >
              View Plan Comparison
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> 14-day Pro trial included
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Setup in 2 minutes
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
