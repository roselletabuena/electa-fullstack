import React from "react";
import { SiteShell } from "@/features/navigation";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
