import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile/change-password")({
  head: () => ({ meta: [{ title: "Change password — HAMS" }] }),
  component: ChangePw,
});

function ChangePw() {
  const change = useAuth((s) => s.changePassword);
  const navigate = useNavigate();
  const [oldPw, setOld] = useState("");
  const [newPw, setNew] = useState("");
  const [conf, setConf] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPw !== conf) return toast.error("Passwords do not match");
    const r = change(oldPw, newPw);
    if (!r.ok) return toast.error(r.error ?? "Failed");
    toast.success("Password updated");
    navigate({ to: "/profile" });
  };

  return (
    <div>
      <PageHeader title="Change Password" />
      <form onSubmit={submit} className="card-elevated p-6 max-w-md space-y-4">
        <div><Label className="mb-1.5 block">Current password</Label><Input type="password" value={oldPw} onChange={(e) => setOld(e.target.value)} required /></div>
        <div><Label className="mb-1.5 block">New password</Label><Input type="password" value={newPw} onChange={(e) => setNew(e.target.value)} required /></div>
        <div><Label className="mb-1.5 block">Confirm new password</Label><Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} required /></div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/profile" })}>Cancel</Button>
          <Button type="submit">Update password</Button>
        </div>
      </form>
    </div>
  );
}
