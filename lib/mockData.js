// lib/mockData.js - Central in-memory mock data store
// This simulates a database. Replace with Firebase calls later.

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Seed Users - Passwords are now hashed using bcryptjs
// ---------------------------------------------------------------------------
export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@pos.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Store Manager',
    email: 'manager@pos.com',
    password: bcrypt.hashSync('manager123', 10),
    role: 'MANAGER',
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Jane Cashier',
    email: 'cashier@pos.com',
    password: bcrypt.hashSync('cashier123', 10),
    role: 'CASHIER',
    createdAt: '2026-01-03T00:00:00Z',
  },
];

export const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Coca-Cola 500ml', category: 'Beverages', price: 3.50, costPrice: 2.10, quantity: 120, barcode: '5000112637922', lowStockThreshold: 20, createdAt: '2026-01-05T00:00:00Z', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop' },
  { id: 'p2', name: 'Pepsi 500ml', category: 'Beverages', price: 3.20, costPrice: 1.90, quantity: 95, barcode: '5000112011536', lowStockThreshold: 20, createdAt: '2026-01-05T00:00:00Z', image: 'https://images.unsplash.com/photo-1533007422967-bb14020c0299?q=80&w=800&auto=format&fit=crop' },
  { id: 'p3', name: 'Mineral Water 1L', category: 'Beverages', price: 1.80, costPrice: 0.80, quantity: 200, barcode: '7310865004703', lowStockThreshold: 30, createdAt: '2026-01-05T00:00:00Z', image: 'https://images.unsplash.com/photo-1560023907-5f33966b93aa?q=80&w=800&auto=format&fit=crop' },
  { id: 'p4', name: 'Bread Loaf', category: 'Bakery', price: 5.00, costPrice: 3.00, quantity: 40, barcode: '0045674300015', lowStockThreshold: 10, createdAt: '2026-01-06T00:00:00Z', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop' },
  { id: 'p5', name: 'Whole Milk 1L', category: 'Dairy', price: 4.50, costPrice: 3.10, quantity: 8, barcode: '0012345678905', lowStockThreshold: 15, createdAt: '2026-01-06T00:00:00Z', image: 'https://images.unsplash.com/photo-1550583724-1255818c0533?q=80&w=800&auto=format&fit=crop' },
  { id: 'p6', name: 'Cheddar Cheese 200g', category: 'Dairy', price: 6.99, costPrice: 4.50, quantity: 30, barcode: '1234567890128', lowStockThreshold: 10, createdAt: '2026-01-06T00:00:00Z', image: 'https://images.unsplash.com/photo-1486297678162-ad2a19b05840?q=80&w=800&auto=format&fit=crop' },
  { id: 'p7', name: 'Chicken Breast 1kg', category: 'Meat', price: 12.99, costPrice: 8.00, quantity: 5, barcode: '9781234567897', lowStockThreshold: 8, createdAt: '2026-01-07T00:00:00Z', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=800&auto=format&fit=crop' },
  { id: 'p8', name: 'Basmati Rice 2kg', category: 'Grains', price: 8.50, costPrice: 5.50, quantity: 60, barcode: '8901234567890', lowStockThreshold: 15, createdAt: '2026-01-07T00:00:00Z', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop' },
  { id: 'p9', name: 'Tomato Paste 400g', category: 'Canned Goods', price: 2.99, costPrice: 1.80, quantity: 75, barcode: '7654321098765', lowStockThreshold: 20, createdAt: '2026-01-08T00:00:00Z', image: 'https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?q=80&w=800&auto=format&fit=crop' },
  { id: 'p10', name: 'Cooking Oil 2L', category: 'Oils & Fats', price: 9.99, costPrice: 6.50, quantity: 45, barcode: '6543210987654', lowStockThreshold: 10, createdAt: '2026-01-08T00:00:00Z', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop' },
  { id: 'p11', name: 'Sugar 1kg', category: 'Baking', price: 3.75, costPrice: 2.20, quantity: 80, barcode: '5432109876543', lowStockThreshold: 15, createdAt: '2026-01-09T00:00:00Z', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?q=80&w=800&auto=format&fit=crop' },
  { id: 'p12', name: 'Eggs (12 pack)', category: 'Dairy', price: 7.20, costPrice: 4.80, quantity: 4, barcode: '4321098765432', lowStockThreshold: 6, createdAt: '2026-01-09T00:00:00Z', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800&auto=format&fit=crop' },
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Kwame Asante', email: 'kwame@email.com', phone: '0244123456', loyaltyPoints: 340, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'c2', name: 'Ama Boateng', email: 'ama@email.com', phone: '0277987654', loyaltyPoints: 125, createdAt: '2026-01-12T00:00:00Z' },
  { id: 'c3', name: 'Kofi Mensah', email: 'kofi@email.com', phone: '0201456789', loyaltyPoints: 580, createdAt: '2026-01-15T00:00:00Z' },
  { id: 'c4', name: 'Akua Owusu', email: 'akua@email.com', phone: '0247654321', loyaltyPoints: 90, createdAt: '2026-02-01T00:00:00Z' },
];

export const MOCK_SALES = [
  {
    id: 's1', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: 'c1', customerName: 'Kwame Asante',
    totalAmount: 24.50, discountAmount: 0, paymentMethod: 'CASH', status: 'COMPLETED',
    createdAt: '2026-03-17T08:30:00Z',
    items: [
      { productId: 'p1', productName: 'Coca-Cola 500ml', quantity: 4, unitPrice: 3.50, subtotal: 14.00 },
      { productId: 'p8', productName: 'Basmati Rice 2kg', quantity: 1, unitPrice: 8.50, subtotal: 8.50 },
      { productId: 'p9', productName: 'Tomato Paste 400g', quantity: 1, unitPrice: 2.99, subtotal: 2.99 },
    ],
  },
  {
    id: 's2', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: null, customerName: 'Walk-in',
    totalAmount: 16.70, discountAmount: 0, paymentMethod: 'MOBILE_MONEY', status: 'COMPLETED',
    createdAt: '2026-03-17T09:15:00Z',
    items: [
      { productId: 'p4', productName: 'Bread Loaf', quantity: 2, unitPrice: 5.00, subtotal: 10.00 },
      { productId: 'p6', productName: 'Cheddar Cheese 200g', quantity: 1, unitPrice: 6.99, subtotal: 6.99 },
    ],
  },
  {
    id: 's3', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: 'c2', customerName: 'Ama Boateng',
    totalAmount: 33.18, discountAmount: 2.00, paymentMethod: 'CARD', status: 'COMPLETED',
    createdAt: '2026-03-17T10:45:00Z',
    items: [
      { productId: 'p5', productName: 'Whole Milk 1L', quantity: 3, unitPrice: 4.50, subtotal: 13.50 },
      { productId: 'p10', productName: 'Cooking Oil 2L', quantity: 2, unitPrice: 9.99, subtotal: 19.98 },
    ],
  },
  {
    id: 's4', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: 'c3', customerName: 'Kofi Mensah',
    totalAmount: 45.75, discountAmount: 0, paymentMethod: 'CASH', status: 'COMPLETED',
    createdAt: '2026-03-16T11:00:00Z',
    items: [
      { productId: 'p7', productName: 'Chicken Breast 1kg', quantity: 2, unitPrice: 12.99, subtotal: 25.98 },
      { productId: 'p11', productName: 'Sugar 1kg', quantity: 3, unitPrice: 3.75, subtotal: 11.25 },
      { productId: 'p3', productName: 'Mineral Water 1L', quantity: 2, unitPrice: 1.80, subtotal: 3.60 },
      { productId: 'p9', productName: 'Tomato Paste 400g', quantity: 1, unitPrice: 2.99, subtotal: 2.99 },
    ],
  },
  {
    id: 's5', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: null, customerName: 'Walk-in',
    totalAmount: 14.40, discountAmount: 0, paymentMethod: 'CASH', status: 'COMPLETED',
    createdAt: '2026-03-16T14:30:00Z',
    items: [
      { productId: 'p3', productName: 'Mineral Water 1L', quantity: 4, unitPrice: 1.80, subtotal: 7.20 },
      { productId: 'p2', productName: 'Pepsi 500ml', quantity: 2, unitPrice: 3.20, subtotal: 6.40 },
    ],
  },
  {
    id: 's6', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: 'c1', customerName: 'Kwame Asante',
    totalAmount: 27.18, discountAmount: 0, paymentMethod: 'MOBILE_MONEY', status: 'COMPLETED',
    createdAt: '2026-03-15T09:00:00Z',
    items: [
      { productId: 'p8', productName: 'Basmati Rice 2kg', quantity: 2, unitPrice: 8.50, subtotal: 17.00 },
      { productId: 'p9', productName: 'Tomato Paste 400g', quantity: 2, unitPrice: 2.99, subtotal: 5.98 },
      { productId: 'p2', productName: 'Pepsi 500ml', quantity: 1, unitPrice: 3.20, subtotal: 3.20 },
    ],
  },
  {
    id: 's7', cashierId: 'u3', cashierName: 'Jane Cashier', customerId: 'c4', customerName: 'Akua Owusu',
    totalAmount: 52.46, discountAmount: 5.00, paymentMethod: 'CARD', status: 'COMPLETED',
    createdAt: '2026-03-14T16:00:00Z',
    items: [
      { productId: 'p10', productName: 'Cooking Oil 2L', quantity: 3, unitPrice: 9.99, subtotal: 29.97 },
      { productId: 'p12', productName: 'Eggs (12 pack)', quantity: 2, unitPrice: 7.20, subtotal: 14.40 },
      { productId: 'p11', productName: 'Sugar 1kg', quantity: 2, unitPrice: 3.75, subtotal: 7.50 },
    ],
  },
];

export const MOCK_INVENTORY_LOGS = [
  { id: 'il1', productId: 'p5', productName: 'Whole Milk 1L', changeType: 'SALE', quantityChanged: -3, reason: 'Sale #s3', userId: 'u3', createdAt: '2026-03-17T10:45:00Z' },
  { id: 'il2', productId: 'p7', productName: 'Chicken Breast 1kg', changeType: 'SALE', quantityChanged: -2, reason: 'Sale #s4', userId: 'u3', createdAt: '2026-03-16T11:00:00Z' },
  { id: 'il3', productId: 'p12', productName: 'Eggs (12 pack)', changeType: 'SALE', quantityChanged: -2, reason: 'Sale #s7', userId: 'u3', createdAt: '2026-03-14T16:00:00Z' },
  { id: 'il4', productId: 'p5', productName: 'Whole Milk 1L', changeType: 'RESTOCK', quantityChanged: 20, reason: 'Manual restock', userId: 'u2', createdAt: '2026-03-13T08:00:00Z' },
];

// Daily sales for the last 7 days (for charts)
export const MOCK_WEEKLY_SALES = [
  { day: 'Mon', sales: 120.50, transactions: 8 },
  { day: 'Tue', sales: 98.20, transactions: 6 },
  { day: 'Wed', sales: 145.75, transactions: 11 },
  { day: 'Thu', sales: 87.30, transactions: 5 },
  { day: 'Fri', sales: 210.90, transactions: 14 },
  { day: 'Sat', sales: 287.40, transactions: 19 },
  { day: 'Sun', sales: 165.20, transactions: 12 },
];
