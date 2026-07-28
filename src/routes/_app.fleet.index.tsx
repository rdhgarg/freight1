import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/stores/data";
import { fmtDate, csvDownload } from "@/lib/format";
import { Plus, Download, Truck, Search, AlertTriangle } from "lucide-react";
import { FLEET_VEHICLE_TYPES } from "@/lib/types";

export const Route = createFileRoute("/_app/fleet/")({
  head: () => ({ meta: [{ title: "Fleet Management — HAMS" }] }),
  component: FleetList,
});

function FleetList() {
  const nav = useNavigate();
  const { fleet, drivers, shipments } = useData();
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => fleet.filter((f) => {
    if (type !== "All" && f.vehicleType !== type) return false;
    if (status !== "All" && f.status !== status) return false;
    if (!q) return true;
    return `${f.registration} ${f.ownerName ?? ""}`.toLowerCase().includes(q.toLowerCase());
  }), [fleet, q, type, status]);

  const isExpiringSoon = (iso: string) => {
    const days = (new Date(iso).getTime() - Date.now()) / 86400000;
    return days < 30;
  };

  return (
    <div>
      <PageHeader title="Fleet Management" description={`${fleet.length} vehicles`} actions={
        <>
          <Button variant="outline" size="sm" onClick={() => csvDownload("fleet.csv", rows.map((f) => ({
            Registration: f.registration, Type: f.vehicleType, Capacity: f.capacityTons, Ownership: f.ownership, Owner: f.ownerName ?? "", Status: f.status,
            Insurance: fmtDate(f.insuranceExpiry), Fitness: fmtDate(f.fitnessExpiry),
          })))}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          <Button size="sm" onClick={() => nav({ to: "/fleet/new" })}><Plus className="h-4 w-4 mr-1.5" /> Add Vehicle</Button>
        </>
      } />
      <div className="card-elevated p-3 mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search registration…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            {FLEET_VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>{["All","Available","Assigned","Maintenance","Retired"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="card-elevated overflow-hidden">
        {rows.length === 0 ? <EmptyState icon={Truck} title="No vehicles" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Registration</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium text-right">Cap.</th>
                <th className="px-4 py-3 font-medium">Ownership</th><th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Insurance</th><th className="px-4 py-3 font-medium">Fitness</th>
                <th className="px-4 py-3 font-medium text-right">Trips</th><th className="px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {rows.map((f) => {
                  const drv = drivers.find((d) => d.id === f.driverId);
                  const trips = shipments.filter((s) => s.truckId === f.id).length;
                  const insExp = isExpiringSoon(f.insuranceExpiry);
                  const fitExp = isExpiringSoon(f.fitnessExpiry);
                  return (
                    <tr key={f.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3"><Link to="/fleet/$id" params={{ id: f.id }} className="text-primary hover:underline font-mono font-medium">{f.registration}</Link></td>
                      <td className="px-4 py-3">{f.vehicleType}</td>
                      <td className="px-4 py-3 text-right">{f.capacityTons}T</td>
                      <td className="px-4 py-3">{f.ownership}{f.ownerName && <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">{f.ownerName}</div>}</td>
                      <td className="px-4 py-3 text-xs">{drv?.name ?? "—"}</td>
                      <td className={`px-4 py-3 text-xs whitespace-nowrap ${insExp ? "text-destructive font-medium" : ""}`}>{insExp && <AlertTriangle className="inline h-3 w-3 mr-1" />}{fmtDate(f.insuranceExpiry)}</td>
                      <td className={`px-4 py-3 text-xs whitespace-nowrap ${fitExp ? "text-destructive font-medium" : ""}`}>{fitExp && <AlertTriangle className="inline h-3 w-3 mr-1" />}{fmtDate(f.fitnessExpiry)}</td>
                      <td className="px-4 py-3 text-right">{trips}</td>
                      <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
