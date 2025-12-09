

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { HomeIcon, MenuIcon, UsersIcon, LogoutIcon, PackageIcon, DiscountIcon, ReportsIcon, BriefcaseIcon, PermissionsIcon, ExpensesIcon, CalculatorIcon, TruckIcon, PhotoIcon, RecipeIcon, ChartBarIcon, BanknotesIcon } from '../../components/icons/IconComponents';
import { UserRole, Employee, PERMISSIONS, PermissionKey } from '../../types';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navLinkClasses = "flex items-center px-4 py-3 text-lg font-semibold rounded-lg transition-colors duration-200";
  const activeClass = "bg-orange-500 text-white";
  const inactiveClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const navItems: { to: string, icon: React.ReactNode, label: string, permissionKey: PermissionKey }[] = [
      { to: "/admin", icon: <HomeIcon />, label: "الرئيسية", permissionKey: 'dashboard' },
      { to: "/admin/menu", icon: <MenuIcon />, label: "إدارة المنيو", permissionKey: 'menu' },
      { to: "/admin/subscribers", icon: <UsersIcon />, label: "إدارة المشتركين", permissionKey: 'subscribers' },
      { to: "/admin/packages", icon: <PackageIcon />, label: "إدارة الباقات", permissionKey: 'packages' },
      { to: "/admin/discounts", icon: <DiscountIcon />, label: "إدارة الخصومات", permissionKey: 'discounts' },
      { to: "/admin/appearance", icon: <PhotoIcon />, label: "إدارة الواجهة", permissionKey: 'appearance' },
      { to: "/admin/vacuum-recipes", icon: <RecipeIcon />, label: "وصفات الفاكيوم", permissionKey: 'vacuumRecipes' },
      { to: "/admin/reports", icon: <ReportsIcon />, label: "التقارير", permissionKey: 'reports' },
      { to: "/admin/employees", icon: <BriefcaseIcon />, label: "إدارة الموظفين", permissionKey: 'employees' },
      { to: "/admin/permissions", icon: <PermissionsIcon />, label: "صلاحيات الموظفين", permissionKey: 'permissions' },
      { to: "/admin/expenses", icon: <ExpensesIcon />, label: "إدارة المصروفات", permissionKey: 'expenses' },
      { to: "/admin/payroll", icon: <CalculatorIcon />, label: "كشف الرواتب", permissionKey: 'payroll' },
      { to: "/admin/suppliers", icon: <TruckIcon />, label: "إدارة الموردين", permissionKey: 'suppliers' },
      { to: "/admin/partner-withdrawals", icon: <BanknotesIcon />, label: "مسحوبات الشركاء", permissionKey: 'partnerWithdrawals' },
      { to: "/admin/net-profit", icon: <ChartBarIcon />, label: "صافي الربح", permissionKey: 'netProfit' },
  ];

  const filteredNavItems = user?.role === UserRole.Admin 
    ? navItems 
    : navItems.filter(item => user?.role === UserRole.Employee && (user as Employee).permissions[item.permissionKey]);

  return (
    <div className="flex h-screen bg-gray-800">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <div className="text-center py-4 mb-6">
          <h2 className="text-2xl font-bold">لوحة التحكم</h2>
          <p className="text-sm text-orange-400">{user?.name}</p>
        </div>
        <nav className="flex-grow space-y-2">
          {filteredNavItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === "/admin"} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
                  {item.icon}<span className="mr-3">{item.label}</span>
              </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
           <button onClick={handleLogout} className={`${navLinkClasses} w-full text-gray-300 hover:bg-red-700 hover:text-white`}>
            <LogoutIcon /><span className="mr-3">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;