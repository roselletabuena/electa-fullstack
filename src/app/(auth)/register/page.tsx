import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Join Electa | Universal Account",
  description: "Create your Electa account to vote on pageants and organize events.",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session && session.userId) {
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
      <RegisterForm />
    </Suspense>
  );
}
