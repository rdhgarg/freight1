import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — HAMS" }] }),
  component: Forgot,
});

function Forgot() {
  const request = useAuth((s) => s.requestReset);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = request(email);
    if (!r.ok) { toast.error(r.error ?? "Failed"); return; }
    setSent(true);
    toast.success("Reset link sent (demo). Use the Reset page.");
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your account email and we'll send instructions.</p>
        {sent ? (
          <div className="mt-6 rounded-md border border-success/30 bg-success/10 p-4 text-sm">
            <p>If an account exists for <b>{email}</b>, a reset link has been sent.</p>
            <Link to="/auth/reset" search={{ email }} className="mt-3 inline-block text-primary hover:underline">
              Continue to reset →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
      </div>
    </div>
  );
}
