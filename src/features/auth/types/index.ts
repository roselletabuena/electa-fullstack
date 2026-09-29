import { z } from "zod";

export type UserRole = "ORGANIZER" | "VOTER" | "ADMIN";

export interface UserSessionDto {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null | undefined;
  organizationName?: string | null | undefined;
  isNewUser?: boolean | undefined;
  expiresAt: string;
}

export interface LoginCredentialsDto {
  email: string;
  password?: string | undefined;
  isDemoLogin?: boolean | undefined;
  returnTo?: string | undefined;
}

export interface RegisterOrganizerDto {
  name: string;
  email: string;
  password?: string | undefined;
  organizationName?: string | undefined;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "EMAIL_ALREADY_EXISTS"
  | "VALIDATION_ERROR"
  | "AUTH_FAILED"
  | "AUTH_CANCELLED"
  | "INVALID_STATE"
  | "TOKEN_EXCHANGE_FAILED"
  | "SESSION_EXPIRED"
  | "UNAUTHORIZED";

export interface AuthErrorDto {
  code: AuthErrorCode;
  message: string;
  field?: string | undefined;
}

export type AuthActionResult<T = UserSessionDto> =
  | { success: true; data: T; redirectTo?: string | undefined }
  | { success: false; error: AuthErrorDto };

// OAuth Schemas & Types
export const oauthStateSchema = z.object({
  state: z.string().min(16),
  nonce: z.string().min(16),
  returnTo: z.string().optional().default("/dashboard"),
  createdAt: z.number(),
});

export type OAuthStatePayload = z.infer<typeof oauthStateSchema>;

export const cognitoCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type CognitoCallbackQuery = z.infer<typeof cognitoCallbackQuerySchema>;
