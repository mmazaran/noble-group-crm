"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAutomation(formData: FormData) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const triggerEvent = formData.get("trigger_event") as string;
  const actionType = formData.get("action_type") as string;
  const actionMessage = formData.get("action_message") as string;
  const actionTo = formData.get("action_to") as string;

  await supabase.from("automations").insert({
    name: formData.get("name") as string,
    trigger_event: triggerEvent,
    action_type: actionType,
    action_config: { message: actionMessage, to: actionTo },
    is_active: true,
  });

  revalidatePath("/automations");
}

export async function toggleAutomation(id: string, isActive: boolean) {
  const supabase = createClient();
  await supabase.from("automations").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/automations");
}

export async function deleteAutomation(id: string) {
  const supabase = createClient();
  await supabase.from("automations").delete().eq("id", id);
  revalidatePath("/automations");
}
