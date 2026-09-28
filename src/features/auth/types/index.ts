export type UserRole = "ORGANIZER" | "VOTER" | "ADMIN";

export interface UserSessionDto {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
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
