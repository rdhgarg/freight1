import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { WorkOrder } from "@/lib/types";
import { CARGO_TYPES, CONTAINER_TYPES, INDIAN_PORTS, SHIPPING_LINES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/stores/data";

export const workOrderSchema = z.object({
  customerId: z.string().min(1, "Customer required"),
  customerRef: z.string().max(80).optional().or(z.literal("")),
  cargoType: z.enum(["FCL", "LCL", "Bulk", "Break-Bulk", "Reefer", "Hazardous"]).optional(),
  commodity: z.string().max(150).optional().or(z.literal("")),
  containerType: z.enum(["20ft GP", "40ft GP", "40ft HC", "20ft Reefer", "40ft Reefer", "Flat Rack", "Open Top"]).optional(),
  containers: z.number().min(1, "At least 1").max(500),
  weightTons: z.number().min(0).optional(),
  volumeCbm: z.number().min(0).optional(),
  shippingLine: z.string().optional().or(z.literal("")),
  vessel: z.string().max(100).optional().or(z.literal("")),
  voyage: z.string().max(80).optional().or(z.literal("")),
  blNumber: z.string().max(80).optional().or(z.literal("")),
  deliveryOrderNo: z.string().max(80).optional().or(z.literal("")),
  port: z.string().optional().or(z.literal("")),
  terminal: z.string().max(100).optional().or(z.literal("")),
  pickup: z.string().min(2, "Pickup required").max(300),
  delivery: z.string().min(2, "Delivery required").max(300),
  deliveryContactName: z.string().max(100).optional().or(z.literal("")),
  deliveryContactPhone: z.string().max(20).optional().or(z.literal("")),
  rate: z.number().min(0, "Required"),
  currency: z.enum(["AED", "INR", "USD", "EUR"]),
  taxPct: z.number().min(0).max(100),
  billingTerms: z.string().max(80).optional().or(z.literal("")),
  terms: z.string().max(500),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  requiredDeliveryDate: z.string().optional().or(z.literal("")),
  primaryVendorId: z.string().optional().or(z.literal("")),
  remarks: z.string().max(1000).optional().or(z.literal("")),
});
export type WorkOrderForm = z.infer<typeof workOrderSchema>;

export function WorkOrderFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  defaultValues?: Partial<WorkOrder>;
  onSubmit: (v: WorkOrderForm) => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const customers = useData((s) => s.customers);
  const vendors = useData((s) => s.vendors);
  const toDate = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } =
    useForm<WorkOrderForm>({
      resolver: zodResolver(workOrderSchema),
      defaultValues: {
        customerId: defaultValues?.customerId ?? "",
        customerRef: defaultValues?.customerRef ?? "",
        cargoType: defaultValues?.cargoType ?? "FCL",
        commodity: defaultValues?.commodity ?? "",
        containerType: defaultValues?.containerType ?? "40ft HC",
        containers: defaultValues?.containers ?? 1,
        weightTons: defaultValues?.weightTons ?? 0,
        volumeCbm: defaultValues?.volumeCbm ?? 0,
        shippingLine: defaultValues?.shippingLine ?? "",
        vessel: defaultValues?.vessel ?? "",
        voyage: defaultValues?.voyage ?? "",
        blNumber: defaultValues?.blNumber ?? "",
        deliveryOrderNo: defaultValues?.deliveryOrderNo ?? "",
        port: defaultValues?.port ?? "",
        terminal: defaultValues?.terminal ?? "",
        pickup: defaultValues?.pickup ?? "",
        delivery: defaultValues?.delivery ?? "",
        deliveryContactName: defaultValues?.deliveryContactName ?? "",
        deliveryContactPhone: defaultValues?.deliveryContactPhone ?? "",
        rate: defaultValues?.rate ?? 0,
        currency: defaultValues?.currency ?? "AED",
        taxPct: defaultValues?.taxPct ?? 5,
        billingTerms: defaultValues?.billingTerms ?? "Net 30",
        terms: defaultValues?.terms ?? "",
        priority: defaultValues?.priority ?? "Normal",
        startDate: toDate(defaultValues?.startDate) || toDate(new Date().toISOString()),
        endDate: toDate(defaultValues?.endDate) || toDate(new Date(Date.now() + 5 * 86400000).toISOString()),
        requiredDeliveryDate: toDate(defaultValues?.requiredDeliveryDate),
        primaryVendorId: defaultValues?.primaryVendorId ?? "",
        remarks: defaultValues?.remarks ?? "",
      },
    });

  const containers = watch("containers") || 0;
  const rate = watch("rate") || 0;
  const taxPct = watch("taxPct") || 0;
  const subtotal = containers * rate;
  const tax = (subtotal * taxPct) / 100;
  const total = subtotal + tax;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section title="Customer">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer" error={errors.customerId?.message}>
            <Controller control={control} name="customerId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Customer reference" error={errors.customerRef?.message}>
            <Input {...register("customerRef")} placeholder="Client PO / Ref no." />
          </Field>
        </div>
      </Section>

      <Section title="Cargo & Container">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cargo type" error={errors.cargoType?.message}>
            <Controller control={control} name="cargoType" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CARGO_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Commodity" error={errors.commodity?.message}><Input {...register("commodity")} placeholder="e.g. Textiles" /></Field>
          <Field label="Container type" error={errors.containerType?.message}>
            <Controller control={control} name="containerType" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTAINER_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Containers" error={errors.containers?.message}>
            <Input type="number" min={1} {...register("containers", { valueAsNumber: true })} />
          </Field>
          <Field label="Weight (tons)" error={errors.weightTons?.message}>
            <Input type="number" step={0.1} min={0} {...register("weightTons", { valueAsNumber: true })} />
          </Field>
          <Field label="Volume (CBM)" error={errors.volumeCbm?.message}>
            <Input type="number" step={0.1} min={0} {...register("volumeCbm", { valueAsNumber: true })} />
          </Field>
        </div>
      </Section>

      <Section title="Shipping Details">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Shipping line" error={errors.shippingLine?.message}>
            <Controller control={control} name="shippingLine" render={({ field }) => (
              <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select line" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">—</SelectItem>
                  {SHIPPING_LINES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Vessel" error={errors.vessel?.message}><Input {...register("vessel")} /></Field>
          <Field label="Voyage" error={errors.voyage?.message}><Input {...register("voyage")} /></Field>
          <Field label="BL number" error={errors.blNumber?.message}><Input className="font-mono" {...register("blNumber")} /></Field>
          <Field label="Delivery Order no." error={errors.deliveryOrderNo?.message}><Input className="font-mono" {...register("deliveryOrderNo")} /></Field>
          <Field label="Port" error={errors.port?.message}>
            <Controller control={control} name="port" render={({ field }) => (
              <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select port" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">—</SelectItem>
                  {INDIAN_PORTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Terminal" error={errors.terminal?.message}><Input {...register("terminal")} /></Field>
        </div>
      </Section>

      <Section title="Route">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pickup location" error={errors.pickup?.message}><Textarea rows={2} {...register("pickup")} /></Field>
          <Field label="Delivery location" error={errors.delivery?.message}><Textarea rows={2} {...register("delivery")} /></Field>
          <Field label="Delivery contact name" error={errors.deliveryContactName?.message}><Input {...register("deliveryContactName")} /></Field>
          <Field label="Delivery contact phone" error={errors.deliveryContactPhone?.message}><Input {...register("deliveryContactPhone")} /></Field>
        </div>
      </Section>

      <Section title="Commercial">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rate per container" error={errors.rate?.message}>
            <Input type="number" min={0} step={500} {...register("rate", { valueAsNumber: true })} />
          </Field>
          <Field label="Currency" error={errors.currency?.message}>
            <Controller control={control} name="currency" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR ₹</SelectItem>
                  <SelectItem value="USD">USD $</SelectItem>
                  <SelectItem value="EUR">EUR €</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Tax %" error={errors.taxPct?.message}>
            <Input type="number" min={0} max={100} step={0.5} {...register("taxPct", { valueAsNumber: true })} />
          </Field>
          <Field label="Billing terms" error={errors.billingTerms?.message}>
            <Controller control={control} name="billingTerms" render={({ field }) => (
              <Select value={field.value || "Net 30"} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Immediate","Net 7","Net 15","Net 30","Net 45","Net 60"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Primary vendor" error={errors.primaryVendorId?.message}>
            <Controller control={control} name="primaryVendorId" render={({ field }) => (
              <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">—</SelectItem>
                  {vendors.filter((v) => v.status === "Active").map((v) => <SelectItem key={v.id} value={v.id}>{v.name} · {v.category}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Priority" error={errors.priority?.message}>
            <Controller control={control} name="priority" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </Field>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm grid grid-cols-3 gap-4">
          <div><div className="text-[11px] uppercase text-muted-foreground">Subtotal</div><div className="font-semibold">{subtotal.toLocaleString("en-IN")}</div></div>
          <div><div className="text-[11px] uppercase text-muted-foreground">Tax</div><div className="font-semibold">{Math.round(tax).toLocaleString("en-IN")}</div></div>
          <div><div className="text-[11px] uppercase text-muted-foreground">Total</div><div className="font-bold text-primary">{Math.round(total).toLocaleString("en-IN")}</div></div>
        </div>
      </Section>

      <Section title="Schedule">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Start date" error={errors.startDate?.message}><Input type="date" {...register("startDate")} /></Field>
          <Field label="End date" error={errors.endDate?.message}><Input type="date" {...register("endDate")} /></Field>
          <Field label="Required delivery" error={errors.requiredDeliveryDate?.message}><Input type="date" {...register("requiredDeliveryDate")} /></Field>
        </div>
      </Section>

      <Section title="Terms & Remarks">
        <Field label="Terms" error={errors.terms?.message}><Textarea rows={2} {...register("terms")} placeholder="e.g. Door delivery, unloading included" /></Field>
        <Field label="Remarks" error={errors.remarks?.message}><Textarea rows={2} {...register("remarks")} /></Field>
      </Section>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
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
