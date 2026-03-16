"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/section-heading";
import {
  Mail,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  MessageSquare,
  Shield,
  Crown,
  Zap,
} from "lucide-react";

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
      ? `ShieldX Subscription Request - ${
          requestedPlan ? PLAN_LABELS[requestedPlan] : "Plan Inquiry"
        }`
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const subscriptionLabel = requestedPlan ? PLAN_LABELS[requestedPlan] : "ShieldX";

  const contactInfo = [
    {
      icon: Mail,
      label: "Email Us",
      value: "support@securecodereviews.com",
      href: "mailto:support@securecodereviews.com",
    },
    {
      icon: Clock,
      label: "Response Time",
      value: isSubscriptionRequest ? "Within 1 business day" : "Within 24 hours",
      href: null,
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Remote-first, Worldwide",
      href: null,
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge={isSubscriptionRequest ? "ShieldX Sales" : "Contact"}
          title={isSubscriptionRequest ? "Request ShieldX Subscription" : "Get in Touch"}
          description={
            isSubscriptionRequest
              ? "Tell us which ShieldX plan you want, who will use it, and when you want to start. We will reply with next steps for activation and billing."
              : "Have a question about our services or need help with application security? We'd love to hear from you."
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="shrink-0 rounded-lg bg-primary/10 p-3 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    {isSubscriptionRequest ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Shield className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-semibold">
                      {isSubscriptionRequest
                        ? "ShieldX Subscription Request"
                        : "Enterprise Support"}
                    </span>
                  </div>

                  {isSubscriptionRequest ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        This request will be marked as a ShieldX subscription inquiry
                        so we can reply with the right onboarding and billing steps.
                      </p>
                      <div className="rounded-xl border border-primary/15 bg-background/80 p-4 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Requested plan</span>
                          <span className="font-semibold text-foreground">
                            {subscriptionLabel}
                          </span>
                        </div>
                        <div className="mt-3 flex items-start gap-2 text-muted-foreground">
                          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>
                            Add team size, billing email, and rollout timeline so we can
                            process the request faster.
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Need a dedicated security consultant, a custom assessment, or a
                        larger ShieldX rollout? Reach out and we will tailor the right
                        engagement for your team.
                      </p>
                      <a href="mailto:support@securecodereviews.com">
                        <Button size="sm" variant="outline" className="mt-1 gap-2">
                          <Mail className="h-4 w-4" />
                          support@securecodereviews.com
                        </Button>
                      </a>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {isSubscriptionRequest ? "Request Subscription" : "Send Us a Message"}
                </CardTitle>
                <CardDescription>
                  {isSubscriptionRequest
                    ? "We will review your request and reply with plan guidance, activation details, and next billing steps."
                    : "Fill out the form below and we will get back to you as soon as possible."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 py-12 text-center"
                  >
                    <div className="rounded-full bg-primary/10 p-4">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      {isSubscriptionRequest
                        ? "Subscription Request Sent"
                        : "Message Sent Successfully"}
                    </h3>
                    <p className="max-w-md text-muted-foreground">
                      {isSubscriptionRequest
                        ? `Thanks for requesting ShieldX ${subscriptionLabel}. We will review it and respond to `
                        : "Thank you for reaching out. Our team will review your message and respond to "}
                      <span className="font-medium text-foreground">{email}</span>
                      {isSubscriptionRequest
                        ? " with the next steps."
                        : " within 24 hours."}
                    </p>
                    <Button variant="outline" onClick={resetForm} className="mt-4">
                      {isSubscriptionRequest
                        ? "Send Another Subscription Request"
                        : "Send Another Message"}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {isSubscriptionRequest && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                        This form is prefilled for a{" "}
                        <strong className="text-foreground">{subscriptionLabel}</strong>{" "}
                        request so we can identify it quickly on our side.
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your security needs..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={7}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {isSubscriptionRequest ? "Send Subscription Request" : "Send Message"}
                        </>
                      )}
                    </Button>

                    {error && (
                      <p className="text-center text-sm text-destructive">{error}</p>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                      Or email us directly at{" "}
                      <a
                        href="mailto:support@securecodereviews.com"
                        className="text-primary hover:underline"
                      >
                        support@securecodereviews.com
                      </a>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
