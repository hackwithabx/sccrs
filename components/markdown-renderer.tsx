"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const slugify = (text: string) =>
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const components: Components = {
    h1: ({ children }) => (
      <h1
        id={slugify(String(children))}
        className="text-3xl font-bold mt-10 mb-5 text-foreground border-b border-border pb-3 scroll-mt-20"
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        id={slugify(String(children))}
        className="text-2xl font-bold mt-10 mb-4 text-foreground flex items-center gap-2 scroll-mt-20"
      >
        <span className="inline-block w-1 h-7 bg-primary rounded-full" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        id={slugify(String(children))}
        className="text-xl font-semibold mt-7 mb-3 text-foreground scroll-mt-20"
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        id={slugify(String(children))}
        className="text-lg font-semibold mt-5 mb-2 text-foreground scroll-mt-20"
      >
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-muted-foreground leading-relaxed mb-4 text-[15px]">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-2 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2 text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-muted-foreground leading-relaxed text-[15px]">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-muted-foreground">{children}</em>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-5 bg-primary/5 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            {children}
          </code>
        );
      }
      return (
        <code className={`${className || ""} text-sm`}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 overflow-x-auto my-5 border border-border text-sm leading-relaxed">
        {children}
      </pre>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-primary hover:underline font-medium"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    hr: () => <hr className="my-8 border-border" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-border">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/70">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border text-sm">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-muted-foreground border-b border-border/50 text-sm">
        {children}
      </td>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/30 transition-colors">
        {children}
      </tr>
    ),
    img: ({ src, alt }) => (
      <figure className="my-6">
        <img
          src={src}
          alt={alt || ""}
          className="rounded-lg border border-border w-full"
          loading="lazy"
        />
        {alt && (
          <figcaption className="text-center text-xs text-muted-foreground mt-2 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
  };

  return (
    <div className="prose-article max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
