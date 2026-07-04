import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Ship, Package, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — HAMS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("admin@hams.co");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const r = login(email, password);
      setLoading(false);
      if (!r.ok) { toast.error(r.error ?? "Login failed"); return; }
      toast.success("Welcome to HAMS");
      navigate({ to: "/dashboard" });
    }, 350);
  };

  const demos = [
    { role: "Super Admin", email: "admin@hams.co", pw: "admin123" },
    { role: "Sales Manager", email: "sales@hams.co", pw: "demo1234" },
    { role: "Operations Mgr", email: "ops@hams.co", pw: "demo1234" },
    { role: "Accounts Mgr", email: "accounts@hams.co", pw: "demo1234" },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden gradient-primary text-white p-10 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 backdrop-blur font-black">H</div>
          <div>
            <div className="font-bold text-lg">HAMS</div>
            <div className="text-xs text-white/70 uppercase tracking-widest">Sales & Ops Workflow</div>
          </div>
        </div>
        <div>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold leading-tight">
            Move every container<br />with confidence.
          </motion.h2>
          <p className="mt-4 text-white/80 max-w-md">
            From work order to delivery to invoice — HAMS is the operating system for modern logistics teams.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[{ i: Truck, l: "Fleet" }, { i: Ship, l: "Port" }, { i: Package, l: "Cargo" }].map((x, k) => (
              <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * k }}
                className="rounded-xl bg-white/10 backdrop-blur p-4">
                <x.i className="h-5 w-5" />
                <div className="mt-2 text-xs font-medium">{x.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="text-xs text-white/60">© {new Date().getFullYear()} HAMS · Enterprise ERP</div>
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary text-white font-black">H</div>
            <div>
              <div className="font-bold">HAMS</div>
              <div className="text-xs text-muted-foreground">Sales & Ops Workflow</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access the dashboard.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/forgot" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : (<>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>)}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Quick demo login</div>
            <div className="grid grid-cols-2 gap-2">
              {demos.map((d) => (
                <button key={d.email} type="button" onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                  className="text-left rounded-md border border-border bg-card px-2.5 py-2 text-xs hover:bg-accent transition-colors">
                  <div className="font-medium truncate">{d.role}</div>
                  <div className="truncate text-muted-foreground">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
