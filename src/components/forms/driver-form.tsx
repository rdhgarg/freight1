import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Driver } from "@/lib/types";
import { DRIVER_STATUSES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/stores/data";

export const driverSchema = z.object({
  name: z.string().trim().min(2, "Driver name required").max(100),
  employeeId: z.string().trim().max(30).optional().or(z.literal("")),
  mobile: z.string().trim().min(7, "Valid phone required").max(25),
  license: z.string().trim().min(4, "License number required").max(40),
  licenseExpiry: z.string().min(1, "License expiry required"),
  nationality: z.string().trim().max(40).optional().or(z.literal("")),
  truckId: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().trim().max(100).optional().or(z.literal("")),
  emergencyContactPhone: z.string().trim().max(25).optional().or(z.literal("")),
  photoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["Available", "Assigned", "On Trip", "Leave", "Inactive"]),
});
export type DriverForm = z.infer<typeof driverSchema>;

export function DriverFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  defaultValues?: Partial<Driver>;
  onSubmit: (v: DriverForm) => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const fleet = useData((s) => s.fleet);
  const toDate = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      employeeId: defaultValues?.employeeId ?? "",
      mobile: defaultValues?.mobile ?? "",
      license: defaultValues?.license ?? "",
      licenseExpiry: toDate(defaultValues?.licenseExpiry) || toDate(new Date(Date.now() + 365 * 86400000).toISOString()),
      nationality: defaultValues?.nationality ?? "",
      truckId: defaultValues?.truckId ?? "",
      emergencyContactName: defaultValues?.emergencyContactName ?? "",
      emergencyContactPhone: defaultValues?.emergencyContactPhone ?? "",
      photoUrl: defaultValues?.photoUrl ?? "",
      status: (defaultValues?.status as DriverForm["status"]) ?? "Available",
    },
  });

  const err = (k: keyof DriverForm) =>
    errors[k] ? <p className="mt-1 text-[11px] text-destructive">{errors[k]?.message as string}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block">Driver name *</Label>
          <Input {...register("name")} placeholder="Rashid Al Marri" />
          {err("name")}
        </div>
        <div>
          <Label className="mb-1.5 block">Employee ID</Label>
          <Input {...register("employeeId")} placeholder="EMP-1042" />
          {err("employeeId")}
        </div>
        <div>
          <Label className="mb-1.5 block">Phone *</Label>
          <Input {...register("mobile")} placeholder="+971 50 123 4567" />
          {err("mobile")}
        </div>
        <div>
          <Label className="mb-1.5 block">Nationality</Label>
          <Input {...register("nationality")} placeholder="UAE" />
          {err("nationality")}
        </div>
        <div>
          <Label className="mb-1.5 block">License number *</Label>
          <Input {...register("license")} placeholder="DXB-4471920" />
          {err("license")}
        </div>
        <div>
          <Label className="mb-1.5 block">License expiry *</Label>
          <Input type="date" {...register("licenseExpiry")} />
          {err("licenseExpiry")}
        </div>
        <div>
          <Label className="mb-1.5 block">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DRIVER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Assigned fleet</Label>
          <Controller
            control={control}
            name="truckId"
            render={({ field }) => (
              <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {fleet.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.registration} · {f.vehicleType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Emergency contact name</Label>
          <Input {...register("emergencyContactName")} placeholder="Next of kin" />
        </div>
        <div>
          <Label className="mb-1.5 block">Emergency contact phone</Label>
          <Input {...register("emergencyContactPhone")} placeholder="+971 55 000 0000" />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Profile image URL</Label>
          <Input {...register("photoUrl")} placeholder="https://…" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
