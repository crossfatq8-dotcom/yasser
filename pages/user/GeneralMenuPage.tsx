import React from 'react';
import { Meal, MealCategory } from '../../types';
import { useData } from '../../data/DataContext';

const GeneralMealCard: React.FC<{ meal: Meal; }> = ({ meal }) => (
    <div 
        className="
            relative bg-white rounded-lg shadow-md overflow-hidden flex flex-row items-center
            border-2 border-gray-300 h-24
        "
    >
        <img src={meal.imageUrl} alt={meal.name} className="w-24 h-full object-cover flex-shrink-0" />
        <div className="p-3 flex-grow flex flex-col justify-between">
            <h3 className="font-bold text-sm leading-tight text-gray-900">{meal.name}</h3>
             <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-orange-100 text-orange-800 p-1 rounded">
                    <div className="font-bold">{meal.macros.calories}</div>
                    <div className="text-gray-600 text-[10px]">سعرات</div>
                </div>
                <div className="bg-blue-100 text-blue-800 p-1 rounded">
                    <div className="font-bold">{meal.macros.protein}g</div>
                    <div className="text-gray-600 text-[10px]">بروتين</div>
                </div>
                <div className="bg-green-100 text-green-800 p-1 rounded">
                    <div className="font-bold">{meal.macros.carbs}g</div>
                    <div className="text-gray-600 text-[10px]">كارب</div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 p-1 rounded">
                    <div className="font-bold">{meal.macros.fat}g</div>
                    <div className="text-gray-600 text-[10px]">دهون</div>
                </div>
            </div>
        </div>
    </div>
);


const GeneralMenuPage: React.FC = () => {
    const { meals: allMeals } = useData();
    
    const mealSections = Object.values(MealCategory).map(category => {
        const availableMeals = allMeals.filter(meal => meal.category === category);
        return { category, meals: availableMeals };
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">المنيو</h1>
            
            <div className="bg-gray-900/50 p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="space-y-8">
                    {mealSections.map(section => {
                        if (section.meals.length === 0) return null;

                        return (
                            <div key={section.category} className="bg-black p-4 rounded-xl shadow-inner border-t-4 border-x-4 border-black border-b-8 border-orange-700/80">
                                 <h3 className="text-xl font-bold text-orange-400 mb-4">{section.category}</h3>
                                  <div className="space-y-4">
                                     {section.meals.map(meal => (
                                        <GeneralMealCard key={meal.id} meal={meal} />
                                     ))}
                                 </div>
                             </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GeneralMenuPage;