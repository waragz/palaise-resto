import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import { X, Clock, Flame, Sparkles, Plus, Minus, Check } from 'lucide-react';

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, instructions: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, onAddToCart }) => {
  const { config, language } = useRestaurant();
  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const title = language === 'ar' && item.nameAr ? item.nameAr : item.name;
  const description = language === 'ar' && item.descriptionAr ? item.descriptionAr : item.description;

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions);
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-transform hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dish Image */}
        <div className="relative h-60 w-full overflow-hidden bg-stone-100 shrink-0">
          <img
            src={item.image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback image if broken
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {item.isChefSpecial && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              {t('chefSpecial')}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-stone-900 leading-snug">{title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-500">
                {item.preparationTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    ~{item.preparationTimeMinutes} min
                  </span>
                )}
                {item.calories && (
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {item.calories} kcal
                  </span>
                )}
                {item.isSpicy && (
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200">
                    🌶️ {t('spicy')}
                  </span>
                )}
                {item.isVegetarian && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    🌱 {t('vegetarian')}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xl font-extrabold text-amber-600 whitespace-nowrap">
              {item.price} {config.currency}
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">{description}</p>

          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {language === 'ar' ? 'المكونات' : 'Ingrédients'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 text-stone-700 font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom instructions input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-stone-700">
              {t('customization')}
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t('customPlaceholder')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 mt-auto">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-stone-800 text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={!item.isAvailable || addedSuccess}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : item.isAvailable
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                {language === 'ar' ? 'تمت الإضافة للسلة' : 'Ajouté au panier !'}
              </>
            ) : item.isAvailable ? (
              <>
                <span>{t('addToCart')}</span>
                <span>•</span>
                <span>
                  {item.price * quantity} {config.currency}
                </span>
              </>
            ) : (
              t('unavailable')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
