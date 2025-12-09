

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../data/DataContext';
import { UserRole, Subscription, Package, DiscountCode, User } from '../../types';

// Data for the chart remains the same as it's static mock data
const data = [
  { name: 'يناير', subscribers: 40 },
  { name: 'فبراير', subscribers: 30 },
  { name: 'مارس', subscribers: 20 },
  { name: 'أبريل', subscribers: 27 },
  { name: 'مايو', subscribers: 18 },
  { name: 'يونيو', subscribers: 23 },
  { name: 'يوليو', subscribers: 34 },
];

const StatCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (
  <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <h3 className="text-gray-400 text-lg">{title}</h3>
    <p className="text-4xl font-bold text-white my-2">{value}</p>
    {description && <p className="text-orange-400 text-sm">{description}</p>}
  </div>
);

const calculateSubscriptionPrice = (subscription: Subscription | undefined, packages: Package[], discountCodes: DiscountCode[]): number => {
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


const DashboardHome: React.FC = () => {
  const { users, packages, discountCodes, expenses, vacuumOrders } = useData();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  today.setHours(0, 0, 0, 0);

  const paidAndActiveTodaySubscribers: User[] = users.filter(u => {
    if (u.role !== UserRole.Subscriber || !u.subscription || u.subscription.status !== 'active' || u.subscription.paymentStatus !== 'paid') {
      return false;
    }
    const startDate = new Date(u.subscription.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + u.subscription.duration);

    return today >= startDate && today < endDate;
  });

  const totalActivePaidSubscribers = paidAndActiveTodaySubscribers.length;
  
  const todaysNewPaidSubscribers = paidAndActiveTodaySubscribers.filter(u => {
      const startDate = new Date(u.subscription!.startDate);
      startDate.setHours(0, 0, 0, 0);
      return startDate.getTime() === today.getTime();
  });

  const todaysNewPaidSubscribersCount = todaysNewPaidSubscribers.length;
  
  const dailyBoxes = totalActivePaidSubscribers;
  
  const dailyPackageRevenue = todaysNewPaidSubscribers.reduce((total, user) => {
      const price = calculateSubscriptionPrice(user.subscription, packages, discountCodes);
      return total + price;
  }, 0);
  
  const dailyVacuumRevenue = vacuumOrders
    .filter(order => order.orderDate === todayStr)
    .reduce((total, order) => total + order.totalPrice, 0);

  const totalPackageRevenue = users
    .filter(u => u.role === UserRole.Subscriber && u.subscription && u.subscription.paymentStatus === 'paid')
    .reduce((total, user) => {
        const price = calculateSubscriptionPrice(user.subscription, packages, discountCodes);
        return total + price;
    }, 0);
    
  const totalVacuumRevenue = vacuumOrders.reduce((total, order) => total + order.totalPrice, 0);
    
  const totalExpensesThisMonth = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);


  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">لوحة المعلومات الرئيسية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشتركين" value={totalActivePaidSubscribers} description="مشترك فعال ومدفوع اليوم" />
        <StatCard title="مشتركين اليوم" value={todaysNewPaidSubscribersCount} description="اشتراكات مدفوعة بدأت اليوم" />
        <StatCard title="عدد البوكسات اليومية" value={dailyBoxes} description="صندوق سيتم توصيله اليوم" />
        <StatCard title="مصروفات الشهر" value={`${totalExpensesThisMonth.toFixed(2)} د.ك`} description="إجمالي المصروفات للشهر الحالي" />
        
        <StatCard title="ايراد الباقات اليومي" value={`${dailyPackageRevenue.toFixed(2)} د.ك`} />
        <StatCard title="ايراد الفاكيوم اليومي" value={`${dailyVacuumRevenue.toFixed(3)} د.ك`} />
        
        <StatCard title="إجمالي إيراد الباقات" value={`${totalPackageRevenue.toFixed(2)} د.ك`} />
        <StatCard title="إجمالي إيراد الفاكيوم" value={`${totalVacuumRevenue.toFixed(3)} د.ك`} />

      </div>

      <div className="bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">نمو المشتركين (آخر 6 أشهر)</h2>
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: '#a0a0a0' }} />
                    <YAxis tick={{ fill: '#a0a0a0' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
                    <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                    <Bar dataKey="subscribers" fill="#f97316" name="المشتركون الجدد"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;