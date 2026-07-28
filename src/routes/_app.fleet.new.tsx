import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { FleetFormFields } from "@/components/forms/fleet-form";
import { useData } from "@/stores/data";
import { uid } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/fleet/new")({
  head: () => ({ meta: [{ title: "Add Vehicle — HAMS" }] }),
  component: NewFleet,
});

function NewFleet() {
  const nav = useNavigate();
  const upsert = useData((s) => s.upsertFleet);
  return (
    <div>
      <PageHeader title="Add Vehicle" description="Register a new vehicle in the fleet." />
      <div className="card-elevated p-6 max-w-4xl">
        <FleetFormFields submitLabel="Add vehicle" onCancel={() => nav({ to: "/fleet" })}
          onSubmit={(v) => {
            upsert({
              id: uid("f_"),
              createdAt: new Date().toISOString(),
              ...v,
              insuranceExpiry: new Date(v.insuranceExpiry).toISOString(),
              fitnessExpiry: new Date(v.fitnessExpiry).toISOString(),
              permitExpiry: v.permitExpiry ? new Date(v.permitExpiry).toISOString() : undefined,
              pucExpiry: v.pucExpiry ? new Date(v.pucExpiry).toISOString() : undefined,
              ownerName: v.ownerName || undefined,
              driverId: v.driverId || undefined,
            });
            toast.success("Vehicle added");
            nav({ to: "/fleet" });
          }}
        />
      </div>
    </div>
  );
}
