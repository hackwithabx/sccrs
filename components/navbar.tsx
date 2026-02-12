"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  ShieldAlert,
  Menu,
  X,
  BookOpen,
  Code,
  BarChart3,
  Wrench,
  FileText,
  Briefcase,
  Cloud,
  Users,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navLinks = [
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/owasp", label: "OWASP", icon: ShieldAlert },
  { href: "/secure-code", label: "Secure Code", icon: Code },
  { href: "/vulnerabilities", label: "Vulnerabilities", icon: BarChart3 },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/cloud-security", label: "Cloud", icon: Cloud },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      {/* Top bar Brand Name (prominent) */}
      <div className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Secure<span className="text-primary">Code</span>Reviews
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom bar Navigation Links (compact) */}
      <nav className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0.5 h-10 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}>
                  <button
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant={
                      pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href))
                        ? "secondary"
                        : "ghost"
                    }
                    className="w-full justify-start gap-2"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t mt-2">
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth/login" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="flex-1">
                      <Button
                        className="w-full"
                        onClick={() => setMobileOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
