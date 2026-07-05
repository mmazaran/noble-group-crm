"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const supabase = createClient();

  await supabase.from("tasks").insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    project_id: formData.get("project_id") ? String(formData.get("project_id")) : null,
    due_date: formData.get("due_date") ? String(formData.get("due_date")) : null,
    status: "todo",
  });

  revalidatePath("/tasks");
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = createClient();
  await supabase.from("tasks").update({ status }).eq("id", id);
  revalidatePath("/tasks");
}
