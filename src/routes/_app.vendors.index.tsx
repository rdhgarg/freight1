import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/stores/data";
import { fmtDate, csvDownload } from "@/lib/format";
import { Plus, Download, Warehouse, Search, Star } from "lucide-react";
import { VENDOR_CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/_app/vendors/")({
  head: () => ({ meta: [{ title: "Vendors — HAMS" }] }),
  component: VendorsList,
});

function VendorsList() {
  const nav = useNavigate();
  const { vendors, workOrders } = useData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const rows = useMemo(() => vendors.filter((v) => {
    if (cat !== "All" && v.category !== cat) return false;
    if (!q) return true;
    const s = `${v.name} ${v.code} ${v.gst} ${v.services} ${v.contactName}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }), [vendors, q, cat]);

  const woByVendor = (vid: string) => workOrders.filter((w) => w.primaryVendorId === vid);

  return (
    <div>
      <PageHeader title="Vendor Management" description={`${vendors.length} vendors`} actions={
        <>
          <Button variant="outline" size="sm" onClick={() => csvDownload("vendors.csv", rows.map((v) => ({
            Code: v.code, Name: v.name, Category: v.category, GST: v.gst, Contact: v.contactName, Phone: v.contactPhone, Email: v.contactEmail, Terms: v.paymentTerms, Rating: v.rating ?? "", Status: v.status,
          })))}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          <Button size="sm" onClick={() => nav({ to: "/vendors/new" })}><Plus className="h-4 w-4 mr-1.5" /> New Vendor</Button>
        </>
      } />
      <div className="card-elevated p-3 mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {VENDOR_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="card-elevated overflow-hidden">
        {rows.length === 0 ? <EmptyState icon={Warehouse} title="No vendors" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium text-right">Jobs</th>
                <th className="px-4 py-3 font-medium">Rating</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Since</th>
              </tr></thead>
              <tbody>
                {rows.map((v) => {
                  const jobs = woByVendor(v.id);
                  const done = jobs.filter((w) => ["Completed", "Closed", "Trip Created", "Converted"].includes(w.status)).length;
                  return (
                    <tr key={v.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 font-mono">{v.code}</td>
                      <td className="px-4 py-3"><Link to="/vendors/$id" params={{ id: v.id }} className="text-primary hover:underline font-medium">{v.name}</Link>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">{v.services}</div></td>
                      <td className="px-4 py-3">{v.category}</td>
                      <td className="px-4 py-3 text-xs">{v.contactName}<div className="text-muted-foreground">{v.contactPhone}</div></td>
                      <td className="px-4 py-3 text-right">{done}/{jobs.length}</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {v.rating?.toFixed(1) ?? "—"}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(v.createdAt)}</td>
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
