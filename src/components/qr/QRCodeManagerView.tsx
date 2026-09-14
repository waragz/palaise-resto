import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import { RestaurantTable } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Printer,
  Plus,
  Trash2,
  ExternalLink,
  Wifi,
  Sparkles,
  Users,
  Check,
  X,
} from 'lucide-react';

export const QRCodeManagerView: React.FC = () => {
  const {
    config,
    tables,
    addTable,
    deleteTable,
    orders,
    setActiveTable,
    setActiveView,
    language,
  } = useRestaurant();

  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [selectedPrintTable, setSelectedPrintTable] = useState<RestaurantTable | null>(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  // New table form state
  const [newNumber, setNewNumber] = useState(tables.length + 1);
  const [newLabel, setNewLabel] = useState(`Table ${tables.length + 1}`);
  const [newCapacity, setNewCapacity] = useState(4);
  const [newLocation, setNewLocation] = useState<'indoor' | 'terrace' | 'vip'>('indoor');

  // Helper to build table URL
  const getTableUrl = (tableNum: number) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${path}?table=${tableNum}&view=client`;
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTable({
      number: Number(newNumber),
      label: newLabel || `Table ${newNumber}`,
      capacity: Number(newCapacity),
      location: newLocation,
      isActive: true,
    });
    setIsAddTableOpen(false);
    setNewNumber(newNumber + 1);
    setNewLabel(`Table ${newNumber + 1}`);
  };

  const openClientMenuForTable = (tableNum: number) => {
    setActiveTable(tableNum);
    setActiveView('client');
  };

  // Find if table has active orders
  const getTableStatus = (tableNum: number) => {
    const active = orders.find(
      (o) =>
        String(o.tableNumber) === String(tableNum) &&
        (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
    );
    return active;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4" />
              <span>{t('qrCodes')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('qrManagerTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              {t('qrManagerSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsBulkPrintOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printAllCards')}</span>
            </button>

            <button
              onClick={() => setIsAddTableOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addTable')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const qrUrl = getTableUrl(table.number);
            const activeOrder = getTableStatus(table.number);

            return (
              <div
                key={table.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                {/* Table Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-stone-900">
                          {table.label}
                        </h3>
                        {activeOrder ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 animate-pulse border border-orange-200">
                            En cours #{activeOrder.orderNumber}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                            Libre
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {table.capacity} {t('tableCapacity')}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {table.location === 'terrace'
                            ? t('terrace')
                            : table.location === 'vip'
                            ? t('vip')
                            : t('indoor')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-stone-50 transition-colors"
                      title="Supprimer la table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-center justify-center my-3 group">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200 group-hover:scale-105 transition-transform">
                      <QRCodeSVG
                        value={qrUrl}
                        size={140}
                        level="M"
                        includeMargin={false}
                        fgColor="#1c1917"
                      />
                    </div>

                    <span className="text-[11px] text-stone-600 font-medium mt-3 text-center">
                      {t('scanToOrder')}
                    </span>
                    <span className="text-[10px] text-amber-700 font-mono mt-0.5 truncate max-w-[200px]">
                      ?table={table.number}
                    </span>
                  </div>
                </div>

                {/* Table Actions */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPrintTable(table)}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t('printCard')}</span>
                    </button>

                    <button
                      onClick={() => openClientMenuForTable(table.number)}
                      className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-200/80"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Tester Menu</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Single Table Print Modal */}
      {selectedPrintTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-stone-200">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-900 text-sm">
                {t('printCard')} - {selectedPrintTable.label}
              </h3>
              <button
                onClick={() => setSelectedPrintTable(null)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Table Tent Preview */}
            <div className="p-8 flex flex-col items-center text-center bg-white" id="printable-table-card">
              <div className="w-full max-w-xs border-4 border-stone-800 rounded-3xl p-6 shadow-md bg-stone-50 flex flex-col items-center">
                {/* Logo & Restaurant Name */}
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  {language === 'ar' ? config.nameAr || config.name : config.name}
                </h2>
                <p className="text-[11px] text-stone-500 mb-4">
                  {language === 'ar' ? config.taglineAr || config.tagline : config.tagline}
                </p>

                {/* Table Badge */}
                <div className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-sm font-extrabold mb-4">
                  {selectedPrintTable.label}
                </div>

                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-stone-200 mb-3">
                  <QRCodeSVG
                    value={getTableUrl(selectedPrintTable.number)}
                    size={160}
                    level="Q"
                    includeMargin={false}
                    fgColor="#1c1917"
                  />
                </div>

                <div className="text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
                  📱 {t('scanToOrder')}
                </div>
                <p className="text-[11px] text-stone-500 max-w-[200px] leading-relaxed">
                  Ouvrez votre appareil photo, scannez le code pour consulter notre menu et commander !
                </p>

                {/* Wi-Fi Info */}
                {config.wifiSsid && (
                  <div className="mt-4 pt-3 border-t border-stone-200 w-full text-[10px] text-stone-600 flex flex-col items-center gap-0.5">
                    <span className="flex items-center gap-1 font-semibold">
                      <Wifi className="w-3 h-3 text-amber-600" />
                      Wi-Fi : {config.wifiSsid}
                    </span>
                    {config.wifiPassword && (
                      <span>Mot de passe : {config.wifiPassword}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPrintTable(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200"
              >
                {t('close')}
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Print All Cards Modal */}
      {isBulkPrintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-stone-200">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-sm">
                  {t('printAllCards')} ({tables.length} tables)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkPrintOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-100">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="bg-white border-2 border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center"
                >
                  <div className="font-black text-sm text-stone-900">
                    {language === 'ar' ? config.nameAr || config.name : config.name}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-bold my-2">
                    {table.label}
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 my-2">
                    <QRCodeSVG
                      value={getTableUrl(table.number)}
                      size={130}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-stone-700">
                    {t('scanToOrder')}
                  </div>
                  {config.wifiSsid && (
                    <div className="text-[10px] text-stone-500 mt-2">
                      Wi-Fi: {config.wifiSsid} ({config.wifiPassword})
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setIsBulkPrintOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                {t('close')}
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-stone-800"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la planche complète</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-stone-200">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-900 text-sm">{t('addTable')}</h3>
              <button
                onClick={() => setIsAddTableOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Numéro de Table
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newNumber}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    setNewNumber(num);
                    setNewLabel(`Table ${num}`);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Table 12, Terrasse A..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Capacité (Personnes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Emplacement / Zone
                </label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value as 'indoor' | 'terrace' | 'vip')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="indoor">{t('indoor')}</option>
                  <option value="terrace">{t('terrace')}</option>
                  <option value="vip">{t('vip')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  {t('addTable')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
