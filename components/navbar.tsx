"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Shield,
  Wrench,
  X,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  highlight?: boolean;
  matchAlso?: string[];
}

const navLinks: NavLink[] = [
  { href: "/shieldx", label: "ShieldX", highlight: true },
  { href: "/services", label: "Services" },
  { href: "/tools", label: "Tools" },
  { href: "/owasp", label: "Learn", matchAlso: ["/secure-code", "/cloud-security", "/vulnerabilities"] },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const mobileIcons = {
  "/shieldx": Shield,
  "/services": Briefcase,
  "/tools": Wrench,
  "/owasp": BookOpen,
  "/blog": BookOpen,
  "/about": Info,
  "/contact": Mail,
};

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = useCallback(
    (href: string, matchAlso?: string[]) => {
      if (pathname === href) return true;
      if (href !== "/" && pathname.startsWith(href)) return true;
      if (matchAlso?.some((item) => pathname.startsWith(item))) return true;
      return false;
    },
    [pathname]
  );

  if (pathname.startsWith("/demos")) return null;

  return (
    <>
      <header
        className={`sticky top-0 z-[120] w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-[#07111d]/86 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl"
            : "border-white/10 bg-[#07111d]/70 backdrop-blur-lg"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <Shield className="h-5 w-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
              Secure<span className="text-cyan-300">Code</span>Reviews
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ href, label, highlight, matchAlso }) => {
              const active = isActive(href, matchAlso);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : highlight
                        ? "text-cyan-200 hover:bg-cyan-400/10 hover:text-cyan-100"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {label}
                  {active ? (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-4 -bottom-[9px] h-px bg-cyan-300"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/auth/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
                >
                  Request review
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/5 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[130] bg-black/55 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-[140] flex h-[100svh] w-[min(86vw,330px)] flex-col overflow-hidden border-l border-white/10 bg-[#06111d]/96 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 pt-[env(safe-area-inset-top)]">
                <span className="text-lg font-semibold text-white">Navigation</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {navLinks.map(({ href, label, highlight, matchAlso }) => {
                    const active = isActive(href, matchAlso);
                    const Icon = mobileIcons[href as keyof typeof mobileIcons] || Shield;

                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                            active
                              ? "bg-white/10 text-white"
                              : highlight
                                ? "text-cyan-200 hover:bg-cyan-400/10"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                          {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" /> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {session ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white hover:bg-white/5"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                    >
                      Request review
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
