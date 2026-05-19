"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Crown,
  Mail,
  MapPin,
  Send,
  Shield,
  Zap,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubscriptionPlan = "pro" | "enterprise";

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  pro: "Pro",
  enterprise: "Enterprise",
};

function getSubscriptionPlan(value: string | null): SubscriptionPlan | null {
  return value === "pro" || value === "enterprise" ? value : null;
}

function buildSubscriptionMessage(plan: SubscriptionPlan | null) {
  const planLabel = plan ? PLAN_LABELS[plan] : "ShieldX";

  return [
    `Plan requested: ${planLabel}`,
    "Company / team name:",
    "Team size / seats needed:",
    "Primary use case:",
    "Billing email:",
    "Preferred start date:",
    "",
    "Anything else we should know?",
  ].join("\n");
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageInner />
    </Suspense>
  );
}

function ContactPageInner() {
  const searchParams = useSearchParams();

  const requestedPlan = getSubscriptionPlan(searchParams.get("plan"));
  const requestedType = searchParams.get("type");
  const querySubject = searchParams.get("subject")?.trim() || "";
  const queryMessage = searchParams.get("message")?.trim() || "";

  const isSubscriptionRequest =
    requestedType === "subscription" ||
    requestedPlan !== null ||
    /subscription/i.test(querySubject);

  const presetSubject =
    querySubject ||
    (isSubscriptionRequest
      ? `ShieldX Subscription Request - ${requestedPlan ? PLAN_LABELS[requestedPlan] : "Plan Inquiry"}`
      : "");

  const presetMessage =
    queryMessage || (isSubscriptionRequest ? buildSubscriptionMessage(requestedPlan) : "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSubject(presetSubject);
    setMessage(presetMessage);
  }, [presetMessage, presetSubject]);

  const resetForm = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setSubject(presetSubject);
    setMessage(presetMessage);
    setError("");
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          requestType: isSubscriptionRequest ? "subscription" : "general",
          subscriptionPlan: requestedPlan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const subscriptionLabel = requestedPlan ? PLAN_LABELS[requestedPlan] : "ShieldX";

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@securecodereviews.com",
      href: "mailto:support@securecodereviews.com",
    },
    {
      icon: Clock,
      label: "Response time",
      value: isSubscriptionRequest ? "Within 1 business day" : "Within 24 hours",
      href: null,
    },
    {
      icon: MapPin,
      label: "Coverage",
      value: "Remote-first, worldwide",
      href: null,
    },
  ];

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
        <div className="space-y-6">
          <SectionHeading
            badge={isSubscriptionRequest ? "Sales" : "Contact"}
            title={isSubscriptionRequest ? "Request a SecureCodeReviews plan" : "Talk to the security team"}
            description={
              isSubscriptionRequest
                ? "Tell us which plan you need, who will use it, and what rollout timeline you are targeting."
                : "Use this page for AI security audits, ShieldX subscriptions, cloud security reviews, and general support questions."
            }
          />

          <div className="surface-card-strong rounded-[2rem] p-6">
            <div className="text-sm font-semibold text-slate-950">Choose the right path</div>
            <div className="mt-4 space-y-3">
              {[
                ["AI security audit", "Prompt injection, data leakage, unsafe output, and agent workflow review."],
                ["ShieldX subscription", "Free, Pro, or Enterprise pricing conversations and onboarding."],
                ["Cloud and DevSecOps review", "Delivery pipeline, cloud posture, and release security support."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-950">{title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card className="surface-card h-full rounded-[1.7rem] border-0">
                  <CardContent className="p-5">
                    <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-sm text-slate-500">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="mt-2 block text-sm font-semibold text-slate-950 hover:text-blue-700">
                        {item.value}
                      </a>
                    ) : (
                      <div className="mt-2 text-sm font-semibold text-slate-950">{item.value}</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="surface-card rounded-[1.8rem] border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                {isSubscriptionRequest ? (
                  <Crown className="h-4 w-4 text-blue-700" />
                ) : (
                  <Shield className="h-4 w-4 text-blue-700" />
                )}
                {isSubscriptionRequest ? "Subscription request details" : "What to include"}
              </div>

              {isSubscriptionRequest ? (
                <div className="mt-4 rounded-[1.35rem] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">Requested plan</span>
                    <span className="font-semibold text-slate-950">{subscriptionLabel}</span>
                  </div>
                  <div className="mt-4 flex items-start gap-2 text-sm leading-7 text-slate-600">
                    <Zap className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                    Add team size, rollout timing, and billing email to reduce back-and-forth and help us answer accurately.
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                    Product or workflow being reviewed, stack details, and target timeline.
                  </div>
                  <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                    Primary concerns such as prompt injection, AI output security, cloud posture, or release readiness.
                  </div>
                  <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                    Whether you need software access, advisory help, or both.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card-strong rounded-[2rem] border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">
              {submitted ? "Message received" : isSubscriptionRequest ? "Start the plan conversation" : "Send a request"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {submitted
                ? "We will reply using the email you provided."
                : "The form routes general inquiries and subscription requests to the right internal path."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-[1.6rem] bg-emerald-50 px-5 py-6 text-sm leading-7 text-emerald-900">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  Thanks. Your message has been submitted.
                </div>
                <p className="mt-3">
                  We will review your request and reply with next steps. If this is a plan request, include any additional procurement or billing context in your email reply so onboarding moves faster.
                </p>
                <Button onClick={resetForm} variant="outline" className="mt-5 rounded-full border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50">
                  Send another request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error ? (
                  <div className="rounded-[1.4rem] bg-rose-50 px-4 py-4 text-sm text-rose-800">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required className="rounded-[1rem] border-slate-200 bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required className="rounded-[1rem] border-slate-200 bg-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="How can we help?" required className="rounded-[1rem] border-slate-200 bg-white" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the product, security scope, team size, or billing request." required className="min-h-[220px] rounded-[1rem] border-slate-200 bg-white" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" disabled={loading} className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? "Sending..." : "Send request"}
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                    <a href="mailto:support@securecodereviews.com">Email directly</a>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}