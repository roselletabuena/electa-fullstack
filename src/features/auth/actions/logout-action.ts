"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("electa_auth_session");
  cookieStore.delete("vs_auth_session");

  redirect("/login");
}
