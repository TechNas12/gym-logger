import { z } from 'zod';

export interface PasswordRule {
  id: string;
  label: string;
  test: (val: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'min-length',
    label: 'At least 8 characters',
    test: (val: string) => val.length >= 8,
  },
  {
    id: 'has-letter',
    label: 'At least one letter (a-z, A-Z)',
    test: (val: string) => /[a-zA-Z]/.test(val),
  },
  {
    id: 'has-number',
    label: 'At least one number (0-9)',
    test: (val: string) => /[0-9]/.test(val),
  },
];

export function checkPasswordRequirements(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));
}

/**
 * Standard email schema with trimming and lowercasing normalization
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address (e.g. name@domain.com)');

/**
 * Password schema with length, letter, and number checks
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'Password must include at least one letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must include at least one number',
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
