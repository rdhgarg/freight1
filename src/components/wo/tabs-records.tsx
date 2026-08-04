import { useRef, useState } from "react";
import { toast } from "sonner";
import { Activity, Download, FileText, MapPin, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, StatusBadge } from "@/components/page-header";
import { useData } from "@/stores/data";
import { useActor } from "@/components/wo/use-actor";
import { fmtDateTime } from "@/lib/format";
import { fileToDataUrl, nextStage } from "@/lib/wo";
import { WO_DOC_CATEGORIES, WO_LIFECYCLE } from "@/lib/types";
import type { WODocCategory, WorkOrder, WorkOrderStatus } from "@/lib/types";

/* -------------------------------- Timeline -------------------------------- */

export function TimelineTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { addWOTimelineEvent } = useData();
  const [stage, setStage] = useState<WorkOrderStatus>(nextStage(wo.status) ?? "Operations Started");
  const [note, setNote] = useState("");
  const events = (wo.woTimeline ?? []).slice().reverse();

  return (
    <div className="space-y-4">
      <div className="card-elevated p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label className="mb-1.5 block">Event</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as WorkOrderStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{WO_LIFECYCLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px] flex-[2]">
            <Label className="mb-1.5 block">Remarks</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for this event" />
          </div>
          <Button
            size="sm"
            onClick={() => {
              addWOTimelineEvent(wo.id, { stage, at: new Date().toISOString(), by: actor.by, department: actor.department, note: note || undefined });
              setNote("");
              toast.success("Timeline event added");
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add event
          </Button>
        </div>
      </div>

      <div className="card-elevated p-4">
        {events.length === 0 ? (
          <EmptyState icon={MapPin} title="No timeline events yet" description="Operational updates appear here automatically." />
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {events.map((t) => (
              <li key={t.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{t.stage}</span>
                  {t.department && <StatusBadge status={t.department} />}
                </div>
                <div className="text-[11px] text-muted-foreground">{fmtDateTime(t.at)} · {t.by ?? "—"}</div>
                {t.note && <div className="mt-0.5 text-xs">{t.note}</div>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- Documents ------------------------------- */

export function DocumentsTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { addWODoc, replaceWODoc, deleteWODoc } = useData();
  const [category, setCategory] = useState<WODocCategory>("Delivery Order");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const docs = wo.docs ?? [];

  const read = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Files above 2MB are stored without a preview in this demo");
      return undefined;
    }
    return fileToDataUrl(file);
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const dataUrl = await read(file);
      addWODoc(wo.id, { name: file.name, type: file.type || "application/octet-stream", category, dataUrl, uploadedAt: new Date().toISOString(), uploadedBy: actor.by }, actor);
      toast.success(`${file.name} uploaded`);
      setOpen(false);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const doReplace = async (file: File) => {
    if (!replacingId) return;
    const existing = docs.find((d) => d.id === replacingId);
    const dataUrl = await read(file);
    replaceWODoc(wo.id, replacingId, {
      name: file.name,
      type: file.type || "application/octet-stream",
      category: existing?.category ?? "Other",
      dataUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: actor.by,
    }, actor);
    toast.success("Document replaced");
    setReplacingId(null);
    if (replaceRef.current) replaceRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="card-elevated p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Documents</div>
          <div className="text-xs text-muted-foreground">{docs.length} file(s) across {WO_DOC_CATEGORIES.length} categories</div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Upload className="h-4 w-4 mr-1.5" /> Upload document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as WODocCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WO_DOC_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">File</Label>
                <Input ref={fileRef} type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} disabled={busy} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <input ref={replaceRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void doReplace(f); }} />

      {docs.length === 0 ? (
        <div className="card-elevated p-6"><EmptyState icon={FileText} title="No documents uploaded" description="Upload the delivery order, gate pass, reports and proofs here." /></div>
      ) : (
        WO_DOC_CATEGORIES.filter((c) => docs.some((d) => (d.category ?? "Other") === c)).map((c) => (
          <div key={c} className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c}</div>
            <ul className="mt-2 divide-y divide-border">
              {docs.filter((d) => (d.category ?? "Other") === c).map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{fmtDateTime(d.uploadedAt)} · {d.uploadedBy ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {d.dataUrl ? (
                      <>
                        <Button size="sm" variant="outline" asChild><a href={d.dataUrl} target="_blank" rel="noreferrer">Preview</a></Button>
                        <Button size="sm" variant="outline" asChild><a href={d.dataUrl} download={d.name}><Download className="h-4 w-4" /></a></Button>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">No preview</span>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setReplacingId(d.id); replaceRef.current?.click(); }}><RefreshCw className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => { deleteWODoc(wo.id, d.id, actor); toast.message("Document deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

/* ------------------------------- Activity log ------------------------------ */

export function ActivityTab({ wo }: { wo: WorkOrder }) {
  const [q, setQ] = useState("");
  const logs = (wo.activityLog ?? [])
    .slice()
    .reverse()
    .filter((a) => !q || `${a.action} ${a.by} ${a.note ?? ""} ${a.department ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="card-elevated p-3">
        <Input placeholder="Filter activity by action, user or department…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card-elevated overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState icon={Activity} title="No activity recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{fmtDateTime(a.at)}</td>
                    <td className="px-4 py-3">{a.by}</td>
                    <td className="px-4 py-3">{a.department ? <StatusBadge status={a.department} /> : "—"}</td>
                    <td className="px-4 py-3 font-medium">{a.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Shared small note editor used by the overview tab. */
export function RemarksBox({ value, onSave }: { value?: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value ?? "");
  return (
    <div>
      <Textarea rows={3} value={v} onChange={(e) => setV(e.target.value)} placeholder="Internal remarks…" />
      <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => { onSave(v); toast.success("Saved"); }}>Save</Button></div>
    </div>
  );
}
