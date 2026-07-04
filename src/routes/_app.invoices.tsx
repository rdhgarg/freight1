import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/invoices")({
  head: () => ({ meta: [{ title: "Invoices — HAMS" }] }),
  component: () => <ComingSoon title="Invoices" phase="Phase 4" bullets={["Generate from shipment","PDF preview & download","Status (Draft/Sent/Paid/Overdue)","Tax calculation","Bulk export"]} />,
});
