
import React, { useState, useEffect } from 'react';
import { Meal, MealCategory } from '../../types';
import Modal from '../../components/Modal';
import { useData } from '../../data/DataContext';

const MealCard: React.FC<{ meal: Meal; onEdit: (meal: Meal) => void; onDelete: (meal: Meal) => void; }> = ({ meal, onEdit, onDelete }) => (
  <div className="bg-gray-600 rounded-lg shadow-sm border border-gray-500 overflow-hidden flex flex-col">
    <img src={meal.imageUrl} alt={meal.name} className="w-full h-32 object-cover" />
    <div className="p-3 flex-grow">
      <h4 className="font-semibold text-gray-100 text-sm">{meal.name}</h4>
      <p className="text-xs text-gray-300 mt-1">{meal.description}</p>
    </div>
    <div className="p-2 bg-gray-700 border-t border-gray-500">
        <button onClick={() => onEdit(meal)} className="text-xs text-blue-400 hover:underline">تعديل</button>
        <button onClick={() => onDelete(meal)} className="text-xs text-red-400 hover:underline mr-2">حذف</button>
    </div>
  </div>
);

const MenuCategorySection: React.FC<{ 
  category: MealCategory; 
  mealIds: string[];
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (meal: Meal) => void;
  onAddMeal: (category: MealCategory) => void;
}> = ({ category, mealIds, onEditMeal, onDeleteMeal, onAddMeal }) => {
  const { meals: allMeals } = useData();
  const meals = mealIds.map(id => allMeals.find(m => m.id === id)).filter(Boolean) as Meal[];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-orange-400 border-b-2 border-orange-400/30 pb-2 mb-4">{category} ({meals.length} وجبات)</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {meals.map(meal => <MealCard key={meal.id} meal={meal} onEdit={onEditMeal} onDelete={onDeleteMeal} />)}
        <button onClick={() => onAddMeal(category)} className="flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg text-gray-400 hover:bg-gray-600/50 cursor-pointer transition-colors">
            <div className="text-center">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="mt-2 block text-sm font-medium">إضافة وجبة</span>
            </div>
        </button>
      </div>
    </div>
  );
};

const MenuManagement: React.FC = () => {
  const { dailyMenu, updateMeal, addMeal, deleteMeal } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const menu = dailyMenu;

  const handleAddMeal = (category: MealCategory) => {
    setModalMode('add');
    setSelectedCategory(category);
    setSelectedMeal(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setModalMode('edit');
    setSelectedMeal(meal);
    setSelectedCategory(meal.category);
    setImagePreview(meal.imageUrl);
    setIsModalOpen(true);
  };

  const handleDeleteMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
    setSelectedCategory(null);
    setImagePreview(null);
  };

  const handleConfirmDelete = () => {
    if (selectedMeal) {
      deleteMeal(selectedMeal.id);
    }
    setIsConfirmOpen(false);
    setSelectedMeal(null);
  };

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = selectedMeal?.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`;
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
        imageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    const mealData: Meal = {
      id: selectedMeal?.id || `meal-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      imageUrl: imageUrl,
      category: selectedCategory!,
      macros: {
        calories: Number(formData.get('calories')),
        protein: Number(formData.get('protein')),
        carbs: Number(formData.get('carbs')),
        // FIX: Add missing 'fat' property
        fat: Number(formData.get('fat')),
      }
    };
    
    if (modalMode === 'add') {
      addMeal(mealData);
    } else {
      updateMeal(mealData);
    }
    
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">إدارة المنيو</h1>
        <div className="flex items-center space-x-4">
            <input 
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="p-2 border border-gray-500 bg-gray-600 text-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
            <button className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
                تحديث المنيو
            </button>
        </div>
      </div>

      <div className="bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-200 mb-6">منيو يوم: {selectedDate}</h2>
        
        {Object.entries(menu.meals).map(([category, mealIds]) => (
          <MenuCategorySection 
            key={category} 
            category={category as MealCategory} 
            mealIds={mealIds} 
            onAddMeal={handleAddMeal}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
          />
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'إضافة وجبة جديدة' : 'تعديل الوجبة'}
      >
        <form onSubmit={handleSaveChanges} className="space-y-4">
          <div>
            <label htmlFor="meal-name" className="block text-sm font-medium text-gray-300">اسم الوجبة</label>
            <input type="text" id="meal-name" name="name" defaultValue={selectedMeal?.name || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="meal-desc" className="block text-sm font-medium text-gray-300">الوصف</label>
            <textarea id="meal-desc" name="description" rows={3} defaultValue={selectedMeal?.description || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"></textarea>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">البيانات الغذائية</label>
            {/* FIX: Add 'fat' input and adjust grid layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-1">
                <input type="number" name="calories" placeholder="السعرات" defaultValue={selectedMeal?.macros?.calories || ''} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                <input type="number" name="protein" placeholder="البروتين (g)" defaultValue={selectedMeal?.macros?.protein || ''} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                <input type="number" name="carbs" placeholder="الكارب (g)" defaultValue={selectedMeal?.macros?.carbs || ''} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                <input type="number" name="fat" placeholder="الدهون (g)" defaultValue={selectedMeal?.macros?.fat || ''} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
          </div>
          <div>
            <label htmlFor="meal-image" className="block text-sm font-medium text-gray-300">صورة الوجبة</label>
            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-md object-cover border-2 border-gray-500" />}
              <div className="flex-1">
                <input 
                    type="file" 
                    id="meal-image" 
                    name="image" 
                    accept="image/*" 
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setImagePreview(URL.createObjectURL(file));
                        } else {
                            setImagePreview(selectedMeal?.imageUrl || null);
                        }
                    }}
                    className="block w-full text-sm text-gray-400 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                />
                 <p className="text-xs text-gray-500 mt-1">اترك الحقل فارغاً لاستخدام الصورة الحالية.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="تأكيد الحذف">
        <p className="text-gray-300">هل أنت متأكد من أنك تريد حذف وجبة "{selectedMeal?.name}"؟</p>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
          <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">حذف</button>
        </div>
      </Modal>
    </div>
  );
};

export default MenuManagement;