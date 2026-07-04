import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/ledgers")({
  head: () => ({ meta: [{ title: "Ledgers — HAMS" }] }),
  component: () => <ComingSoon title="Ledgers" phase="Phase 4" bullets={["Customer & supplier ledgers","Running balance","Date filters","Transaction drill-down","Export"]} />,
});
