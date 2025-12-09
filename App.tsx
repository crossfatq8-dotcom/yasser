

import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardHome from './pages/admin/DashboardHome';
import MenuManagement from './pages/admin/MenuManagement';
import SubscriberManagement from './pages/admin/SubscriberManagement';
import PackageManagement from './pages/admin/PackageManagement';
import DiscountManagement from './pages/admin/DiscountManagement';
import UserDashboard from './pages/user/UserDashboard';
import MySubscription from './pages/user/MySubscription';
import { UserRole, Employee as EmployeeType, PermissionKey } from './types';
import { DataProvider } from './data/DataContext';
import Reports from './pages/admin/Reports';
import EmployeesManagement from './pages/admin/EmployeesManagement';
import { AuthProvider, useAuth } from './Auth';
import EmployeePermissions from './pages/admin/EmployeePermissions';
import ExpensesManagement from './pages/admin/ExpensesManagement';
import PayrollManagement from './pages/admin/PayrollManagement';
import SuppliersManagement from './pages/admin/SuppliersManagement';
import UserHomePage from './pages/user/UserHomePage';
import MyMealsPage from './pages/user/MyMealsPage';
import PackageSubscriptionPage from './pages/user/PackageSubscriptionPage';
import AppearanceManagement from './pages/admin/AppearanceManagement';
import MorePage from './pages/user/MorePage';
import EditProfilePage from './pages/user/EditProfilePage';
import TermsPage from './pages/user/TermsPage';
import FavoriteMealsPage from './pages/user/FavoriteMealsPage';
import GeneralMenuPage from './pages/user/GeneralMenuPage';
import VacuumPage from './pages/user/VacuumPage';
import VacuumRecipesManagement from './pages/admin/VacuumRecipesManagement';
import NetProfitPage from './pages/admin/NetProfitPage';
import PartnerWithdrawalsManagement from './pages/admin/PartnerWithdrawalsManagement';


const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles: UserRole[], permissionKey?: PermissionKey }> = ({ children, allowedRoles, permissionKey }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
     return <Navigate to="/unauthorized" replace />;
  }
  
  // Check for employee-specific permissions
  if (user.role === UserRole.Employee && permissionKey) {
      const employee = user as EmployeeType;
      if (!employee.permissions[permissionKey]) {
          return <Navigate to="/unauthorized" replace />;
      }
  }

  return <>{children}</>;
};


const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <HashRouter>
          <div className="bg-gray-100 min-h-screen font-sans">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/user/subscribe/:packageId" element={<PackageSubscriptionPage />} />
              
              <Route 
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="dashboard"><DashboardHome /></ProtectedRoute>} />
                <Route path="menu" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="menu"><MenuManagement /></ProtectedRoute>} />
                <Route path="subscribers" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="subscribers"><SubscriberManagement /></ProtectedRoute>} />
                <Route path="packages" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="packages"><PackageManagement /></ProtectedRoute>} />
                <Route path="discounts" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="discounts"><DiscountManagement /></ProtectedRoute>} />
                <Route path="appearance" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="appearance"><AppearanceManagement /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="reports"><Reports /></ProtectedRoute>} />
                <Route path="employees" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="employees"><EmployeesManagement /></ProtectedRoute>} />
                <Route path="permissions" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><EmployeePermissions /></ProtectedRoute>} />
                <Route path="expenses" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="expenses"><ExpensesManagement /></ProtectedRoute>} />
                <Route path="payroll" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="payroll"><PayrollManagement /></ProtectedRoute>} />
                <Route path="suppliers" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="suppliers"><SuppliersManagement /></ProtectedRoute>} />
                <Route path="partner-withdrawals" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="partnerWithdrawals"><PartnerWithdrawalsManagement /></ProtectedRoute>} />
                <Route path="vacuum-recipes" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="vacuumRecipes"><VacuumRecipesManagement /></ProtectedRoute>} />
                <Route path="net-profit" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]} permissionKey="netProfit"><NetProfitPage /></ProtectedRoute>} />
              </Route>

              <Route 
                path="/user"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Subscriber]}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<UserHomePage />} />
                <Route path="my-meals" element={<MyMealsPage />} />
                <Route path="vacuum" element={<VacuumPage />} />
                <Route path="general-menu" element={<GeneralMenuPage />} />
                <Route path="favorites" element={<FavoriteMealsPage />} />
                <Route path="my-info" element={<MySubscription />} />
                <Route path="more" element={<MorePage />} />
                <Route path="edit-profile" element={<EditProfilePage />} />
                <Route path="terms" element={<TermsPage />} />
              </Route>

              <Route path="/" element={<RootRedirector />} />
              <Route path="/unauthorized" element={
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold text-red-600">غير مصرح بالدخول</h1>
                    <p className="text-gray-600 mt-4">ليس لديك الصلاحية للوصول إلى هذه الصفحة.</p>
                </div>
              }/>
            </Routes>
          </div>
        </HashRouter>
      </AuthProvider>
    </DataProvider>
  );
};

const RootRedirector: React.FC = () => {
  const { user } = useAuth();
  if (user) {
    if (user.role === UserRole.Admin || user.role === UserRole.Employee) {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/user" />;
  }
  return <Navigate to="/login" />;
};


export default App;