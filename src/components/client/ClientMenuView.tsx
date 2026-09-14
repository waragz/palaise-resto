import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import { MenuItem } from '../../types';
import { ItemModal } from './ItemModal';
import { CartDrawer } from './CartDrawer';
import { OrderStatusModal } from './OrderStatusModal';
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Plus,
  ShoppingBag,
  Wifi,
  MapPin,
  Utensils,
  ChevronRight,
  Salad,
  Soup,
  Coffee,
  Cake,
} from 'lucide-react';

export const ClientMenuView: React.FC = () => {
  const {
    config,
    menuItems,
    categories,
    activeTable,
    setActiveTable,
    tables,
    cartTotalCount,
    cartSubtotal,
    addToCart,
    language,
    latestPlacedOrder,
  } = useRestaurant();

  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<'all' | 'special' | 'vegetarian' | 'spicy'>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Category icons mapping
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Salad':
        return <Salad className="w-4 h-4" />;
      case 'Soup':
        return <Soup className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Cake':
        return <Cake className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (filterTag === 'special' && !item.isChefSpecial) return false;
      if (filterTag === 'vegetarian' && !item.isVegetarian) return false;
      if (filterTag === 'spicy' && !item.isSpicy) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchFr =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.ingredients?.some((ing) => ing.toLowerCase().includes(q));
        const matchAr =
          (item.nameAr && item.nameAr.includes(q)) ||
          (item.descriptionAr && item.descriptionAr.includes(q));
        return matchFr || matchAr;
      }

      return true;
    });
  }, [menuItems, selectedCategory, filterTag, searchQuery]);

  return (
    <div className="min-h-screen pb-28 bg-stone-50/70">
      {/* Restaurant Hero Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white shadow-xl p-6 sm:p-8">
          {/* Subtle decorative culinary background overlay */}
          <div className="absolute -right-12 -bottom-12 opacity-15 pointer-events-none">
            <Utensils className="w-64 h-64 text-amber-300" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 border border-amber-300/30 text-amber-200">
                ⭐ {language === 'ar' ? 'أشهى المأكولات الطازجة' : 'Cuisine Raffinée'}
              </span>

              {/* Table Selector Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowTablePicker((prev) => !prev)}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-white text-amber-950 flex items-center gap-1.5 shadow-xs hover:bg-amber-50 transition-colors"
                >
                  <span>📍</span>
                  <span>
                    {activeTable ? `${t('tableNumber')} ${activeTable}` : t('chooseTable')}
                  </span>
                  <span className="text-[10px] text-amber-700 underline ml-0.5">
                    ({t('changeTable')})
                  </span>
                </button>

                {showTablePicker && (
                  <div className="absolute top-9 left-0 z-30 w-56 p-3 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-stone-500 mb-2">
                      {t('chooseTable')}:
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                      {tables.map((tbl) => (
                        <button
                          key={tbl.id}
                          onClick={() => {
                            setActiveTable(tbl.number);
                            setShowTablePicker(false);
                          }}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            String(activeTable) === String(tbl.number)
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          #{tbl.number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'ar' ? config.nameAr || config.name : config.name}
            </h1>

            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed max-w-xl">
              {language === 'ar' ? config.taglineAr || config.tagline : config.tagline}
            </p>

            {/* Practical Restaurant Details: Wi-Fi & Address */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-amber-200">
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {config.address}
              </span>
              {config.wifiSsid && (
                <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-xl">
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  {t('wifiBadge')} <strong className="text-white">{config.wifiSsid}</strong>
                  {config.wifiPassword && (
                    <span className="text-[11px] text-amber-300">({config.wifiPassword})</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Order Alert Bar (if user already ordered and wants to track) */}
      {latestPlacedOrder && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div
            onClick={() => setIsStatusOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <div className="text-xs">
                <span className="font-bold">
                  {t('orderNumberLabel')} #{latestPlacedOrder.orderNumber}
                </span>{' '}
                -{' '}
                <span className="font-medium underline">
                  {t('trackOrder')} (
                  {latestPlacedOrder.status === 'pending'
                    ? t('statusPending')
                    : latestPlacedOrder.status === 'preparing'
                    ? t('statusPreparing')
                    : latestPlacedOrder.status === 'ready'
                    ? t('statusReady')
                    : t('statusServed')}
                  )
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </div>
        </div>
      )}

      {/* Search Bar & Dietary Filter Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchDishes')}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-2xl bg-white border border-stone-200/80 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3.5 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterTag === 'all'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {t('allCategories')}
            </button>
            <button
              onClick={() => setFilterTag('special')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterTag === 'special'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {t('chefSpecial')}
            </button>
            <button
              onClick={() => setFilterTag('vegetarian')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterTag === 'vegetarian'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              🌱 {t('vegetarian')}
            </button>
            <button
              onClick={() => setFilterTag('spicy')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterTag === 'spicy'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-red-800 border-red-200 hover:bg-red-50'
              }`}
            >
              🌶️ {t('spicy')}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const label = language === 'ar' && cat.nameAr ? cat.nameAr : cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-102'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-2xs">
            <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-800 text-base">
              {language === 'ar' ? 'لم يتم العثور على أطباق' : 'Aucun plat trouvé'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'ar'
                ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً آخر'
                : 'Essayez une autre recherche ou sélectionnez une autre catégorie.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => {
              const title = language === 'ar' && item.nameAr ? item.nameAr : item.name;
              const desc =
                language === 'ar' && item.descriptionAr ? item.descriptionAr : item.description;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group bg-white rounded-3xl overflow-hidden border border-stone-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col cursor-pointer ${
                    !item.isAvailable ? 'opacity-65' : ''
                  }`}
                >
                  {/* Dish Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Chef special badge */}
                    {item.isChefSpecial && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-md">
                        <Sparkles className="w-3 h-3" />
                        {t('chefSpecial')}
                      </span>
                    )}

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                          {t('unavailable')}
                        </span>
                      </div>
                    )}

                    {/* Price tag over image */}
                    <div className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-extrabold shadow-md">
                      {item.price} {config.currency}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-amber-700 transition-colors">
                          {title}
                        </h3>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                    </div>

                    {/* Meta tags (spicy, veg, cook time) */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                      {item.preparationTimeMinutes && (
                        <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {item.preparationTimeMinutes} min
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-semibold">
                          🌶️
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                          🌱
                        </span>
                      )}
                    </div>

                    {/* Add Button */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">
                        {item.price} {config.currency}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.isAvailable) {
                            addToCart(item, 1);
                          }
                        }}
                        disabled={!item.isAvailable}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          item.isAvailable
                            ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-xs shadow-amber-600/20'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('addToCart')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-stone-900 hover:bg-stone-800 active:scale-98 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between transition-all border border-stone-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                  {cartTotalCount}
                </div>
                <div className="text-left rtl:text-right">
                  <div className="text-xs text-stone-400 font-medium">
                    {cartTotalCount} {t('itemsCount')} {activeTable ? `• Table #${activeTable}` : ''}
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {t('viewCart')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-black text-amber-400">
                  {cartSubtotal} {config.currency}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(item, qty, inst) => addToCart(item, qty, inst)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={() => setIsStatusOpen(true)}
      />

      {isStatusOpen && <OrderStatusModal onClose={() => setIsStatusOpen(false)} />}
    </div>
  );
};
