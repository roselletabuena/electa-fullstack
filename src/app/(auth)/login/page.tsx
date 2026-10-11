import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Electa",
  description: "Sign in to your Electa universal account to vote and manage events.",
};

export default async function LoginPage(): Promise<React.JSX.Element> {
  const session = await getSession();
  if (session?.userId) {
    redirect("/dashboard");
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
