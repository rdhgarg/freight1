import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/outstanding")({
  head: () => ({ meta: [{ title: "Outstanding — HAMS" }] }),
  component: () => <ComingSoon title="Outstanding" phase="Phase 4" bullets={["Aging buckets","Overdue tracking","Reminder actions","Party-wise summary","Excel export"]} />,
});
