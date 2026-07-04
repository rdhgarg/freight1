import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Download, Trash2, Edit3, Eye, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { useData } from "@/stores/data";
import { csvDownload, inr, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/customers/")({
  head: () => ({ meta: [{ title: "Customers — HAMS" }] }),
  component: CustomersList,
});

function CustomersList() {
  const navigate = useNavigate();
  const { customers, deleteCustomer, invoices } = useData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const perPage = 8;

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return customers.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!term ||
          c.name.toLowerCase().includes(term) ||
          c.company.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.gst.toLowerCase().includes(term)),
    );
  }, [customers, q, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const view = filtered.slice((page - 1) * perPage, page * perPage);

  const outstandingFor = (id: string) =>
    invoices.filter((i) => i.customerId === id).reduce((s, i) => s + (i.total - i.paid), 0);

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers · ${customers.filter((c) => c.status === "Active").length} active`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => { csvDownload("customers.csv", filtered as unknown as Record<string, unknown>[]); toast.success("Exported"); }}>
              <Download className="h-4 w-4 mr-1.5" /> Export
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/customers/new" })}>
              <Plus className="h-4 w-4 mr-1.5" /> New Customer
            </Button>
          </>
        }
      />

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-elevated overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:flex items-center gap-2 p-3 border-b border-border">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, company, GST, email…" className="pl-8 w-full sm:w-80" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-36 shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {view.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Try adjusting filters or add your first customer."
            action={<Button size="sm" onClick={() => navigate({ to: "/customers/new" })}><Plus className="h-4 w-4 mr-1.5" /> New Customer</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-sticky-head">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">GST</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Credit Limit</th>
                  <th className="px-4 py-3 font-medium">Outstanding</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {view.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link to="/customers/$id" params={{ id: c.id }} className="font-medium text-foreground hover:text-primary">
                        {c.company}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{c.name} · joined {fmtDate(c.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.gst}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{c.email}</div>
                      <div className="text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{inr(c.creditLimit)}</td>
                    <td className="px-4 py-3">
                      <span className={outstandingFor(c.id) > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {inr(outstandingFor(c.id))}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/customers/$id", params: { id: c.id } })} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/customers/$id/edit", params: { id: c.id } })} title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(c.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
            <div>Showing {view.length} of {filtered.length}</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <div className="grid place-items-center px-2">Page {page} / {pages}</div>
              <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </motion.div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the customer from your records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (toDelete) { deleteCustomer(toDelete); toast.success("Customer deleted"); setToDelete(null); } }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
