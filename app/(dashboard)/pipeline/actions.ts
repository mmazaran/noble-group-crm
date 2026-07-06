"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateClientStage(clientId: string, stage: string) {
  const supabase = createClient();
  await supabase.from("clients").update({ pipeline_stage: stage }).eq("id", clientId);
  revalidatePath("/pipeline");
}
