import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { FleetFormFields } from "@/components/forms/fleet-form";
import { Button } from "@/components/ui/button";
import { useData } from "@/stores/data";
import { toast } from "sonner";
import { FileX } from "lucide-react";

export const Route = createFileRoute("/_app/fleet/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Vehicle — HAMS" }] }),
  component: EditFleet,
});

function EditFleet() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { fleet, upsertFleet } = useData();
  const f = fleet.find((x) => x.id === id);
  if (!f) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Vehicle not found" action={<Button onClick={() => nav({ to: "/fleet" })}>Back</Button>} /></div>;
  return (
    <div>
      <PageHeader title={`Edit ${f.registration}`} />
      <div className="card-elevated p-6 max-w-4xl">
        <FleetFormFields defaultValues={f} submitLabel="Save changes" onCancel={() => nav({ to: "/fleet/$id", params: { id } })}
          onSubmit={(v) => {
            upsertFleet({
              ...f, ...v,
              insuranceExpiry: new Date(v.insuranceExpiry).toISOString(),
              fitnessExpiry: new Date(v.fitnessExpiry).toISOString(),
              permitExpiry: v.permitExpiry ? new Date(v.permitExpiry).toISOString() : undefined,
              pucExpiry: v.pucExpiry ? new Date(v.pucExpiry).toISOString() : undefined,
              ownerName: v.ownerName || undefined,
              driverId: v.driverId || undefined,
            });
            toast.success("Vehicle updated");
            nav({ to: "/fleet/$id", params: { id } });
          }}
        />
      </div>
    </div>
  );
}
