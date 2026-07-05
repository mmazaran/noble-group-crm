"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addContentItem(formData: FormData) {
  const supabase = createClient();

  await supabase.from("content_items").insert({
    project_id: String(formData.get("project_id")),
    title: String(formData.get("title")),
    type: String(formData.get("type") || "reel"),
    status: String(formData.get("status") || "planned"),
    platform: String(formData.get("platform") || "instagram"),
    scheduled_date: formData.get("scheduled_date") ? String(formData.get("scheduled_date")) : null,
    caption: String(formData.get("caption") || ""),
  });

  revalidatePath("/content");
}

export async function updateContentStatus(id: string, status: string) {
  const supabase = createClient();
  await supabase.from("content_items").update({ status }).eq("id", id);
  revalidatePath("/content");
}
