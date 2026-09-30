"use client";

import React from "react";
import { OmnichannelAuthModal } from "@/features/auth/components/OmnichannelAuthModal";

export interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string | undefined;
  onSuccess?: (() => void) | undefined;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  onSuccess,
}) => {
  return (
    <OmnichannelAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Sign In to Cast Your Vote"
      subtitle={
        candidateName
          ? `Support ${candidateName} with your daily free votes by signing in with your preferred account.`
          : "Sign in with your preferred social or passwordless account to cast your free daily votes."
      }
    />
  );
};
