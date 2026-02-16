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
  Brain,
  ChevronDown,
} from "lucide-react";

// Organized nav sections with clear separation
const navSections = {
  services: {
    label: "Services & Solutions",
    badge: null,
    items: [
      { href: "/services", label: "All Services", icon: Briefcase, description: "Our Security & Development Services" },
    ],
  },
  aiSecurity: {
    label: "🤖 AI Security (NEW)",
    badge: "NEW",
    items: [
      { href: "/tools/ai-security-auditor", label: "AI Security Auditor", icon: Brain, description: "Test your LLM/AI applications" },
    ],
  },
  tools: {
    label: "Free Tools",
    badge: null,
    items: [
      { href: "/tools", label: "All Tools", icon: Wrench, description: "Header analyzer, JWT decoder, hash tools" },
    ],
  },
  educational: {
    label: "Learning & Education",
    badge: null,
    items: [
      { href: "/owasp", label: "OWASP", icon: ShieldAlert, description: "OWASP Top 10 & security standards" },
      { href: "/secure-code", label: "Secure Code", icon: Code, description: "Secure coding practices & examples" },
      { href: "/cloud-security", label: "Cloud Security", icon: Cloud, description: "Cloud infrastructure security" },
      { href: "/vulnerabilities", label: "Vulnerabilities", icon: BarChart3, description: "Common vulnerabilities guide" },
    ],
  },
  blog: {
    label: "Blog & Content",
    badge: null,
    items: [
      { href: "/blog", label: "Blog", icon: BookOpen, description: "Security articles & insights" },
    ],
  },
  reports: {
    label: "Reports",
    badge: null,
    items: [
      { href: "/reports", label: "Generate Report", icon: FileText, description: "Create security assessment reports" },
    ],
  },
};

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { data: session } = useSession();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      {/* Top bar Brand Name */}
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

      {/* Desktop Navigation - Organized & Clear */}
      <nav className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 overflow-x-auto">
            {/* Services & Solutions */}
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted">
                <Briefcase className="h-3.5 w-3.5" />
                Services
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-0 mt-0 w-56 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link href="/services" className="block px-4 py-3 hover:bg-muted">
                  <div className="font-medium text-sm">All Services</div>
                  <div className="text-xs text-muted-foreground">Security & Development</div>
                </Link>
              </div>
            </div>

            {/* AI Security - PROMINENT */}
            <Link href="/tools/ai-security-auditor">
              <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${
                isActive("/tools/ai-security-auditor")
                  ? "bg-violet-600/20 text-violet-600"
                  : "text-violet-600 hover:bg-violet-600/10"
              }`}>
                <Brain className="h-3.5 w-3.5" />
                🤖 AI Security
              </button>
            </Link>

            {/* Free Tools */}
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted">
                <Wrench className="h-3.5 w-3.5" />
                Tools
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-0 mt-0 w-56 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link href="/tools" className="block px-4 py-3 hover:bg-muted">
                  <div className="font-medium text-sm">All Tools</div>
                  <div className="text-xs text-muted-foreground">Free security tools</div>
                </Link>
              </div>
            </div>

            <div className="w-px h-6 bg-border mx-1"></div>

            {/* Learning & Education */}
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted">
                <BookOpen className="h-3.5 w-3.5" />
                Learn
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-0 mt-0 w-60 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link href="/owasp" className="block px-4 py-3 hover:bg-muted border-b border-border">
                  <div className="font-medium text-sm">OWASP</div>
                  <div className="text-xs text-muted-foreground">Top 10 & security standards</div>
                </Link>
                <Link href="/secure-code" className="block px-4 py-3 hover:bg-muted border-b border-border">
                  <div className="font-medium text-sm">Secure Code</div>
                  <div className="text-xs text-muted-foreground">Secure coding practices</div>
                </Link>
                <Link href="/cloud-security" className="block px-4 py-3 hover:bg-muted border-b border-border">
                  <div className="font-medium text-sm">Cloud Security</div>
                  <div className="text-xs text-muted-foreground">Cloud infrastructure</div>
                </Link>
                <Link href="/vulnerabilities" className="block px-4 py-3 hover:bg-muted">
                  <div className="font-medium text-sm">Vulnerabilities</div>
                  <div className="text-xs text-muted-foreground">Common vulnerabilities</div>
                </Link>
              </div>
            </div>

            {/* Blog */}
            <Link href="/blog">
              <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive("/blog")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
                <BookOpen className="h-3.5 w-3.5" />
                Blog
              </button>
            </Link>

            {/* Reports */}
            <Link href="/reports">
              <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive("/reports")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
                <FileText className="h-3.5 w-3.5" />
                Reports
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Nav - Well Organized */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background"
          >
            <div className="flex flex-col p-4 space-y-2">
              {/* Services Section */}
              <div className="border-b pb-3">
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Services</div>
                <Link href="/services" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Briefcase className="h-4 w-4" />
                    All Services
                  </Button>
                </Link>
              </div>

              {/* AI Security Section */}
              <div className="border-b pb-3">
                <div className="text-xs font-bold text-violet-600 uppercase mb-2">New</div>
                <Link href="/tools/ai-security-auditor" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/tools/ai-security-auditor") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <Brain className="h-4 w-4" />
                    🤖 AI Security Auditor
                  </Button>
                </Link>
              </div>

              {/* Tools Section */}
              <div className="border-b pb-3">
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Free Tools</div>
                <Link href="/tools" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/tools") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <Wrench className="h-4 w-4" />
                    All Tools
                  </Button>
                </Link>
              </div>

              {/* Learning Section */}
              <div className="border-b pb-3">
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Learning</div>
                <Link href="/owasp" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/owasp") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    OWASP
                  </Button>
                </Link>
                <Link href="/secure-code" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/secure-code") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <Code className="h-4 w-4" />
                    Secure Code
                  </Button>
                </Link>
                <Link href="/cloud-security" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/cloud-security") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <Cloud className="h-4 w-4" />
                    Cloud Security
                  </Button>
                </Link>
                <Link href="/vulnerabilities" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/vulnerabilities") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Vulnerabilities
                  </Button>
                </Link>
              </div>

              {/* Content Section */}
              <div className="border-b pb-3">
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Content</div>
                <Link href="/blog" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/blog") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </Button>
                </Link>
                <Link href="/reports" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive("/reports") ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Reports
                  </Button>
                </Link>
              </div>

              {/* User Section */}
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
