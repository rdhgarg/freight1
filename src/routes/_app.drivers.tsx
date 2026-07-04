import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/drivers")({
  head: () => ({ meta: [{ title: "Drivers — HAMS" }] }),
  component: () => <ComingSoon title="Drivers" phase="Phase 2" bullets={["Driver profiles & licenses","Truck assignment","Delivery history","Performance reports","Search, filters, pagination|CSV export"]} />,
});
