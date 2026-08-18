import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DriverFormFields } from "@/components/forms/driver-form";
import { useData } from "@/stores/data";
import { uid } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/drivers/new")({
  head: () => ({ meta: [{ title: "Add Driver — HAMS" }] }),
  component: NewDriver,
});

function NewDriver() {
  const nav = useNavigate();
  const upsert = useData((s) => s.upsertDriver);
  return (
    <div>
      <PageHeader title="Add Driver" description="Register a new driver in the master list." />
      <div className="card-elevated p-6 max-w-4xl">
        <DriverFormFields
          submitLabel="Add driver"
          onCancel={() => nav({ to: "/drivers" })}
          onSubmit={(v) => {
            upsert({
              id: uid("dr_"),
              joinedAt: new Date().toISOString(),
              docs: [],
              ...v,
              employeeId: v.employeeId || undefined,
              nationality: v.nationality || undefined,
              truckId: v.truckId || undefined,
              emergencyContactName: v.emergencyContactName || undefined,
              emergencyContactPhone: v.emergencyContactPhone || undefined,
              photoUrl: v.photoUrl || undefined,
              licenseExpiry: new Date(v.licenseExpiry).toISOString(),
            });
            toast.success("Driver added");
            nav({ to: "/drivers" });
          }}
        />
      </div>
    </div>
  );
}
