
import React from 'react';
import { useAuth } from '../../Auth';
import { useData } from '../../data/DataContext';
import { Address, PaymentMethod, PaymentStatus, MealCategory, SubscriptionDuration, User } from '../../types';


const calculateEndDate = (startDate: string, duration: number): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + duration);
  return date.toISOString().split('T')[0];
};

const DetailRow: React.FC<{ label: string; value: string | undefined | number; highlight?: boolean; className?: string }> = ({ label, value, highlight = false, className = '' }) => (
    <div className={`flex justify-between items-center py-4 border-b ${className}`}>
        <dt className="text-md text-gray-600">{label}</dt>
        <dd className={`text-md font-semibold text-right ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value ?? 'غير متوفر'}</dd>
    </div>
);

const AddressDisplay: React.FC<{ address: Address }> = ({ address }) => {
    const { governorate, area, block, street, houseNumber, building, floor, apartment } = address;
    const optionalParts = [
        building ? `عمارة ${building}` : '',
        floor ? `دور ${floor}` : '',
        apartment ? `شقة ${apartment}` : ''
    ].filter(Boolean).join('، ');

    return (
        <div className="text-md font-semibold text-gray-900 text-right">
            <p>{`محافظة ${governorate}، منطقة ${area}`}</p>
            <p>{`قطعة ${block}، شارع ${street}، منزل ${houseNumber}`}</p>
            {optionalParts && <p>{optionalParts}</p>}
        </div>
    );
};


const MySubscription: React.FC = () => {
  const { user } = useAuth();
  const { packages, discountCodes } = useData();
  const currentUser = user as User;
  const subscription = currentUser?.subscription;
  const selectedPackage = subscription ? packages.find(p => p.id === subscription.packageId) : null;
  const appliedDiscountCode = subscription?.discountCode ? discountCodes.find(d => d.code === subscription.discountCode) : null;


  if (!subscription || !currentUser) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">لا يوجد لديك اشتراك فعال.</h1>
      </div>
    );
  }

  const calculatePriceBreakdown = () => {
    if (!subscription || !selectedPackage) return { subtotal: 0, discountAmount: 0, total: 0 };
    
    const dailyMealPrice = subscription.mealComposition.reduce((sum: number, mealType: MealCategory) => {
        return sum + (selectedPackage.prices[mealType] || 0);
    }, 0);
    
    const dailyTotal = dailyMealPrice;
    
    const subtotal = dailyTotal * subscription.duration;

    let discountAmount = 0;
    if(appliedDiscountCode) {
        const currentDuration = String(subscription.duration) as keyof typeof appliedDiscountCode.discountAmounts;
        const discountAmountForDuration = appliedDiscountCode.discountAmounts[currentDuration];
        if (discountAmountForDuration) {
            discountAmount = discountAmountForDuration;
        }
    }
    
    const totalWithDiscount = subtotal - discountAmount;
    const total = totalWithDiscount > 0 ? totalWithDiscount : 0;

    return {
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        total: total.toFixed(2)
    };
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    const map = { 'link': 'رابط دفع', 'cash': 'كاش', 'knet': 'كي نت' };
    return map[method];
  }

  const getPaymentStatusPill = (status: PaymentStatus) => {
    const isPaid = status === 'paid';
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {isPaid ? 'تم الدفع' : 'تحت التسوية'}
      </span>
    )
  }
  
  const priceBreakdown = calculatePriceBreakdown();
  const statusText = subscription.status === 'active' ? 'نشط' : 'منتهي الصلاحية';
  const endDate = calculateEndDate(subscription.startDate, subscription.duration);
  const mealCompositionText = subscription.mealComposition.join('، ');

  return (
    <div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">تفاصيل اشتراكي</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-orange-600">{selectedPackage?.name}</h2>
                    <p className="text-gray-500 mt-1">{selectedPackage?.description}</p>
                    <span className={`mt-2 inline-block px-4 py-1 text-sm font-semibold rounded-full ${
                        subscription.status === 'active' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {statusText}
                    </span>
                </div>
                <dl>
                    <DetailRow label="اسم المشترك" value={currentUser.name} />
                    <div className="py-4 border-b">
                        <dt className="text-md text-gray-600 mb-2">عنوان التوصيل</dt>
                        <AddressDisplay address={currentUser.address} />
                    </div>
                    <DetailRow label="خطة الوجبات اليومية" value={mealCompositionText} />
                    <DetailRow label="تاريخ بداية الاشتراك" value={subscription.startDate} />
                    <DetailRow label="مدة الاشتراك" value={`${subscription.duration} يوم`} />
                    <DetailRow label="تاريخ نهاية الاشتراك" value={endDate} />
                </dl>
            </div>
            <div className="bg-gray-50 px-8 py-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الدفع</h3>
                <dl>
                    <DetailRow label="تاريخ الدفع" value={subscription.paymentDate} />
                    <DetailRow label="طريقة الدفع" value={getPaymentMethodText(subscription.paymentMethod)} />
                    <div className="flex justify-between items-center py-4 border-b">
                        <dt className="text-md text-gray-600">حالة الدفع</dt>
                        <dd>{getPaymentStatusPill(subscription.paymentStatus)}</dd>
                    </div>
                     <DetailRow label="المجموع الفرعي" value={`${priceBreakdown.subtotal} دينار كويتي`} className="border-none" />
                     {appliedDiscountCode && Number(priceBreakdown.discountAmount) > 0 && (
                        <DetailRow 
                            label={`الخصم (${appliedDiscountCode.code})`} 
                            value={`- ${priceBreakdown.discountAmount} دينار كويتي`} 
                            className="text-green-600"
                        />
                     )}
                     <DetailRow label="السعر الإجمالي" value={`${priceBreakdown.total} دينار كويتي`} highlight={true} />
                </dl>
            </div>
            <div className="p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                        تجديد الاشتراك
                    </button>
                    <button className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                        إيقاف مؤقت
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MySubscription;