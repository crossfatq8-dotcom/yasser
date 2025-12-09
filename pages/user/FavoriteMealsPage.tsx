import React from 'react';
import { useAuth } from '../../Auth';
import { useData } from '../../data/DataContext';
import { Meal, User } from '../../types';
import { HeartIcon } from '../../components/icons/IconComponents';

const FavoriteMealCard: React.FC<{ meal: Meal; onToggleFavorite: (mealId: string) => void; }> = ({ meal, onToggleFavorite }) => (
    <div 
        className="
            relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col
            border-2 border-gray-300
        "
    >
        <img src={meal.imageUrl} alt={meal.name} className="w-full h-24 object-cover" />
        <div className="absolute top-2 right-2">
             <button onClick={() => onToggleFavorite(meal.id)} className="p-1.5 bg-black/50 rounded-full text-orange-500">
                <HeartIcon filled={true} className="w-4 h-4"/>
            </button>
        </div>
        <div className="p-2 flex-grow flex flex-col justify-between">
            <h3 className="font-bold text-sm text-gray-900">{meal.name}</h3>
            <div className="mt-1 grid grid-cols-2 gap-1 text-center">
                <div className="bg-orange-100 text-orange-800 p-1 rounded-sm text-[10px]"><span className="font-bold">{meal.macros.calories}</span><br/>سعرة</div>
                <div className="bg-blue-100 text-blue-800 p-1 rounded-sm text-[10px]"><span className="font-bold">{meal.macros.protein}g</span><br/>بروتين</div>
                <div className="bg-green-100 text-green-800 p-1 rounded-sm text-[10px]"><span className="font-bold">{meal.macros.carbs}g</span><br/>كارب</div>
                <div className="bg-yellow-100 text-yellow-800 p-1 rounded-sm text-[10px]"><span className="font-bold">{meal.macros.fat}g</span><br/>دهون</div>
            </div>
        </div>
    </div>
);

const FavoriteMealsPage: React.FC = () => {
    const { user } = useAuth();
    const { meals, toggleFavoriteMeal } = useData();

    if (!user) return null;

    // Fix: Cast user to User to safely access favoriteMealIds.
    const currentUser = user as User;

    const favoriteMeals = meals.filter(meal => currentUser.favoriteMealIds.includes(meal.id));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">وجباتي المفضلة</h1>

            {favoriteMeals.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                    {favoriteMeals.map(meal => (
                        <FavoriteMealCard 
                            key={meal.id} 
                            meal={meal} 
                            onToggleFavorite={() => toggleFavoriteMeal(currentUser.id, meal.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400">لم تقم بإضافة أي وجبات إلى المفضلة بعد.</p>
                    <p className="text-sm text-gray-500 mt-2">اضغط على أيقونة القلب على الوجبات في صفحة "وجباتي" لإضافتها هنا.</p>
                </div>
            )}
        </div>
    );
};

export default FavoriteMealsPage;