import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Action, ModuleKey, Role } from "@/lib/types";
import { ALL_ACTIONS } from "@/lib/types";

type Matrix = Record<Role, Record<ModuleKey, Action[]>>;

const MODULES: ModuleKey[] = [
  "dashboard",
  "customers",
  "drivers",
  "suppliers",
  "workOrders",
  "shipments",
  "trucks",
  "expenses",
  "purchases",
  "invoices",
  "receipts",
  "ledgers",
  "outstanding",
  "journal",
  "settings",
  "users",
  "roles",
];

const full: Action[] = [...ALL_ACTIONS];
const readOnly: Action[] = ["view", "export"];

const build = (per: Partial<Record<ModuleKey, Action[]>>, fallback: Action[]) => {
  const out = {} as Record<ModuleKey, Action[]>;
  MODULES.forEach((m) => (out[m] = per[m] ?? fallback));
  return out;
};

const defaultMatrix: Matrix = {
  "Super Admin": build({}, full),
  "Sales Manager": build(
    {
      customers: full,
      workOrders: full,
      shipments: ["view", "add", "edit", "export"],
      invoices: full,
      receipts: ["view", "add", "export"],
      outstanding: ["view", "export"],
      ledgers: ["view", "export"],
      settings: readOnly,
    },
    readOnly,
  ),
  "Operations Manager": build(
    {
      shipments: full,
      workOrders: ["view", "edit", "approve", "export"],
      drivers: full,
      trucks: full,
      expenses: full,
      suppliers: ["view", "add", "edit", "export"],
    },
    readOnly,
  ),
  "Accounts Manager": build(
    {
      invoices: full,
      receipts: full,
      ledgers: full,
      outstanding: full,
      journal: full,
      purchases: full,
      expenses: ["view", "edit", "approve", "export"],
    },
    readOnly,
  ),
  "Driver Manager": build({ drivers: full, trucks: full, shipments: ["view", "edit", "export"] }, readOnly),
  "Customer Support": build({ customers: ["view", "edit", "export"], shipments: ["view", "export"] }, readOnly),
  Viewer: build({}, readOnly),
};

interface RBACState {
  matrix: Matrix;
  setMatrix: (m: Matrix) => void;
  toggle: (role: Role, module: ModuleKey, action: Action) => void;
  reset: () => void;
}

export const useRBAC = create<RBACState>()(
  persist(
    (set, get) => ({
      matrix: defaultMatrix,
      setMatrix: (matrix) => set({ matrix }),
      toggle: (role, module, action) => {
        const cur = get().matrix[role][module] ?? [];
        const has = cur.includes(action);
        const next = has ? cur.filter((a) => a !== action) : [...cur, action];
        set({ matrix: { ...get().matrix, [role]: { ...get().matrix[role], [module]: next } } });
      },
      reset: () => set({ matrix: defaultMatrix }),
    }),
    { name: "hams-rbac" },
  ),
);

export const can = (role: Role | undefined, module: ModuleKey, action: Action): boolean => {
  if (!role) return false;
  const state = useRBAC.getState().matrix[role]?.[module] ?? [];
  return state.includes(action);
};
