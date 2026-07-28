import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { VendorFormFields } from "@/components/forms/vendor-form";
import { useData } from "@/stores/data";
import { uid } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vendors/new")({
  head: () => ({ meta: [{ title: "New Vendor — HAMS" }] }),
  component: NewVendor,
});

function NewVendor() {
  const nav = useNavigate();
  const upsert = useData((s) => s.upsertVendor);
  return (
    <div>
      <PageHeader title="New Vendor" description="Register a service provider." />
      <div className="card-elevated p-6 max-w-4xl">
        <VendorFormFields submitLabel="Create vendor" onCancel={() => nav({ to: "/vendors" })}
          onSubmit={(v) => {
            upsert({ id: uid("v_"), createdAt: new Date().toISOString(), ...v });
            toast.success("Vendor created");
            nav({ to: "/vendors" });
          }}
        />
      </div>
    </div>
  );
}
