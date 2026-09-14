import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import { Order, OrderStatus } from '../../types';
import { playNewOrderSound, playOrderReadySound } from '../../utils/audio';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Utensils,
  Check,
  User,
  Filter,
} from 'lucide-react';

export const KitchenDisplayView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    config,
    toggleAudio,
    language,
  } = useRestaurant();

  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'served'>('all');
  const [, setTick] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Re-render every 5 seconds to keep live elapsed time counters accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter tickets
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') {
      // By default in 'all', show active tickets (pending, preparing, ready)
      return order.status !== 'cancelled';
    }
    return order.status === filterStatus;
  });

  // Active tickets needing attention
  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );

  const totalDishesToCook = orders
    .filter((o) => o.status === 'pending' || o.status === 'preparing')
    .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  // Elapsed minutes helper
  const getElapsedMinutes = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.floor((now - start) / (1000 * 60));
  };

  const toggleItemCheck = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 pb-20">
      {/* KDS Top Bar */}
      <div className="bg-stone-950 border-b border-stone-800 sticky top-16 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t('kitchenBoard')}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-stone-400">{t('kitchenSubtitle')}</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
            <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl px-4 py-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                {activeOrders.length}
              </div>
              <div className="text-xs">
                <div className="text-stone-400 font-medium">{t('totalActive')}</div>
                <div className="font-bold text-white">{activeOrders.length} tickets</div>
              </div>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl px-4 py-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs">
                <div className="text-stone-400 font-medium">{t('dishesToCook')}</div>
                <div className="font-bold text-white">{totalDishesToCook} {t('itemsCount')}</div>
              </div>
            </div>

            {/* Test sound */}
            <button
              onClick={() => playNewOrderSound()}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Tester le son du carillon"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Test Son</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-stone-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
          </span>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === 'all'
                ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750 hover:text-stone-200'
            }`}
          >
            {t('allTickets')} ({orders.filter((o) => o.status !== 'cancelled').length})
          </button>

          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
            }`}
          >
            🟡 {t('pendingTickets')} ({orders.filter((o) => o.status === 'pending').length})
          </button>

          <button
            onClick={() => setFilterStatus('preparing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === 'preparing'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
            }`}
          >
            🔵 {t('cookingTickets')} ({orders.filter((o) => o.status === 'preparing').length})
          </button>

          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === 'ready'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
            }`}
          >
            🟢 {t('readyTickets')} ({orders.filter((o) => o.status === 'ready').length})
          </button>

          <button
            onClick={() => setFilterStatus('served')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === 'served'
                ? 'bg-stone-700 text-white border-stone-600 shadow-sm'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
            }`}
          >
            ✔️ {t('servedTickets')} ({orders.filter((o) => o.status === 'served').length})
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-stone-800/40 rounded-3xl p-16 text-center border border-stone-800 max-w-xl mx-auto mt-10">
            <Utensils className="w-14 h-14 text-stone-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-lg">{t('noActiveOrders')}</h3>
            <p className="text-xs text-stone-400 mt-1">
              {language === 'ar'
                ? 'عندما يقوم الزبائن بمسح QR code والطلب، ستظهر التذاكر هنا فوراً مع رنين تنبيهي.'
                : 'Dès que des clients commandent via leur QR code ou sur place, les tickets apparaîtront instantanément ici.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsed >= 15 && order.status !== 'served';
              const isWarning = elapsed >= 10 && elapsed < 15 && order.status !== 'served';

              // Header color based on status and urgency
              let headerBg = 'bg-stone-800 border-stone-700';
              let badgeColor = 'bg-stone-700 text-stone-200';
              let statusText = t('statusPending');

              if (order.status === 'pending') {
                headerBg = isUrgent
                  ? 'bg-red-950/80 border-red-800 text-red-100'
                  : 'bg-amber-950/70 border-amber-800 text-amber-100';
                badgeColor = 'bg-amber-500 text-stone-950';
                statusText = t('statusPending');
              } else if (order.status === 'preparing') {
                headerBg = isUrgent
                  ? 'bg-red-950/80 border-red-800 text-red-100'
                  : 'bg-blue-950/70 border-blue-800 text-blue-100';
                badgeColor = 'bg-blue-500 text-white';
                statusText = t('statusPreparing');
              } else if (order.status === 'ready') {
                headerBg = 'bg-emerald-950/80 border-emerald-800 text-emerald-100';
                badgeColor = 'bg-emerald-500 text-white';
                statusText = t('statusReady');
              } else if (order.status === 'served') {
                headerBg = 'bg-stone-800/80 border-stone-700 text-stone-400';
                badgeColor = 'bg-stone-700 text-stone-300';
                statusText = t('statusServed');
              }

              return (
                <div
                  key={order.id}
                  className={`bg-stone-850 rounded-3xl overflow-hidden border flex flex-col justify-between shadow-xl transition-all ${
                    isUrgent
                      ? 'border-red-500/70 shadow-red-950/40 ring-1 ring-red-500/40'
                      : order.status === 'ready'
                      ? 'border-emerald-500/70 shadow-emerald-950/30'
                      : 'border-stone-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-4 border-b flex items-start justify-between ${headerBg}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          {order.orderType === 'dine_in'
                            ? `${t('tableNumber')} ${order.tableNumber}`
                            : '🥡 À EMPORTER'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${badgeColor}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="text-xs text-stone-300 flex items-center gap-2 mt-1">
                        <span className="font-semibold text-white">#{order.orderNumber}</span>
                        <span>•</span>
                        {order.customerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-stone-400" />
                            {order.customerName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="flex flex-col items-end">
                      <div
                        className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl border ${
                          isUrgent
                            ? 'bg-red-500 text-white border-red-400 animate-pulse'
                            : isWarning
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-800 text-stone-300 border-stone-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} min</span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Urgency Alert if late */}
                  {isUrgent && (
                    <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-1.5 flex items-center gap-1.5 text-xs text-red-300 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{t('urgentWarning')}</span>
                    </div>
                  )}

                  {/* Customer General Notes */}
                  {order.notes && (
                    <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
                      <strong>Note client :</strong> {order.notes}
                    </div>
                  )}

                  {/* Items List (with interactive kitchen check-off) */}
                  <div className="p-4 space-y-2.5 flex-1">
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex justify-between">
                      <span>Plat / Ingrédients</span>
                      <span>Qté</span>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        const title =
                          language === 'ar' && item.nameAr ? item.nameAr : item.name;

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemCheck(item.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                              isChecked
                                ? 'bg-stone-800/40 border-stone-800 text-stone-500 line-through'
                                : 'bg-stone-800/90 border-stone-700 text-stone-100 hover:border-stone-600'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-stone-600 bg-stone-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <div className="font-bold text-sm leading-snug">
                                  {title}
                                </div>
                                {item.specialInstructions && (
                                  <div className="text-xs font-bold text-amber-400 mt-0.5 bg-amber-950/60 px-2 py-0.5 rounded-md inline-block border border-amber-800/50">
                                    ⚠️ {item.specialInstructions}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className="w-7 h-7 rounded-lg bg-orange-600/30 text-orange-300 border border-orange-500/40 flex items-center justify-center font-black text-sm shrink-0">
                              x{item.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-stone-950 border-t border-stone-800/80 flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-950 flex items-center justify-center gap-2 transition-all"
                      >
                        <Play className="w-4 h-4" />
                        <span>{t('startPrep')}</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('markReady')}</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="w-full py-3 px-4 rounded-xl bg-stone-700 hover:bg-stone-600 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>{t('markServed')}</span>
                      </button>
                    )}

                    {order.status === 'served' && (
                      <div className="flex items-center justify-between text-xs text-stone-500 px-2 py-1">
                        <span>Commande terminée</span>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="text-stone-400 hover:text-stone-200 underline text-[11px] flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Rouvrir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
