import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/purchases")({
  head: () => ({ meta: [{ title: "Purchases — HAMS" }] }),
  component: () => <ComingSoon title="Purchases" phase="Phase 3" bullets={["Purchase orders","Supplier bills","Approval + payment tracking","PO status pipeline","Purchase reports"]} />,
});
