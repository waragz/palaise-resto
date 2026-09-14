import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const {
    config,
    cart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    tables,
    activeTable,
    setActiveTable,
    placeOrder,
    language,
  } = useRestaurant();

  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [selectedTable, setSelectedTable] = useState<number | string>(activeTable || 1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const tax = Math.round(cartSubtotal * config.taxRate * 10) / 10;
  const grandTotal = cartSubtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      placeOrder(
        cart,
        orderType === 'dine_in' ? selectedTable : 'Takeaway',
        orderType,
        customerName.trim() || undefined,
        customerPhone.trim() || undefined,
        notes.trim() || undefined
      );

      if (orderType === 'dine_in') {
        setActiveTable(selectedTable);
      }

      setIsSubmitting(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback if canvas confetti fails
      }

      onClose();
      onOrderPlaced();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">{t('viewCart')}</h2>
              <span className="text-xs text-stone-500">
                {cart.length} {t('itemsCount')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1"
                title="Vider le panier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Items or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-stone-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-700 text-base mb-1">{t('emptyCart')}</h3>
              <p className="text-xs text-stone-500 max-w-xs">{t('startOrdering')}</p>
            </div>
          ) : (
            <>
              {/* Order Type Toggle */}
              <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl border border-stone-200/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'dine_in'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>🍽️</span>
                  <span>{t('dineIn')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>🥡</span>
                  <span>{t('takeaway')}</span>
                </button>
              </div>

              {/* Table Picker if Dine-In */}
              {orderType === 'dine_in' && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                    <span className="flex items-center gap-1">
                      <span>🏷️</span>
                      <span>{t('tableNumber')}</span>
                    </span>
                    <span className="text-[11px] text-amber-700">
                      {activeTable ? `Fixée par QR (#${activeTable})` : 'Sélectionnez votre table'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {tables.map((tbl) => (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedTable(tbl.number)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          String(selectedTable) === String(tbl.number)
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs scale-102'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        #{tbl.number}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-3">
                {cart.map((item, index) => {
                  const title =
                    language === 'ar' && item.menuItem.nameAr
                      ? item.menuItem.nameAr
                      : item.menuItem.name;

                  return (
                    <div
                      key={`${item.menuItem.id}-${index}`}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex gap-3 items-start"
                    >
                      <img
                        src={item.menuItem.image}
                        alt={title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                            {title}
                          </h4>
                          <span className="font-extrabold text-stone-900 text-xs sm:text-sm ml-2 whitespace-nowrap">
                            {item.menuItem.price * item.quantity} {config.currency}
                          </span>
                        </div>

                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-1 italic border border-amber-200/60 inline-block">
                            "{item.specialInstructions}"
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1">
                          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                            <button
                              onClick={() => updateCartItemQty(index, item.quantity - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartItemQty(index, item.quantity + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Info & Notes */}
              <div className="space-y-2.5 pt-2 border-t border-stone-200">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t('customerName')}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل اسمك هنا' : 'Ex: Karim, Sarah...'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t('orderNotes')}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('customPlaceholder')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-stone-800">
                  {cartSubtotal} {config.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax')}</span>
                <span className="font-semibold text-stone-800">
                  {tax} {config.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                <span>{t('total')}</span>
                <span className="text-amber-600">
                  {grandTotal} {config.currency}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('confirmOrder')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
