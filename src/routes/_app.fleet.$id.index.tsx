import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/stores/data";
import { fmtDate } from "@/lib/format";
import { Edit3, FileX, Truck, AlertTriangle, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/fleet/$id/")({
  head: () => ({ meta: [{ title: "Vehicle — HAMS" }] }),
  component: FleetDetail,
});

function FleetDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { fleet, drivers, shipments } = useData();
  const f = fleet.find((x) => x.id === id);
  if (!f) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Vehicle not found" action={<Button onClick={() => nav({ to: "/fleet" })}>Back</Button>} /></div>;
  const driver = drivers.find((d) => d.id === f.driverId);
  const trips = shipments.filter((s) => s.truckId === id);

  const expiryRow = (label: string, iso?: string) => {
    if (!iso) return <div className="flex justify-between"><dt className="text-muted-foreground">{label}</dt><dd>—</dd></div>;
    const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
    const cls = days < 0 ? "text-destructive font-semibold" : days < 30 ? "text-warning font-medium" : "";
    return (
      <div className="flex justify-between"><dt className="text-muted-foreground">{label}</dt>
        <dd className={cls}>{days < 30 && <AlertTriangle className="inline h-3 w-3 mr-1" />}{fmtDate(iso)} <span className="text-[11px] text-muted-foreground">({days}d)</span></dd>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title={f.registration} description={`${f.vehicleType} · ${f.capacityTons}T · ${f.ownership}`} actions={
        <>
          <StatusBadge status={f.status} />
          <Button size="sm" variant="outline" onClick={() => nav({ to: "/fleet/$id/edit", params: { id } })}><Edit3 className="h-4 w-4 mr-1.5" /> Edit</Button>
        </>
      } />
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd>{f.vehicleType}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Capacity</dt><dd>{f.capacityTons} T</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Ownership</dt><dd>{f.ownership}</dd></div>
              {f.ownerName && <div className="flex justify-between"><dt className="text-muted-foreground">Owner</dt><dd>{f.ownerName}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Odometer</dt><dd>{(f.odometerKm ?? 0).toLocaleString("en-IN")} km</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Driver</dt><dd>{driver?.name ?? "Unassigned"}</dd></div>
            </dl>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance</div>
            <dl className="mt-3 space-y-1.5 text-sm">
              {expiryRow("Insurance", f.insuranceExpiry)}
              {expiryRow("Fitness", f.fitnessExpiry)}
              {expiryRow("Permit", f.permitExpiry)}
              {expiryRow("PUC", f.pucExpiry)}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="trips">
            <TabsList>
              <TabsTrigger value="trips">Trips ({trips.length})</TabsTrigger>
              <TabsTrigger value="maintenance" disabled>Maintenance</TabsTrigger>
              <TabsTrigger value="expenses" disabled>Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="trips" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {trips.length === 0 ? <EmptyState icon={Truck} title="No trips yet" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                      <th className="px-4 py-3 font-medium">Shipment</th><th className="px-4 py-3 font-medium">Route</th><th className="px-4 py-3 font-medium">Stage</th><th className="px-4 py-3 font-medium">Created</th>
                    </tr></thead>
                    <tbody>
                      {trips.map((s) => (
                        <tr key={s.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3"><Link to="/shipments" className="text-primary hover:underline font-medium">{s.shipmentNo}</Link></td>
                          <td className="px-4 py-3 text-xs truncate max-w-[220px]">{s.pickup} → {s.delivery}</td>
                          <td className="px-4 py-3"><StatusBadge status={s.stage} /></td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
