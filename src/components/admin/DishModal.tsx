import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import { X, Save, Image as ImageIcon } from 'lucide-react';

interface DishModalProps {
  dish: MenuItem | null; // null if adding new dish
  onClose: () => void;
}

export const DishModal: React.FC<DishModalProps> = ({ dish, onClose }) => {
  const { addMenuItem, updateMenuItem, categories, config, language } = useRestaurant();
  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState<number | ''>(45);
  const [category, setCategory] = useState('mains');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [prepTime, setPrepTime] = useState<number | ''>(15);
  const [calories, setCalories] = useState<number | ''>(450);
  const [ingredientsStr, setIngredientsStr] = useState('');

  useEffect(() => {
    if (dish) {
      setName(dish.name);
      setNameAr(dish.nameAr || '');
      setDescription(dish.description);
      setDescriptionAr(dish.descriptionAr || '');
      setPrice(dish.price);
      setCategory(dish.category);
      setImage(dish.image);
      setIsAvailable(dish.isAvailable);
      setIsChefSpecial(dish.isChefSpecial || false);
      setIsVegetarian(dish.isVegetarian || false);
      setIsSpicy(dish.isSpicy || false);
      setPrepTime(dish.preparationTimeMinutes || 15);
      setCalories(dish.calories || 400);
      setIngredientsStr(dish.ingredients?.join(', ') || '');
    } else {
      // Default image sample
      setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    }
  }, [dish]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '') return;

    const ingredients = ingredientsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const dishPayload = {
      name,
      nameAr: nameAr.trim() || undefined,
      description,
      descriptionAr: descriptionAr.trim() || undefined,
      price: Number(price),
      category,
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isAvailable,
      isChefSpecial,
      isVegetarian,
      isSpicy,
      preparationTimeMinutes: prepTime ? Number(prepTime) : undefined,
      calories: calories ? Number(calories) : undefined,
      ingredients,
    };

    if (dish) {
      updateMenuItem(dish.id, dishPayload);
    } else {
      addMenuItem(dishPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 className="font-bold text-stone-900 text-base">
            {dish ? t('editDish') : t('addNewDish')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('dishName')} (FR / Latin) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tagine d'Agneau aux Pruneaux"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('dishNameAr')}
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: طاجين الغنم بالبرقوق"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('price')} ({config.currency}) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('category')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-amber-500"
              >
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.nameAr})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('dishDesc')}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description savoureuse des ingrédients..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('dishDescAr')}
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="وصف الطبق والمكونات بالعربية..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {t('imageUrl')}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500"
              />
              {image && (
                <img
                  src={image}
                  alt="Aperçu"
                  className="w-9 h-9 rounded-lg object-cover border border-stone-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Temps Préparation (min)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Disponibilité
              </label>
              <button
                type="button"
                onClick={() => setIsAvailable((prev) => !prev)}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                  isAvailable
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {isAvailable ? '✓ Disponible' : '✕ Épuisé'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {t('ingredientsList')}
            </label>
            <input
              type="text"
              value={ingredientsStr}
              onChange={(e) => setIngredientsStr(e.target.value)}
              placeholder="Poulet, Amandes, Safran, Huile d'olive..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
            />
          </div>

          {/* Badges / Flags */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isChefSpecial}
                onChange={(e) => setIsChefSpecial(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>⭐ {t('chefSpecial')}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>🌱 {t('vegetarian')}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpicy}
                onChange={(e) => setIsSpicy(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <span>🌶️ {t('spicy')}</span>
            </label>
          </div>

          <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 -mx-6 -mb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200"
            >
              {t('close')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveDish')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
