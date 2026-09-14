export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type Language = 'fr' | 'ar' | 'en';

export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isChefSpecial?: boolean;
  preparationTimeMinutes?: number;
  calories?: number;
  ingredients?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  iconName: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  selectedOptions?: string[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: number | string;
  orderType: 'dine_in' | 'takeaway';
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isPaid: boolean;
}

export interface RestaurantTable {
  id: string;
  number: number;
  label: string;
  capacity: number;
  location?: 'indoor' | 'terrace' | 'vip';
  isActive: boolean;
}

export interface RestaurantConfig {
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  currency: string;
  phone: string;
  address: string;
  wifiSsid?: string;
  wifiPassword?: string;
  taxRate: number; // e.g. 0.1 for 10%
  soundEnabled: boolean;
  kitchenAutoAlert: boolean;
}
