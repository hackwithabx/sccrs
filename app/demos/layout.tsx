import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Website Demo Templates | SecureCodeReviews",
    template: "%s | SecureCodeReviews",
  },
  description:
    "Premium responsive website templates for clinics, restaurants, real estate, CA firms, coaching institutes, and salons.",
  robots: { index: false, follow: false },
};

export default function DemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ colorScheme: "light", scrollBehavior: "smooth" }}
    >
      {children}
    </div>
  );
}
