// lib/validations.js - Zod schemas for all API inputs
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  barcode: z.string().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional().default(10),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contact_person: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export const saleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
});

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'MOBILE_MONEY', 'CARD']),
  amount: z.number().nonnegative(),
  reference: z.string().optional().or(z.literal('')),
});

export const saleSchema = z.object({
  customerId: z.string().nullable().optional(),
  customerName: z.string().optional().default('Walk-in'),
  cashierId: z.string().optional(),
  cashierName: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  pointsRedeemed: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'CARD', 'SPLIT']),
  payments: z.array(paymentSchema).min(1, 'At least one payment method is required').optional(),
  items: z.array(saleItemSchema).min(1, 'Sale must have at least one item'),
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string(),
  quantity: z.number().int(), // positive for restock, negative for deduction
  reason: z.string().min(3, 'Reason is required'),
  userId: z.string(),
  supplierId: z.string().optional().nullable(),
});
