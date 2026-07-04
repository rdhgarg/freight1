import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useCurrentUser } from "@/stores/auth";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile/")({
  head: () => ({ meta: [{ title: "Profile — HAMS" }] }),
  component: Profile,
});

function Profile() {
  const user = useCurrentUser();
  const update = useAuth((s) => s.updateProfile);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update({ name, email, phone });
    toast.success("Profile updated");
  };

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account details." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-elevated p-6 flex flex-col items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full gradient-primary text-white text-2xl font-bold">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="mt-4 font-semibold">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-medium">{user.role}</div>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate({ to: "/profile/change-password" })}>
            Change password
          </Button>
        </div>
        <form onSubmit={save} className="card-elevated p-6 lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label className="mb-1.5 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label className="mb-1.5 block">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label className="mb-1.5 block">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><Label className="mb-1.5 block">Role</Label><Input value={user.role} disabled /></div>
          </div>
          <div className="flex justify-end"><Button type="submit">Save changes</Button></div>
        </form>
      </div>
    </div>
  );
}
