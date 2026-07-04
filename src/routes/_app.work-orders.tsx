import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/work-orders")({
  head: () => ({ meta: [{ title: "Work Orders — HAMS" }] }),
  component: () => <ComingSoon title="Work Orders" phase="Phase 2" bullets={["WO creation & approval","Rate & terms builder","Approve then generate Shipment","Timeline tracking","Status pipeline"]} />,
});
