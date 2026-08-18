import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData } from "@/stores/data";
import { aed, fmtDate, fmtDateTime, uid } from "@/lib/format";
import { fileToDataUrl, woMoney } from "@/lib/wo";
import { useCurrentUser } from "@/stores/auth";
import { can } from "@/stores/rbac";
import { toast } from "sonner";
import {
  Edit3, Phone, ShieldAlert, UserX, FileText, Upload, Trash2, Download, Eye,
  ClipboardList, Truck, Power, UserCog,
} from "lucide-react";
import type { DriverDoc } from "@/lib/types";

export const Route = createFileRoute("/_app/drivers/$id/")({
  head: () => ({ meta: [{ title: "Driver — HAMS" }] }),
  component: DriverDetail,
});

function DriverDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const user = useCurrentUser();
  const { drivers, fleet, workOrders, upsertDriver, deleteDriver, setDriverStatus } = useData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDoc, setConfirmDoc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceDocId, setReplaceDocId] = useState<string | null>(null);

  const driver = drivers.find((d) => d.id === id);

  const assignments = useMemo(() => {
    const rows = workOrders
      .flatMap((w) =>
        (w.assignmentHistory ?? [])
          .filter((h) => h.type === "Driver" && h.driverId === id)
          .map((h) => ({ wo: w, entry: h })),
      )
      .sort((a, b) => b.entry.at.localeCompare(a.entry.at));
    return rows;
  }, [workOrders, id]);

  const perf = useMemo(() => {
    const mine = workOrders.filter((w) => w.assignedDriverId === id);
    const active = mine.filter((w) => !["Closed", "Payment Received", "Delivered"].includes(w.status));
    const completed = mine.filter((w) => ["Closed", "Payment Received", "Delivered"].includes(w.status));
    const total = assignments.filter((a) => a.entry.action !== "Released").length;
    const completion = total ? Math.round((completed.length / Math.max(total, 1)) * 100) : 0;
    const onTime = completed.filter((w) => !w.requiredDeliveryDate || new Date(w.endDate) <= new Date(w.requiredDeliveryDate)).length;
    const avgPerf = completed.length ? Math.round((onTime / completed.length) * 100) : 0;
    return { total, completed: completed.length, active: active.length, completion, avgPerf };
  }, [workOrders, assignments, id]);

  if (!driver) {
    return (
      <div className="card-elevated p-6">
        <EmptyState icon={UserX} title="Driver not found" action={<Button onClick={() => nav({ to: "/drivers" })}>Back</Button>} />
      </div>
    );
  }

  const vehicle = fleet.find((f) => f.id === driver.truckId);
  const activeWO = workOrders.filter((w) => w.assignedDriverId === id && !["Closed", "Payment Received"].includes(w.status));
  const licenseExpired = driver.licenseExpiry ? new Date(driver.licenseExpiry).getTime() < Date.now() : false;
  const docs = driver.docs ?? [];

  const persistDocs = (next: DriverDoc[]) => upsertDriver({ ...driver, docs: next });

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const added: DriverDoc[] = [];
    for (const f of Array.from(files)) {
      added.push({ id: uid("dd_"), name: f.name, type: f.type || "file", dataUrl: await fileToDataUrl(f), uploadedAt: new Date().toISOString() });
    }
    persistDocs([...docs, ...added]);
    toast.success(`${added.length} document(s) uploaded`);
  };

  const onReplace = async (files: FileList | null) => {
    if (!files?.length || !replaceDocId) return;
    const f = files[0];
    const dataUrl = await fileToDataUrl(f);
    persistDocs(docs.map((d) => (d.id === replaceDocId ? { ...d, name: f.name, type: f.type || "file", dataUrl, uploadedAt: new Date().toISOString() } : d)));
    setReplaceDocId(null);
    toast.success("Document replaced");
  };

  const downloadMock = (d: DriverDoc) => {
    if (d.dataUrl) {
      const a = document.createElement("a");
      a.href = d.dataUrl;
      a.download = d.name;
      a.click();
    } else {
      const blob = new Blob([`HAMS mock document\nDriver: ${driver.name}\nDocument: ${d.name}\nGenerated: ${new Date().toISOString()}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${d.name.replace(/\s+/g, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const remove = () => {
    if (activeWO.length) {
      toast.error(`Cannot delete — assigned to active work order(s): ${activeWO.map((w) => w.woNumber).join(", ")}`);
      return;
    }
    deleteDriver(id);
    toast.success("Driver deleted");
    nav({ to: "/drivers" });
  };

  return (
    <div>
      <PageHeader
        title={driver.name}
        description={`${driver.employeeId ?? "—"} · ${driver.nationality ?? "—"} · Joined ${fmtDate(driver.joinedAt)}`}
        actions={
          <>
            <StatusBadge status={driver.status} />
            {can(user?.role, "drivers", "edit") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDriverStatus(id, driver.status === "Inactive" ? "Available" : "Inactive");
                    toast.success(driver.status === "Inactive" ? "Driver activated" : "Driver suspended");
                  }}
                >
                  <Power className="h-4 w-4 mr-1.5" /> {driver.status === "Inactive" ? "Activate" : "Suspend"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => nav({ to: "/drivers/$id/edit", params: { id } })}>
                  <Edit3 className="h-4 w-4 mr-1.5" /> Edit
                </Button>
              </>
            )}
            {can(user?.role, "drivers", "delete") && (
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1.5 text-destructive" /> Delete
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              {driver.photoUrl ? (
                <img src={driver.photoUrl} alt={driver.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary text-lg font-bold">
                  {driver.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold truncate">{driver.name}</div>
                <div className="text-xs text-muted-foreground">{driver.employeeId ?? "—"}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${driver.mobile.replace(/\s/g, "")}`} className="text-primary hover:underline">{driver.mobile}</a>
              </div>
              {driver.emergencyContactName && (
                <div className="text-xs text-muted-foreground">
                  Emergency: {driver.emergencyContactName} · {driver.emergencyContactPhone ?? "—"}
                </div>
              )}
            </div>
          </div>

          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">License</div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Number</dt><dd className="font-mono">{driver.license}</dd></div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Expiry</dt>
                <dd className={licenseExpired ? "text-destructive font-medium" : ""}>
                  {licenseExpired && <ShieldAlert className="inline h-3 w-3 mr-1" />}
                  {driver.licenseExpiry ? fmtDate(driver.licenseExpiry) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Availability</dt><dd><StatusBadge status={driver.status} /></dd></div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Assigned fleet</dt>
                <dd>{vehicle ? <Link to="/fleet/$id" params={{ id: vehicle.id }} className="text-primary hover:underline">{vehicle.registration}</Link> : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="assignments">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="assignments">Assignment History ({assignments.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {assignments.length === 0 ? (
                  <EmptyState icon={ClipboardList} title="No assignments yet" description="Assign this driver from a Work Order's Driver tab." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                          <th className="px-4 py-3 font-medium">Work Order</th>
                          <th className="px-4 py-3 font-medium">Fleet</th>
                          <th className="px-4 py-3 font-medium">Assigned</th>
                          <th className="px-4 py-3 font-medium">Released</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                          <th className="px-4 py-3 font-medium">WO Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(({ wo, entry }) => {
                          const release = (wo.assignmentHistory ?? []).find(
                            (h) => h.type === "Driver" && h.driverId === id && h.action !== "Assigned" && h.at > entry.at,
                          );
                          const fl = fleet.find((f) => f.id === wo.assignedFleetId);
                          return (
                            <tr key={entry.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                              <td className="px-4 py-3">
                                <Link to="/work-orders/$id" params={{ id: wo.id }} className="text-primary hover:underline font-medium">{wo.woNumber}</Link>
                                <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{wo.pickup} → {wo.delivery}</div>
                              </td>
                              <td className="px-4 py-3 text-xs">{fl?.registration ?? "—"}</td>
                              <td className="px-4 py-3 text-xs whitespace-nowrap">{fmtDateTime(entry.at)}</td>
                              <td className="px-4 py-3 text-xs whitespace-nowrap">{release ? fmtDateTime(release.at) : "—"}</td>
                              <td className="px-4 py-3"><StatusBadge status={entry.action} /></td>
                              <td className="px-4 py-3"><StatusBadge status={wo.status} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <div className="card-elevated p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm font-semibold">Driver documents</div>
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1.5" /> Upload
                  </Button>
                  <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { void onUpload(e.target.files); e.target.value = ""; }} />
                  <input ref={replaceRef} type="file" className="hidden" onChange={(e) => { void onReplace(e.target.files); e.target.value = ""; }} />
                </div>
                {docs.length === 0 ? (
                  <EmptyState icon={FileText} title="No documents" description="Upload license copies, visas, or training certificates." />
                ) : (
                  <ul className="mt-3 space-y-2">
                    {docs.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{d.name}</div>
                          <div className="text-[11px] text-muted-foreground">{d.type} · {fmtDateTime(d.uploadedAt)}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" aria-label="Preview" onClick={() => d.dataUrl && window.open(d.dataUrl, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Download" onClick={() => downloadMock(d)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Replace" onClick={() => { setReplaceDocId(d.id); replaceRef.current?.click(); }}>
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setConfirmDoc(d.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Total assignments", value: String(perf.total), icon: ClipboardList },
                  { label: "Completed work orders", value: String(perf.completed), icon: FileText },
                  { label: "Active work orders", value: String(perf.active), icon: Truck },
                  { label: "Completion rate", value: `${perf.completion}%`, icon: UserCog },
                  { label: "On-time delivery", value: `${perf.avgPerf}%`, icon: ShieldAlert },
                  {
                    label: "Revenue handled",
                    value: aed(workOrders.filter((w) => w.assignedDriverId === id).reduce((s, w) => s + woMoney(w).total, 0)),
                    icon: FileText,
                  },
                ].map((k) => (
                  <div key={k.label} className="card-elevated p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
                      <k.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-1 text-2xl font-bold">{k.value}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {driver.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Drivers with active work-order assignments cannot be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(confirmDoc)} onOpenChange={(o) => !o && setConfirmDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>This removes the document from the driver's profile.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { persistDocs(docs.filter((d) => d.id !== confirmDoc)); setConfirmDoc(null); toast.success("Document deleted"); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
