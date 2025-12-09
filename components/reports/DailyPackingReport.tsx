
import React from 'react';
import { useData } from '../../data/DataContext';
import { getActiveSubscribersForDate, getTodayDateString } from './reportUtils';
import { PrintIcon } from '../icons/IconComponents';
import { MealCategory } from '../../types';

const DailyPackingReport: React.FC = () => {
    const { users, userSelections, meals, packages } = useData();
    const today = getTodayDateString();
    
    const activeSubscribers = getActiveSubscribersForDate(today, users);

    return (
        <div id="report-packing">
            <style>
            {`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 20mm;
                    }
                    body * { visibility: hidden; }
                    #report-packing, #report-packing * { visibility: visible; }
                    #report-packing { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .packing-card { 
                        page-break-inside: avoid !important; 
                        border: 1px solid #4a5568;
                    }
                }
            `}
            </style>
            <div className="flex justify-between items-center mb-4 no-print">
                 <h2 className="text-2xl font-semibold text-gray-200">تقرير التعبئة ليوم: {today}</h2>
                 <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                    <PrintIcon />
                    طباعة
                </button>
            </div>
            
            <div className="space-y-4">
                {activeSubscribers.map(user => {
                    const selection = userSelections.find(s => s.userId === user.id && s.date === today);
                    const pkgName = packages.find(p => p.id === user.subscription?.packageId)?.name || 'غير معروف';

                    const mealsToPack: { [mealId: string]: { name: string; category: MealCategory; count: number } } = {};
                    if (selection) {
                        Object.values(selection.selections).forEach(mealId => {
                            const mealIdStr = mealId as string;
                            if (mealsToPack[mealIdStr]) {
                                mealsToPack[mealIdStr].count++;
                            } else {
                                const meal = meals.find(m => m.id === mealIdStr);
                                if (meal) {
                                    mealsToPack[mealIdStr] = {
                                        name: meal.name,
                                        category: meal.category,
                                        count: 1,
                                    };
                                }
                            }
                        });
                    }
                    
                    const orderedMeals = Object.values(MealCategory).flatMap(category => 
                        Object.values(mealsToPack).filter(meal => meal.category === category)
                    );

                    return (
                        <div key={user.id} className="bg-gray-600 p-4 rounded-lg packing-card">
                            <div className="border-b border-gray-500 pb-2 mb-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-white">{user.name}</h3>
                                    <span className="text-sm font-semibold text-orange-400">{pkgName}</span>
                                </div>
                                {user.dislikedIngredients && user.dislikedIngredients.length > 0 && (
                                    <div className="mt-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-md">
                                        <span className="font-bold">مكونات غير مفضلة: </span>
                                        <span>{user.dislikedIngredients.join('، ')}</span>
                                    </div>
                                )}
                            </div>
                            {orderedMeals.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-right text-gray-300">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-4 py-2">الفئة</th>
                                                <th scope="col" className="px-4 py-2">الوجبة المختارة</th>
                                                <th scope="col" className="px-4 py-2 text-center">العدد</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderedMeals.map(meal => (
                                                <tr key={meal.name} className="border-b border-gray-500 last:border-b-0">
                                                    <td className="px-4 py-2 font-medium">{meal.category}</td>
                                                    <td className="px-4 py-2 text-white">{meal.name}</td>
                                                    <td className="px-4 py-2 text-center font-bold text-orange-400">{meal.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-yellow-400 text-center py-4">لم يختر وجباته بعد</p>
                            )}
                        </div>
                    );
                })}
                {activeSubscribers.length === 0 && (
                    <p className="text-center text-gray-400">لا يوجد مشتركين لتعبئة وجباتهم اليوم.</p>
                )}
            </div>
        </div>
    );
};

export default DailyPackingReport;