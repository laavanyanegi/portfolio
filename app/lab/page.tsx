import type { Metadata } from "next";
import LabClient from "@/components/canvas/lab/LabClient";

// Phase 2 look test: deployed but unlinked, and kept out of search engines.
export const metadata: Metadata = {
  title: "Look test",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <LabClient />;
}
