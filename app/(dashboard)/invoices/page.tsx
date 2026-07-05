import { createClient } from "@/lib/supabase/server";
import { addInvoice } from "./actions";
import InvoiceStatusSelect from "./invoice-status-select";

export default async function InvoicesPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user!.id)
    .single();
  const isInternal = profile?.role === "owner" || profile?.role === "team";

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(company_name), invoice_items(quantity, unit_price)")
    .order("issue_date", { ascending: false });

  const { data: clients } = isInternal
    ? await supabase.from("clients").select("id, company_name")
    : { data: [] };

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:06 — INVOICES</div>
        <h1 className="font-display text-2xl">Invoices</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {invoices?.length ? (
            invoices.map((inv: any) => {
              const total = inv.invoice_items?.reduce(
                (sum: number, item: any) => sum + item.quantity * item.unit_price,
                0
              );
              return (
                <div
                  key={inv.id}
                  className="rounded-lg border border-studio-border bg-studio-surface p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs text-studio-faint">{inv.invoice_number}</div>
                    <div className="font-medium">{inv.clients?.company_name}</div>
                    <div className="text-sm text-studio-muted">
                      Due {inv.due_date ?? "—"} · ${total?.toFixed(2) ?? "0.00"}
                    </div>
                  </div>
                  {isInternal ? (
                    <InvoiceStatusSelect id={inv.id} currentStatus={inv.status} />
                  ) : (
                    <span className="text-xs font-mono uppercase text-studio-muted">{inv.status}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-studio-muted text-sm">No invoices yet.</div>
          )}
        </div>

        {isInternal && (
          <div className="rounded-lg border border-studio-border bg-studio-surface p-5 h-fit">
            <h2 className="font-display text-lg mb-4">Create invoice</h2>
            <form action={addInvoice} className="space-y-3">
              <select
                name="client_id"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              >
                <option value="">Select client…</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
              <input
                name="invoice_number"
                placeholder="Invoice # (e.g. PV-0012)"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <input
                name="due_date"
                type="date"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <input
                name="item_description"
                placeholder="Line item description"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <div className="flex gap-2">
                <input
                  name="item_quantity"
                  type="number"
                  placeholder="Qty"
                  defaultValue={1}
                  className="w-1/2 rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
                />
                <input
                  name="item_price"
                  type="number"
                  step="0.01"
                  placeholder="Unit price"
                  className="w-1/2 rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
              >
                Create invoice
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
