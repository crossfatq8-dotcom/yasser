import React, { useState } from 'react';
import DailyProductionReport from '../../components/reports/DailyProductionReport';
import PackagesReport from '../../components/reports/PackagesReport';
import ExpiryLabelsReport from '../../components/reports/ExpiryLabelsReport';
import DailyPackingReport from '../../components/reports/DailyPackingReport';
import DeliveryLabelsReport from '../../components/reports/DeliveryLabelsReport';
import DriversReport from '../../components/reports/DriversReport';
import InventoryReport from '../../components/reports/InventoryReport';
import VacuumReport from '../../components/reports/VacuumReport';

type ReportTab = 
  | 'production' | 'packages' | 'expiry' | 'packing' 
  | 'delivery' | 'drivers' | 'inventory' | 'vacuum';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('production');

  const tabs: { id: ReportTab; title: string; component: React.ReactNode }[] = [
    { id: 'production', title: 'التصنيع اليومي', component: <DailyProductionReport /> },
    { id: 'packages', title: 'الباقات', component: <PackagesReport /> },
    { id: 'expiry', title: 'ملصقات الصلاحية', component: <ExpiryLabelsReport /> },
    { id: 'packing', title: 'التعبئة اليومية', component: <DailyPackingReport /> },
    { id: 'delivery', title: 'ملصقات التوصيل', component: <DeliveryLabelsReport /> },
    { id: 'drivers', title: 'السائقين', component: <DriversReport /> },
    { id: 'inventory', title: 'المخزون', component: <InventoryReport /> },
    { id: 'vacuum', title: 'تقارير الفاكيوم', component: <VacuumReport /> },
  ];

  const renderContent = () => {
    const activeComponent = tabs.find(tab => tab.id === activeTab);
    return activeComponent ? activeComponent.component : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">التقارير</h1>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md">
        <div className="border-b border-gray-600">
          <nav className="-mb-px flex space-x-4 space-x-reverse px-4 overflow-x-auto" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  }`}
              >
                {tab.title}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;