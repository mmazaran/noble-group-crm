"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addInvoice(formData: FormData) {
  const supabase = createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      client_id: String(formData.get("client_id")),
      invoice_number: String(formData.get("invoice_number")),
      due_date: formData.get("due_date") ? String(formData.get("due_date")) : null,
      status: "draft",
    })
    .select()
    .single();

  if (!error && invoice) {
    const description = String(formData.get("item_description") || "Services rendered");
    const quantity = Number(formData.get("item_quantity") || 1);
    const unitPrice = Number(formData.get("item_price") || 0);

    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      description,
      quantity,
      unit_price: unitPrice,
    });
  }

  revalidatePath("/invoices");
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = createClient();
  await supabase.from("invoices").update({ status }).eq("id", id);
  revalidatePath("/invoices");
}
