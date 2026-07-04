import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "Reset password — HAMS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ email: (s.email as string) ?? "" }),
  component: Reset,
});

function Reset() {
  const { email } = Route.useSearch();
  const reset = useAuth((s) => s.resetPassword);
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [mail, setMail] = useState(email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== pw2) return toast.error("Passwords do not match");
    const r = reset(mail, pw);
    if (!r.ok) return toast.error(r.error ?? "Failed");
    toast.success("Password updated. Please sign in.");
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Set a new password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="mail">Email</Label>
            <Input id="mail" type="email" value={mail} onChange={(e) => setMail(e.target.value)} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="pw2">Confirm password</Label>
            <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="mt-1.5" required />
          </div>
          <Button type="submit" className="w-full">Update password</Button>
        </form>
      </div>
    </div>
  );
}
