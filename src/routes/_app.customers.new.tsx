import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { CustomerFormFields } from "@/components/forms/customer-form";
import { useData } from "@/stores/data";
import { uid } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers/new")({
  head: () => ({ meta: [{ title: "New customer — HAMS" }] }),
  component: NewCustomer,
});

function NewCustomer() {
  const navigate = useNavigate();
  const upsert = useData((s) => s.upsertCustomer);
  return (
    <div>
      <PageHeader title="New Customer" description="Add a customer to your book." />
      <div className="card-elevated p-6 max-w-3xl">
        <CustomerFormFields
          submitLabel="Create customer"
          onCancel={() => navigate({ to: "/customers" })}
          onSubmit={(v) => {
            upsert({ id: uid("c_"), createdAt: new Date().toISOString(), ...v });
            toast.success("Customer created");
            navigate({ to: "/customers" });
          }}
        />
      </div>
    </div>
  );
}
