"use client";

import { updateInvoiceStatus } from "./actions";

export default function InvoiceStatusSelect({ id, currentStatus }: { id: string; currentStatus: string }) {
  return (
    <select
      defaultValue={currentStatus}
      onChange={(e) => updateInvoiceStatus(id, e.target.value)}
      className="text-xs rounded border border-studio-border bg-studio-bg px-2 py-1 outline-none focus:border-tungsten"
    >
      <option value="draft">Draft</option>
      <option value="sent">Sent</option>
      <option value="paid">Paid</option>
      <option value="overdue">Overdue</option>
    </select>
  );
}
