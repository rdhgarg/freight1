import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, Circle, Phone, RotateCcw, Truck, UserCog, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, StatusBadge } from "@/components/page-header";
import { useData } from "@/stores/data";
import { useActor } from "@/components/wo/use-actor";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { WO_OPS_TASKS } from "@/lib/types";
import type { WorkOrder } from "@/lib/types";

/* ------------------------------- Operations ------------------------------- */

export function OperationsTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { toggleWOOpsTask, setWOOpsRemarks } = useData();
  const [remarks, setRemarks] = useState(wo.opsRemarks ?? "");
  const [taskRemark, setTaskRemark] = useState<Record<string, string>>({});
  const tasks = wo.opsTasks ?? [];
  const done = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      <div className="card-elevated p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-semibold">Operations Checklist</div>
            <div className="text-xs text-muted-foreground">
              {done} of {WO_OPS_TASKS.length} tasks completed — updates post to the live timeline automatically.
            </div>
          </div>
          <StatusBadge status={done === WO_OPS_TASKS.length ? "Completed" : "In Progress"} />
        </div>

        <ul className="mt-3 space-y-2">
          {WO_OPS_TASKS.map((def) => {
            const t = tasks.find((x) => x.key === def.key);
            const completed = Boolean(t?.completed);
            return (
              <li key={def.key} className={`rounded-lg border p-3 ${completed ? "border-success/40 bg-success/5" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={completed ? `Reopen ${def.label}` : `Complete ${def.label}`}
                    onClick={() => {
                      toggleWOOpsTask(wo.id, def.key, actor, taskRemark[def.key] || undefined);
                      toast.success(completed ? `${def.label} reopened` : `${def.label} completed`);
                    }}
                    className="mt-0.5 shrink-0"
                  >
                    {completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${completed ? "" : "text-foreground"}`}>{def.label}</span>
                      <StatusBadge status={completed ? "Completed" : "Pending"} />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {completed
                        ? `${fmtDateTime(t!.completedAt ?? "")} · ${t!.by ?? "—"}${t!.department ? ` · ${t!.department}` : ""}`
                        : `Unlocks stage: ${def.stage}`}
                    </div>
                    {t?.remarks && <div className="mt-1 text-xs">Remarks: {t.remarks}</div>}
                    {!completed && (
                      <Input
                        className="mt-2 h-8 text-xs"
                        placeholder="Remarks (optional)"
                        value={taskRemark[def.key] ?? ""}
                        onChange={(e) => setTaskRemark((s) => ({ ...s, [def.key]: e.target.value }))}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card-elevated p-4">
        <Label className="mb-1.5 block">Operations remarks</Label>
        <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Port notes, hold reasons, coordination details…" />
        <div className="mt-2 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => { setRemarks(""); setWOOpsRemarks(wo.id, ""); toast.message("Remarks cleared"); }}>Clear</Button>
          <Button size="sm" onClick={() => { setWOOpsRemarks(wo.id, remarks); toast.success("Remarks saved"); }}>Save remarks</Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Driver --------------------------------- */

export function DriverTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { drivers, fleet, assignWODriver, releaseWOAssignment } = useData();
  const [driverId, setDriverId] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const current = drivers.find((d) => d.id === wo.assignedDriverId);
  const history = (wo.assignmentHistory ?? []).filter((h) => h.type === "Driver").slice().reverse();
  const selectable = drivers.filter((d) => ["Available", "Assigned", "On Trip"].includes(d.status) || d.id === wo.assignedDriverId);

  const save = () => {
    if (!driverId) return;
    assignWODriver(wo.id, driverId, actor, note || undefined);
    toast.success(current ? "Driver replaced" : "Driver assigned");
    setOpen(false);
    setDriverId("");
    setNote("");
  };

  return (
    <div className="space-y-4">
      <div className="card-elevated p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Assigned driver</div>
            {current ? (
              <div className="mt-1">
                <div className="text-base font-semibold">{current.name}</div>
                <div className="text-xs text-muted-foreground">
                  {current.employeeId ?? "—"} · {current.mobile} · License {current.license}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={current.status} />
                  {current.licenseExpiry && new Date(current.licenseExpiry).getTime() < Date.now() && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-destructive"><ShieldAlert className="h-3 w-3" /> License expired</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-1 text-sm text-muted-foreground">No driver assigned yet.</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {current && (
              <>
                <Button size="sm" variant="outline" asChild>
                  <a href={`tel:${current.mobile.replace(/\s/g, "")}`}><Phone className="h-4 w-4 mr-1.5" /> Call driver</a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/drivers/$id" params={{ id: current.id }}><ExternalLink className="h-4 w-4 mr-1.5" /> Driver details</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => { releaseWOAssignment(wo.id, "Driver", actor); toast.message("Driver released"); }}>
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Release
                </Button>
              </>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><UserCog className="h-4 w-4 mr-1.5" /> {current ? "Replace driver" : "Assign driver"}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{current ? "Replace driver" : "Assign driver"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-1.5 block">Driver</Label>
                    <Select value={driverId} onValueChange={setDriverId}>
                      <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                      <SelectContent>
                        {selectable.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name} · {d.status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-[11px] text-muted-foreground">Drivers on leave or inactive are not selectable.</p>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Reason / note</Label>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button disabled={!driverId} onClick={save}>Save assignment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4">
        <div className="text-sm font-semibold">Driver assignment history</div>
        {history.length === 0 ? (
          <EmptyState icon={UserCog} title="No driver assignments yet" />
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((h) => {
              const d = drivers.find((x) => x.id === h.driverId);
              const f = fleet.find((x) => x.id === h.fleetId);
              return (
                <li key={h.id} className="flex items-start gap-3 rounded-lg border border-border p-2.5">
                  <Truck className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{h.action} — {d?.name ?? f?.registration ?? "—"}</div>
                    <div className="text-[11px] text-muted-foreground">{fmtDateTime(h.at)} · {h.by ?? "—"}{h.note ? ` — ${h.note}` : ""}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Fleet --------------------------------- */

export function FleetTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { fleet, drivers, assignWOFleet, releaseWOAssignment } = useData();
  const [fleetId, setFleetId] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const current = fleet.find((f) => f.id === wo.assignedFleetId);
  const currentDriver = drivers.find((d) => d.id === (current?.driverId ?? wo.assignedDriverId));
  const history = (wo.assignmentHistory ?? []).filter((h) => h.type === "Fleet").slice().reverse();
  // Unavailable vehicles (maintenance / retired) cannot be assigned.
  const selectable = fleet.filter((f) => ["Available", "Assigned"].includes(f.status) || f.id === wo.assignedFleetId);

  const save = () => {
    if (!fleetId) return;
    const target = fleet.find((f) => f.id === fleetId);
    if (target && ["Maintenance", "Retired"].includes(target.status)) {
      toast.error(`${target.registration} is ${target.status.toLowerCase()} and cannot be assigned`);
      return;
    }
    assignWOFleet(wo.id, fleetId, actor, note || undefined);
    toast.success(current ? "Vehicle replaced" : "Vehicle assigned");
    setOpen(false);
    setFleetId("");
    setNote("");
  };

  return (
    <div className="space-y-4">
      <div className="card-elevated p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Assigned vehicle</div>
            {current ? (
              <div className="mt-1">
                <div className="text-base font-semibold">{current.registration}</div>
                <div className="text-xs text-muted-foreground">{current.vehicleType} · {current.capacityTons}T · {current.ownership}</div>
                <div className="mt-1.5"><StatusBadge status={current.status} /></div>
              </div>
            ) : (
              <div className="mt-1 text-sm text-muted-foreground">No vehicle assigned yet.</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {current && (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/fleet/$id" params={{ id: current.id }}><ExternalLink className="h-4 w-4 mr-1.5" /> Vehicle details</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => { releaseWOAssignment(wo.id, "Fleet", actor); toast.message("Vehicle released"); }}>
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Release
                </Button>
              </>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Truck className="h-4 w-4 mr-1.5" /> {current ? "Replace vehicle" : "Assign vehicle"}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{current ? "Replace vehicle" : "Assign vehicle"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-1.5 block">Vehicle</Label>
                    <Select value={fleetId} onValueChange={setFleetId}>
                      <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>
                        {selectable.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.registration} · {f.vehicleType} · {f.status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-[11px] text-muted-foreground">Vehicles in maintenance or retired are excluded.</p>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Reason / note</Label>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button disabled={!fleetId} onClick={save}>Save assignment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {current && (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field k="Registration" v={current.registration} />
            <Field k="Capacity" v={`${current.capacityTons} tons`} />
            <Field k="Current odometer" v={current.odometerKm ? `${current.odometerKm.toLocaleString("en-AE")} km` : "—"} />
            <Field k="Insurance expiry" v={fmtDate(current.insuranceExpiry)} warn={new Date(current.insuranceExpiry).getTime() < Date.now()} />
            <Field k="Permit expiry" v={current.permitExpiry ? fmtDate(current.permitExpiry) : "—"} warn={Boolean(current.permitExpiry && new Date(current.permitExpiry).getTime() < Date.now())} />
            <Field k="Fitness expiry" v={fmtDate(current.fitnessExpiry)} warn={new Date(current.fitnessExpiry).getTime() < Date.now()} />
            <Field k="Availability" v={current.status} />
            <Field k="Ownership" v={`${current.ownership}${current.ownerName ? ` · ${current.ownerName}` : ""}`} />
            <Field k="Current driver" v={currentDriver?.name ?? "—"} />
          </dl>
        )}
      </div>

      <div className="card-elevated p-4">
        <div className="text-sm font-semibold">Fleet assignment history</div>
        {history.length === 0 ? (
          <EmptyState icon={Truck} title="No vehicle assignments yet" />
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((h) => {
              const f = fleet.find((x) => x.id === h.fleetId);
              return (
                <li key={h.id} className="flex items-start gap-3 rounded-lg border border-border p-2.5">
                  <Truck className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{h.action} — {f?.registration ?? "—"}</div>
                    <div className="text-[11px] text-muted-foreground">{fmtDateTime(h.at)} · {h.by ?? "—"}{h.note ? ` — ${h.note}` : ""}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={`text-sm font-medium ${warn ? "text-destructive" : ""}`}>{v}</dd>
    </div>
  );
}
