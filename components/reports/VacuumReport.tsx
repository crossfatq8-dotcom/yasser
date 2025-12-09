
import React from 'react';
import { useData } from '../../data/DataContext';
import { getTodayDateString } from './reportUtils';
import { PrintIcon } from '../icons/IconComponents';
import { VacuumOrderItem } from '../../types';

const VacuumReport: React.FC = () => {
    const { vacuumOrders, vacuumPackages, marinades } = useData();
    const today = getTodayDateString();

    // We'll report on orders placed today, to be prepared for delivery in 2 days.
    const todaysOrders = vacuumOrders.filter(o => o.orderDate === today);

    // FIX: Correctly type the initial value for the reduce method to ensure kitchenSummary is properly typed.
    const kitchenSummary = todaysOrders.reduce((summary, order) => {
        order.items.forEach(item => {
            const key = `${item.packageId}-${item.marinadeId}`;
            if (!summary[key]) {
                const pkg = vacuumPackages.find(p => p.id === item.packageId);
                const marinade = marinades.find(m => m.id === item.marinadeId);
                summary[key] = {
                    packageName: pkg?.name || 'غير معروف',
                    marinadeName: marinade?.name || 'غير معروف',
                    totalKg: 0,
                };
            }
            const currentItem = summary[key];
            if (currentItem) {
                 currentItem.totalKg += item.quantityKg;
            }
        });
        return summary;
    }, {} as Record<string, { packageName: string; marinadeName: string; totalKg: number }>);

    const getFullItemName = (item: VacuumOrderItem) => {
        const pkg = vacuumPackages.find(p => p.id === item.packageId);
        const marinade = marinades.find(m => m.id === item.marinadeId);
        return `${pkg?.name || ''} (تتبيلة: ${marinade?.name || ''}) - ${item.quantityKg} كيلو`;
    }

    return (
        <div id="report-vacuum">
            <style>
            {`
                @media print {
                    @page { size: A4 portrait; margin: 20mm; }
                    body * { visibility: hidden; }
                    #report-vacuum, #report-vacuum * { visibility: visible; }
                    #report-vacuum { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .report-section { page-break-inside: avoid; }
                }
            `}
            </style>
            <div className="flex justify-between items-center mb-6 no-print">
                 <h2 className="text-2xl font-semibold text-gray-200">تقرير الفاكيوم لطلبات يوم: {today}</h2>
                 <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                    <PrintIcon />
                    طباعة
                </button>
            </div>

            {/* Kitchen Summary */}
            <div className="report-section mb-8">
                <h3 className="text-xl font-bold text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-3">ملخص تجهيز المطبخ</h3>
                {Object.keys(kitchenSummary).length > 0 ? (
                    <table className="min-w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-600">
                            <tr>
                                <th scope="col" className="px-6 py-3">المنتج</th>
                                <th scope="col" className="px-6 py-3">التتبيلة</th>
                                <th scope="col" className="px-6 py-3">الكمية الإجمالية (كيلو)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-700">
                            {Object.values(kitchenSummary).map((item, index) => (
                                <tr key={index} className="border-b border-gray-600">
                                    <td className="px-6 py-4 font-medium text-white">{item.packageName}</td>
                                    <td className="px-6 py-4">{item.marinadeName}</td>
                                    <td className="px-6 py-4 font-bold text-orange-400">{item.totalKg.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-400 py-4">لا توجد طلبات لتجهيزها اليوم.</p>
                )}
            </div>

            {/* Detailed Orders */}
            <div className="report-section">
                 <h3 className="text-xl font-bold text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-3">قائمة الطلبات التفصيلية</h3>
                 {todaysOrders.length > 0 ? (
                    <div className="space-y-4">
                        {todaysOrders.map(order => (
                             <div key={order.id} className="bg-gray-700 p-4 rounded-lg">
                                <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{order.userName}</h4>
                                        <p className="text-xs text-gray-400">تاريخ التوصيل: {order.deliveryDate}</p>
                                    </div>
                                </div>
                                <ul className="list-disc pr-5 text-gray-300 text-sm">
                                    {order.items.map((item, index) => (
                                        <li key={index}>{getFullItemName(item)}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-center text-gray-400 py-4">لا توجد طلبات اليوم.</p>
                 )}
            </div>
        </div>
    );
};

export default VacuumReport;
