import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/settings/company")({
  head: () => ({ meta: [{ title: "Company Profile — HAMS" }] }),
  component: () => <ComingSoon title="Company Profile" phase="Phase 5" bullets={["Business identity","GSTIN / PAN","Registered address","Logo upload","Bank details"]} />,
});
