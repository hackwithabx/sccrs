"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { codeExamples } from "@/lib/code-examples-data";
import { AlertTriangle, CheckCircle2, Code, Copy, Check } from "lucide-react";

export default function SecureCodePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["all", ...new Set(codeExamples.map((e) => e.category))];

  const filtered =
    selectedCategory === "all"
      ? codeExamples
      : codeExamples.filter((e) => e.category === selectedCategory);

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
          description="Learn from real-world vulnerable vs. secure code patterns. Copy secure implementations directly into your projects."
        />

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Code examples */}
        <div className="mt-12 space-y-8">
          <AnimatePresence mode="wait">
            {filtered.map((example, i) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">{example.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{example.language}</Badge>
                          <Badge variant="secondary">{example.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {example.description}
                    </p>
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
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
