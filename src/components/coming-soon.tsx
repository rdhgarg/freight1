import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  phase,
  bullets,
}: {
  title: string;
  phase: "Phase 2" | "Phase 3" | "Phase 4" | "Phase 5";
  bullets: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={`Full CRUD + workflow — landing in ${phase}.`} />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-8 max-w-3xl"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-info/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">{phase}</div>
            <h2 className="mt-1 text-xl font-bold">{title} module</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This module is scaffolded and reachable from the sidebar. The full interactive build lands in {phase} of the delivery plan.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <Button asChild size="sm"><Link to="/dashboard">Back to dashboard <ArrowRight className="h-4 w-4 ml-1.5" /></Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/customers">Try Customers module</Link></Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
