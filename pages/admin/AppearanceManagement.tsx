import React, { useState } from 'react';
import { useData } from '../../data/DataContext';
import { PlusIcon, DeleteIcon } from '../../components/icons/IconComponents';

const AppearanceManagement: React.FC = () => {
    const { bannerImages, addBannerImage, deleteBannerImage, whatsAppNumber, updateWhatsAppNumber } = useData();
    const [wame, setWame] = useState(whatsAppNumber);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            addBannerImage(imageUrl);
        }
    };

    const handleWameSave = () => {
        updateWhatsAppNumber(wame);
        alert('تم حفظ رقم الواتس آب بنجاح!');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">إدارة الواجهة</h1>
            
            <div className="bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-200">صور البانر المتحرك</h2>
                    <label htmlFor="banner-upload" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                        <PlusIcon />
                        إضافة صورة
                    </label>
                    <input type="file" id="banner-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                
                {bannerImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {bannerImages.map((imageUrl, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden">
                                <img src={imageUrl} alt={`Banner ${index + 1}`} className="w-full h-32 object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => deleteBannerImage(imageUrl)}
                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                        title="حذف الصورة"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-8">لا توجد صور في البانر حالياً. قم بإضافة صور جديدة.</p>
                )}
            </div>

            <div className="bg-gray-700 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-200 mb-4">إعدادات التواصل</h2>
                <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="whatsapp-number" className="block text-sm font-medium text-gray-300 mb-1">رقم الواتس آب للتواصل</label>
                        <input 
                            type="tel" 
                            id="whatsapp-number" 
                            value={wame}
                            onChange={(e) => setWame(e.target.value)}
                            placeholder="e.g., 96512345678"
                            className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white ltr"
                        />
                         <p className="text-xs text-gray-400 mt-1">أدخل الرقم مع رمز الدولة وبدون علامة (+).</p>
                    </div>
                    <button 
                        onClick={handleWameSave}
                        className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        حفظ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppearanceManagement;