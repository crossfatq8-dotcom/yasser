import React, { useState } from 'react';
import { useData } from '../../data/DataContext';
import { getActiveSubscribersForDate, getTodayDateString } from './reportUtils';
import { PrintIcon } from '../icons/IconComponents';
import { MealCategory, DislikedIngredient } from '../../types';
import Modal from '../Modal';

const DailyProductionReport: React.FC = () => {
    const { users, userSelections, meals, dailyMenu } = useData();
    const today = getTodayDateString();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMealDislikes, setSelectedMealDislikes] = useState<{ name: string; summary: Partial<Record<DislikedIngredient, number>> } | null>(null);

    const activeSubscribers = getActiveSubscribersForDate(today, users);
    
    const productionList = activeSubscribers.reduce((acc, user) => {
        const selection = userSelections.find(s => s.userId === user.id && s.date === today);
        if (selection) {
            Object.values(selection.selections).forEach((mealId) => {
                const mealIdStr = mealId as string;
                if (!acc[mealIdStr]) {
                    const meal = meals.find(m => m.id === mealIdStr);
                    acc[mealIdStr] = { 
                        name: meal?.name || 'وجبة غير معروفة', 
                        count: 0,
                        dislikeSummary: {}
                    };
                }
                acc[mealIdStr].count += 1;
                if (user.dislikedIngredients && user.dislikedIngredients.length > 0) {
                    user.dislikedIngredients.forEach(dislike => {
                        const summary = acc[mealIdStr].dislikeSummary;
                        summary[dislike] = (summary[dislike] || 0) + 1;
                    });
                }
            });
        }
        return acc;
    }, {} as { [mealId: string]: { name: string, count: number, dislikeSummary: Partial<Record<DislikedIngredient, number>> } });

    const orderedCategories = Object.values(MealCategory);

    const groupedProductionList = orderedCategories.map(category => {
        const categoryMenuMeals = dailyMenu.meals[category] || [];
        
        const categoryMeals = categoryMenuMeals.map(mealId => {
            const productionData = productionList[mealId];
            return {
                name: productionData?.name || meals.find(m => m.id === mealId)?.name || 'وجبة غير معروفة',
                count: productionData?.count || 0,
                dislikeSummary: productionData?.dislikeSummary || {}
            };
        }).filter(m => m.count > 0);

        const categoryTotal = categoryMeals.reduce((sum, { count }) => sum + count, 0);

        return {
            category,
            meals: categoryMeals,
            total: categoryTotal,
        };
    });
    
    const handleOpenModal = (name: string, summary: Partial<Record<DislikedIngredient, number>>) => {
        setSelectedMealDislikes({ name, summary });
        setIsModalOpen(true);
    };

    return (
        <div id="report-production">
            <style>
            {`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 20mm;
                    }
                    body * { visibility: hidden; }
                    #report-production, #report-production * { visibility: visible; }
                    #report-production { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                    }
                    .no-print { display: none !important; }
                    .report-section { page-break-inside: avoid; }
                }
            `}
            </style>
            <div className="flex justify-between items-center mb-6 no-print">
                 <h2 className="text-2xl font-semibold text-gray-200">تقرير التصنيع ليوم: {today}</h2>
                 <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                    <PrintIcon />
                    طباعة
                </button>
            </div>
            
            <div className="space-y-8">
                {groupedProductionList.map(({ category, meals: categoryMeals, total }) => (
                    <div key={category} className="report-section">
                        <h3 className="text-xl font-bold text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-3">{category}</h3>
                        <div className="space-y-2">
                            {categoryMeals.map(({ name, count, dislikeSummary }) => {
                                const hasDislikes = Object.keys(dislikeSummary).length > 0;

                                return (
                                    <div key={name} className="bg-gray-600/50 p-3 rounded-md flex justify-between items-center">
                                        <span className="text-white font-semibold flex-1">{name}</span>
                                        <span className={`font-bold text-lg mx-4 ${count > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{count}</span>
                                        <div className="w-28 text-left">
                                            {hasDislikes && (
                                                <button 
                                                    onClick={() => handleOpenModal(name, dislikeSummary)}
                                                    className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors no-print"
                                                >
                                                    ملاحظات
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 text-right pr-3 flex justify-end items-center gap-2">
                            <span className="font-bold text-gray-200">إجمالي {category}: </span>
                            <span className="font-bold text-xl text-orange-400">{total}</span>
                        </div>
                        <hr className="mt-6 border-t-4 border-gray-600 rounded" />
                    </div>
                ))}
                {groupedProductionList.length === 0 && (
                    <p className="text-center text-gray-400 py-8">لا توجد وجبات لتصنيعها اليوم.</p>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`ملاحظات وجبة: ${selectedMealDislikes?.name}`}
            >
                {selectedMealDislikes && (
                    <div className="space-y-3">
                        {Object.entries(selectedMealDislikes.summary).map(([ingredient, count]) => (
                            <div key={ingredient} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                                <span className="text-red-400 font-semibold">بدون {ingredient}</span>
                                <span className="bg-red-500 text-white font-bold text-sm w-8 h-8 flex items-center justify-center rounded-full">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DailyProductionReport;