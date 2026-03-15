import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Article | SCRs Community Blog",
  description: "Share your security expertise with the SCRs community. Write and submit articles on application security, vulnerability research, and secure coding.",
  openGraph: {
    title: "Submit Article | SCRs Community Blog",
    description: "Share your security expertise with the SCRs community.",
  },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
