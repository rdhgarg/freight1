import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/settings/users")({
  head: () => ({ meta: [{ title: "Users — HAMS" }] }),
  component: () => <ComingSoon title="Users" phase="Phase 5" bullets={["User CRUD","Role assignment","Activate / deactivate","Password reset","Audit log"]} />,
});
