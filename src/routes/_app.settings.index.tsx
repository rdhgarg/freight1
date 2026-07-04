import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/settings/")({
  head: () => ({ meta: [{ title: "Settings — HAMS" }] }),
  component: () => <ComingSoon title="Settings" phase="Phase 5" bullets={["Company profile","Invoice & tax config","Email templates","Notifications","System preferences"]} />,
});
