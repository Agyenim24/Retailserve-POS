// lib/store.js - Supabase integration for backend storage
import { supabaseAdmin as supabase } from './supabase';
import bcrypt from 'bcryptjs';

// Deep-clone seed data so we start fresh each server start
// We no longer need local users/products arrays here as we access Supabase.

export const store = {
  // USERS
  getUsers: async () => {
    const { data, error } = await supabase.from('users').select('id, name, email, role, created_at');
    if (error) throw error;
    return data;
  },
  findUserByEmail: async (email) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (error) throw error;
    if (data && data.password_hash) {
      data.password_hash = data.password_hash.replace(/[^a-zA-Z0-9./$]/g, '');
    }
    return data;
  },
  createUser: async (data) => {
    const { password, ...rest } = data;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ ...rest, password_hash: hashedPassword })
      .select()
      .single();
    if (error) throw error;
    return newUser;
  },
  updateUser: async (id, data) => {
    let updateData = { ...data };
    if (data.password) {
      updateData.password_hash = bcrypt.hashSync(data.password, 10);
      delete updateData.password;
    }
    const { data: updated, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // PRODUCTS
  getProducts: async (filters = {}) => {
    let query = supabase.from('products').select('*, categories(name)');
    
    if (filters.search) {
      const q = `%${filters.search}%`;
      query = query.or(`name.ilike.${q},barcode.ilike.${q}`);
    }
    
    if (filters.category) {
      // Assuming you pass the category name or ID? 
      // If it's Category name, we might need to filter by the joined table.
      // For now, let's keep it simple: filter by ID or Category string.
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Map category join to match the original object structure
    return data.map(p => ({
      ...p,
      category: p.categories?.name || 'Uncategorized'
    }));
  },
  getProduct: async (id) => {
    const { data, error } = await supabase.from('products').select('*, categories(name)').eq('id', id).single();
    if (error) return null;
    return { ...data, category: data.categories?.name || 'Uncategorized' };
  },
  getProductByBarcode: async (barcode) => {
    const { data, error } = await supabase.from('products').select('*, categories(name)').eq('barcode', barcode).maybeSingle();
    if (error) return null;
    if (!data) return null;
    return { ...data, category: data.categories?.name || 'Uncategorized' };
  },
  createProduct: async (data) => {
    // Basic category handling (upsert into categories first if needed?)
    // Actually, following the SQL we wrote, we use category_id.
    const { category, lowStockThreshold, ...rest } = data;
    
    // Quick category lookup/create
    const { data: catData } = await supabase.from('categories').select('id').eq('name', category).maybeSingle();
    let category_id = catData?.id;
    if (!category_id) {
      const { data: newCat } = await supabase.from('categories').insert({ name: category }).select('id').single();
      category_id = newCat?.id;
    }
    
    const { data: newP, error } = await supabase
      .from('products')
      .insert({ 
        ...rest, 
        category_id,
        low_stock_threshold: lowStockThreshold
      })
      .select()
      .single();
    if (error) throw error;
    return newP;
  },
  updateProduct: async (id, data) => {
    const { category, lowStockThreshold, ...rest } = data;
    let category_id;
    if (category) {
      const { data: catData } = await supabase.from('categories').select('id').eq('name', category).maybeSingle();
      if (!catData) {
        const { data: newCat } = await supabase.from('categories').insert({ name: category }).select('id').single();
        category_id = newCat?.id;
      } else {
        category_id = catData.id;
      }
    }
    
    const updatePayload = { ...rest };
    if (category_id) updatePayload.category_id = category_id;
    if (lowStockThreshold !== undefined) updatePayload.low_stock_threshold = lowStockThreshold;
    
    const { data: updated, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  getLowStockProducts: async () => {
    // Standard Supabase filter (filtering in memory for column-to-column comparison)
    const { data: allProducts, error } = await supabase.from('products').select('*, categories(name)');
    if (error) throw error;
    
    return allProducts
      .filter(p => p.quantity <= (p.low_stock_threshold || 10))
      .map(p => ({
        ...p,
        category: p.categories?.name || 'Uncategorized'
      }));
  },
  getCategories: async () => {
    const { data, error } = await supabase.from('categories').select('name').order('name');
    if (error) throw error;
    return data.map(c => c.name);
  },

  // INVENTORY
  adjustStock: async (productId, quantity, reason, userId, supplierId = null) => {
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
    if (!product) return null;
    
    const newQuantity = product.quantity + quantity;
    const { data: updatedProduct } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', productId)
      .select()
      .single();
      
    const { data: log } = await supabase
      .from('inventory_logs')
      .insert({
        product_id: productId,
        user_id: userId,
        change_type: quantity > 0 ? 'RESTOCK' : 'SALE',
        quantity_changed: quantity,
        reason,
        supplier_id: supplierId
      })
      .select()
      .single();
      
    return { product: updatedProduct, log };
  },
  getInventoryLogs: async () => {
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*, products(name), suppliers(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(l => ({ 
      ...l, 
      productName: l.products?.name,
      supplierName: l.suppliers?.name,
      createdAt: l.created_at,
      changeType: l.change_type,
      quantityChanged: l.quantity_changed
    }));
  },

  // CUSTOMERS
  getCustomers: async (search = '') => {
    let query = supabase.from('customers').select('*').order('name');
    if (search) {
      const q = `%${search}%`;
      query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  getCustomer: async (id) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  createCustomer: async (data) => {
    const { data: newC, error } = await supabase.from('customers').insert(data).select().single();
    if (error) throw error;
    return newC;
  },
  updateCustomer: async (id, data) => {
    const { data: updated, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  },
  deleteCustomer: async (id) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  addLoyaltyPoints: async (customerId, points) => {
    const { data: customer } = await supabase.from('customers').select('loyalty_points').eq('id', customerId).single();
    if (!customer) return null;
    const { data: updated } = await supabase
      .from('customers')
      .update({ loyalty_points: (customer.loyalty_points || 0) + points })
      .eq('id', customerId)
      .select()
      .single();
    return updated;
  },
  getCustomerHistory: async (customerId) => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*, products(name))')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(s => ({
      ...s,
      createdAt: s.created_at,
      totalAmount: s.final_amount,
      items: s.sale_items.map(item => ({
        ...item,
        productName: item.products?.name
      }))
    }));
  },

  // SALES (Simple version, multi-table insert)
  createSale: async (data) => {
    const { items, payments, cashierId, cashierName, customerId, customerName, totalAmount, discountAmount, paymentMethod, pointsRedeemed = 0 } = data;
    
    // Convert to database snake_case
    const dbSaleData = {
      total_amount: totalAmount,
      discount_amount: (discountAmount || 0) + (pointsRedeemed / 100), // 100 pts = $1
      final_amount: totalAmount - (discountAmount || 0) - (pointsRedeemed / 100),
      payment_method: paymentMethod,
      cashier_id: cashierId,
      customer_id: customerId,
      status: 'COMPLETED'
    };

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert(dbSaleData)
      .select()
      .single();
      
    if (saleError) throw saleError;
    
    // Insert Sale Items
    const itemsToInsert = items.map(item => ({
      sale_id: sale.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    }));
    await supabase.from('sale_items').insert(itemsToInsert);
    
    // Insert Payments
    if (payments && payments.length > 0) {
      const paymentsToInsert = payments.map(p => ({
        sale_id: sale.id,
        method: p.method,
        amount: p.amount,
        reference: p.reference
      }));
      await supabase.from('sale_payments').insert(paymentsToInsert);
    }
    
    // Deduct stock and Log
    for (const item of items) {
      await store.adjustStock(item.productId, -item.quantity, `Sale #${sale.id}`, cashierId);
    }
    
    // Loyalty Points Logic
    if (customerId) {
        const netPoints = Math.floor(totalAmount) - pointsRedeemed; // Add what's earned, subtract what's spent
        await store.addLoyaltyPoints(customerId, netPoints);
    }
    
    return {
      ...sale,
      id: sale.id,
      createdAt: sale.created_at,
      totalAmount: sale.final_amount,
      items: items.map(item => ({
        ...item,
        subtotal: item.quantity * item.unitPrice
      })),
      payments: payments || [{ method: paymentMethod, amount: totalAmount }],
      cashierName: cashierName,
      customerName: customerName || 'Walk-in'
    };
  },
  getSales: async (filters = {}) => {
    let query = supabase.from('sales').select('*, users(name), customers(name)').order('created_at', { ascending: false });
    if (filters.cashierId) query = query.eq('cashier_id', filters.cashierId);
    // Simple date filter
    if (filters.date) {
      query = query.gte('created_at', `${filters.date}T00:00:00`).lte('created_at', `${filters.date}T23:59:59`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(s => ({
      ...s,
      createdAt: s.created_at,
      totalAmount: s.final_amount || s.total_amount,
      cashierName: s.users?.name,
      customerName: s.customers?.name || 'Walk-in'
    }));
  },
  
  // REPORTS (Simplified by fetching data)
  getDailySales: async ({ date, cashierId } = {}) => {
    const sales = await store.getSales({ date, cashierId });
    return {
      totalRevenue: sales.reduce((sum, s) => sum + Number(s.final_amount || s.total_amount), 0),
      totalTransactions: sales.length,
      totalDiscount: sales.reduce((sum, s) => sum + Number(s.discount_amount || 0), 0),
      sales: sales,
    };
  },
  getInventoryReport: async () => {
    const { data: products } = await supabase.from('products').select('*');
    return {
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      totalValue: products.reduce((sum, p) => sum + (Number(p.price) * p.quantity), 0),
      totalCostValue: products.reduce((sum, p) => sum + (Number(p.cost_price || 0) * p.quantity), 0),
      lowStockCount: products.filter(p => p.quantity <= p.low_stock_threshold).length,
      lowStockItems: products.filter(p => p.quantity <= p.low_stock_threshold)
    };
  },
  getTopProducts: async () => {
    const { data: items } = await supabase
      .from('sale_items')
      .select('product_id, quantity, subtotal, products(name)');
    
    const map = {};
    items?.forEach(item => {
      const pid = item.product_id;
      if (!map[pid]) map[pid] = { productId: pid, productName: item.products?.name, totalQty: 0, totalRevenue: 0 };
      map[pid].totalQty += item.quantity;
      map[pid].totalRevenue += Number(item.subtotal);
    });
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
  },
  getCashierPerformance: async (date) => {
    const sales = await store.getSales({ date });
    const map = {};
    sales.forEach(s => {
      if (!map[s.cashier_id]) map[s.cashier_id] = { cashierId: s.cashier_id, cashierName: s.cashierName, totalSales: 0, totalRevenue: 0 };
      map[s.cashier_id].totalSales++;
      map[s.cashier_id].totalRevenue += Number(s.final_amount || s.total_amount);
    });
    return Object.values(map);
  },
  getProfitReport: async (date) => {
    const { data: sales } = await supabase
      .from('sales')
      .select('*, sale_items(*, products(cost_price))');
    
    let filtered = sales || [];
    if (date) filtered = sales.filter(s => s.created_at.startsWith(date));

    let totalRevenue = 0;
    let totalCost = 0;

    filtered.forEach(sale => {
      totalRevenue += Number(sale.final_amount || sale.total_amount);
      sale.sale_items.forEach(item => {
        totalCost += Number(item.products?.cost_price || 0) * item.quantity;
      });
    });

    return {
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
    };
  },

  // SUPPLIERS
  getSuppliers: async () => {
    const { data, error } = await supabase.from('suppliers').select('*').order('name');
    if (error) throw error;
    return data;
  },
  createSupplier: async (data) => {
    const { data: newS, error } = await supabase.from('suppliers').insert(data).select().single();
    if (error) throw error;
    return newS;
  },
  updateSupplier: async (id, data) => {
    const { data: updated, error } = await supabase.from('suppliers').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  },
  deleteSupplier: async (id) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // BACKUP & RESTORE
  getBackupData: async () => {
    const [users, products, categories, customers, suppliers, sales, saleItems, inventoryLogs] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('products').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('customers').select('*'),
      supabase.from('suppliers').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('sale_items').select('*'),
      supabase.from('inventory_logs').select('*')
    ]);
    
    return {
      users: users.data || [],
      products: products.data || [],
      categories: categories.data || [],
      customers: customers.data || [],
      suppliers: suppliers.data || [],
      sales: sales.data || [],
      saleItems: saleItems.data || [],
      inventoryLogs: inventoryLogs.data || []
    };
  },
  restoreBackupData: async (backup) => {
    const { users, products, categories, customers, suppliers, sales, saleItems, inventoryLogs } = backup;
    
    // Order is important to handle foreign keys
    const tables = [
      { name: 'users', data: users },
      { name: 'categories', data: categories },
      { name: 'suppliers', data: suppliers },
      { name: 'customers', data: customers },
      { name: 'products', data: products },
      { name: 'sales', data: sales },
      { name: 'sale_items', data: saleItems },
      { name: 'inventory_logs', data: inventoryLogs }
    ];

    for (const table of tables) {
      if (table.data && table.data.length > 0) {
        // Upsert by ID to preserve relations
        const { error } = await supabase.from(table.name).upsert(table.data);
        if (error) throw new Error(`Restore failed at ${table.name}: ${error.message}`);
      }
    }
    return true;
  }
};

export default store;
