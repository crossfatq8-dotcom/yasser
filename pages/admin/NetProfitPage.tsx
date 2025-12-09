

import React, { useState, useMemo } from 'react';
import { useData } from '../../data/DataContext';
import { Subscription, Package, DiscountCode, User, UserRole } from '../../types';

// Helper function to calculate price, copied from DashboardHome
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

const NetProfitPage: React.FC = () => {
    const { users, packages, discountCodes, vacuumOrders, expenses, invoices, partnerWithdrawals } = useData();
    const [filter, setFilter] = useState<'total' | 'thisMonth'>('total');

    const financials = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const isThisMonth = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        };
        
        // Filter data based on selection
        const filteredUsers = filter === 'thisMonth' 
            ? users.filter(u => u.subscription && isThisMonth(u.subscription.paymentDate)) 
            : users;
            
        const filteredVacuumOrders = filter === 'thisMonth'
            ? vacuumOrders.filter(o => isThisMonth(o.orderDate))
            : vacuumOrders;

        const filteredExpenses = filter === 'thisMonth'
            ? expenses.filter(e => isThisMonth(e.date))
            : expenses;

        const filteredInvoices = filter === 'thisMonth'
            ? invoices.filter(i => isThisMonth(i.date))
            : invoices;
        
        const filteredPartnerWithdrawals = filter === 'thisMonth'
            ? partnerWithdrawals.filter(w => isThisMonth(w.date))
            : partnerWithdrawals;
        
        // Calculations
        const packageRevenue = filteredUsers
            .filter(u => u.role === UserRole.Subscriber && u.subscription?.paymentStatus === 'paid')
            .reduce((total, user) => total + calculateSubscriptionPrice(user.subscription, packages, discountCodes), 0);

        const vacuumRevenue = filteredVacuumOrders.reduce((total, order) => total + order.totalPrice, 0);
        
        const totalRevenue = packageRevenue + vacuumRevenue;

        const generalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
        const supplierPayments = filteredInvoices.reduce((total, invoice) => total + invoice.paidAmount, 0);
        const partnerWithdrawalsTotal = filteredPartnerWithdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);
        
        const totalLiabilities = generalExpenses + supplierPayments + partnerWithdrawalsTotal;
        
        const netProfit = totalRevenue - totalLiabilities;
        
        return {
            packageRevenue,
            vacuumRevenue,
            totalRevenue,
            generalExpenses,
            supplierPayments,
            partnerWithdrawalsTotal,
            totalLiabilities,
            netProfit,
        };
    }, [filter, users, packages, discountCodes, vacuumOrders, expenses, invoices, partnerWithdrawals]);

    const formatCurrency = (amount: number) => `${amount.toFixed(3)} د.ك`;
    
    const netProfitColor = financials.netProfit >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">صافي الربح</h1>
                <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setFilter('total')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'total' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        الإجمالي الكلي
                    </button>
                    <button 
                        onClick={() => setFilter('thisMonth')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'thisMonth' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        هذا الشهر
                    </button>
                </div>
            </div>

            <div className={`bg-gray-800 p-6 rounded-lg text-center border-t-4 ${financials.netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                <p className="text-lg text-gray-400">صافي الربح</p>
                <p className={`text-5xl font-extrabold my-2 ${netProfitColor}`}>
                    {formatCurrency(financials.netProfit)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Revenues Section */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-600 pb-2">تفاصيل الإيرادات</h2>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">إيرادات الباقات</span>
                        <span className="font-mono font-semibold text-white">{formatCurrency(financials.packageRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">إيرادات الفاكيوم</span>
                        <span className="font-mono font-semibold text-white">{formatCurrency(financials.vacuumRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-600 pt-3 mt-3">
                        <span className="font-bold text-lg text-green-400">إجمالي الإيرادات</span>
                        <span className="font-mono font-bold text-lg text-green-400">{formatCurrency(financials.totalRevenue)}</span>
                    </div>
                </div>

                {/* Liabilities Section */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-600 pb-2">تفاصيل الالتزامات</h2>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-300">المصروفات العامة</span>
                        <span className="font-mono font-semibold text-white">{formatCurrency(financials.generalExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">مدفوعات الموردين</span>
                        <span className="font-mono font-semibold text-white">{formatCurrency(financials.supplierPayments)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-300">مسحوبات الشركاء</span>
                        <span className="font-mono font-semibold text-white">{formatCurrency(financials.partnerWithdrawalsTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-600 pt-3 mt-3">
                        <span className="font-bold text-lg text-red-400">إجمالي الالتزامات</span>
                        <span className="font-mono font-bold text-lg text-red-400">{formatCurrency(financials.totalLiabilities)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetProfitPage;