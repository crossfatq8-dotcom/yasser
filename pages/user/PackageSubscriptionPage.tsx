import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../Auth';
import { Package, MealCategory, SubscriptionDuration, User, UserRole, Address, Subscription, DeliveryShift, DISLIKED_INGREDIENTS, DislikedIngredient, DiscountCode } from '../../types';

const PackageSubscriptionPage: React.FC = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const { packages, discountCodes, addUser, areas } = useData();
    const { login } = useAuth();

    const [step, setStep] = useState(1);
    const selectedPackage = useMemo(() => packages.find(p => p.id === packageId), [packageId, packages]);
    
    // State for all steps
    const [formData, setFormData] = useState({
        // Step 1
        duration: 30 as SubscriptionDuration,
        mealComposition: [MealCategory.Lunch, MealCategory.Dinner] as MealCategory[],
        // Step 2
        startDate: new Date().toISOString().split('T')[0],
        deliveryShift: 'morning' as DeliveryShift,
        dislikedIngredients: [] as DislikedIngredient[],
        // Step 3
        name: '',
        phone: '',
        password: '',
        address: {} as Partial<Address>,
        discountCode: '',
    });

    if (!selectedPackage) {
        return <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white">الباقة غير موجودة</h1>
            <Link to="/user" className="text-orange-500 hover:underline mt-4 inline-block">العودة إلى الرئيسية</Link>
        </div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (['governorate', 'area', 'block', 'street', 'houseNumber', 'building', 'floor', 'apartment'].includes(name)) {
            setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleMealCompositionChange = (index: number, value: MealCategory) => {
      const newComposition = [...formData.mealComposition];
      newComposition[index] = value;
      setFormData({...formData, mealComposition: newComposition});
    };

    const addMealToComposition = () => {
      setFormData(prev => ({ ...prev, mealComposition: [...prev.mealComposition, MealCategory.Lunch] }));
    }

    const removeMealFromComposition = (index: number) => {
      setFormData(prev => ({ ...prev, mealComposition: prev.mealComposition.filter((_, i) => i !== index) }));
    }

    const handleDislikeToggle = (ingredient: DislikedIngredient) => {
        setFormData(prev => ({
            ...prev,
            dislikedIngredients: prev.dislikedIngredients.includes(ingredient)
                ? prev.dislikedIngredients.filter(item => item !== ingredient)
                : [...prev.dislikedIngredients, ingredient]
        }));
    };

    const { finalPrice, discountAmount } = useMemo(() => {
        const { mealComposition, duration, discountCode } = formData;
        const dailyMealPrice = mealComposition.reduce((sum: number, mealType: MealCategory) => sum + (selectedPackage.prices[mealType] || 0), 0);
        const priceBeforeDiscount = dailyMealPrice * duration;
        
        let finalPrice = priceBeforeDiscount;
        let appliedDiscount = 0;
        
        if (discountCode) {
           const foundCode = discountCodes.find(c => c.code.toLowerCase() === discountCode.toLowerCase());
           if(foundCode) {
               const currentDurationKey = String(duration) as keyof DiscountCode['discountAmounts'];
               if(foundCode.discountAmounts[currentDurationKey]) {
                   appliedDiscount = foundCode.discountAmounts[currentDurationKey]!;
                   finalPrice = Math.max(0, priceBeforeDiscount - appliedDiscount);
               }
           }
        }
        return { 
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            discountAmount: parseFloat(appliedDiscount.toFixed(2)),
        };
    }, [formData, selectedPackage, discountCodes]);
    
    const handleSubmit = () => {
        const newSubscription: Subscription = {
            packageId: selectedPackage.id,
            mealComposition: formData.mealComposition,
            startDate: formData.startDate,
            duration: Number(formData.duration) as SubscriptionDuration,
            status: 'active',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'link', 
            paymentStatus: 'pending',
            discountCode: discountAmount > 0 ? formData.discountCode : undefined,
            deliveryShift: formData.deliveryShift,
            areaId: (formData.address as any).area || '', 
            pausedDays: [],
            pauseDaysAvailable: 3,
        };

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
            role: UserRole.Subscriber,
            address: formData.address as Address,
            subscription: newSubscription,
            dislikedIngredients: formData.dislikedIngredients,
            // FIX: Add missing 'favoriteMealIds' property
            favoriteMealIds: [],
        };
        
        addUser(newUser);
        
        if(login(newUser.phone, newUser.password, false)) {
            navigate('/user/my-meals');
        } else {
            navigate('/login');
        }
    };


    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    const steps = [ "تخصيص الباقة", "التفضيلات والجدولة", "العنوان والدفع" ];

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
                 <div className="px-4">
                    <div className="relative">
                        <div className="absolute top-1/2 w-full h-0.5 bg-gray-700" />
                        <div className="relative flex justify-between">
                            {steps.map((name, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${step >= index + 1 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {index + 1}
                                    </div>
                                    <p className={`mt-2 text-xs text-center ${step >= index + 1 ? 'text-orange-400 font-semibold' : 'text-gray-400'}`}>{name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    
                    {step === 1 && (
                       <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden flex border-2 border-gray-300">
                                <img src={`https://picsum.photos/300/300?random=${selectedPackage.id}`} alt={selectedPackage.name} className="w-36 h-36 object-cover flex-shrink-0" />
                                <div className="p-4 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-gray-900">{selectedPackage.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{selectedPackage.description}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">مدة الاشتراك</label>
                                    <select id="duration" name="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md">
                                        {[6, 12, 20, 26, 30].map(d => <option key={d} value={d}>{d} يوم</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تكوين الوجبات اليومية</label>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                                    {formData.mealComposition.map((meal, index) => (
                                        <div key={index} className="flex items-center space-x-2 space-x-reverse">
                                            <select value={meal} onChange={(e) => handleMealCompositionChange(index, e.target.value as MealCategory)} className="block w-full border border-gray-300 rounded-md py-2 px-3">
                                                {Object.values(MealCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <button type="button" onClick={() => removeMealFromComposition(index)} className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addMealToComposition} className="mt-2 text-sm text-green-600 hover:text-green-500 w-full">+ إضافة وجبة أخرى</button>
                                </div>
                            </div>
                             <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
                                <p className="text-sm text-gray-600">السعر الإجمالي (قبل الخصم)</p>
                                <p className="text-3xl font-bold text-orange-600">{finalPrice.toFixed(2)} د.ك</p>
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div>
                             <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">الخطوة 2: التفضيلات والجدولة</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">تاريخ بداية الاشتراك</label>
                                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                 </div>
                                 <div>
                                    <label htmlFor="deliveryShift" className="block text-sm font-medium text-gray-700">فترة التوصيل المفضلة</label>
                                    <select id="deliveryShift" name="deliveryShift" value={formData.deliveryShift} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                                        <option value="morning">صباحية (6ص - 12ظ)</option>
                                        <option value="evening">مسائية (4م - 10م)</option>
                                    </select>
                                </div>
                             </div>
                             <div className="mt-6">
                                <h4 className="text-md font-medium text-gray-800 mb-2">المكونات غير المفضلة</h4>
                                <p className="text-sm text-gray-500 mb-3">اختر المكونات التي لا تفضلها.</p>
                                <div className="flex flex-wrap gap-2">
                                    {DISLIKED_INGREDIENTS.map(ingredient => (
                                        <button
                                            key={ingredient}
                                            type="button"
                                            onClick={() => handleDislikeToggle(ingredient)}
                                            className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                                                formData.dislikedIngredients.includes(ingredient)
                                                    ? 'bg-orange-500 text-white border-orange-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {ingredient}
                                        </button>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}

                    {step === 3 && (
                       <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">الخطوة 3: بياناتك الشخصية وعنوان التوصيل</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                                </div>
                                <hr/>
                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries({governorate: 'المحافظة', area: 'المنطقة', block: 'القطعة', street: 'الشارع', houseNumber: 'رقم المنزل', building: 'عمارة (اختياري)', floor: 'الدور (اختياري)', apartment: 'شقة (اختياري)'}).map(([key, label]) => (
                                         <div key={key} className={key === 'street' || key === 'building' ? 'col-span-2 md:col-span-1' : ''}>
                                            <label className="block text-sm font-medium text-gray-700">{label}</label>
                                            <input type="text" name={key} value={(formData.address as any)[key] || ''} onChange={handleChange} required={!label.includes('اختياري')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                    ))}
                                 </div>
                                 <hr/>
                                <div className="mt-4 p-4 bg-orange-50 rounded-lg text-center">
                                    <button onClick={handleSubmit} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                        اشترك الآن (دفع آمن)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="flex justify-between mt-8">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md">
                                السابق
                            </button>
                        ) : <Link to="/user" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md">إلغاء</Link>}
                        {step < 3 && (
                             <button type="button" onClick={nextStep} className="bg-orange-500 text-white px-6 py-2 rounded-md">
                                التالي
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageSubscriptionPage;