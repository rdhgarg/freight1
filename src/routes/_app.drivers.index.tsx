import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData } from "@/stores/data";
import { fmtDate, csvDownload } from "@/lib/format";
import { Plus, Download, UserCog, Search, Edit3, Trash2, Eye, ShieldAlert, Power } from "lucide-react";
import { DRIVER_STATUSES } from "@/lib/types";
import { useCurrentUser } from "@/stores/auth";
import { can } from "@/stores/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/drivers/")({
  head: () => ({
    meta: [
      { title: "Drivers — HAMS" },
      { name: "description", content: "Driver master with licenses, availability and work-order assignment history." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ status: typeof s.status === "string" ? s.status : undefined }),
  component: DriversList,
});

const PAGE = 10;

function DriversList() {
  const nav = useNavigate();
  const { status: statusParam } = Route.useSearch();
  const { drivers, fleet, workOrders, deleteDriver, setDriverStatus } = useData();
  const user = useCurrentUser();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(statusParam ?? "All");
  const [avail, setAvail] = useState("All");
  const [fleetId, setFleetId] = useState("All");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<string | null>(null);

  const rows = useMemo(() => {
    const onDuty = ["Assigned", "On Trip"];
    return drivers.filter((d) => {
      if (status !== "All" && d.status !== status) return false;
      if (avail === "Available" && d.status !== "Available") return false;
      if (avail === "On Duty" && !onDuty.includes(d.status)) return false;
      if (avail === "Unavailable" && !["Leave", "Inactive", "Off Duty"].includes(d.status)) return false;
      if (fleetId !== "All" && d.truckId !== fleetId) return false;
      if (!q) return true;
      return `${d.name} ${d.employeeId ?? ""} ${d.mobile} ${d.license} ${d.nationality ?? ""}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [drivers, q, status, avail, fleetId]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = rows.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE);

  const activeWOs = (driverId: string) =>
    workOrders.filter((w) => w.assignedDriverId === driverId && !["Closed", "Payment Received"].includes(w.status));

  const remove = (id: string) => {
    const blocking = activeWOs(id);
    if (blocking.length) {
      toast.error(`Cannot delete — driver is assigned to ${blocking.length} active work order(s): ${blocking.map((w) => w.woNumber).join(", ")}`);
      return;
    }
    deleteDriver(id);
    toast.success("Driver deleted");
  };

  const exportCsv = () =>
    csvDownload("drivers.csv", rows.map((d) => ({
      Name: d.name, EmployeeID: d.employeeId ?? "", Phone: d.mobile, License: d.license,
      LicenseExpiry: d.licenseExpiry ? fmtDate(d.licenseExpiry) : "", Nationality: d.nationality ?? "",
      Status: d.status, Fleet: fleet.find((f) => f.id === d.truckId)?.registration ?? "", Joined: fmtDate(d.joinedAt),
    })));

  return (
    <div>
      <PageHeader
        title="Drivers"
        description={`${drivers.length} drivers · ${drivers.filter((d) => ["Assigned", "On Trip"].includes(d.status)).length} on duty`}
        actions={
          <>
            {can(user?.role, "drivers", "export") && (
              <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
            )}
            {can(user?.role, "drivers", "add") && (
              <Button size="sm" onClick={() => nav({ to: "/drivers/new" })}><Plus className="h-4 w-4 mr-1.5" /> Add driver</Button>
            )}
          </>
        }
      />

      <div className="card-elevated p-3 mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search name, employee ID, license…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {DRIVER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={avail} onValueChange={(v) => { setAvail(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Any availability</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Duty">On duty</SelectItem>
            <SelectItem value="Unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fleetId} onValueChange={(v) => { setFleetId(v); setPage(1); }}>
          <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All fleet</SelectItem>
            {fleet.map((f) => <SelectItem key={f.id} value={f.id}>{f.registration}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="card-elevated overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={UserCog} title="No drivers found" description="Adjust filters or add a new driver." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">License</th>
                  <th className="px-4 py-3 font-medium">Fleet</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((d) => {
                  const expired = d.licenseExpiry ? new Date(d.licenseExpiry).getTime() < Date.now() : false;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/40 cursor-pointer"
                      onClick={() => nav({ to: "/drivers/$id", params: { id: d.id } })}
                    >
                      <td className="px-4 py-3">
                        <Link to="/drivers/$id" params={{ id: d.id }} className="font-medium text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {d.name}
                        </Link>
                        <div className="text-[11px] text-muted-foreground">{d.employeeId ?? "—"} · {d.nationality ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{d.mobile}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-mono">{d.license}</div>
                        <div className={expired ? "text-destructive" : "text-muted-foreground"}>
                          {expired && <ShieldAlert className="inline h-3 w-3 mr-1" />}
                          {d.licenseExpiry ? fmtDate(d.licenseExpiry) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{fleet.find((f) => f.id === d.truckId)?.registration ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" aria-label="View" onClick={() => nav({ to: "/drivers/$id", params: { id: d.id } })}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {can(user?.role, "drivers", "edit") && (
                            <>
                              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => nav({ to: "/drivers/$id/edit", params: { id: d.id } })}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={d.status === "Inactive" ? "Activate" : "Suspend"}
                                onClick={() => {
                                  setDriverStatus(d.id, d.status === "Inactive" ? "Available" : "Inactive");
                                  toast.success(d.status === "Inactive" ? "Driver activated" : "Driver suspended");
                                }}
                              >
                                <Power className={`h-4 w-4 ${d.status === "Inactive" ? "text-success" : "text-warning"}`} />
                              </Button>
                            </>
                          )}
                          {can(user?.role, "drivers", "delete") && (
                            <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setConfirm(d.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rows.length > PAGE && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {Math.min(page, pages)} of {pages} · {rows.length} drivers</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <AlertDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this driver?</AlertDialogTitle>
            <AlertDialogDescription>
              Drivers assigned to active work orders cannot be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirm) remove(confirm); setConfirm(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
