"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAppointment(formData: FormData) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  await supabase.from("appointments").insert({
    client_id: formData.get("client_id") as string || null,
    project_id: formData.get("project_id") as string || null,
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    start_time: formData.get("start_time") as string,
    end_time: formData.get("end_time") as string,
    type: formData.get("type") as string,
    status: "scheduled",
    assigned_to: authData.user.id,
  });

  revalidatePath("/calendar");
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = createClient();
  await supabase.from("appointments").update({ status }).eq("id", id);
  revalidatePath("/calendar");
}
