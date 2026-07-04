import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { CustomerFormFields } from "@/components/forms/customer-form";
import { useData } from "@/stores/data";
import { toast } from "sonner";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/customers/$id/edit")({
  head: () => ({ meta: [{ title: "Edit customer — HAMS" }] }),
  component: EditCustomer,
});

function EditCustomer() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const customer = useData((s) => s.customers.find((c) => c.id === id));
  const upsert = useData((s) => s.upsertCustomer);

  if (!customer) {
    return (
      <div className="card-elevated p-6">
        <EmptyState icon={UserX} title="Customer not found" action={<Button onClick={() => navigate({ to: "/customers" })}>Back to customers</Button>} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit ${customer.company}`} description="Update customer details." />
      <div className="card-elevated p-6 max-w-3xl">
        <CustomerFormFields
          defaultValues={customer}
          submitLabel="Save changes"
          onCancel={() => navigate({ to: "/customers/$id", params: { id } })}
          onSubmit={(v) => {
            upsert({ ...customer, ...v });
            toast.success("Customer updated");
            navigate({ to: "/customers/$id", params: { id } });
          }}
        />
      </div>
    </div>
  );
}
