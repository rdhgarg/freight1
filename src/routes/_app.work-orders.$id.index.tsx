import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/stores/data";
import { inr, fmtDate, fmtDateTime } from "@/lib/format";
import { useCurrentUser } from "@/stores/auth";
import { FileX, Edit3, CheckCircle2, XCircle, RotateCcw, Send, Truck, ClipboardCheck, Anchor } from "lucide-react";
import { toast } from "sonner";
import { WO_STATUS_FLOW } from "@/lib/types";

export const Route = createFileRoute("/_app/work-orders/$id/")({
  head: () => ({ meta: [{ title: "Work Order — HAMS" }] }),
  component: WODetail,
});

function WODetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const user = useCurrentUser();
  const {
    workOrders, customers, vendors, shipments,
    transitionWorkOrder, approveWorkOrder, rejectWorkOrder, sendBackWorkOrder, generateShipmentFromWO,
  } = useData();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Work order not found" action={<Button onClick={() => nav({ to: "/work-orders" })}>Back</Button>} /></div>;

  const customer = customers.find((c) => c.id === wo.customerId);
  const vendor = vendors.find((v) => v.id === wo.primaryVendorId);
  const shipment = shipments.find((s) => s.id === wo.shipmentId);
  const subtotal = wo.containers * wo.rate;
  const tax = subtotal * (wo.taxPct ?? 0) / 100;
  const total = subtotal + tax;

  const by = user?.name ?? "System";
  const canApprove = ["Submitted", "Under Review", "Pending Approval"].includes(wo.status);
  const canSubmit = wo.status === "Draft" || wo.status === "Sent Back";
  const canCreateTrip = ["Approved", "Ready for Operations", "Dispatch Pending"].includes(wo.status);
  const flowIdx = WO_STATUS_FLOW.indexOf(wo.status);

  return (
    <div>
      <PageHeader
        title={wo.woNumber}
        description={`${customer?.company ?? "—"} · ${wo.customerRef ?? ""}`}
        actions={
          <>
            <StatusBadge status={wo.status} />
            {canSubmit && <Button size="sm" variant="outline" onClick={() => { transitionWorkOrder(wo.id, "Submitted", by); toast.success("Submitted for approval"); }}><Send className="h-4 w-4 mr-1.5" /> Submit</Button>}
            {canApprove && <>
              <Button size="sm" variant="outline" onClick={() => { sendBackWorkOrder(wo.id, by); toast.message("Sent back for revision"); }}><RotateCcw className="h-4 w-4 mr-1.5" /> Send Back</Button>
              <Button size="sm" variant="outline" onClick={() => { rejectWorkOrder(wo.id, by); toast.error("Work order rejected"); }}><XCircle className="h-4 w-4 mr-1.5" /> Reject</Button>
              <Button size="sm" onClick={() => { approveWorkOrder(wo.id, by); toast.success("Work order approved"); }}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve</Button>
            </>}
            {canCreateTrip && !wo.shipmentId && <Button size="sm" onClick={() => { const sid = generateShipmentFromWO(wo.id); if (sid) { toast.success("Trip / Shipment created"); nav({ to: "/shipments" }); } }}><Truck className="h-4 w-4 mr-1.5" /> Create Trip</Button>}
            <Button size="sm" variant="outline" onClick={() => nav({ to: "/work-orders/$id/edit", params: { id } })}><Edit3 className="h-4 w-4 mr-1.5" /> Edit</Button>
          </>
        }
      />

      {/* Status pipeline */}
      <div className="card-elevated p-4 mb-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {WO_STATUS_FLOW.map((s, i) => {
            const done = flowIdx >= 0 && i <= flowIdx;
            const current = i === flowIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold border ${current ? "bg-primary text-primary-foreground border-primary" : done ? "bg-success/20 text-success border-success/40" : "bg-muted text-muted-foreground border-border"}`}>{i + 1}</div>
                <div className={`text-xs ${current ? "font-semibold" : done ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
                {i < WO_STATUS_FLOW.length - 1 && <div className={`h-px w-8 ${done ? "bg-success/50" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</div>
            <div className="mt-2 text-sm">
              {customer ? <Link to="/customers/$id" params={{ id: customer.id }} className="text-primary hover:underline font-medium">{customer.company}</Link> : "—"}
              <div className="text-xs text-muted-foreground mt-0.5">{customer?.name} · {customer?.phone}</div>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{customer?.gst}</div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commercial</div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row k="Rate" v={`${inr(wo.rate)} × ${wo.containers}`} />
              <Row k="Subtotal" v={inr(subtotal)} />
              <Row k={`Tax (${wo.taxPct ?? 0}%)`} v={inr(tax)} />
              <Row k="Total" v={<span className="font-bold text-primary">{inr(total)}</span>} />
              <Row k="Terms" v={wo.billingTerms ?? "—"} />
              <Row k="Priority" v={<StatusBadge status={wo.priority ?? "Normal"} />} />
            </dl>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule</div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row k="Start" v={fmtDate(wo.startDate)} />
              <Row k="End" v={fmtDate(wo.endDate)} />
              {wo.requiredDeliveryDate && <Row k="Req. Delivery" v={fmtDate(wo.requiredDeliveryDate)} />}
            </dl>
          </div>
          {vendor && (
            <div className="card-elevated p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Vendor</div>
              <div className="mt-2 text-sm">
                <Link to="/vendors/$id" params={{ id: vendor.id }} className="text-primary hover:underline font-medium">{vendor.name}</Link>
                <div className="text-xs text-muted-foreground">{vendor.category}</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="approval">Approval History</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="trip">Trip / Shipment</TabsTrigger>
              <TabsTrigger value="dispatch" disabled>Dispatch</TabsTrigger>
              <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="card-elevated p-4 grid gap-4 sm:grid-cols-2">
                <Info label="Cargo type" v={wo.cargoType ?? "—"} />
                <Info label="Commodity" v={wo.commodity ?? "—"} />
                <Info label="Container type" v={wo.containerType ?? "—"} />
                <Info label="Containers" v={String(wo.containers)} />
                <Info label="Weight (T)" v={wo.weightTons?.toString() ?? "—"} />
                <Info label="Volume (CBM)" v={wo.volumeCbm?.toString() ?? "—"} />
                <Info label="Pickup" v={wo.pickup} />
                <Info label="Delivery" v={wo.delivery} />
                <Info label="Delivery contact" v={wo.deliveryContactName ? `${wo.deliveryContactName} — ${wo.deliveryContactPhone ?? ""}` : "—"} />
                <Info label="Terms" v={wo.terms || "—"} />
                {wo.remarks && <Info label="Remarks" v={wo.remarks} full />}
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-4">
              <div className="card-elevated p-4 grid gap-4 sm:grid-cols-2">
                <Info label="Shipping line" v={wo.shippingLine ?? "—"} />
                <Info label="Vessel" v={wo.vessel ?? "—"} />
                <Info label="Voyage" v={wo.voyage ?? "—"} />
                <Info label="BL number" v={wo.blNumber ?? "—"} />
                <Info label="Delivery Order" v={wo.deliveryOrderNo ?? "—"} />
                <Info label="Port" v={wo.port ?? "—"} />
                <Info label="Terminal" v={wo.terminal ?? "—"} />
              </div>
            </TabsContent>

            <TabsContent value="approval" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {(wo.approvalHistory ?? []).length === 0 ? <EmptyState icon={ClipboardCheck} title="No approval activity yet" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                      <th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">By</th><th className="px-4 py-3 font-medium">Decision</th><th className="px-4 py-3 font-medium">Note</th>
                    </tr></thead>
                    <tbody>
                      {(wo.approvalHistory ?? []).map((a) => (
                        <tr key={a.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(a.at)}</td>
                          <td className="px-4 py-3">{a.by}</td>
                          <td className="px-4 py-3"><StatusBadge status={a.decision} /></td>
                          <td className="px-4 py-3 text-muted-foreground">{a.note ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <div className="card-elevated p-4">
                <ol className="space-y-3">
                  {(wo.activityLog ?? []).slice().reverse().map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm"><span className="font-medium">{a.action}</span> {a.note && <span className="text-muted-foreground">— {a.note}</span>}</div>
                        <div className="text-[11px] text-muted-foreground">{fmtDateTime(a.at)} · {a.by}</div>
                      </div>
                    </li>
                  ))}
                  {(wo.activityLog ?? []).length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="trip" className="mt-4">
              <div className="card-elevated p-4">
                {shipment ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Linked Trip</div>
                      <Link to="/shipments" className="text-primary font-semibold hover:underline">{shipment.shipmentNo}</Link>
                      <div className="text-xs text-muted-foreground mt-0.5">Stage: <StatusBadge status={shipment.stage} /></div>
                    </div>
                    <Anchor className="h-6 w-6 text-muted-foreground" />
                  </div>
                ) : (
                  <EmptyState icon={Truck} title="No trip created yet" description={canCreateTrip ? "Approve and create a trip to move this WO into operations." : "Trip creation available after approval."} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>;
}
function Info({ label, v, full }: { label: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="mt-0.5 text-sm break-words">{v}</div>
    </div>
  );
}
