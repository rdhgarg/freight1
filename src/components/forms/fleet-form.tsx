import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Fleet } from "@/lib/types";
import { FLEET_VEHICLE_TYPES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/stores/data";

export const fleetSchema = z.object({
  registration: z.string().trim().min(4, "Registration required").max(30),
  vehicleType: z.enum(["Trailer 20ft", "Trailer 40ft", "Container Truck", "Open Truck", "Tanker", "LCV"]),
  capacityTons: z.number().min(0).max(200),
  ownership: z.enum(["Owned", "Attached", "Market Hire"]),
  ownerName: z.string().max(150).optional().or(z.literal("")),
  driverId: z.string().optional().or(z.literal("")),
  insuranceExpiry: z.string().min(1, "Required"),
  fitnessExpiry: z.string().min(1, "Required"),
  permitExpiry: z.string().optional().or(z.literal("")),
  pucExpiry: z.string().optional().or(z.literal("")),
  odometerKm: z.number().min(0).optional(),
  status: z.enum(["Available", "Assigned", "Maintenance", "Retired"]),
});
export type FleetForm = z.infer<typeof fleetSchema>;

export function FleetFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  defaultValues?: Partial<Fleet>;
  onSubmit: (v: FleetForm) => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const drivers = useData((s) => s.drivers);
  const toDate = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FleetForm>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {
      registration: defaultValues?.registration ?? "",
      vehicleType: (defaultValues?.vehicleType as FleetForm["vehicleType"]) ?? "Container Truck",
      capacityTons: defaultValues?.capacityTons ?? 20,
      ownership: defaultValues?.ownership ?? "Owned",
      ownerName: defaultValues?.ownerName ?? "",
      driverId: defaultValues?.driverId ?? "",
      insuranceExpiry: toDate(defaultValues?.insuranceExpiry) || toDate(new Date(Date.now() + 180 * 86400000).toISOString()),
      fitnessExpiry: toDate(defaultValues?.fitnessExpiry) || toDate(new Date(Date.now() + 365 * 86400000).toISOString()),
      permitExpiry: toDate(defaultValues?.permitExpiry),
      pucExpiry: toDate(defaultValues?.pucExpiry),
      odometerKm: defaultValues?.odometerKm ?? 0,
      status: defaultValues?.status ?? "Available",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Registration number" error={errors.registration?.message}>
          <Input className="font-mono uppercase" placeholder="MH 04 AB 1234" {...register("registration")} />
        </Field>
        <Field label="Vehicle type" error={errors.vehicleType?.message}>
          <Controller control={control} name="vehicleType" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FLEET_VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Capacity (tons)" error={errors.capacityTons?.message}>
          <Input type="number" step={0.5} {...register("capacityTons", { valueAsNumber: true })} />
        </Field>
        <Field label="Ownership" error={errors.ownership?.message}>
          <Controller control={control} name="ownership" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">Owned</SelectItem>
                <SelectItem value="Attached">Attached</SelectItem>
                <SelectItem value="Market Hire">Market Hire</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Owner name" error={errors.ownerName?.message}><Input {...register("ownerName")} placeholder="Optional (for Attached/Hire)" /></Field>
        <Field label="Assigned driver" error={errors.driverId?.message}>
          <Controller control={control} name="driverId" render={({ field }) => (
            <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Unassigned</SelectItem>
                {drivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.license}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Insurance expiry" error={errors.insuranceExpiry?.message}><Input type="date" {...register("insuranceExpiry")} /></Field>
        <Field label="Fitness expiry" error={errors.fitnessExpiry?.message}><Input type="date" {...register("fitnessExpiry")} /></Field>
        <Field label="Permit expiry" error={errors.permitExpiry?.message}><Input type="date" {...register("permitExpiry")} /></Field>
        <Field label="PUC expiry" error={errors.pucExpiry?.message}><Input type="date" {...register("pucExpiry")} /></Field>
        <Field label="Odometer (km)" error={errors.odometerKm?.message}>
          <Input type="number" min={0} step={100} {...register("odometerKm", { valueAsNumber: true })} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Controller control={control} name="status" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </Field>
      </div>
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
