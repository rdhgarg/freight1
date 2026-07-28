import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { WorkOrderFormFields } from "@/components/forms/work-order-form";
import { useData } from "@/stores/data";
import { uid } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/work-orders/new")({
  head: () => ({ meta: [{ title: "New Work Order — HAMS" }] }),
  component: NewWO,
});

function NewWO() {
  const nav = useNavigate();
  const { workOrders, upsertWorkOrder } = useData();
  return (
    <div>
      <PageHeader title="New Work Order" description="Capture customer instruction and cargo details." />
      <div className="card-elevated p-6">
        <WorkOrderFormFields
          submitLabel="Create Work Order"
          onCancel={() => nav({ to: "/work-orders" })}
          onSubmit={(v) => {
            const woNumber = `WO-2026-${String(workOrders.length + 1).padStart(4, "0")}`;
            const now = new Date().toISOString();
            upsertWorkOrder({
              id: uid("w_"),
              woNumber,
              createdAt: now,
              status: "Draft",
              activityLog: [{ id: uid("a_"), at: now, by: "You", action: "WO created (Draft)" }],
              approvalHistory: [],
              docs: [],
              ...v,
              customerRef: v.customerRef || undefined,
              shippingLine: v.shippingLine || undefined,
              port: v.port || undefined,
              primaryVendorId: v.primaryVendorId || undefined,
              requiredDeliveryDate: v.requiredDeliveryDate || undefined,
              startDate: new Date(v.startDate).toISOString(),
              endDate: new Date(v.endDate).toISOString(),
            });
            toast.success(`Work Order ${woNumber} created`);
            nav({ to: "/work-orders" });
          }}
        />
      </div>
    </div>
  );
}
