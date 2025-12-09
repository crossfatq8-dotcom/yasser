import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Meal, MealCategory, UserMealSelection, User } from '../../types';
import { useAuth } from '../../Auth';
import { useData } from '../../data/DataContext';
import { HeartIcon } from '../../components/icons/IconComponents';
import Modal from '../../components/Modal';

const MealCard: React.FC<{ meal: Meal; isSelected: boolean; isFavorite: boolean; onSelect: () => void; onToggleFavorite: () => void; }> = ({ meal, isSelected, isFavorite, onSelect, onToggleFavorite }) => (
    <div 
        onClick={onSelect}
        className={`
            relative bg-white rounded-lg shadow-md overflow-hidden flex flex-row items-center
            transition-all duration-200 cursor-pointer h-24
            ${isSelected ? 'border-4 border-orange-500' : 'border-2 border-gray-700'}
        `}
    >
        <div className="relative flex-shrink-0">
            <img src={meal.imageUrl} alt={meal.name} className="w-24 h-full object-cover" />
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
                className="absolute top-1 right-1 p-1.5 bg-black/50 rounded-full text-white hover:text-orange-400 transition-colors"
            >
                <HeartIcon filled={isFavorite} className="w-4 h-4"/>
            </button>
        </div>
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


const MyMealsPage: React.FC = () => {
    const { user } = useAuth();
    const { dailyMenu, userSelections, updateUserSelections, meals: allMeals, togglePauseDay, toggleFavoriteMeal } = useData();
    // Fix: Cast user to User as this page is for subscribers only.
    const currentUser = user as User;
    const subscription = currentUser?.subscription;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const subscriptionDays = useMemo(() => {
        if (!subscription) return [];
        const endDate = new Date(subscription.startDate);
        const effectiveDuration = subscription.duration; // We don't add paused days to the calendar view
        endDate.setDate(new Date(subscription.startDate).getDate() + effectiveDuration);
        
        const days = [];
        let currentDate = new Date(subscription.startDate);

        while(currentDate < endDate) {
            days.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    }, [subscription]);

    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [selectionsForDay, setSelectionsForDay] = useState<UserMealSelection['selections']>({});
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
      if (scrollContainerRef.current && !isSelectionMode) {
        const todayButton = scrollContainerRef.current.querySelector(`[data-date="${todayStr}"]`) as HTMLElement;
        if (todayButton) {
          const containerWidth = scrollContainerRef.current.offsetWidth;
          const scrollLeft = todayButton.offsetLeft - (containerWidth / 2) + (todayButton.offsetWidth / 2);
          scrollContainerRef.current.scrollLeft = scrollLeft;
        }
      }
    }, [todayStr, isSelectionMode]);

    useEffect(() => {
        const initialSelections = userSelections.find(s => s.userId === currentUser?.id && s.date === selectedDate)?.selections;
        setSelectionsForDay(initialSelections || {});
    }, [userSelections, currentUser, selectedDate]);
    
    useEffect(() => {
        if (!subscription || subscription.pausedDays.includes(selectedDate)) {
            setIsSelectionMode(false);
            return;
        }

        const requiredSelections = subscription.mealComposition.length;
        const currentSelections = Object.keys(selectionsForDay).length;
        
        setIsSelectionMode(currentSelections < requiredSelections);
    }, [selectionsForDay, subscription, selectedDate]);


    const handleDayClick = (day: string) => {
        setSelectedDate(day);
    };

    const handleSelectMeal = (composedKey: string, mealId: string) => {
        if(subscription?.pausedDays.includes(selectedDate)) return; 
        setSelectionsForDay(prev => {
            const newSelections = {...prev};
            if (newSelections[composedKey] === mealId) {
                delete newSelections[composedKey]; 
            } else {
                newSelections[composedKey] = mealId; 
            }
            return newSelections;
        });
    };

    const handleSaveChanges = () => {
        if (currentUser) {
            updateUserSelections(currentUser.id, selectedDate, selectionsForDay);
            setIsSuccessModalOpen(true);
        }
    };

    const handlePauseToggle = () => {
        if (currentUser) {
            togglePauseDay(currentUser.id, selectedDate);
        }
    }
    
    const mealSections = useMemo(() => {
        if (!subscription) return [];
        const composition = subscription.mealComposition;
        const categoryCounts: { [key in MealCategory]?: number } = {};
        return composition.map(category => {
            const count = categoryCounts[category] || 0;
            categoryCounts[category] = count + 1;
            const composedKey = `${category}-${count}`;
            const title = composition.filter(c => c === category).length > 1 ? `${category} (${count + 1})` : category;
            return { composedKey, title, category, mealIds: dailyMenu.meals[category] || [] };
        });
    }, [subscription, dailyMenu]);

    const nutritionalInfo = useMemo(() => {
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        Object.values(selectionsForDay).forEach(mealId => {
            const meal = allMeals.find(m => m.id === mealId);
            if (meal) {
                totals.calories += meal.macros.calories;
                totals.protein += meal.macros.protein;
                totals.carbs += meal.macros.carbs;
                totals.fat += meal.macros.fat;
            }
        });
        return totals;
    }, [selectionsForDay, allMeals]);

    if (!subscription) {
        return <div className="text-center p-8 bg-gray-800 rounded-lg shadow"><p className="text-white">ليس لديك اشتراك فعال.</p></div>;
    }
    
    const isDayPaused = subscription.pausedDays.includes(selectedDate);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white mb-6">وجباتي</h1>
            
            {!isSelectionMode && (
                <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-2 space-x-reverse pb-3 -mx-4 px-4 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                    {subscriptionDays.map((day) => (
                        <button 
                            key={day} 
                            data-date={day}
                            onClick={() => handleDayClick(day)} 
                            className={`
                                flex-shrink-0 w-12 h-12 rounded-lg text-xs font-bold transition-colors
                                flex flex-col items-center justify-center relative
                                ${subscription.pausedDays.includes(day) ? 'bg-gray-600 text-gray-400 line-through' : 'bg-gray-800 text-white hover:bg-gray-700'}
                                ${selectedDate === day ? '!bg-orange-500 ring-2 ring-offset-2 ring-offset-black ring-orange-500' : ''}
                            `}
                        >
                            <span className="text-xs">{new Date(day).toLocaleDateString('ar-EG', { weekday: 'short' })}</span>
                            <span className="text-sm">{new Date(day).getDate()}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="bg-gray-900/50 rounded-xl shadow-sm relative">
                 <div className="sticky top-20 bg-gray-900/80 backdrop-blur-sm z-10 py-4 border-b border-gray-700 rounded-t-lg">
                    {!isSelectionMode && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={handleSaveChanges} className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-700 shadow-lg disabled:opacity-50" disabled={isDayPaused}>
                                    حفظ الاختيارات
                                </button>
                                <button onClick={handlePauseToggle} className="bg-yellow-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-yellow-700 shadow-lg">
                                    {isDayPaused ? 'استئناف اليوم' : 'إيقاف اليوم'}
                                </button>
                            </div>
                            <div className="text-xs text-gray-400">
                            {isDayPaused ? "هذا اليوم متوقف" : `أيام الإيقاف المتبقية: ${subscription.pauseDaysAvailable}`}
                            </div>
                        </div>
                    )}
                     <div className={`${!isSelectionMode ? 'mt-4' : ''} flex justify-around items-center bg-black/30 p-2 rounded-lg text-center`}>
                        <div><span className="font-bold text-lg text-orange-400">{nutritionalInfo.calories}</span><p className="text-xs text-gray-400">سعرات</p></div>
                        <div><span className="font-bold text-lg text-blue-400">{nutritionalInfo.protein}g</span><p className="text-xs text-gray-400">بروتين</p></div>
                        <div><span className="font-bold text-lg text-green-400">{nutritionalInfo.carbs}g</span><p className="text-xs text-gray-400">كارب</p></div>
                        <div><span className="font-bold text-lg text-yellow-400">{nutritionalInfo.fat}g</span><p className="text-xs text-gray-400">دهون</p></div>
                    </div>
                </div>
                
                 <div className="p-4 sm:p-6 pt-6">
                     {isDayPaused ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400">هذا اليوم متوقف. لا يمكنك اختيار وجبات.</p>
                            <p className="text-xs text-gray-500 mt-2">سيتم تمديد اشتراكك بيوم إضافي.</p>
                        </div>
                     ) : (
                        <div className="space-y-8">
                            {mealSections.map(section => {
                                const availableMeals = section.mealIds.map(id => allMeals.find(m => m.id === id)).filter(Boolean) as Meal[];
                                
                                return (
                                    <div key={section.composedKey} className="bg-black p-4 rounded-xl shadow-inner border-t-4 border-x-4 border-black border-b-8 border-orange-700/80">
                                         <h3 className="text-xl font-bold text-orange-400 mb-4">{section.title}</h3>
                                         
                                         <div className="space-y-4">
                                            {availableMeals.map(meal => (
                                                <MealCard 
                                                    key={meal.id}
                                                    meal={meal}
                                                    isSelected={selectionsForDay[section.composedKey] === meal.id}
                                                    isFavorite={currentUser?.favoriteMealIds.includes(meal.id) || false}
                                                    onSelect={() => handleSelectMeal(section.composedKey, meal.id)}
                                                    onToggleFavorite={() => currentUser && toggleFavoriteMeal(currentUser.id, meal.id)}
                                                />
                                            ))}
                                         </div>

                                          {availableMeals.length === 0 && (
                                             <p className="text-gray-500">لا توجد وجبات متاحة لهذه الفئة اليوم.</p>
                                         )}
                                     </div>
                                );
                            })}
                        </div>
                     )}
                 </div>
            </div>

            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="نجاح"
            >
                <div className="text-center text-white space-y-4">
                    <p>تم حفظ اليوم بنجاح!</p>
                    <button 
                        onClick={() => setIsSuccessModalOpen(false)} 
                        className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
                    >
                        حسنًا
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default MyMealsPage;