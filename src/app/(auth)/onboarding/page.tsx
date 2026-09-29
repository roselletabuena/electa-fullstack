import type { Metadata } from "next";
import { OnboardingForm } from "@/features/auth/components/OnboardingForm";

export const metadata: Metadata = {
  title: "Welcome Onboarding | VoteSphere",
  description: "Set up your organizer organization workspace on VoteSphere",
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
