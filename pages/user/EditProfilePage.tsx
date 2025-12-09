import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { useData } from '../../data/DataContext';
import { User } from '../../types';

const EditProfilePage: React.FC = () => {
    const { user, updateCurrentUser } = useAuth();
    const { updateUser } = useData();
    const navigate = useNavigate();
    
    // Fix: Cast user to User and provide a full default address object to prevent type errors.
    const currentUser = user as User;
    
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || { governorate: '', area: '', block: '', street: '', houseNumber: '' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (['governorate', 'area', 'block', 'street', 'houseNumber', 'building', 'floor', 'apartment'].includes(name)) {
            setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser = { ...user, ...formData } as User;
        updateUser(updatedUser);
        updateCurrentUser(updatedUser);
        alert('تم تحديث بياناتك بنجاح!');
        navigate('/user/more');
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">تعديل بياناتي</h1>
            <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-xl shadow-sm space-y-6">
                <fieldset className="border border-gray-700 p-4 rounded-md">
                    <legend className="px-2 text-orange-400">البيانات الشخصية</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">الاسم</label>
                            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} required className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white" />
                        </div>
                    </div>
                </fieldset>
                
                 <fieldset className="border border-gray-700 p-4 rounded-md">
                     <legend className="px-2 text-orange-400">عنوان التوصيل</legend>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries({governorate: 'المحافظة', area: 'المنطقة', block: 'القطعة', street: 'الشارع', houseNumber: 'رقم المنزل', building: 'عمارة (اختياري)', floor: 'الدور (اختياري)', apartment: 'شقة (اختياري)'}).map(([key, label]) => (
                             <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                                <input type="text" id={key} name={key} value={(formData.address as any)[key] || ''} onChange={handleChange} required={!label.includes('اختياري')} className="block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                            </div>
                        ))}
                     </div>
                  </fieldset>

                <div className="flex justify-end pt-4 gap-4">
                    <button type="button" onClick={() => navigate('/user/more')} className="px-6 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">إلغاء</button>
                    <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;