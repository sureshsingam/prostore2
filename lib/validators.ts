import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

// creating schema to validate product insertion
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be atleast 3 characters"),
  slug: z.string().min(3, "Slug must be atleast 3 characters"),
  category: z.string().min(3, "Category must be atleast 3 characters"),
  brand: z.string().min(3, "Brand must be atleast 3 characters"),
  description: z.string().min(3, "Description must be atleast 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have atleast 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// schema for signing users in

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});

// schema for registering users
export const signUpFormSchema = z
  .object({
    name: z.string().min(2, "Name must be atleast 2 characters "),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be atleast 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"],
  });

// cart schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  quantity: z.number().int().nonnegative("quantity must be a positive number"),
  image: z.string().min(1, "Image is required"),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

// Schema for the shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  streetAddress: z
    .string()
    .min(3, "Street Address must be at least 3 characters "),
  city: z.string().min(3, "City must be at least 3 characters "),
  postalCode: z.string().min(3, "postalCode must be at least 3 characters "),
  country: z.string().min(2, "Country must be at least 2 characters "),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Create Schema for payment methods
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment Method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid Payment Method",
  });

// Schemas for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
});

// Schemas for inserting order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  quantity: z.number(),
});

// schema for paypal payment result schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

//schema for updating user profile

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be atleast 2 characters"),
  email: z.string().min(3, "Email must be atleast 3 characters"),
});
