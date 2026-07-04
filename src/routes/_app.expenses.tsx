import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — HAMS" }] }),
  component: () => <ComingSoon title="Expenses" phase="Phase 3" bullets={["6 expense categories","Receipt upload","Shipment linking","Approval workflow","Reports & filters"]} />,
});
