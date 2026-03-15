"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  PenSquare,
  Send,
  Eye,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  BookOpen,
  Tag,
  FolderOpen,
  X,
} from "lucide-react";

const CATEGORIES = [
  "Web Security",
  "API Security",
  "Cloud Security",
  "DevSecOps",
  "Mobile Security",
  "Network Security",
  "Application Security",
  "Threat Intelligence",
  "Compliance",
  "Secure Coding",
  "Penetration Testing",
  "Vulnerability Research",
  "AI Security",
  "Supply Chain Security",
  "Zero Trust",
  "Other",
];

const SUGGESTED_TAGS = [
  "OWASP", "XSS", "SQL Injection", "CSRF", "Authentication", "Authorization",
  "Encryption", "TLS", "API", "JWT", "OAuth", "SSRF", "RCE", "LFI",
  "Containerization", "Kubernetes", "Docker", "AWS", "Azure", "GCP",
  "Python", "JavaScript", "Java", "Go", "Rust", "Node.js",
  "React", "Angular", "CI/CD", "SAST", "DAST", "SCA", "Fuzzing",
  "Bug Bounty", "CTF", "Malware", "Ransomware", "Zero-Day",
];

export default function SubmitArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (!excerpt.trim()) return setError("Excerpt is required");
    if (!content.trim()) return setError("Content is required");
    if (!category) return setError("Category is required");
    if (content.trim().length < 500) return setError("Content must be at least 500 characters");

    setSubmitting(true);

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content, category, tags }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Not authenticated
  if (status === "loading") {
    return (
      <div className="py-32 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8">
              <PenSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Write for SCRs Community</h1>
              <p className="text-muted-foreground mb-6">
                Sign in to submit your security articles and share your expertise with the community.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/login">
                  <Button size="lg">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg">Create Account</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Post submitted successfully
  if (submitted) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Article Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Your article has been submitted for review. An admin will review it and
                you&apos;ll be notified once it&apos;s published.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => { setSubmitted(false); setTitle(""); setExcerpt(""); setContent(""); setCategory(""); setTags([]); }}>
                  Write Another
                </Button>
                <Link href="/blog">
                  <Button variant="outline">View Blog</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">My Dashboard</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>

        <SectionHeading
          badge="Community"
          title="Write for SCRs"
          description="Share your security knowledge with the community. Articles are reviewed by admins before publishing."
        />

        {/* Guidelines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-2 text-blue-500">Submission Guidelines</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Write about application security, vulnerability research, secure coding, or related topics</li>
                    <li>• Use Markdown formatting for headers, code blocks, lists, and links</li>
                    <li>• Include practical code examples where applicable</li>
                    <li>• Minimum 500 characters of content required</li>
                    <li>• Articles will be reviewed within 48 hours</li>
                    <li>• Original content only — no plagiarism</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5" />
                  {preview ? "Preview" : "Write Your Article"}
                </CardTitle>
                <CardDescription>
                  {preview ? "Review how your article will look" : "Use Markdown for formatting"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!preview ? (
                  <>
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Understanding SSRF Attacks in Modern Web Apps"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1"
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{title.length}/200</p>
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt *</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="A brief summary of your article (shown in blog listing)..."
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className="mt-1"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{excerpt.length}/500</p>
                    </div>

                    <div>
                      <Label htmlFor="content">Content * (Markdown supported)</Label>
                      <Textarea
                        id="content"
                        placeholder={`## Introduction\n\nStart writing your article here...\n\n### Key Points\n\n- Point one\n- Point two\n\n\`\`\`python\n# Code example\ndef secure_function():\n    pass\n\`\`\``}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={20}
                        className="mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {content.length} characters {content.length < 500 && content.length > 0 ? "(min 500)" : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <h1>{title || "Untitled"}</h1>
                    <p className="text-muted-foreground italic">{excerpt}</p>
                    <div className="flex gap-2 mb-4">
                      {category && <Badge>{category}</Badge>}
                      {tags.map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                    <div className="whitespace-pre-wrap">{content}</div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPreview(!preview)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    {preview ? "Edit" : "Preview"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" /> Category *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={category === cat ? "default" : "outline"}
                      onClick={() => setCategory(cat)}
                      className="text-xs"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Tags (max 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    className="text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => addTag(tagInput)}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1 pr-1">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TAGS.filter((t) => !tags.includes(t.toLowerCase()))
                      .slice(0, 15)
                      .map((t) => (
                        <button
                          key={t}
                          onClick={() => addTag(t)}
                          className="text-xs px-2 py-0.5 rounded-full border hover:bg-accent transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Author
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
