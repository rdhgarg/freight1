import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/receipts")({
  head: () => ({ meta: [{ title: "Receipts — HAMS" }] }),
  component: () => <ComingSoon title="Receipts" phase="Phase 4" bullets={["Payment against invoice","Multiple modes","PDF receipts","Auto ledger posting","History"]} />,
});
