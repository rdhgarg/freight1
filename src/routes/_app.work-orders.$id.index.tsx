import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/stores/data";
import { aed, fmtDate } from "@/lib/format";
import { woMoney, progressPct, stageIndex } from "@/lib/wo";
import { OperationsTab, DriverTab, FleetTab } from "@/components/wo/tabs-operations";
import { TimelineTab, DocumentsTab, ActivityTab } from "@/components/wo/tabs-records";
import { ExpensesTab, InvoiceTab, PaymentsTab, OutstandingTab } from "@/components/wo/tabs-finance";
import {
  FileX, Edit3, ChevronRight, ClipboardCheck, UserCog, Truck as TruckIcon, MapPin,
  FileText, Wallet, Receipt, CreditCard, AlertCircle, Activity, LayoutDashboard,
} from "lucide-react";
import { WO_LIFECYCLE } from "@/lib/types";

export const Route = createFileRoute("/_app/work-orders/$id/")({
  head: () => ({ meta: [{ title: "Work Order — HAMS" }] }),
  component: WODetail,
});

function WODetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { workOrders, customers, vendors, drivers, fleet } = useData();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) {
    return (
      <div className="card-elevated p-6">
        <EmptyState icon={FileX} title="Work order not found" action={<Button onClick={() => nav({ to: "/work-orders" })}>Back</Button>} />
      </div>
    );
  }

  const customer = customers.find((c) => c.id === wo.customerId);
  const vendor = vendors.find((v) => v.id === wo.primaryVendorId);
  const assignedDriver = drivers.find((d) => d.id === wo.assignedDriverId);
  const assignedFleet = fleet.find((f) => f.id === wo.assignedFleetId);
  const money = woMoney(wo);
  const idx = stageIndex(wo.status);
  const pct = progressPct(wo.status);

  return (
    <div>
      <PageHeader
        title={wo.woNumber}
        description={`${customer?.company ?? "—"}${wo.customerRef ? ` · Ref ${wo.customerRef}` : ""} · Created ${fmtDate(wo.createdAt)} by ${wo.createdBy ?? "—"}`}
        actions={
          <>
            <StatusBadge status={wo.status} />
            <Button size="sm" variant="outline" onClick={() => nav({ to: "/work-orders/$id/edit", params: { id } })}>
              <Edit3 className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </>
        }
      />

      {/* Lifecycle pipeline */}
      <div className="card-elevated p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lifecycle progress</div>
          <div className="text-xs font-medium">{pct}% · Stage {idx + 1} of {WO_LIFECYCLE.length}</div>
        </div>
        <Progress value={pct} className="h-1.5 mb-3" />
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {WO_LIFECYCLE.map((s, i) => {
              const done = idx >= 0 && i <= idx;
              const current = i === idx;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold border ${current ? "bg-primary text-primary-foreground border-primary" : done ? "bg-success/20 text-success border-success/40" : "bg-muted text-muted-foreground border-border"}`}>{i + 1}</div>
                  <div className={`text-[11px] whitespace-nowrap ${current ? "font-semibold" : done ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
                  {i < WO_LIFECYCLE.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</div>
            <div className="mt-2 text-sm">
              <div className="font-medium">{customer?.company ?? "—"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{customer?.name} · {customer?.phone}</div>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">TRN: {customer?.gst ?? "—"}</div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commercial (AED)</div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row k="Rate" v={`${aed(wo.rate)} × ${wo.containers}`} />
              <Row k="Subtotal" v={aed(money.subtotal)} />
              <Row k={`VAT (${money.vatPct}%)`} v={aed(money.vat)} />
              <Row k="Total" v={<span className="font-bold text-primary">{aed(money.total)}</span>} />
              <Row k="Paid" v={aed(money.paid)} />
              <Row k="Balance" v={<span className={money.balance > 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>{aed(money.balance)}</span>} />
              <Row k="Expenses" v={aed(money.expensesGrand)} />
              <Row k="Margin" v={<span className={money.margin >= 0 ? "text-success" : "text-destructive"}>{aed(money.margin)}</span>} />
            </dl>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row k="Driver" v={assignedDriver ? <Link to="/drivers/$id" params={{ id: assignedDriver.id }} className="text-primary hover:underline">{assignedDriver.name}</Link> : "—"} />
              <Row k="Fleet" v={assignedFleet ? <Link to="/fleet/$id" params={{ id: assignedFleet.id }} className="text-primary hover:underline">{assignedFleet.registration}</Link> : "—"} />
              <Row k="Vendor" v={vendor ? <Link to="/vendors/$id" params={{ id: vendor.id }} className="text-primary hover:underline">{vendor.name}</Link> : "—"} />
            </dl>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview"><LayoutDashboard className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
              <TabsTrigger value="operations"><ClipboardCheck className="h-3.5 w-3.5 mr-1" />Operations</TabsTrigger>
              <TabsTrigger value="driver"><UserCog className="h-3.5 w-3.5 mr-1" />Driver</TabsTrigger>
              <TabsTrigger value="fleet"><TruckIcon className="h-3.5 w-3.5 mr-1" />Fleet</TabsTrigger>
              <TabsTrigger value="timeline"><MapPin className="h-3.5 w-3.5 mr-1" />Timeline</TabsTrigger>
              <TabsTrigger value="documents"><FileText className="h-3.5 w-3.5 mr-1" />Documents</TabsTrigger>
              <TabsTrigger value="expenses"><Wallet className="h-3.5 w-3.5 mr-1" />Expenses</TabsTrigger>
              <TabsTrigger value="invoice"><Receipt className="h-3.5 w-3.5 mr-1" />Invoice</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="h-3.5 w-3.5 mr-1" />Payments</TabsTrigger>
              <TabsTrigger value="outstanding"><AlertCircle className="h-3.5 w-3.5 mr-1" />Outstanding</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="h-3.5 w-3.5 mr-1" />Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="card-elevated p-4 grid gap-4 sm:grid-cols-2">
                <Info label="Cargo type" v={wo.cargoType ?? "—"} />
                <Info label="Commodity" v={wo.commodity ?? "—"} />
                <Info label="Container type" v={wo.containerType ?? "—"} />
                <Info label="Containers" v={String(wo.containers)} />
                <Info label="Shipping line" v={wo.shippingLine ?? "—"} />
                <Info label="Vessel / Voyage" v={`${wo.vessel ?? "—"} · ${wo.voyage ?? "—"}`} />
                <Info label="BL number" v={wo.blNumber ?? "—"} />
                <Info label="Port / Terminal" v={`${wo.port ?? "—"}${wo.terminal ? ` · ${wo.terminal}` : ""}`} />
                <Info label="Pickup" v={wo.pickup} />
                <Info label="Delivery" v={wo.delivery} />
                <Info label="Start date" v={fmtDate(wo.startDate)} />
                <Info label="Required delivery" v={wo.requiredDeliveryDate ? fmtDate(wo.requiredDeliveryDate) : "—"} />
                {wo.remarks && <Info label="Remarks" v={wo.remarks} full />}
              </div>
            </TabsContent>

            <TabsContent value="operations" className="mt-4"><OperationsTab wo={wo} /></TabsContent>
            <TabsContent value="driver" className="mt-4"><DriverTab wo={wo} /></TabsContent>
            <TabsContent value="fleet" className="mt-4"><FleetTab wo={wo} /></TabsContent>
            <TabsContent value="timeline" className="mt-4"><TimelineTab wo={wo} /></TabsContent>
            <TabsContent value="documents" className="mt-4"><DocumentsTab wo={wo} /></TabsContent>
            <TabsContent value="expenses" className="mt-4"><ExpensesTab wo={wo} /></TabsContent>
            <TabsContent value="invoice" className="mt-4"><InvoiceTab wo={wo} /></TabsContent>
            <TabsContent value="payments" className="mt-4"><PaymentsTab wo={wo} /></TabsContent>
            <TabsContent value="outstanding" className="mt-4"><OutstandingTab wo={wo} /></TabsContent>
            <TabsContent value="activity" className="mt-4"><ActivityTab wo={wo} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function Info({ label, v, full }: { label: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{v}</div>
    </div>
  );
}
