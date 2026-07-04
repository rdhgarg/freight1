# HAMS — Logistics & Transport ERP Admin Panel

A full enterprise-grade admin SaaS is a very large build (realistically 40–60+ screens with CRUD, RBAC, accounting, and workflow engines). To ship something **production-quality** rather than a shallow shell of 60 placeholder pages, I'll build it in phases and get your sign-off on scope before starting. Everything will be fully interactive with mock data persisted to `localStorage` (via Zustand) so create/edit/delete/approve/pay flows work end-to-end across reloads.

## Stack & foundation
- TanStack Start (already scaffolded), Tailwind v4, shadcn/ui, Framer Motion, Recharts, Zustand + persist, react-hook-form + zod, sonner toasts, jsPDF for invoice/receipt PDFs.
- Design system: professional blue / white / dark-gray palette defined as semantic oklch tokens in `src/styles.css`; light + dark mode; soft shadows, sticky table headers, animated page transitions.
- Layout shell: collapsible sidebar (shadcn `Sidebar`), top bar with global search + notifications + profile menu, breadcrumbs, responsive on mobile/tablet/desktop.

## RBAC
- Roles: Super Admin, Sales Manager, Operations Manager, Accounts Manager, Driver Manager, Customer Support, Viewer.
- Permission matrix per module × action (view/add/edit/delete/export/approve) stored in a Zustand store.
- Route guards via TanStack `beforeLoad`; sidebar items and row actions hidden/disabled by permission; role & user management screens to edit the matrix live.

## Modules (all with List / Add / Edit / Details / Delete-confirm / search / filters / pagination / export CSV / toast)
1. **Auth** — Login, Forgot Password, Reset Password, Profile, Change Password (dummy auth, persisted session).
2. **Dashboard** — 8 KPI cards (clickable → filtered lists), Revenue line chart, Shipment status donut, Expense distribution bar, Monthly performance area chart. All values computed from stores.
3. **Customers** — full CRUD + ledger tab + shipment history tab.
4. **Drivers** — CRUD + assignments + delivery history + simple performance stats.
5. **Suppliers** — CRUD + bills + linked expenses.
6. **Work Orders** — CRUD + approval flow + "Generate Shipment" action that creates a linked Shipment.
7. **Shipments** (flagship) — CRUD + status pipeline (Customs → Driver Assigned → Port → Inspection → X-Ray → Out From Port → In Transit → Delivered) with animated vertical timeline, driver assignment modal, delivery proof upload (base64), documents, expenses tab, activity log.
8. **Trucks** — CRUD + driver mapping + shipment mapping + insurance/fitness tracking.
9. **Expenses** — CRUD across 6 categories, receipt upload, shipment linking, approval flow, reports.
10. **Purchases** — POs, supplier bills, approval, payment tracking.
11. **Accounts**
    - Invoices — generate from shipment, HTML preview, PDF download, status (Draft/Sent/Paid/Overdue).
    - Receipts — record payment against invoice, PDF download, history.
    - Ledgers — customer & supplier running-balance views.
    - Outstanding — aging buckets, overdue list.
    - Journal / Contra — manual entries.
12. **Settings** — Company profile, invoice/tax config, email templates, notifications, users, roles, permissions, preferences.

## End-to-end flow demo
Seeded data will let you walk: Customer → Work Order (approve) → Shipment (advance stages, assign driver, add expenses, mark delivered) → Invoice (generate, PDF) → Receipt (pay) → Outstanding cleared. Each step links to the next via action buttons.

## Delivery in phases (each phase = one turn)
Because of size, I'll ship in reviewable chunks — each phase is fully working before the next:

- **Phase 1** — Design system, layout shell, auth, RBAC engine, dashboard, seed data, Customers module (reference implementation).
- **Phase 2** — Drivers, Suppliers, Trucks, Work Orders (with approval → shipment generation).
- **Phase 3** — Shipments (timeline, driver assignment, docs, expenses tab), Expenses module, Purchases.
- **Phase 4** — Accounts (Invoices + PDF, Receipts, Ledgers, Outstanding, Journal).
- **Phase 5** — Settings (all sections incl. role/permission editor), polish, empty/loading/error states pass, mobile QA.

## Confirm before I start
1. **OK to proceed in 5 phases** as above (each phase = one message), or do you want everything in one shot understanding that some modules will then be thinner?
2. **Data persistence**: `localStorage` via Zustand (no backend). Confirm — or should I enable **Lovable Cloud** (Supabase) so data is real and multi-user? Cloud is a bigger up-front lift but makes it truly production-ready.
3. **Currency & locale** for invoices/amounts: default **INR (₹)** given GST fields, or USD/AED/other?
4. **Logo/brand**: use a generated "HAMS" wordmark, or will you supply a logo?

Reply with answers (or just "go with defaults: 5 phases, localStorage, INR, generated logo") and I'll start Phase 1 immediately.