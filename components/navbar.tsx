"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  Menu,
  X,
  BookOpen,
  Wrench,
  FileText,
  Briefcase,
  LogOut,
  LayoutDashboard,
  Brain,
  Info,
  Mail,
  ArrowRight,
} from "lucide-react";

const navLinks = [
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/tools/ai-security-auditor", label: "AI Security", icon: Brain, highlight: true },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/owasp", label: "Learn", icon: BookOpen, matchAlso: ["/secure-code", "/cloud-security", "/vulnerabilities"] },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = useCallback(
    (href: string, matchAlso?: string[]) => {
      if (pathname === href) return true;
      if (href !== "/" && pathname.startsWith(href)) return true;
      if (matchAlso?.some((m) => pathname.startsWith(m))) return true;
      return false;
    },
    [pathname]
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow duration-300 bg-background/85 backdrop-blur-lg ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ─── Logo ─── */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Shield className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight select-none">
              Secure<span className="text-primary">Code</span>Reviews
            </span>
          </Link>

          {/* ─── Desktop Navigation ─── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label, highlight, matchAlso }) => {
              const active = isActive(href, matchAlso);
              // Prevent "Tools" from being active when AI Security is active
              const suppressActive = href === "/tools" && isActive("/tools/ai-security-auditor");
              const showActive = active && !suppressActive;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    highlight
                      ? showActive
                        ? "text-primary bg-primary/10"
                        : "text-primary hover:bg-primary/5"
                      : showActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {label}
                  {/* Active indicator bar */}
                  {showActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ─── Right actions ─── */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Auth – Desktop */}
            {session ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent/50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent/50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent/50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Hamburger – Mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Active indicator bottom border for desktop */}
      <div className="hidden lg:block h-px bg-border" />

      {/* ─── Mobile overlay + slide-in menu ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-background shadow-2xl lg:hidden flex flex-col"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-primary">Menu</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile nav links */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-0.5">
                  {navLinks.map(({ href, label, icon: Icon, highlight, matchAlso }) => {
                    const active = isActive(href, matchAlso);
                    const suppressActive = href === "/tools" && isActive("/tools/ai-security-auditor");
                    const showActive = active && !suppressActive;

                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            showActive
                              ? "bg-primary/10 text-primary"
                              : highlight
                                ? "text-primary hover:bg-primary/5"
                                : "text-foreground hover:bg-accent/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                          {showActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Mobile auth */}
              <div className="border-t border-border p-4 space-y-2">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent/50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
