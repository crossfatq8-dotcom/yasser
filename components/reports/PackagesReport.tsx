import React from 'react';
import { useData } from '../../data/DataContext';
import { getActiveSubscribersForDate, getTodayDateString } from './reportUtils';
import { PrintIcon } from '../icons/IconComponents';
import { MealCategory, Meal } from '../../types';

const PackagesReport: React.FC = () => {
    const { users, userSelections, packages, meals, dailyMenu } = useData();
    const today = getTodayDateString();
    
    const activeSubscribers = getActiveSubscribersForDate(today, users);
    const orderedCategories = Object.values(MealCategory);

    // New data structure: { packageId: { mealId: count } }
    const mealCountsByPackageAndMeal = activeSubscribers.reduce((acc, user) => {
        if (!user.subscription) return acc;
        const packageId = user.subscription.packageId;
        
        if (!acc[packageId]) {
            acc[packageId] = {};
        }

        const selection = userSelections.find(s => s.userId === user.id && s.date === today);
        if (selection) {
            Object.values(selection.selections).forEach(mealId => {
                const mealIdStr = mealId as string;
                acc[packageId][mealIdStr] = (acc[packageId][mealIdStr] || 0) + 1;
            });
        }
        return acc;
    }, {} as Record<string, Record<string, number>>);

    const grandColTotals: Record<string, number> = {};
    packages.forEach(pkg => {
        grandColTotals[pkg.id] = Object.values(mealCountsByPackageAndMeal[pkg.id] || {}).reduce((sum, count) => sum + count, 0);
    });
    
    const grandRowTotals: Record<string, number> = {};
    meals.forEach(meal => {
        grandRowTotals[meal.id] = packages.reduce((sum, pkg) => sum + (mealCountsByPackageAndMeal[pkg.id]?.[meal.id] || 0), 0);
    });

    const grandTotal = Object.values(grandColTotals).reduce((sum, count) => sum + count, 0);

    return (
        <div id="report-packages">
             <style>
            {`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 15mm;
                    }
                    body * { visibility: hidden; }
                    #report-packages, #report-packages * { visibility: visible; }
                    #report-packages { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    table { font-size: 10px; }
                    th, td { padding: 4px 6px; }
                    .sticky { position: static !important; } /* Disable sticky for print */
                }
            `}
            </style>
            <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-2xl font-semibold text-gray-200">التحليل اليومي المفصل للوجبات حسب الباقة</h2>
                 <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                    <PrintIcon />
                    طباعة
                </button>
            </div>
           
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-center text-gray-300 border-collapse border border-gray-600">
                    <thead className="text-xs text-gray-200 uppercase bg-gray-600">
                        <tr>
                            <th scope="col" className="px-2 py-3 border border-gray-500 sticky right-0 bg-gray-600 z-10">الوجبة</th>
                            {packages.map(pkg => (
                                <th key={pkg.id} scope="col" className="px-2 py-3 border border-gray-500">{pkg.name} <span className="text-gray-400 font-normal block text-[10px]">{pkg.description.split('/')[0]}</span></th>
                            ))}
                            <th scope="col" className="px-2 py-3 border border-gray-500 bg-gray-800">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderedCategories.map(category => {
                            const categoryMeals = dailyMenu.meals[category].map(id => meals.find(m => m.id === id)).filter(Boolean) as Meal[];
                            const categoryTotalsByPackage = packages.reduce((acc, pkg) => {
                                acc[pkg.id] = categoryMeals.reduce((sum, meal) => sum + (mealCountsByPackageAndMeal[pkg.id]?.[meal.id] || 0), 0);
                                return acc;
                            }, {} as Record<string, number>);
                            const categoryTotal = categoryMeals.reduce((sum, meal) => sum + (grandRowTotals[meal.id] || 0), 0);

                            return (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-700 font-bold">
                                        <td className="px-2 py-2 border border-gray-500 sticky right-0 bg-gray-700 z-10 text-right">{category}</td>
                                        <td colSpan={packages.length + 1} className="border border-gray-500"></td>
                                    </tr>
                                    {categoryMeals.map(meal => (
                                        <tr key={meal.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                                            <td className="px-2 py-2 font-medium text-white whitespace-nowrap border border-gray-500 text-right sticky right-0 bg-gray-600/50 z-10 pr-6">{meal.name}</td>
                                            {packages.map(pkg => (
                                                <td key={pkg.id} className="px-2 py-2 border border-gray-500">
                                                    {mealCountsByPackageAndMeal[pkg.id]?.[meal.id] || 0}
                                                </td>
                                            ))}
                                            <td className="px-2 py-2 font-bold text-orange-400 border border-gray-500 bg-gray-800">{grandRowTotals[meal.id] || 0}</td>
                                        </tr>
                                    ))}
                                     <tr className="bg-gray-700/80 font-bold text-orange-400">
                                        <td className="px-2 py-2 border border-gray-500 sticky right-0 bg-gray-700/80 z-10 text-right">إجمالي {category}</td>
                                        {packages.map(pkg => (
                                            <td key={pkg.id} className="px-2 py-2 border border-gray-500">{categoryTotalsByPackage[pkg.id]}</td>
                                        ))}
                                        <td className="px-2 py-2 border border-gray-500 bg-gray-800">{categoryTotal}</td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-800 font-bold text-orange-400">
                         <tr className="border-t-2 border-orange-500">
                            <td className="px-2 py-3 border border-gray-500 sticky right-0 bg-gray-800 z-10">الإجمالي الكلي</td>
                             {packages.map(pkg => (
                                <td key={pkg.id} className="px-2 py-3 border border-gray-500">{grandColTotals[pkg.id] || 0}</td>
                            ))}
                            <td className="px-2 py-3 border border-gray-500 text-lg">{grandTotal}</td>
                         </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PackagesReport;
