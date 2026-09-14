import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { translations } from '../utils/translations';
import {
  UtensilsCrossed,
  ChefHat,
  QrCode,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Languages,
  Store,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    config,
    activeView,
    setActiveView,
    language,
    setLanguage,
    orders,
    activeTable,
    toggleAudio,
  } = useRestaurant();

  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  // Active tickets count in kitchen (pending or preparing)
  const activeKitchenCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <button
            onClick={() => setActiveView('client')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shadow-amber-700/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-stone-900 leading-tight text-base tracking-tight">
                {language === 'ar' ? config.nameAr || config.name : config.name}
              </div>
              <div className="text-xs text-stone-700 flex items-center gap-1.5 font-medium">
                <span>{language === 'ar' ? config.taglineAr || config.tagline : config.tagline}</span>
                {activeTable && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                    Table #{activeTable}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Navigation View Switcher */}
          <nav className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            <button
              onClick={() => setActiveView('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeView === 'client'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Store className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">{t('menuClient')}</span>
              <span className="md:hidden">Menu</span>
            </button>

            <button
              onClick={() => setActiveView('cuisine')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeView === 'cuisine'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-4 h-4 text-orange-600" />
              <span className="hidden md:inline">{t('cuisineKDS')}</span>
              <span className="md:hidden">Cuisine</span>
              {activeKitchenCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-orange-500 text-white animate-pulse">
                  {activeKitchenCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('qr_tables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeView === 'qr_tables'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{t('qrCodes')}</span>
              <span className="md:hidden">QR</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeView === 'admin'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-700" />
              <span className="hidden md:inline">{t('admin')}</span>
              <span className="md:hidden">Admin</span>
            </button>
          </nav>

          {/* Right Utility: Audio Toggle & Language Switcher */}
          <div className="flex items-center gap-1.5">
            {/* Audio chime toggle */}
            <button
              onClick={toggleAudio}
              title={config.soundEnabled ? t('soundOn') : t('soundOff')}
              className={`p-2 rounded-xl border transition-colors ${
                config.soundEnabled
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : 'bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200'
              }`}
            >
              {config.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/80 text-xs font-semibold">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  language === 'fr'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  language === 'ar'
                    ? 'bg-white text-amber-800 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
