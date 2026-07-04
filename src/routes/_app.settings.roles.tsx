import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/settings/roles")({
  head: () => ({ meta: [{ title: "Roles & Permissions — HAMS" }] }),
  component: () => <ComingSoon title="Roles & Permissions" phase="Phase 5" bullets={["Live permission matrix","Per-module actions","Custom role editor","Preview role capabilities","Reset defaults"]} />,
});
