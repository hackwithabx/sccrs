"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { codeExamples } from "@/lib/code-examples-data";
import {
  AlertTriangle, CheckCircle2, Code, Copy, Check,
  Search, Filter, Globe, ShieldAlert, BookOpen, Hash,
} from "lucide-react";

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  JavaScript: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Python: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Java: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  PHP: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "C#": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Go: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Ruby: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function SecureCodePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(codeExamples.map((e) => e.category)))],
    []
  );
  const languages = useMemo(
    () => ["all", ...Array.from(new Set(codeExamples.map((e) => e.language)))],
    []
  );

  const filtered = useMemo(() => {
    let result = codeExamples;
    if (selectedCategory !== "all") {
      result = result.filter((e) => e.category === selectedCategory);
    }
    if (selectedLanguage !== "all") {
      result = result.filter((e) => e.language === selectedLanguage);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.language.toLowerCase().includes(q) ||
          (e.cweId && e.cweId.toLowerCase().includes(q)) ||
          (e.owaspId && e.owaspId.toLowerCase().includes(q))
      );
    }
    return result;
  }, [selectedCategory, selectedLanguage, searchQuery]);

  const stats = useMemo(() => ({
    total: codeExamples.length,
    languages: new Set(codeExamples.map((e) => e.language)).size,
    categories: new Set(codeExamples.map((e) => e.category)).size,
    withCwe: codeExamples.filter((e) => e.cweId).length,
  }), []);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Secure Code"
          title="Secure Code Examples"
          description="Learn from real-world vulnerable vs. secure code patterns across multiple languages. Copy secure implementations directly into your projects."
        />

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Examples", value: stats.total, icon: Code, color: "text-primary" },
            { label: "Languages", value: stats.languages, icon: Globe, color: "text-emerald-500" },
            { label: "Categories", value: stats.categories, icon: Filter, color: "text-violet-500" },
            { label: "CWE Mapped", value: stats.withCwe, icon: ShieldAlert, color: "text-amber-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mt-8 relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, CWE, OWASP, language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Language filter */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2 justify-center text-sm text-muted-foreground">
            <Globe className="h-4 w-4" /> Language
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {languages.map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={selectedLanguage === lang ? "default" : "outline"}
                onClick={() => setSelectedLanguage(lang)}
                className={
                  lang !== "all" && selectedLanguage !== lang
                    ? `${languageColors[lang] || ""}`
                    : ""
                }
              >
                {lang === "all" ? "All Languages" : lang}
              </Button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2 justify-center text-sm text-muted-foreground">
            <Filter className="h-4 w-4" /> Category
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat === "all" ? "All Categories" : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong> of {codeExamples.length} examples
          {selectedLanguage !== "all" && <> in <Badge variant="outline" className="ml-1">{selectedLanguage}</Badge></>}
          {selectedCategory !== "all" && <> under <Badge variant="secondary" className="ml-1 capitalize">{selectedCategory}</Badge></>}
        </div>

        {/* Code examples */}
        <div className="mt-8 space-y-8">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No examples found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
              </motion.div>
            ) : (
              filtered.map((example, i) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">{example.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={languageColors[example.language] || ""}
                            >
                              {example.language}
                            </Badge>
                            <Badge variant="secondary">{example.category}</Badge>
                            {example.cweId && (
                              <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                <Hash className="h-3 w-3" />
                                {example.cweId}
                              </Badge>
                            )}
                            {example.owaspId && (
                              <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                                <ShieldAlert className="h-3 w-3" />
                                {example.owaspId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {example.description}
                      </p>
                      {(example.cweName || example.owaspName) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {example.cweName && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {example.cweName}
                            </span>
                          )}
                          {example.owaspName && (
                            <span className="flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" /> OWASP {example.owaspName}
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="vulnerable" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="vulnerable" className="gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            Vulnerable
                          </TabsTrigger>
                          <TabsTrigger value="secure" className="gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Secure
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="vulnerable">
                          <div className="relative">
                            <pre className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 overflow-x-auto text-sm">
                              <code>{example.vulnerable}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        <TabsContent value="secure">
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 gap-1 text-xs"
                              onClick={() => copyCode(example.secure, example.id)}
                            >
                              {copiedId === example.id ? (
                                <>
                                  <Check className="h-3 w-3" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copy
                                </>
                              )}
                            </Button>
                            <pre className="rounded-lg bg-primary/5 border border-primary/20 p-4 overflow-x-auto text-sm">
                              <code>{example.secure}</code>
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Explanation */}
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <h4 className="font-semibold text-sm mb-1">Why This Matters</h4>
                        <p className="text-sm text-muted-foreground">
                          {example.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
