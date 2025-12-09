import React from 'react';
import { useData } from '../../data/DataContext';
import { getActiveSubscribersForDate, getTodayDateString, getRelativeDateString } from './reportUtils';
import { User } from '../../types';
import { PrintIcon } from '../icons/IconComponents';

const DeliveryLabel: React.FC<{ user: User; logoUrl: string | null }> = ({ user, logoUrl }) => {
    const { subscription, address } = user;
    const today = getTodayDateString();
    const endDate = subscription ? getRelativeDateString(subscription.startDate, subscription.duration) : '';

    return (
        <div 
            className="label-card bg-white text-black p-3 rounded-lg border border-gray-400"
            style={{ width: '10cm', height: '7.5cm', direction: 'rtl', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
            <div className="text-center border-b pb-1 mb-1">
                 <h3 className="font-bold text-xl">{user.name}</h3>
                 <p className="text-sm"><strong>الهاتف:</strong> {user.phone}</p>
            </div>

            {logoUrl && (
                <div className="flex-grow flex items-center justify-center my-1">
                    <img src={logoUrl} alt="Logo" style={{ maxHeight: '2.5cm', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
            )}
            
            <div className="text-xs border-t pt-1 mt-1">
                <div className="text-xs mt-1">
                    <p><strong>العنوان:</strong> {address.governorate}، {address.area}، ق{address.block}، ش{address.street}، م{address.houseNumber}</p>
                    {address.building && <p>عمارة {address.building}، دور {address.floor}، شقة {address.apartment}</p>}
                </div>
                 <div className="flex justify-between w-full mt-1">
                    <span><strong>تاريخ الإنتاج:</strong> {today}</span>
                    <span><strong>نهاية الاشتراك:</strong> {endDate}</span>
                </div>
            </div>
        </div>
    );
};

const DeliveryLabelsReport: React.FC = () => {
    const { users, logoUrl, updateLogo } = useData();
    const today = getTodayDateString();
    const activeSubscribers = getActiveSubscribersForDate(today, users);
    
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
                 <h2 className="text-2xl font-semibold text-gray-200">ملصقات التوصيل</h2>
                 <div className="flex gap-2">
                    <input type="file" id="logo-upload-delivery" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <button onClick={() => document.getElementById('logo-upload-delivery')?.click()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
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
                تم تصميم هذه الملصقات للطباعة على ورق ستيكر مقاس 10 سم عرض × 7.5 سم ارتفاع.
            </p>
             <style>
                {`
                @media print {
                    @page {
                        size: 10cm 7.5cm;
                        margin: 0;
                    }
                    body * { 
                        visibility: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                     }
                    .no-print { display: none !important; }
                    #print-area-delivery, #print-area-delivery * { visibility: visible; }
                    #print-area-delivery { 
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
             
            <div id="print-area-delivery" className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeSubscribers.map(user => (
                    <DeliveryLabel key={user.id} user={user} logoUrl={logoUrl} />
                ))}
            </div>
             {activeSubscribers.length === 0 && (
                <p className="text-center text-gray-400 mt-6">لا توجد ملصقات توصيل لطباعتها اليوم.</p>
            )}
        </div>
    );
};

export default DeliveryLabelsReport;