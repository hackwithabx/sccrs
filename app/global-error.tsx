"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: "1rem", color: "#6b7280" }}>
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "2rem", padding: "0.625rem 1.5rem", borderRadius: "0.375rem", backgroundColor: "#18181b", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
