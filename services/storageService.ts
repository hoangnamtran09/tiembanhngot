import { Ingredient, Order, Product, RecipeItem, OrderItem } from '../types';
import { INITIAL_INGREDIENTS, INITIAL_ORDERS, INITIAL_PRODUCTS } from '../constants';
import { supabase } from './supabaseService';

// Helper: Convert DB ingredient to App format
const mapIngredient = (dbIng: any): Ingredient => ({
  id: dbIng.id,
  name: dbIng.name,
  unit: dbIng.unit,
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
  recipe: recipeItems
    .filter((ri: any) => ri.product_id === dbProd.id)
    .map((ri: any) => ({
      ingredientId: ri.ingredient_id,
      quantity: Number(ri.quantity)
    }))
});

// Helper: Convert DB order + items to App format
const mapOrder = (dbOrder: any, orderItems: any[]): Order => ({
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
});

export const StorageService = {
  // ========== INGREDIENTS ==========
  getIngredients: async (): Promise<Ingredient[]> => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Nếu database trống, seed dữ liệu ban đầu
        await StorageService.saveIngredients(INITIAL_INGREDIENTS);
        return INITIAL_INGREDIENTS;
      }

      return data.map(mapIngredient);
    } catch (err) {
      console.error('Lỗi load ingredients:', err);
      return INITIAL_INGREDIENTS;
    }
  },

  saveIngredients: async (ingredients: Ingredient[]): Promise<void> => {
    try {
      const dbIngredients = ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        unit: ing.unit,
        price: ing.price,
        buying_quantity: ing.buyingQuantity,
        current_stock: ing.currentStock,
        min_threshold: ing.minThreshold
      }));

      const { error } = await supabase
        .from('ingredients')
        .upsert(dbIngredients, { onConflict: 'id' });

      if (error) throw error;
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

      if (!products || products.length === 0) {
        // Seed dữ liệu ban đầu
        await StorageService.saveProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }

      return products.map(p => mapProduct(p, recipeItems || []));
    } catch (err) {
      console.error('Lỗi load products:', err);
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    try {
      // 1. Save products
      const dbProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        selling_price: p.sellingPrice,
        category: p.category
      }));

      const { error: prodError } = await supabase
        .from('products')
        .upsert(dbProducts, { onConflict: 'id' });

      if (prodError) throw prodError;

      // 2. Delete old recipe items for these products
      const productIds = products.map(p => p.id);
      await supabase
        .from('recipe_items')
        .delete()
        .in('product_id', productIds);

      // 3. Insert new recipe items
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

      if (!orders || orders.length === 0) {
        // Seed dữ liệu ban đầu
        await StorageService.saveOrders(INITIAL_ORDERS);
        return INITIAL_ORDERS;
      }

      return orders.map(o => mapOrder(o, orderItems || []));
    } catch (err) {
      console.error('Lỗi load orders:', err);
      return INITIAL_ORDERS;
    }
  },

  saveOrders: async (orders: Order[]): Promise<void> => {
    try {
      // 1. Save orders
      const dbOrders = orders.map(o => ({
        id: o.id,
        customer_name: o.customerName,
        customer_phone: o.customerPhone,
        deadline: o.deadline,
        status: o.status,
        notes: o.notes || '',
        created_at: o.createdAt
      }));

      const { error: ordError } = await supabase
        .from('orders')
        .upsert(dbOrders, { onConflict: 'id' });

      if (ordError) throw ordError;

      // 2. Delete old order items
      const orderIds = orders.map(o => o.id);
      await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);

      // 3. Insert new order items
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
    } catch (err) {
      console.error('Lỗi lưu orders:', err);
    }
  }
};
