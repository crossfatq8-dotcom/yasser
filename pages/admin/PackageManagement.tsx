
import React, { useState, useEffect, useMemo } from 'react';
import { Package, MealCategory, SubscriptionDuration } from '../../types';
import Modal from '../../components/Modal';
import { useData } from '../../data/DataContext';

const PackageManagement: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const initialPrices = {
    [MealCategory.Breakfast]: 0,
    [MealCategory.Lunch]: 0,
    [MealCategory.Dinner]: 0,
    [MealCategory.Salad]: 0,
    [MealCategory.Dessert]: 0,
    [MealCategory.Soup]: 0,
  };

  const [formPrices, setFormPrices] = useState<Package['prices']>(initialPrices);
  
  // State for interactive preview
  const [previewDuration, setPreviewDuration] = useState<SubscriptionDuration>(30);
  const [previewComposition, setPreviewComposition] = useState<MealCategory[]>([MealCategory.Lunch, MealCategory.Dinner]);


  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === 'edit' && selectedPackage) {
        setFormPrices({
          ...selectedPackage.prices,
        });
      } else {
        setFormPrices(initialPrices);
      }
      // Reset preview state on modal open
      setPreviewDuration(30);
      setPreviewComposition([MealCategory.Lunch, MealCategory.Dinner]);
    }
  }, [isModalOpen, modalMode, selectedPackage]);


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormPrices(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  // --- Preview Handlers ---
  const handlePreviewCompositionChange = (index: number, value: MealCategory) => {
    const newComposition = [...previewComposition];
    newComposition[index] = value;
    setPreviewComposition(newComposition);
  };

  const addMealToPreview = () => {
    setPreviewComposition(prev => [...prev, MealCategory.Lunch]);
  }

  const removeMealFromPreview = (index: number) => {
    setPreviewComposition(prev => prev.filter((_, i) => i !== index));
  }
  // --- End Preview Handlers ---


  const handleAddClick = () => {
    setModalMode('add');
    setSelectedPackage(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (pkg: Package) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleConfirmDelete = () => {
    if (selectedPackage) {
      deletePackage(selectedPackage.id);
    }
    setIsConfirmOpen(false);
    setSelectedPackage(null);
  };

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const packageData: Omit<Package, 'pricePerSnack'> = {
      id: selectedPackage?.id || `pkg-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      prices: {
        [MealCategory.Breakfast]: formPrices[MealCategory.Breakfast],
        [MealCategory.Lunch]: formPrices[MealCategory.Lunch],
        [MealCategory.Dinner]: formPrices[MealCategory.Dinner],
        [MealCategory.Salad]: formPrices[MealCategory.Salad],
        [MealCategory.Dessert]: formPrices[MealCategory.Dessert],
        [MealCategory.Soup]: formPrices[MealCategory.Soup],
      },
    };

    if (modalMode === 'add') {
      addPackage(packageData as Package);
    } else {
      updatePackage(packageData as Package);
    }
    
    handleCloseModal();
  };
  
  const exampleCalculatedPrice = useMemo(() => {
    const dailyMealPrice = previewComposition.reduce((sum, mealType) => {
        return sum + (formPrices[mealType] || 0);
    }, 0);
    const dailyTotal = dailyMealPrice;
    return dailyTotal * previewDuration;
  }, [previewComposition, previewDuration, formPrices]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">إدارة الباقات (أنظمة التسعير)</h1>
        <button onClick={handleAddClick} className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
          إضافة نظام تسعير
        </button>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">اسم النظام</th>
                <th scope="col" className="px-6 py-3">الوصف</th>
                <th scope="col" className="px-6 py-3">سعر الغداء</th>
                <th scope="col" className="px-6 py-3">سعر العشاء</th>
                <th scope="col" className="px-6 py-3">سعر السلطة</th>
                <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg: Package) => (
                <tr key={pkg.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{pkg.name}</td>
                  <td className="px-6 py-4">{pkg.description}</td>
                  <td className="px-6 py-4">{pkg.prices.غداء.toFixed(2)} د.ك</td>
                  <td className="px-6 py-4">{pkg.prices.عشاء.toFixed(2)} د.ك</td>
                  <td className="px-6 py-4">{pkg.prices.سلطة.toFixed(2)} د.ك</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEditClick(pkg)} className="font-medium text-blue-400 hover:underline">تعديل</button>
                    <button onClick={() => handleDeleteClick(pkg)} className="font-medium text-red-400 hover:underline mr-4">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'إضافة نظام تسعير جديد' : 'تعديل نظام التسعير'}
      >
        <form onSubmit={handleSaveChanges} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">اسم نظام التسعير</label>
            <input type="text" id="name" name="name" defaultValue={selectedPackage?.name || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">الوصف</label>
            <input type="text" id="description" name="description" defaultValue={selectedPackage?.description || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
          </div>
          
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-orange-400">تسعير الوجبات اليومي (د.ك)</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(MealCategory).map(category => (
                    <div key={category}>
                        <label htmlFor={category} className="block text-sm font-medium text-gray-300">{category}</label>
                        <input type="number" step="0.01" min="0" id={category} name={category} value={formPrices[category]} onChange={handlePriceChange} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                ))}
            </div>
          </fieldset>
           
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-orange-400">معاينة السعر التفاعلية</legend>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 text-center mb-2">1. اختر مدة الاشتراك</label>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {([6, 12, 20, 26, 30] as SubscriptionDuration[]).map(duration => (
                            <button
                                type="button"
                                key={duration}
                                onClick={() => setPreviewDuration(duration)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    previewDuration === duration
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                            >
                                {duration} {duration >= 11 ? 'يوم' : 'أيام'}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 text-center mb-2">2. كوّن خطة وجبات افتراضية</label>
                  <div className="space-y-2 bg-gray-700 p-3 rounded-md">
                    {previewComposition.map((meal, index) => (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse">
                        <select value={meal} onChange={(e) => handlePreviewCompositionChange(index, e.target.value as MealCategory)} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                            {Object.values(MealCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <button type="button" onClick={() => removeMealFromPreview(index)} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addMealToPreview} className="mt-2 text-sm text-green-400 hover:text-green-300 w-full text-center">+ إضافة وجبة أخرى</button>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded-md">
                     <p className="text-sm text-gray-300 text-center mb-1">
                        3. السعر الإجمالي المحسوب
                    </p>
                    <p className="text-2xl font-bold text-orange-400 mt-1 text-center">{exampleCalculatedPrice.toFixed(2)} د.ك</p>
                </div>
            </div>
          </fieldset>
          
          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="تأكيد الحذف">
        <p className="text-gray-300">هل أنت متأكد من أنك تريد حذف نظام التسعير "{selectedPackage?.name}"؟</p>
        <p className="text-sm text-yellow-400 mt-2">لا يمكن حذف نظام تسعير إذا كان مستخدماً من قبل أي مشترك.</p>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
          <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">حذف</button>
        </div>
      </Modal>

    </div>
  );
};

export default PackageManagement;