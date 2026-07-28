import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { VendorFormFields } from "@/components/forms/vendor-form";
import { Button } from "@/components/ui/button";
import { useData } from "@/stores/data";
import { toast } from "sonner";
import { FileX } from "lucide-react";

export const Route = createFileRoute("/_app/vendors/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Vendor — HAMS" }] }),
  component: EditVendor,
});

function EditVendor() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { vendors, upsertVendor } = useData();
  const v = vendors.find((x) => x.id === id);
  if (!v) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Vendor not found" action={<Button onClick={() => nav({ to: "/vendors" })}>Back</Button>} /></div>;
  return (
    <div>
      <PageHeader title={`Edit ${v.name}`} />
      <div className="card-elevated p-6 max-w-4xl">
        <VendorFormFields defaultValues={v} submitLabel="Save changes" onCancel={() => nav({ to: "/vendors/$id", params: { id } })}
          onSubmit={(val) => { upsertVendor({ ...v, ...val }); toast.success("Vendor updated"); nav({ to: "/vendors/$id", params: { id } }); }}
        />
      </div>
    </div>
  );
}
