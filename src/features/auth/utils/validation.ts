import { z } from "zod";

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string().optional(),
    isDemoLogin: z.boolean().optional(),
    returnTo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isDemoLogin) {
        return true;
      }
      return Boolean(data.password && data.password.length >= 6);
    },
    {
      message: "Password must be at least 6 characters",
      path: ["password"],
    },
  );

export const registerOrganizerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  organizationName: z.string().trim().max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerOrganizerSchema>;
