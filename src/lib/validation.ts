import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[+0-9][0-9\s-]{9,15}$/, "Enter a phone number, for example 0300 1234567");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email address") });
export type ForgotInput = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({ password: z.string().min(8, "Use at least 8 characters"), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
export type ResetInput = z.infer<typeof resetSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.union([phone, z.literal("")]).optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const checkoutSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  fullName: z.string().trim().min(2, "Enter the recipient's full name").max(80),
  phone,
  line1: z.string().trim().min(5, "Enter a street address").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city").max(60),
  province: z.string().trim().min(2, "Choose a province"),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  paymentMethod: z.enum(["cod", "store_pickup"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.union([phone, z.literal("")]).optional(),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({ email: z.string().trim().email("Enter a valid email address") });

const money = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount, for example 12500");
const optionalMoney = z.union([money, z.literal("")]);
const wholeNumber = z.string().trim().regex(/^\d+$/, "Enter a whole number");

/** Admin forms keep numbers as strings so empty fields validate cleanly; convert on submit. */
export const productFormSchema = z.object({
  name: z.string().trim().min(3, "Enter a product name").max(120),
  slug: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().min(10, "Add a short description").max(2000),
  details: z.string().max(2000),
  price: money,
  compareAtPrice: optionalMoney,
  categoryId: z.string().min(1, "Choose a category"),
  collections: z.array(z.string()),
  sizes: z.string().trim().min(1, "Add at least one size"),
  colors: z.string().trim().min(1, "Add at least one colour"),
  imageUrls: z.string().trim().min(1, "Add at least one image URL"),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  isNew: z.boolean(),
  status: z.enum(["active", "draft"]),
  defaultStock: wholeNumber,
});
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(60),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(300),
  sortOrder: wholeNumber,
});
export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(80),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code, for example PKR"),
  currencyLocale: z.string().trim().min(2).max(10),
  shippingFlatFee: money,
  freeShippingThreshold: money,
  announcement: z.string().trim().max(140),
  contactEmail: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]),
  contactPhone: z.string().trim().max(30),
  address: z.string().trim().max(200),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const pakistanProvinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
];
