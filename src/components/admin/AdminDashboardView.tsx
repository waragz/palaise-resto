import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import { MenuItem, Order, OrderStatus } from '../../types';
import { DishModal } from './DishModal';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  ChefHat,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  Sliders,
  DollarSign,
  Search,
  Check,
  X,
  Store,
  Wifi,
  Sparkles,
  Phone,
  MapPin,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    config,
    updateConfig,
    menuItems,
    deleteMenuItem,
    toggleItemAvailability,
    orders,
    updateOrderStatus,
    markOrderPaid,
    deleteOrder,
    clearCompletedOrders,
    resetToDefaults,
    categories,
    tables,
    language,
  } = useRestaurant();

  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'settings'>('overview');
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Settings form state
  const [name, setName] = useState(config.name);
  const [nameAr, setNameAr] = useState(config.nameAr || '');
  const [tagline, setTagline] = useState(config.tagline);
  const [taglineAr, setTaglineAr] = useState(config.taglineAr || '');
  const [currency, setCurrency] = useState(config.currency);
  const [phone, setPhone] = useState(config.phone);
  const [address, setAddress] = useState(config.address);
  const [wifiSsid, setWifiSsid] = useState(config.wifiSsid || '');
  const [wifiPassword, setWifiPassword] = useState(config.wifiPassword || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Analytics
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const completedOrdersCount = orders.filter((o) => o.status !== 'cancelled').length;
  const avgOrderValue = completedOrdersCount > 0 ? Math.round(todayRevenue / completedOrdersCount) : 0;
  const activeKitchenCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  // Most popular dishes calculation
  const dishPopularityMap: Record<string, { count: number; name: string; nameAr?: string; revenue: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((it) => {
      if (!dishPopularityMap[it.name]) {
        dishPopularityMap[it.name] = { count: 0, name: it.name, nameAr: it.nameAr, revenue: 0 };
      }
      dishPopularityMap[it.name].count += it.quantity;
      dishPopularityMap[it.name].revenue += it.price * it.quantity;
    });
  });

  const popularDishes = Object.values(dishPopularityMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilterStatus !== 'all' && order.status !== orderFilterStatus) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchNum = String(order.orderNumber).includes(q);
      const matchTable = String(order.tableNumber).toLowerCase().includes(q);
      const matchCustomer = order.customerName?.toLowerCase().includes(q) || false;
      return matchNum || matchTable || matchCustomer;
    }
    return true;
  });

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
      return false;
    }
    if (menuSearchQuery.trim()) {
      const q = menuSearchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.nameAr && item.nameAr.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      name,
      nameAr,
      tagline,
      taglineAr,
      currency,
      phone,
      address,
      wifiSsid,
      wifiPassword,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Admin Header */}
      <div className="bg-white border-b border-stone-200 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              <Store className="w-4 h-4 text-amber-600" />
              <span>{config.name} • {t('admin')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('adminDashboard')}
            </h1>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('overview')}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('ordersList')} ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'menu'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('menuManagement')} ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('restaurantSettings')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: OVERVIEW & SALES */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold">{t('todayRevenue')}</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {todayRevenue} {config.currency}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                  +18% vs moyenne
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold">{t('totalOrdersToday')}</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {completedOrdersCount}
                </div>
                <span className="text-[11px] text-stone-400 mt-1 inline-block">
                  Enregistrées aujourd'hui
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold">{t('avgTicket')}</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {avgOrderValue} {config.currency}
                </div>
                <span className="text-[11px] text-stone-400 mt-1 inline-block">
                  Par client / table
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold">{t('activeKitchenOrders')}</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <ChefHat className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-orange-600">
                  {activeKitchenCount}
                </div>
                <span className="text-[11px] text-orange-700 font-semibold mt-1 inline-block">
                  Tickets en préparation
                </span>
              </div>
            </div>

            {/* Popular Dishes & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Popular Dishes List */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs">
                <h3 className="text-base font-extrabold text-stone-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Plats les Plus Commandés</span>
                </h3>

                <div className="divide-y divide-stone-100">
                  {popularDishes.map((dish, i) => (
                    <div key={dish.name} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-xs">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900 text-sm">
                            {dish.name}
                          </div>
                          {dish.nameAr && (
                            <div className="text-[11px] text-stone-400">{dish.nameAr}</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-stone-900 text-sm">
                          {dish.count} commandés
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          {dish.revenue} {config.currency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast Operations Card */}
              <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black mb-2 flex items-center gap-2 text-amber-400">
                    <Store className="w-4 h-4" />
                    <span>Actions Rapides</span>
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed mb-6">
                    Gérez votre restaurant en direct depuis cette interface centrale.
                  </p>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setEditingDish(null);
                        setIsDishModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('addNewDish')}</span>
                    </button>

                    <button
                      onClick={clearCompletedOrders}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Archiver commandes servies</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-800 text-[11px] text-stone-500">
                  Synchronisation temps réel active avec la Cuisine et les QR Codes.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Rechercher #commande, table..."
                  className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {['all', 'pending', 'preparing', 'ready', 'served'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      orderFilterStatus === st
                        ? 'bg-stone-900 text-white shadow-2xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st === 'all'
                      ? 'Tous'
                      : st === 'pending'
                      ? 'En attente'
                      : st === 'preparing'
                      ? 'En cuisine'
                      : st === 'ready'
                      ? 'Prêt'
                      : 'Servi'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">N°</th>
                      <th className="p-4">Table / Type</th>
                      <th className="p-4">Heure</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Articles</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">{t('status')}</th>
                      <th className="p-4">{t('paymentStatus')}</th>
                      <th className="p-4 text-right rtl:text-left">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-stone-400">
                          Aucune commande trouvée.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-4 font-black text-stone-900">
                            #{order.orderNumber}
                          </td>
                          <td className="p-4 font-bold text-amber-900">
                            {order.orderType === 'dine_in'
                              ? `Table #${order.tableNumber}`
                              : '🥡 À emporter'}
                          </td>
                          <td className="p-4 text-stone-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-4 text-stone-700">
                            {order.customerName || '-'}
                          </td>
                          <td className="p-4 max-w-xs truncate text-stone-600">
                            {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                          </td>
                          <td className="p-4 font-extrabold text-stone-900 whitespace-nowrap">
                            {order.total} {config.currency}
                          </td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                order.status === 'pending'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : order.status === 'preparing'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : order.status === 'ready'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-stone-100 text-stone-600 border-stone-200'
                              }`}
                            >
                              <option value="pending">🟡 En attente</option>
                              <option value="preparing">🔵 En préparation</option>
                              <option value="ready">🟢 Prête</option>
                              <option value="served">✔️ Servie</option>
                              <option value="cancelled">✕ Annulée</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => markOrderPaid(order.id, !order.isPaid)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                order.isPaid
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {order.isPaid ? '✓ Payé' : 'Non payé'}
                            </button>
                          </td>
                          <td className="p-4 text-right rtl:text-left whitespace-nowrap space-x-1 rtl:space-x-reverse">
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                              title="Imprimer ticket de caisse"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MENU MANAGEMENT CRUD */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* Action & Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="Filtrer un plat..."
                    className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-hidden"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingDish(null);
                  setIsDishModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addNewDish')}</span>
              </button>
            </div>

            {/* Dishes Catalog Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Plat</th>
                      <th className="p-4">Nom Arabe</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Prix</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4">Disponibilité</th>
                      <th className="p-4 text-right rtl:text-left">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {filteredMenuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                            <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                              {item.description}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-stone-700 font-medium" dir="rtl">
                          {item.nameAr || '-'}
                        </td>

                        <td className="p-4 capitalize text-stone-600">
                          {categories.find((c) => c.id === item.category)?.name || item.category}
                        </td>

                        <td className="p-4 font-black text-stone-900">
                          {item.price} {config.currency}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-1">
                            {item.isChefSpecial && <span title="Coup de coeur">⭐</span>}
                            {item.isVegetarian && <span title="Végétarien">🌱</span>}
                            {item.isSpicy && <span title="Épicé">🌶️</span>}
                          </div>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                            }`}
                          >
                            {item.isAvailable ? '✓ Disponible' : '✕ Épuisé'}
                          </button>
                        </td>

                        <td className="p-4 text-right rtl:text-left whitespace-nowrap space-x-1 rtl:space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingDish(item);
                              setIsDishModalOpen(true);
                            }}
                            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESTAURANT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight">
                {t('restaurantSettings')}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Configurez les coordonnées, la devise et le Wi-Fi qui s'affichent sur les menus et QR codes.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Paramètres enregistrés avec succès !</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Nom du Restaurant (FR)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Nom du Restaurant (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Slogan (FR)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Slogan (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={taglineAr}
                    onChange={(e) => setTaglineAr(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Devise Monétaire (Symbole)
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="Ex: DH, MAD, €, $, SAR..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Téléphone de Contact
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Adresse Physique
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-amber-600" />
                  <span>Wi-Fi Client (imprimé sur les QR codes)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Nom du réseau (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Mot de passe</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetToDefaults}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resetData')}</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  {t('saveSettings')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Dish Add/Edit Modal */}
      {isDishModalOpen && (
        <DishModal
          dish={editingDish}
          onClose={() => {
            setIsDishModalOpen(false);
            setEditingDish(null);
          }}
        />
      )}

      {/* Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-stone-200">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-900 text-xs">
                Ticket #{selectedReceiptOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-stone-800 space-y-3 bg-white">
              <div className="text-center pb-3 border-b border-dashed border-stone-300">
                <div className="font-bold text-base">{config.name}</div>
                <div className="text-[10px] text-stone-500">{config.address}</div>
                <div className="text-[10px] text-stone-500">{config.phone}</div>
                <div className="text-[11px] font-bold mt-2">
                  COMMANDE #{selectedReceiptOrder.orderNumber}
                </div>
                <div className="text-[10px]">
                  {selectedReceiptOrder.orderType === 'dine_in'
                    ? `TABLE #${selectedReceiptOrder.tableNumber}`
                    : 'À EMPORTER'}{' '}
                  • {new Date(selectedReceiptOrder.createdAt).toLocaleDateString()}{' '}
                  {new Date(selectedReceiptOrder.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="space-y-1 py-2 border-b border-dashed border-stone-300">
                {selectedReceiptOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                    <span>{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{selectedReceiptOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (10%):</span>
                  <span>{selectedReceiptOrder.tax}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-stone-300">
                  <span>TOTAL:</span>
                  <span>
                    {selectedReceiptOrder.total} {config.currency}
                  </span>
                </div>
              </div>

              <div className="text-center text-[10px] text-stone-500 pt-4 border-t border-dashed border-stone-300">
                Merci de votre visite ! Au plaisir de vous revoir.
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200"
              >
                {t('close')}
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
