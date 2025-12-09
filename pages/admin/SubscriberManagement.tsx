
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../data/DataContext';
import { User, UserRole, Subscription, Package, SubscriptionDuration, PaymentMethod, PaymentStatus, Address, MealCategory, Area, DeliveryShift, DISLIKED_INGREDIENTS, DislikedIngredient } from '../../types';
import Modal from '../../components/Modal';

const calculateEndDate = (startDate: string, duration: number): string => {
  if (!startDate) return '';
  const date = new Date(startDate);
  date.setDate(date.getDate() + duration);
  return date.toISOString().split('T')[0];
};

const SubscriberManagement: React.FC = () => {
  const { users, packages, discountCodes, areas, addUser, updateUser, deleteUser } = useData();
  const subscribers = users.filter(user => user.role === UserRole.Subscriber);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [formData, setFormData] = useState<any>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountStatus, setDiscountStatus] = useState({ applied: false, message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const calculateSubscriptionPrice = (subscription: Subscription | undefined): number => {
    if (!subscription) return 0;
  
    const pkg = packages.find(p => p.id === subscription.packageId);
    if (!pkg) return 0;
  
    const dailyMealPrice = subscription.mealComposition.reduce((sum, mealType) => {
      return sum + (pkg.prices[mealType] || 0);
    }, 0);
  
    const subtotal = dailyMealPrice * subscription.duration;
  
    let finalPrice = subtotal;
  
    if (subscription.discountCode) {
      const foundCode = discountCodes.find(c => c.code.toLowerCase() === subscription.discountCode!.toLowerCase());
      if (foundCode) {
        const isApplicable = !foundCode.applicablePackageIds || foundCode.applicablePackageIds.includes(subscription.packageId);
        if (isApplicable) {
          const currentDuration = String(subscription.duration) as keyof typeof foundCode.discountAmounts;
          const discountAmountForDuration = foundCode.discountAmounts[currentDuration];
  
          if (discountAmountForDuration) {
            const priceAfterDiscount = subtotal - discountAmountForDuration;
            finalPrice = priceAfterDiscount > 0 ? priceAfterDiscount : 0;
          }
        }
      }
    }
  
    return parseFloat(finalPrice.toFixed(2));
  };


  const initializeFormData = useCallback(() => {
    if (isModalOpen && modalMode === 'edit' && selectedUser) {
        setFormData({
            ...selectedUser,
            ...selectedUser.address,
            ...selectedUser.subscription
        });
    } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
            packageId: packages[0]?.id || '',
            mealComposition: [MealCategory.Lunch, MealCategory.Dinner],
            duration: 30,
            startDate: today,
            paymentDate: today,
            status: 'active',
            paymentMethod: 'link',
            paymentStatus: 'pending',
            discountCode: '',
            areaId: areas[0]?.id || '',
            deliveryShift: 'morning',
            dislikedIngredients: [],
        });
    }
  }, [isModalOpen, modalMode, selectedUser, packages, areas]);

  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

  useEffect(() => {
    const { packageId, mealComposition, duration, discountCode, startDate } = formData;
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || !mealComposition) {
        setTotalPrice(0);
        return;
    };
    
    const dailyMealPrice = mealComposition.reduce((sum: number, mealType: MealCategory) => {
        return sum + (pkg.prices[mealType] || 0);
    }, 0);
    
    const dailyTotal = dailyMealPrice;
    
    let priceBeforeDiscount = dailyTotal * (duration || 30);

    // Discount logic
    let finalPrice = priceBeforeDiscount;
    let appliedDiscount = false;
    let discountMsg = '';

    if (discountCode) {
        const foundCode = discountCodes.find(c => c.code.toLowerCase() === discountCode.toLowerCase());
        if (foundCode) {
            const isApplicable = !foundCode.applicablePackageIds || foundCode.applicablePackageIds.includes(packageId);
            if (isApplicable) {
                const currentDuration = String(duration) as keyof typeof foundCode.discountAmounts;
                const discountAmountForDuration = foundCode.discountAmounts[currentDuration];

                if (discountAmountForDuration) {
                    const priceAfterDiscount = priceBeforeDiscount - discountAmountForDuration;
                    finalPrice = priceAfterDiscount > 0 ? priceAfterDiscount : 0;
                    appliedDiscount = true;
                    discountMsg = `تم تطبيق خصم بقيمة ${discountAmountForDuration.toFixed(2)} د.ك`;
                } else {
                     discountMsg = 'هذا الكود غير صالح لمدة الاشتراك المختارة.';
                }
            } else {
                discountMsg = 'هذا الكود غير صالح للباقة المختارة.';
            }
        } else {
            discountMsg = 'كود الخصم غير صحيح.';
        }
    }

    setDiscountStatus({ applied: appliedDiscount, message: discountMsg });
    setTotalPrice(parseFloat(finalPrice.toFixed(2)));

    if(startDate && duration){
        setFormData((prev: any) => ({
            ...prev,
            endDate: calculateEndDate(prev.startDate, Number(prev.duration))
        }));
    }

  }, [formData.packageId, formData.mealComposition, formData.duration, formData.startDate, formData.discountCode, packages, discountCodes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({...prev, [name]: value}));
  };
  
  const handleMealCompositionChange = (index: number, value: MealCategory) => {
    const newComposition = [...formData.mealComposition];
    newComposition[index] = value;
    setFormData({...formData, mealComposition: newComposition});
  };

  const addMealToComposition = () => {
    const newComposition = [...formData.mealComposition, MealCategory.Lunch];
    setFormData({...formData, mealComposition: newComposition});
  }

  const removeMealFromComposition = (index: number) => {
    const newComposition = formData.mealComposition.filter((_: any, i: number) => i !== index);
    setFormData({...formData, mealComposition: newComposition});
  }

  const handleDislikeToggle = (ingredient: DislikedIngredient) => {
    setFormData((prev: any) => ({
        ...prev,
        dislikedIngredients: (prev.dislikedIngredients || []).includes(ingredient)
            ? (prev.dislikedIngredients || []).filter((i: DislikedIngredient) => i !== ingredient)
            : [...(prev.dislikedIngredients || []), ingredient]
    }));
  };

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
        deleteUser(selectedUser.id);
    }
    setIsConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const address: Address = {
        governorate: formData.governorate,
        area: formData.area,
        block: formData.block,
        street: formData.street,
        houseNumber: formData.houseNumber,
        building: formData.building,
        floor: formData.floor,
        apartment: formData.apartment
    };

    const subscription: Subscription = {
        packageId: formData.packageId,
        mealComposition: formData.mealComposition,
        startDate: formData.startDate,
        duration: Number(formData.duration) as SubscriptionDuration,
        status: formData.status,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        discountCode: discountStatus.applied ? formData.discountCode : undefined,
        deliveryShift: formData.deliveryShift,
        areaId: formData.areaId,
        pausedDays: formData.pausedDays || [],
        pauseDaysAvailable: formData.pauseDaysAvailable ?? 3,
    };

    const userPayload: User = {
        id: selectedUser?.id || `user-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        password: selectedUser?.password || '0000', // Default password for new users
        role: UserRole.Subscriber,
        address,
        subscription,
        dislikedIngredients: formData.dislikedIngredients || [],
        favoriteMealIds: selectedUser?.favoriteMealIds || [],
    };
    
    if (modalMode === 'add') {
        addUser(userPayload);
    } else {
        updateUser(userPayload);
    }
    
    handleCloseModal();
  };
  
  const renderPaymentStatus = (status: PaymentStatus) => {
    const paid = status === 'paid';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${ paid ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
        {paid ? 'تم الدفع' : 'تحت التسوية'}
      </span>
    );
  };
  
  const filteredSubscribers = subscribers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">إدارة المشتركين</h1>
        <button onClick={handleAddClick} className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
          إضافة مشترك جديد
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="w-full md:w-1/2">
            <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">الاسم</th>
                <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                <th scope="col" className="px-6 py-3">النظام</th>
                <th scope="col" className="px-6 py-3">المبلغ المدفوع</th>
                <th scope="col" className="px-6 py-3">حالة الدفع</th>
                <th scope="col" className="px-6 py-3">تاريخ الانتهاء</th>
                <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((user: User) => (
                <tr key={user.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4">{user.subscription ? (packages.find(p => p.id === user.subscription.packageId)?.name || 'غير معروف') : 'لا يوجد'}</td>
                  <td className="px-6 py-4 font-mono text-orange-400">
                    {user.subscription ? `${calculateSubscriptionPrice(user.subscription).toFixed(2)} د.ك` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {user.subscription ? renderPaymentStatus(user.subscription.paymentStatus) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">{user.subscription ? calculateEndDate(user.subscription.startDate, user.subscription.duration) : 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEditClick(user)} className="font-medium text-blue-400 hover:underline">تعديل</button>
                    <button onClick={() => handleDeleteClick(user)} className="font-medium text-red-400 hover:underline mr-4">حذف</button>
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
        title={modalMode === 'add' ? 'إضافة مشترك جديد' : 'تعديل بيانات المشترك'}
      >
        <form onSubmit={handleSaveChanges} className="space-y-4 text-right">
          {/* Personal Info */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-orange-400">البيانات الشخصية</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">الاسم</label>
                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف</label>
                <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} required className="block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white" />
              </div>
            </div>
          </fieldset>

          {/* Address Info */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
             <legend className="px-2 text-orange-400">عنوان التوصيل</legend>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fields for governorate, area, block, street, houseNumber, building, floor, apartment */}
                {Object.entries({governorate: 'المحافظة', area: 'المنطقة (نص)', block: 'القطعة', street: 'الشارع', houseNumber: 'رقم المنزل', building: 'عمارة (اختياري)', floor: 'الدور (اختياري)', apartment: 'شقة (اختياري)'}).map(([key, label]) => (
                     <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                        <input type="text" id={key} name={key} value={formData[key] || ''} onChange={handleInputChange} required={!label.includes('اختياري')} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                ))}
             </div>
          </fieldset>
          
           {/* Subscription Info */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-orange-400">تفاصيل الاشتراك</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="packageId" className="block text-sm font-medium text-gray-300 mb-1">نظام التسعير</label>
                <select id="packageId" name="packageId" value={formData.packageId} onChange={handleInputChange} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">مدة الاشتراك</label>
                <select id="duration" name="duration" value={formData.duration} onChange={handleInputChange} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                  <option value="6">6 أيام</option>
                  <option value="12">12 يوم</option>
                  <option value="20">20 يوم</option>
                  <option value="26">26 يوم</option>
                  <option value="30">30 يوم</option>
                </select>
              </div>
              <div>
                <label htmlFor="areaId" className="block text-sm font-medium text-gray-300 mb-1">منطقة التوصيل</label>
                <select id="areaId" name="areaId" value={formData.areaId || ''} onChange={handleInputChange} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                    <option value="">اختر المنطقة</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            {/* Meal Composition */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">تكوين الوجبات اليومية</label>
                <div className="space-y-2">
                    {formData.mealComposition?.map((meal: MealCategory, index: number) => (
                        <div key={index} className="flex items-center space-x-2 space-x-reverse">
                            <select value={meal} onChange={(e) => handleMealCompositionChange(index, e.target.value as MealCategory)} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                                {Object.values(MealCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <button type="button" onClick={() => removeMealFromComposition(index)} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
                 <button type="button" onClick={addMealToComposition} className="mt-2 text-sm text-green-400 hover:text-green-300">+ إضافة وجبة أخرى</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">تاريخ البداية</label>
                  <input type="date" id="startDate" name="startDate" value={formData.startDate || ''} onChange={handleInputChange} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">تاريخ الانتهاء (محسوب)</label>
                  <input type="date" id="endDate" name="endDate" value={formData.endDate || ''} readOnly className="block w-full bg-gray-700 border-gray-500 rounded-md py-2 px-3 text-white" />
                </div>
                <div>
                    <label htmlFor="deliveryShift" className="block text-sm font-medium text-gray-300 mb-1">فترة التوصيل</label>
                    <select id="deliveryShift" name="deliveryShift" value={formData.deliveryShift || 'morning'} onChange={handleInputChange} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                        <option value="morning">صباحية (6ص - 12ظ)</option>
                        <option value="evening">مسائية (4م - 10م)</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="discountCode" className="block text-sm font-medium text-gray-300 mb-1">كود الخصم (اختياري)</label>
                    <input type="text" id="discountCode" name="discountCode" value={formData.discountCode || ''} onChange={handleInputChange} className="block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white" />
                    {discountStatus.message && <p className={`text-xs mt-1 ${discountStatus.applied ? 'text-green-400' : 'text-red-400'}`}>{discountStatus.message}</p>}
                </div>
                 <div className="bg-gray-700 p-2 rounded-md flex items-center justify-center col-span-full md:col-span-2">
                 <span className="text-gray-400 ml-2">الإجمالي:</span>
                 <span className="font-bold text-lg text-orange-400">{totalPrice} د.ك</span>
               </div>
            </div>
          </fieldset>

           {/* Payment Info */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-orange-400">معلومات الدفع</legend>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fields for paymentDate, paymentMethod, paymentStatus */}
                {Object.entries({'paymentDate': 'تاريخ الدفع', 'paymentMethod': 'طريقة الدفع', 'paymentStatus': 'حالة الدفع'}).map(([key, label]) => (
                     <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                        {key === 'paymentDate' ? (
                             <input type="date" id={key} name={key} value={formData[key] || ''} onChange={handleInputChange} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                        ) : (
                             <select id={key} name={key} value={formData[key]} onChange={handleInputChange} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                                {key === 'paymentMethod' ? (
                                    <> <option value="link">رابط</option><option value="cash">كاش</option><option value="knet">كي نت</option> </>
                                ) : (
                                    <> <option value="pending">تحت التسوية</option><option value="paid">تم الدفع</option> </>
                                )}
                            </select>
                        )}
                    </div>
                ))}
             </div>
          </fieldset>
            
          <fieldset className="border border-gray-600 p-4 rounded-md">
                <legend className="px-2 text-orange-400">التفضيلات</legend>
                <h4 className="text-md font-medium text-gray-300 mb-2">المكونات غير المفضلة</h4>
                <div className="flex flex-wrap gap-2">
                    {DISLIKED_INGREDIENTS.map(ingredient => (
                        <button
                            key={ingredient}
                            type="button"
                            onClick={() => handleDislikeToggle(ingredient)}
                            className={`px-3 py-1 text-sm rounded-full border ${
                                formData.dislikedIngredients?.includes(ingredient)
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            }`}
                        >
                            {ingredient}
                        </button>
                    ))}
                </div>
            </fieldset>

          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="تأكيد الحذف">
        <p className="text-gray-300">هل أنت متأكد من أنك تريد حذف المشترك "{selectedUser?.name}"؟</p>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
          <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">حذف</button>
        </div>
      </Modal>

    </div>
  );
};

export default SubscriberManagement;