import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/shipments")({
  head: () => ({ meta: [{ title: "Shipments — HAMS" }] }),
  component: () => <ComingSoon title="Shipments" phase="Phase 3" bullets={["Full 8-stage timeline","Driver + truck assignment","Documents & proof upload","Expense tab per shipment","Activity log"]} />,
});
