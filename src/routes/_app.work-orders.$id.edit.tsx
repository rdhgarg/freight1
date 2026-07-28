import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { WorkOrderFormFields } from "@/components/forms/work-order-form";
import { Button } from "@/components/ui/button";
import { useData } from "@/stores/data";
import { toast } from "sonner";
import { FileX } from "lucide-react";

export const Route = createFileRoute("/_app/work-orders/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Work Order — HAMS" }] }),
  component: EditWO,
});

function EditWO() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { workOrders, upsertWorkOrder } = useData();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Work order not found" action={<Button onClick={() => nav({ to: "/work-orders" })}>Back</Button>} /></div>;

  return (
    <div>
      <PageHeader title={`Edit ${wo.woNumber}`} description="Update the work order details." />
      <div className="card-elevated p-6">
        <WorkOrderFormFields
          defaultValues={wo}
          submitLabel="Save changes"
          onCancel={() => nav({ to: "/work-orders/$id", params: { id } })}
          onSubmit={(v) => {
            upsertWorkOrder({
              ...wo,
              ...v,
              startDate: new Date(v.startDate).toISOString(),
              endDate: new Date(v.endDate).toISOString(),
              requiredDeliveryDate: v.requiredDeliveryDate ? new Date(v.requiredDeliveryDate).toISOString() : undefined,
            });
            toast.success("Work order updated");
            nav({ to: "/work-orders/$id", params: { id } });
          }}
        />
      </div>
    </div>
  );
}
