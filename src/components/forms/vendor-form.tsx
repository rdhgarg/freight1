import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Vendor } from "@/lib/types";
import { VENDOR_CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const vendorSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(150),
  code: z.string().trim().min(1, "Code required").max(20),
  category: z.enum(["Transport", "Customs", "Forwarder", "Port Handling", "Warehouse", "Inspection", "Fuel", "Other"]),
  gst: z.string().trim().min(5, "GST required").max(20),
  services: z.string().trim().min(2, "Services required").max(300),
  address: z.string().trim().min(4, "Address required").max(500),
  contactName: z.string().trim().min(2).max(100),
  contactPhone: z.string().trim().min(6).max(20),
  contactEmail: z.string().trim().email("Valid email required").max(255),
  paymentTerms: z.string().min(1),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(["Active", "Inactive", "Blacklisted"]),
});
export type VendorForm = z.infer<typeof vendorSchema>;

export function VendorFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  defaultValues?: Partial<Vendor>;
  onSubmit: (v: VendorForm) => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<VendorForm>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      code: defaultValues?.code ?? "",
      category: (defaultValues?.category as VendorForm["category"]) ?? "Transport",
      gst: defaultValues?.gst ?? "",
      services: defaultValues?.services ?? "",
      address: defaultValues?.address ?? "",
      contactName: defaultValues?.contactName ?? "",
      contactPhone: defaultValues?.contactPhone ?? "",
      contactEmail: defaultValues?.contactEmail ?? "",
      paymentTerms: defaultValues?.paymentTerms ?? "Net 30",
      rating: defaultValues?.rating ?? 4,
      status: defaultValues?.status ?? "Active",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vendor name" error={errors.name?.message}><Input {...register("name")} /></Field>
        <Field label="Vendor code" error={errors.code?.message}><Input className="font-mono" {...register("code")} /></Field>
        <Field label="Category" error={errors.category?.message}>
          <Controller control={control} name="category" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{VENDOR_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="GST number" error={errors.gst?.message}><Input className="font-mono" {...register("gst")} /></Field>
        <Field label="Contact name" error={errors.contactName?.message}><Input {...register("contactName")} /></Field>
        <Field label="Contact phone" error={errors.contactPhone?.message}><Input {...register("contactPhone")} /></Field>
        <Field label="Contact email" error={errors.contactEmail?.message}><Input type="email" {...register("contactEmail")} /></Field>
        <Field label="Payment terms" error={errors.paymentTerms?.message}>
          <Controller control={control} name="paymentTerms" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Immediate","Net 7","Net 15","Net 30","Net 45","Net 60"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Rating (0-5)" error={errors.rating?.message}>
          <Input type="number" min={0} max={5} step={0.1} {...register("rating", { valueAsNumber: true })} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Controller control={control} name="status" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </Field>
      </div>
      <Field label="Services" error={errors.services?.message}><Input {...register("services")} placeholder="e.g. Customs clearance, Documentation" /></Field>
      <Field label="Address" error={errors.address?.message}><Textarea rows={3} {...register("address")} /></Field>
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
