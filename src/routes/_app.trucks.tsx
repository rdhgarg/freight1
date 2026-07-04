import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/trucks")({
  head: () => ({ meta: [{ title: "Trucks — HAMS" }] }),
  component: () => <ComingSoon title="Trucks" phase="Phase 2" bullets={["Fleet register","Insurance & fitness expiry","Driver mapping","Shipment mapping","Maintenance status"]} />,
});
