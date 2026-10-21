import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Throws on failure so callers can show their own toast; returns the public URL.
export async function uploadPublicFile(
  file: File,
  folder: string
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `ailene/${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from("sevenpreneur")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("sevenpreneur").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("Public URL unavailable");
  return data.publicUrl;
}
