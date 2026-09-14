import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  CartItem,
  Category,
  Language,
  MenuItem,
  Order,
  OrderStatus,
  RestaurantConfig,
  RestaurantTable,
} from '../types';
import {
  initialCategories,
  initialConfig,
  initialMenuItems,
  initialOrders,
  initialTables,
} from '../data/initialData';
import { playNewOrderSound, playOrderReadySound } from '../utils/audio';

type ActiveView = 'client' | 'cuisine' | 'admin' | 'qr_tables';

interface RestaurantContextType {
  config: RestaurantConfig;
  updateConfig: (newConfig: Partial<RestaurantConfig>) => void;
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  tables: RestaurantTable[];
  addTable: (table: Omit<RestaurantTable, 'id'>) => void;
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;
  orders: Order[];
  placeOrder: (
    items: CartItem[],
    tableNum: number | string,
    orderType: 'dine_in' | 'takeaway',
    customerName?: string,
    customerPhone?: string,
    notes?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string, isPaid: boolean) => void;
  deleteOrder: (orderId: string) => void;
  clearCompletedOrders: () => void;
  resetToDefaults: () => void;
  // Client state
  activeTable: number | string | null;
  setActiveTable: (t: number | string | null) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, instructions?: string, options?: string[]) => void;
  updateCartItemQty: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  latestPlacedOrder: Order | null;
  setLatestPlacedOrder: (order: Order | null) => void;
  // Navigation & View
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  // Audio toggle
  toggleAudio: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONFIG: 'mat3am_config_v1',
  MENU: 'mat3am_menu_v1',
  CATEGORIES: 'mat3am_categories_v1',
  TABLES: 'mat3am_tables_v1',
  ORDERS: 'mat3am_orders_v1',
  LANG: 'mat3am_lang_v1',
};

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('restaurant_live_sync');
  }
} catch {
  broadcastChannel = null;
}

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Config
  const [config, setConfig] = useState<RestaurantConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? { ...initialConfig, ...JSON.parse(saved) } : initialConfig;
    } catch {
      return initialConfig;
    }
  });

  // Menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : initialMenuItems;
    } catch {
      return initialMenuItems;
    }
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  // Tables
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      return saved ? JSON.parse(saved) : initialTables;
    } catch {
      return initialTables;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  // Language & Active View
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      return (saved as Language) || 'fr';
    } catch {
      return 'fr';
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>('client');
  const [activeTable, setActiveTable] = useState<number | string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);

  // Read URL query params on mount for direct table QR links (e.g. ?table=3 or ?view=cuisine)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) {
        const num = parseInt(tableParam, 10);
        setActiveTable(isNaN(num) ? tableParam : num);
        setActiveView('client');
      }
      const viewParam = params.get('view');
      if (viewParam && ['client', 'cuisine', 'admin', 'qr_tables'].includes(viewParam)) {
        setActiveView(viewParam as ActiveView);
      }
    } catch {
      // URL parsing fallback
    }
  }, []);

  // Update HTML document direction and language attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, language);
    } catch {
      // Storage error
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch { /* storage full */ }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
    } catch { /* storage full */ }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch { /* storage full */ }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch { /* storage full */ }
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch { /* storage full */ }
  }, [orders]);

  // Listen for broadcast messages from other tabs
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type === 'NEW_ORDER') {
        setOrders((prev) => {
          if (prev.some((o) => o.id === payload.id)) return prev;
          return [payload, ...prev];
        });
        if (config.soundEnabled) {
          playNewOrderSound();
        }
      } else if (type === 'UPDATE_ORDER_STATUS') {
        setOrders((prev) =>
          prev.map((o) => (o.id === payload.orderId ? { ...o, status: payload.status, updatedAt: new Date().toISOString() } : o))
        );
        if (payload.status === 'ready' && config.soundEnabled) {
          playOrderReadySound();
        }
      } else if (type === 'SYNC_ALL_ORDERS') {
        setOrders(payload);
      }
    };

    broadcastChannel.onmessage = handleMessage;
    return () => {
      if (broadcastChannel) {
        broadcastChannel.onmessage = null;
      }
    };
  }, [config.soundEnabled]);

  // Config actions
  const updateConfig = (newConfig: Partial<RestaurantConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const toggleAudio = () => {
    setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // Menu actions
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `dish-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Category actions
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Table actions
  const addTable = (tableData: Omit<RestaurantTable, 'id'>) => {
    const newTable: RestaurantTable = {
      ...tableData,
      id: `t-${Date.now()}`,
    };
    setTables((prev) => [...prev, newTable]);
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart actions
  const addToCart = (
    item: MenuItem,
    quantity: number = 1,
    instructions: string = '',
    options: string[] = []
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) =>
          ci.menuItem.id === item.id &&
          ci.specialInstructions === instructions &&
          JSON.stringify(ci.selectedOptions || []) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            menuItem: item,
            quantity,
            specialInstructions: instructions,
            selectedOptions: options,
          },
        ];
      }
    });
  };

  const updateCartItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], quantity: newQty };
      }
      return copy;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // Place order
  const placeOrder = useCallback(
    (
      items: CartItem[],
      tableNum: number | string,
      orderType: 'dine_in' | 'takeaway',
      customerName?: string,
      customerPhone?: string,
      notes?: string
    ): Order => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      const tax = Math.round(subtotal * config.taxRate * 10) / 10;
      const total = subtotal + tax;

      const orderNumber = Math.floor(100 + Math.random() * 900);
      const nowStr = new Date().toISOString();

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        tableNumber: tableNum,
        orderType,
        customerName: customerName || (orderType === 'dine_in' ? `Table ${tableNum}` : 'Client Emporter'),
        customerPhone,
        items: items.map((ci, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          menuItemId: ci.menuItem.id,
          name: ci.menuItem.name,
          nameAr: ci.menuItem.nameAr,
          price: ci.menuItem.price,
          quantity: ci.quantity,
          specialInstructions: ci.specialInstructions,
        })),
        subtotal,
        tax,
        total,
        status: 'pending',
        createdAt: nowStr,
        updatedAt: nowStr,
        notes,
        isPaid: false,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLatestPlacedOrder(newOrder);
      clearCart();

      // Play alert chime
      if (config.soundEnabled) {
        playNewOrderSound();
      }

      // Broadcast to other open tabs (KDS, Admin)
      try {
        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'NEW_ORDER',
            payload: newOrder,
          });
        }
      } catch {
        // Channel post error
      }

      return newOrder;
    },
    [config.taxRate, config.soundEnabled]
  );

  // Update order status
  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status, updatedAt: new Date().toISOString() }
            : o
        )
      );

      // Sound notification on ready
      if (status === 'ready' && config.soundEnabled) {
        playOrderReadySound();
      }

      // Broadcast to other open tabs
      try {
        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'UPDATE_ORDER_STATUS',
            payload: { orderId, status },
          });
        }
      } catch {
        // Channel post error
      }
    },
    [config.soundEnabled]
  );

  const markOrderPaid = (orderId: string, isPaid: boolean) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, isPaid } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const clearCompletedOrders = () => {
    setOrders((prev) => prev.filter((o) => o.status !== 'served' && o.status !== 'cancelled'));
  };

  const resetToDefaults = () => {
    setConfig(initialConfig);
    setMenuItems(initialMenuItems);
    setCategories(initialCategories);
    setTables(initialTables);
    setOrders(initialOrders);
    setCart([]);
  };

  return (
    <RestaurantContext.Provider
      value={{
        config,
        updateConfig,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        categories,
        addCategory,
        tables,
        addTable,
        updateTable,
        deleteTable,
        orders,
        placeOrder,
        updateOrderStatus,
        markOrderPaid,
        deleteOrder,
        clearCompletedOrders,
        resetToDefaults,
        activeTable,
        setActiveTable,
        cart,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        latestPlacedOrder,
        setLatestPlacedOrder,
        activeView,
        setActiveView,
        language,
        setLanguage,
        toggleAudio,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
