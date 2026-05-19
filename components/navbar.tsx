"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  matchAlso?: string[];
}

const navItems: NavItem[] = [
  {
    href: "/products/ai-security-auditor",
    label: "AI Auditor",
    matchAlso: ["/tools/ai-security-auditor"],
  },
  {
    href: "/products/shieldx",
    label: "ShieldX",
    matchAlso: ["/shieldx"],
  },
  {
    href: "/pricing",
    label: "Pricing",
    matchAlso: ["/shieldx/pricing"],
  },
  {
    href: "/learn",
    label: "Learn",
    matchAlso: ["/owasp", "/secure-code", "/cloud-security", "/vulnerabilities"],
  },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, item: NavItem) {
  if (pathname === item.href) return true;
  if (item.matchAlso?.some((entry) => pathname.startsWith(entry))) return true;
  return item.href !== "/" && pathname.startsWith(item.href);
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (pathname.startsWith("/demos")) return null;

  return (
    <>
      <header
        className={`sticky top-0 z-[120] w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/80 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.28)] backdrop-blur-2xl"
            : "border-transparent bg-white/55 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200/80 bg-white shadow-[0_12px_30px_-18px_rgba(20,101,255,0.42)]">
              <Shield className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight text-slate-950">
                Secure<span className="text-blue-600">Code</span>Reviews
              </div>
              <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                AI Security Platform
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    active
                      ? "bg-slate-950 text-white shadow-[0_18px_35px_-26px_rgba(15,23,42,0.45)]"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/auth/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950"
                >
                  Sign in
                </Link>
                <Link
                  href="/contact?subject=AI+Security+Audit+Request"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.65)] hover:bg-blue-700"
                >
                  Book audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-900 shadow-sm lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[130] lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col border-l border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.98))] px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950">Navigation</div>
                <div className="text-xs text-slate-500">AI security, product, and learning paths</div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${
                      active ? "bg-slate-950 text-white" : "bg-white/80 text-slate-700"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-5">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-800"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-800"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-800"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pricing
                  </Link>
                  <Link
                    href="/contact?subject=AI+Security+Audit+Request"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <BookOpen className="h-4 w-4" />
                    Book audit
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}