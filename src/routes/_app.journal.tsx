import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/journal")({
  head: () => ({ meta: [{ title: "Journal & Contra — HAMS" }] }),
  component: () => <ComingSoon title="Journal & Contra" phase="Phase 4" bullets={["Manual journal entries","Contra entries","Debit / credit accounts","Narration & references","Financial records"]} />,
});
