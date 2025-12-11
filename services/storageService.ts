import { Ingredient, Order, Product, RecipeItem, OrderItem, BankSettings, Customer, PurchaseRecord, OtherExpense, StockTransaction } from '../types';
import { INITIAL_INGREDIENTS, INITIAL_ORDERS, INITIAL_PRODUCTS } from '../constants';
import { supabase } from './supabaseService';

// Helper: Convert DB ingredient to App format
const mapIngredient = (dbIng: any): Ingredient => ({
  id: dbIng.id,
  name: dbIng.name,
  unit: dbIng.unit,
  usageUnit: dbIng.usage_unit || dbIng.unit, // Fallback to unit if not set
  price: Number(dbIng.price),
  buyingQuantity: Number(dbIng.buying_quantity),
  currentStock: Number(dbIng.current_stock),
  minThreshold: Number(dbIng.min_threshold)
});

// Helper: Convert DB product + recipe to App format
const mapProduct = (dbProd: any, recipeItems: any[]): Product => ({
  id: dbProd.id,
  name: dbProd.name,
  description: dbProd.description || '',
  sellingPrice: Number(dbProd.selling_price),
  category: dbProd.category,
  imageUrl: dbProd.image_url || undefined,
  recipe: recipeItems
    .filter((ri: any) => ri.product_id === dbProd.id)
    .map((ri: any) => ({
      ingredientId: ri.ingredient_id,
      quantity: Number(ri.quantity)
    }))
});

// Helper: Convert DB order + items to App format
const mapOrder = (dbOrder: any, orderItems: any[]): Order => {
  const order: Order = {
    id: dbOrder.id,
    customerName: dbOrder.customer_name,
    customerPhone: dbOrder.customer_phone,
    deadline: dbOrder.deadline,
    status: dbOrder.status,
    notes: dbOrder.notes || '',
    createdAt: dbOrder.created_at || new Date().toISOString(),
    items: orderItems
      .filter((oi: any) => oi.order_id === dbOrder.id)
      .map((oi: any) => ({
        productId: oi.product_id,
        quantity: Number(oi.quantity)
      }))
  };

  // Map payment info if exists
  if (dbOrder.payment_method) {
    order.payment = {
      method: dbOrder.payment_method,
      totalAmount: Number(dbOrder.total_amount || 0),
      paidAmount: Number(dbOrder.paid_amount || 0),
      remainingAmount: Number(dbOrder.remaining_amount || 0)
    };
  }

  return order;
};

export const StorageService = {
  // ========== INGREDIENTS ==========
  getIngredients: async (): Promise<Ingredient[]> => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;

      // Return empty array if no data (user deleted all)
      // Only seed INITIAL data on first setup (check if table exists and has never been used)
      if (!data || data.length === 0) {
        // Check if this is first time setup by checking if we can query the table
        // If table exists but empty, return empty (user deleted all)
        return [];
      }

      return data.map(mapIngredient);
    } catch (err) {
      console.error('Lỗi load ingredients:', err);
      // On error, return empty instead of INITIAL to avoid auto-seeding
      return [];
    }
  },

  saveIngredients: async (ingredients: Ingredient[]): Promise<void> => {
    try {
      // Get current ingredient IDs
      const currentIds = ingredients.map(ing => ing.id);

      // Fetch all existing IDs from database
      const { data: existingData, error: fetchError } = await supabase
        .from('ingredients')
        .select('id');

      if (fetchError) throw fetchError;

      const existingIds = existingData?.map(d => d.id) || [];

      // Find IDs to delete (in DB but not in current array)
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));

      // Delete removed ingredients
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('ingredients')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) throw deleteError;
      }

      // Upsert current ingredients
      if (ingredients.length > 0) {
        const dbIngredients = ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          unit: ing.unit,
          usage_unit: ing.usageUnit || ing.unit,
          price: ing.price,
          buying_quantity: ing.buyingQuantity,
          current_stock: ing.currentStock,
          min_threshold: ing.minThreshold
        }));

        const { error: upsertError } = await supabase
          .from('ingredients')
          .upsert(dbIngredients, { onConflict: 'id' });

        if (upsertError) throw upsertError;
      } else {
        // If array is empty, delete all
        if (existingIds.length > 0) {
          const { error: deleteAllError } = await supabase
            .from('ingredients')
            .delete()
            .in('id', existingIds);

          if (deleteAllError) throw deleteAllError;
        }
      }
    } catch (err) {
      console.error('Lỗi lưu ingredients:', err);
    }
  },

  // ========== PRODUCTS ==========
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (prodError) throw prodError;

      const { data: recipeItems, error: recipeError } = await supabase
        .from('recipe_items')
        .select('*');

      if (recipeError) throw recipeError;

      // Return empty array if no data (user deleted all)
      if (!products || products.length === 0) {
        return [];
      }

      return products.map(p => mapProduct(p, recipeItems || []));
    } catch (err) {
      console.error('Lỗi load products:', err);
      // On error, return empty instead of INITIAL to avoid auto-seeding
      return [];
    }
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    try {
      // Get current product IDs
      const currentIds = products.map(p => p.id);

      // Fetch all existing IDs from database
      const { data: existingData, error: fetchError } = await supabase
        .from('products')
        .select('id');

      if (fetchError) throw fetchError;

      const existingIds = existingData?.map(d => d.id) || [];

      // Find IDs to delete (in DB but not in current array)
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));

      // Delete removed products (CASCADE will delete recipe_items)
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) throw deleteError;
      }

      // Upsert current products
      if (products.length > 0) {
        const dbProducts = products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          selling_price: p.sellingPrice,
          category: p.category,
          image_url: p.imageUrl || null
        }));

        const { error: prodError } = await supabase
          .from('products')
          .upsert(dbProducts, { onConflict: 'id' });

        if (prodError) throw prodError;

        // Delete old recipe items for these products
        const { error: deleteRecipeError } = await supabase
          .from('recipe_items')
          .delete()
          .in('product_id', currentIds);

        if (deleteRecipeError) throw deleteRecipeError;

        // Insert new recipe items
        const allRecipeItems = products.flatMap(p =>
          p.recipe.map(ri => ({
            product_id: p.id,
            ingredient_id: ri.ingredientId,
            quantity: ri.quantity
          }))
        );

        if (allRecipeItems.length > 0) {
          const { error: recipeError } = await supabase
            .from('recipe_items')
            .insert(allRecipeItems);

          if (recipeError) throw recipeError;
        }
      } else {
        // If array is empty, delete all
        if (existingIds.length > 0) {
          const { error: deleteAllError } = await supabase
            .from('products')
            .delete()
            .in('id', existingIds);

          if (deleteAllError) throw deleteAllError;
        }
      }
    } catch (err) {
      console.error('Lỗi lưu products:', err);
    }
  },

  // ========== ORDERS ==========
  getOrders: async (): Promise<Order[]> => {
    try {
      const { data: orders, error: ordError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordError) throw ordError;

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Return empty array if no data (user deleted all)
      if (!orders || orders.length === 0) {
        return [];
      }

      return orders.map(o => mapOrder(o, orderItems || []));
    } catch (err) {
      console.error('Lỗi load orders:', err);
      // On error, return empty instead of INITIAL to avoid auto-seeding
      return [];
    }
  },

  saveOrders: async (orders: Order[]): Promise<void> => {
    try {
      // Step 1: Delete all orders (CASCADE will delete order_items)
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '');

      if (deleteError) throw deleteError;

      // Step 2: Insert orders (if any)
      if (orders.length > 0) {
        const dbOrders = orders.map(o => ({
          id: o.id,
          customer_name: o.customerName,
          customer_phone: o.customerPhone,
          deadline: o.deadline,
          status: o.status,
          notes: o.notes || '',
          created_at: o.createdAt,
          // Payment info
          payment_method: o.payment?.method || 'Tiền mặt',
          total_amount: o.payment?.totalAmount || 0,
          paid_amount: o.payment?.paidAmount || 0,
          remaining_amount: o.payment?.remainingAmount || 0
        }));

        const { error: ordError } = await supabase
          .from('orders')
          .insert(dbOrders);

        if (ordError) throw ordError;

        // Step 3: Insert order items
        const allOrderItems = orders.flatMap(o =>
          o.items.map(item => ({
            order_id: o.id,
            product_id: item.productId,
            quantity: item.quantity
          }))
        );

        if (allOrderItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(allOrderItems);

          if (itemsError) throw itemsError;
        }
      }
    } catch (err) {
      console.error('Lỗi lưu orders:', err);
    }
  },

  // ========== BANK SETTINGS ==========
  getBankSettings: async (): Promise<BankSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('bank_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Lỗi load bank settings:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        bankId: data.bank_id,
        bankName: data.bank_name,
        accountNumber: data.account_number,
        accountName: data.account_name,
        isActive: data.is_active,
        template: data.template || 'compact',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('Lỗi load bank settings:', err);
      return null;
    }
  },

  saveBankSettings: async (settings: BankSettings): Promise<void> => {
    try {
      const dbSettings = {
        bank_id: settings.bankId,
        bank_name: settings.bankName,
        account_number: settings.accountNumber,
        account_name: settings.accountName,
        is_active: settings.isActive,
        template: settings.template || 'compact'
      };

      if (settings.id) {
        // Update
        const { error } = await supabase
          .from('bank_settings')
          .update(dbSettings)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('bank_settings')
          .insert(dbSettings);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Lỗi lưu bank settings:', err);
    }
  },

  // ========== CUSTOMERS ==========
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!data) return [];

      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || undefined,
        address: c.address || undefined,
        notes: c.notes || undefined,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));
    } catch (err) {
      console.error('Lỗi load customers:', err);
      return [];
    }
  },

  saveCustomers: async (customers: Customer[]): Promise<void> => {
    try {
      const currentIds = customers.map(c => c.id);
      const { data: existingData } = await supabase.from('customers').select('id');
      const existingIds = existingData?.map(d => d.id) || [];
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));

      if (idsToDelete.length > 0) {
        await supabase.from('customers').delete().in('id', idsToDelete);
      }

      if (customers.length > 0) {
        const dbCustomers = customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || null,
          address: c.address || null,
          notes: c.notes || null
        }));

        await supabase.from('customers').upsert(dbCustomers, { onConflict: 'id' });
      }
    } catch (err) {
      console.error('Lỗi lưu customers:', err);
    }
  },

  // ========== PURCHASE RECORDS ==========
  getPurchaseRecords: async (): Promise<PurchaseRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('purchase_records')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((pr: any) => ({
        id: pr.id,
        ingredientId: pr.ingredient_id,
        quantity: Number(pr.quantity),
        price: Number(pr.price),
        purchaseDate: pr.purchase_date,
        supplier: pr.supplier || undefined,
        notes: pr.notes || undefined,
        createdAt: pr.created_at
      }));
    } catch (err) {
      console.error('Lỗi load purchase records:', err);
      return [];
    }
  },

  savePurchaseRecord: async (record: PurchaseRecord): Promise<void> => {
    try {
      const dbRecord = {
        id: record.id,
        ingredient_id: record.ingredientId,
        quantity: record.quantity,
        price: record.price,
        purchase_date: record.purchaseDate,
        supplier: record.supplier || null,
        notes: record.notes || null
      };

      await supabase.from('purchase_records').upsert(dbRecord, { onConflict: 'id' });
    } catch (err) {
      console.error('Lỗi lưu purchase record:', err);
    }
  },

  deletePurchaseRecord: async (id: string): Promise<void> => {
    try {
      await supabase.from('purchase_records').delete().eq('id', id);
    } catch (err) {
      console.error('Lỗi xóa purchase record:', err);
    }
  },

  // ========== OTHER EXPENSES ==========
  getOtherExpenses: async (): Promise<OtherExpense[]> => {
    try {
      const { data, error } = await supabase
        .from('other_expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((e: any) => ({
        id: e.id,
        category: e.category,
        amount: Number(e.amount),
        description: e.description,
        expenseDate: e.expense_date,
        createdAt: e.created_at
      }));
    } catch (err) {
      console.error('Lỗi load other expenses:', err);
      return [];
    }
  },

  saveOtherExpense: async (expense: OtherExpense): Promise<void> => {
    try {
      const dbExpense = {
        id: expense.id,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        expense_date: expense.expenseDate
      };

      await supabase.from('other_expenses').upsert(dbExpense, { onConflict: 'id' });
    } catch (err) {
      console.error('Lỗi lưu other expense:', err);
    }
  },

  deleteOtherExpense: async (id: string): Promise<void> => {
    try {
      await supabase.from('other_expenses').delete().eq('id', id);
    } catch (err) {
      console.error('Lỗi xóa other expense:', err);
    }
  },

  // ========== STOCK TRANSACTIONS ==========
  getStockTransactions: async (): Promise<StockTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((st: any) => ({
        id: st.id,
        ingredientId: st.ingredient_id,
        type: st.type as 'IN' | 'OUT',
        quantity: Number(st.quantity),
        reason: st.reason,
        notes: st.notes || undefined,
        transactionDate: st.transaction_date,
        createdAt: st.created_at
      }));
    } catch (err) {
      console.error('Lỗi load stock transactions:', err);
      return [];
    }
  },

  saveStockTransaction: async (transaction: StockTransaction): Promise<void> => {
    try {
      const dbTransaction = {
        id: transaction.id,
        ingredient_id: transaction.ingredientId,
        type: transaction.type,
        quantity: transaction.quantity,
        reason: transaction.reason,
        notes: transaction.notes || null,
        transaction_date: transaction.transactionDate
      };

      await supabase.from('stock_transactions').upsert(dbTransaction, { onConflict: 'id' });
    } catch (err) {
      console.error('Lỗi lưu stock transaction:', err);
    }
  },

  deleteStockTransaction: async (id: string): Promise<void> => {
    try {
      await supabase.from('stock_transactions').delete().eq('id', id);
    } catch (err) {
      console.error('Lỗi xóa stock transaction:', err);
    }
  }
};
