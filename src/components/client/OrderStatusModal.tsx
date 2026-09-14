import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { translations } from '../../utils/translations';
import {
  X,
  CheckCircle2,
  Clock,
  ChefHat,
  Bell,
  Sparkles,
  Utensils,
  AlertCircle,
} from 'lucide-react';

interface OrderStatusModalProps {
  onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ onClose }) => {
  const { latestPlacedOrder, orders, config, language } = useRestaurant();
  const t = (key: keyof typeof translations.fr) => translations[language]?.[key] || translations.fr[key];

  const [waiterCalled, setWaiterCalled] = useState(false);

  // Retrieve current state of latest placed order from orders array
  const currentOrder =
    orders.find((o) => o.id === latestPlacedOrder?.id) || latestPlacedOrder;

  if (!currentOrder) return null;

  const steps = [
    { key: 'pending', label: t('statusPending'), icon: Clock },
    { key: 'preparing', label: t('statusPreparing'), icon: ChefHat },
    { key: 'ready', label: t('statusReady'), icon: Bell },
    { key: 'served', label: t('statusServed'), icon: Utensils },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'served':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentOrder.status);

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => {
      setWaiterCalled(false);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/40 border border-white/20 text-xs font-bold uppercase tracking-wider">
              {t('orderPlacedTitle')}
            </span>
          </div>

          <h2 className="text-2xl font-black">
            {t('orderNumberLabel')} #{currentOrder.orderNumber}
          </h2>
          <p className="text-xs text-amber-100 mt-1">
            {currentOrder.orderType === 'dine_in'
              ? `${t('tableNumber')} ${currentOrder.tableNumber}`
              : t('takeaway')}{' '}
            • {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Progress stepper */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 text-center">
              {t('trackOrder')}
            </h4>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-stone-200 z-0">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Step items */}
              <div className="relative z-10 flex justify-between">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx < currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center max-w-[70px]">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-amber-600 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-md scale-110'
                            : 'bg-white border-2 border-stone-300 text-stone-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-2 leading-tight ${
                          isCurrent
                            ? 'text-amber-700 font-bold'
                            : isDone
                            ? 'text-stone-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time notification banner */}
          {currentOrder.status === 'ready' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 animate-bounce">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold text-sm">
                  {language === 'ar' ? 'طلبكم جاهز للتقديم!' : 'Votre commande est prête !'}
                </strong>
                <span>
                  {language === 'ar'
                    ? 'النادل في طريقه إليكم الآن لتقديم الأطباق الشهية.'
                    : 'Le serveur vous apporte vos plats à table.'}
                </span>
              </div>
            </div>
          )}

          {/* Waiter alert button */}
          {currentOrder.orderType === 'dine_in' && (
            <div className="space-y-2">
              <button
                onClick={handleCallWaiter}
                disabled={waiterCalled}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  waiterCalled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>{waiterCalled ? t('waiterCalled') : t('callWaiter')}</span>
              </button>
            </div>
          )}

          {/* Items Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {language === 'ar' ? 'تفاصيل الطلب' : 'Détails des articles'}
            </h4>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
              {currentOrder.items.map((item) => {
                const title = language === 'ar' && item.nameAr ? item.nameAr : item.name;
                return (
                  <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-stone-900">
                        {item.quantity}x {title}
                      </div>
                      {item.specialInstructions && (
                        <div className="text-[11px] text-amber-700 italic">
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-stone-800 ml-2">
                      {item.price * item.quantity} {config.currency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="bg-stone-50 p-3.5 rounded-2xl flex justify-between items-center border border-stone-200 text-sm">
            <span className="font-medium text-stone-600">{t('total')}</span>
            <span className="font-extrabold text-amber-700 text-base">
              {currentOrder.total} {config.currency}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
