import { redirect } from "next/navigation";

export default function EventsRedirectPage(): never {
  redirect("/dashboard");
}
