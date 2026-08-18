import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { DriverFormFields } from "@/components/forms/driver-form";
import { useData } from "@/stores/data";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/drivers/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Driver — HAMS" }] }),
  component: EditDriver,
});

function EditDriver() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const upsert = useData((s) => s.upsertDriver);
  const driver = useData((s) => s.drivers.find((d) => d.id === id));

  if (!driver) {
    return (
      <div className="card-elevated p-6">
        <EmptyState icon={UserX} title="Driver not found" action={<Button onClick={() => nav({ to: "/drivers" })}>Back</Button>} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit — ${driver.name}`} description="Update driver profile, license and availability." />
      <div className="card-elevated p-6 max-w-4xl">
        <DriverFormFields
          defaultValues={driver}
          submitLabel="Save changes"
          onCancel={() => nav({ to: "/drivers/$id", params: { id } })}
          onSubmit={(v) => {
            upsert({
              ...driver,
              ...v,
              employeeId: v.employeeId || undefined,
              nationality: v.nationality || undefined,
              truckId: v.truckId || undefined,
              emergencyContactName: v.emergencyContactName || undefined,
              emergencyContactPhone: v.emergencyContactPhone || undefined,
              photoUrl: v.photoUrl || undefined,
              licenseExpiry: new Date(v.licenseExpiry).toISOString(),
            });
            toast.success("Driver updated");
            nav({ to: "/drivers/$id", params: { id } });
          }}
        />
      </div>
    </div>
  );
}
