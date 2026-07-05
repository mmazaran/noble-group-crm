"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addClient(formData: FormData) {
  const supabase = createClient();

  await supabase.from("clients").insert({
    company_name: String(formData.get("company_name")),
    contact_name: String(formData.get("contact_name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    type: String(formData.get("type") || "other"),
  });

  revalidatePath("/clients");
}
