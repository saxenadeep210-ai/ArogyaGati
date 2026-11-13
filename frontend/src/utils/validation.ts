import { z } from 'zod';

// Indian Mobile Number: 10 digits starting with 6, 7, 8, or 9
export const indianMobileRegex = /^[6-9]\d{9}$/;

// ABHA ID format: 14 digits with hyphens (XX-XXXX-XXXX-XXXX) or ABHA address (name@abdm)
export const abhaRegex = /^(\d{2}-\d{4}-\d{4}-\d{4}|[a-zA-Z0-9._]{3,}@[a-zA-Z]{3,})$/;

// 6-digit numeric OTP
export const otpRegex = /^\d{6}$/;

export const patientMobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(indianMobileRegex, 'Please enter a valid 10-digit Indian mobile number'),
});

export const patientAbhaSchema = z.object({
  abhaId: z
    .string()
    .trim()
    .min(5, 'ABHA number or address is required')
    .refine(
      (val) => abhaRegex.test(val) || val.replace(/-/g, '').length === 14,
      'Enter a valid 14-digit ABHA Number (e.g. 14-5544-7788-9922) or ABHA Address (e.g. name@abdm)'
    ),
  consentGranted: z.boolean().refine((val) => val === true, {
    message: 'You must grant consent to access health records',
  }),
});

export const emailLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const patientRegisterSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
    mobile: z.string().trim().regex(indianMobileRegex, 'Enter a valid 10-digit Indian mobile number'),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum({ MALE: 'MALE', FEMALE: 'FEMALE', OTHER: 'OTHER' } as const),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    consentGranted: z.boolean().refine((val) => val === true, {
      message: 'Consent is required for healthcare data processing',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const doctorLoginSchema = z.object({
  doctorId: z.string().trim().min(3, 'Doctor / Staff ID or official email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const adminLoginSchema = z.object({
  adminId: z.string().trim().min(3, 'Administrator ID or Official Email is required'),
  password: z.string().min(6, 'Password is required'),
  mfaCode: z.string().trim().optional(),
  rememberMe: z.boolean().optional(),
});

export const ambulanceLoginSchema = z.object({
  vehicleId: z.string().trim().min(3, 'Vehicle / Ambulance ID is required (e.g., AMB-UP80-108)'),
  driverId: z.string().trim().min(3, 'Driver or Paramedic ID is required'),
  mobile: z.string().trim().regex(indianMobileRegex, 'Valid 10-digit mobile number required'),
  authMethod: z.enum({ OTP: 'OTP', PASSWORD: 'PASSWORD' } as const),
  password: z.string().optional(),
});

export const otpSchema = z.object({
  otp: z.string().trim().regex(otpRegex, 'OTP must be exactly 6 digits'),
});

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Please enter your registered email or mobile number'),
});
