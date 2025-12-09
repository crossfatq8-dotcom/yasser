import React from 'react';
import { useData } from '../../data/DataContext';
import { getActiveSubscribersForDate, getTodayDateString, getRelativeDateString } from './reportUtils';
import { PrintIcon } from '../icons/IconComponents';

interface MealToProduce {
  id: string;
  name: string;
  category: string;
  count: number;
}

const ExpiryLabelsReport: React.FC = () => {
    const { users, userSelections, meals, logoUrl, updateLogo } = useData();
    const today = getTodayDateString();
    const expiryDate = getRelativeDateString(today, 1);
    
    const activeSubscribers = getActiveSubscribersForDate(today, users);
    
    const productionList = activeSubscribers.reduce((acc, user) => {
        const selection = userSelections.find(s => s.userId === user.id && s.date === today);
        if (selection) {
            Object.values(selection.selections).forEach((mealId) => {
                const mealIdStr = mealId as string;
                if (!acc[mealIdStr]) {
                    const meal = meals.find(m => m.id === mealIdStr);
                    acc[mealIdStr] = { 
                        id: mealIdStr, 
                        name: meal?.name || 'غير معروف', 
                        category: meal?.category || 'غير معروف',
                        count: 0 
                    };
                }
                acc[mealIdStr].count += 1;
            });
        }
        return acc;
    }, {} as { [mealId: string]: MealToProduce });

    const labelsToPrint = Object.values(productionList).flatMap(meal =>
        Array.from({ length: meal.count }, (_, i) => ({ ...meal, instance: i }))
    );
    
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    updateLogo(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 no-print">
                 <h2 className="text-2xl font-semibold text-gray-200">ملصقات الصلاحية</h2>
                 <div className="flex gap-2">
                    <input type="file" id="logo-upload-expiry" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <button onClick={() => document.getElementById('logo-upload-expiry')?.click()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        رفع شعار جديد
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        <PrintIcon />
                        طباعة الملصقات
                    </button>
                 </div>
            </div>
            <p className="text-gray-400 mb-4 no-print">
                تم تصميم هذه الملصقات للطباعة على ورق ستيكر مقاس 7.5 سم عرض × 5 سم ارتفاع.
            </p>
            <style>
                {`
                @media print {
                    @page {
                        size: 7.5cm 5cm;
                        margin: 0;
                    }
                    body * { 
                        visibility: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                     }
                    .no-print { display: none !important; }
                    #print-area-expiry, #print-area-expiry * { visibility: visible; }
                    #print-area-expiry { 
                        display: grid !important;
                        position: absolute; left: 0; top: 0; width: 100%; 
                    }
                    .label-card { 
                        page-break-inside: avoid;
                        width: 100%;
                        height: 100%;
                        border: 1px solid black !important;
                        box-shadow: none !important;
                    }
                }
                `}
            </style>
            
            <div id="print-area-expiry" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {labelsToPrint.map((label) => (
                    <div 
                        key={`${label.id}-${label.instance}`}
                        className="label-card bg-white text-black p-2 rounded-md border border-gray-300"
                        style={{ width: '7.5cm', height: '5cm', direction: 'rtl', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div className="text-center w-full">
                            <p className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-300 pb-1">{label.category}</p>
                            <h3 className="font-bold text-sm mt-1">{label.name}</h3>
                        </div>
                        
                        {logoUrl && <img src={logoUrl} alt="Logo" className="my-auto" style={{ maxHeight: '2.2cm', maxWidth: '100%', objectFit: 'contain' }} />}

                        <div className="text-xs flex justify-between w-full mt-auto">
                            <span><strong>تاريخ الإنتاج:</strong> {today}</span>
                            <span><strong>تاريخ الصلاحية:</strong> {expiryDate}</span>
                        </div>
                    </div>
                ))}
            </div>
             {labelsToPrint.length === 0 && (
                <p className="text-center text-gray-400 mt-6">لا توجد ملصقات لطباعتها اليوم.</p>
            )}
        </div>
    );
};

export default ExpiryLabelsReport;
