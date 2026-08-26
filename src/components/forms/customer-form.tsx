import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Customer } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Controller } from "react-hook-form";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  company: z.string().trim().min(2, "Company is required").max(150),
  gst: z.string().trim().min(5, "TRN is required").max(20),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(6, "Phone required").max(20),
  address: z.string().trim().min(4, "Address required").max(500),
  paymentTerms: z.string().min(1, "Required"),
  creditLimit: z.number({ error: "Must be a number" }).min(0, "Must be >= 0"),
  status: z.enum(["Active", "Inactive"]),
});
export type CustomerForm = z.infer<typeof customerSchema>;

export function CustomerFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  defaultValues?: Partial<Customer>;
  onSubmit: (v: CustomerForm) => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      company: defaultValues?.company ?? "",
      gst: defaultValues?.gst ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      paymentTerms: defaultValues?.paymentTerms ?? "Net 30",
      creditLimit: defaultValues?.creditLimit ?? 0,
      status: defaultValues?.status ?? "Active",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact name" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Company name" error={errors.company?.message}>
          <Input {...register("company")} />
        </Field>
        <Field label="TRN (Tax Registration Number)" error={errors.gst?.message}>
          <Input className="font-mono" {...register("gst")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </Field>
        <Field label="Payment terms" error={errors.paymentTerms?.message}>
          <Controller
            control={control}
            name="paymentTerms"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Immediate", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Credit limit (₹)" error={errors.creditLimit?.message}>
          <Input type="number" min={0} step={1000} {...register("creditLimit", { valueAsNumber: true })} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
      <Field label="Address" error={errors.address?.message}>
        <Textarea rows={3} {...register("address")} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
