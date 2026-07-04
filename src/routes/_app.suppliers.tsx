import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_app/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — HAMS" }] }),
  component: () => <ComingSoon title="Suppliers" phase="Phase 2" bullets={["Vendor master","Supplier bills","Expense linking","Payment terms","Search, filters|Category grouping"]} />,
});
