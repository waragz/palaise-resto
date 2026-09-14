/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { ClientMenuView } from './components/client/ClientMenuView';
import { KitchenDisplayView } from './components/cuisine/KitchenDisplayView';
import { QRCodeManagerView } from './components/qr/QRCodeManagerView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';

const MainContent: React.FC = () => {
  const { activeView } = useRestaurant();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      <Navbar />
      <main className="flex-1">
        {activeView === 'client' && <ClientMenuView />}
        {activeView === 'cuisine' && <KitchenDisplayView />}
        {activeView === 'qr_tables' && <QRCodeManagerView />}
        {activeView === 'admin' && <AdminDashboardView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainContent />
    </RestaurantProvider>
  );
}

