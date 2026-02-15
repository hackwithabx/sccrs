"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from markdown content
    const lines = content.split("\n");
    const items: TocItem[] = [];

    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2]
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/`/g, "")
          .trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
        items.push({ id, text, level });
      }
    }

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    // Small delay to let markdown render
    const timer = setTimeout(() => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="hidden xl:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="border border-border rounded-lg p-4 bg-card">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-primary rounded-full" />
          On This Page
        </h4>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveId(heading.id);
                  }
                }}
                className={`block text-xs leading-relaxed py-1 transition-colors hover:text-primary ${
                  heading.level === 3 ? "pl-4" : "pl-0"
                } ${
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
