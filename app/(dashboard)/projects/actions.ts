"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProject(formData: FormData) {
  const supabase = createClient();

  await supabase.from("projects").insert({
    client_id: String(formData.get("client_id")),
    name: String(formData.get("name")),
    address: String(formData.get("address") || ""),
    stage: String(formData.get("stage") || "foundation"),
    start_date: formData.get("start_date") ? String(formData.get("start_date")) : null,
    notes: String(formData.get("notes") || ""),
  });

  revalidatePath("/projects");
}

export async function updateProjectStage(projectId: string, stage: string) {
  const supabase = createClient();
  await supabase.from("projects").update({ stage }).eq("id", projectId);
  revalidatePath("/projects");
}
