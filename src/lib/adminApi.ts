import { supabase } from "@/integrations/supabase/client";

const PASSWORD_KEY = "kb_admin_pw";

export const getAdminPassword = () => sessionStorage.getItem(PASSWORD_KEY);
export const setAdminPassword = (pw: string) => sessionStorage.setItem(PASSWORD_KEY, pw);
export const clearAdminPassword = () => sessionStorage.removeItem(PASSWORD_KEY);

export async function callAdmin<T = any>(
  body: Record<string, unknown>,
  password?: string
): Promise<T> {
  const pw = password ?? getAdminPassword() ?? "";
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body,
    headers: { "x-admin-password": pw },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}
