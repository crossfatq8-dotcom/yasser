import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { HomeIcon, MenuIcon, LogoutIcon, MoreIcon, HeartIcon, ClipboardListIcon, VacuumIcon } from '../../components/icons/IconComponents';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Top nav classes
  const topNavLinkClasses = "flex items-center px-4 py-2 text-md font-medium rounded-md transition-colors duration-200";
  const topNavActiveClass = "bg-gray-700 text-orange-400";
  const topNavInactiveClass = "text-gray-300 hover:bg-gray-700";

  // Bottom nav classes
  const bottomNavLinkClasses = "flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200";
  const bottomNavActiveClass = "text-orange-500";
  const bottomNavInactiveClass = "text-gray-400 hover:text-orange-400";
  
  const navItems = [
    { to: "/user", end: true, icon: <HomeIcon />, label: "الرئيسية" },
    { to: "/user/my-meals", end: false, icon: <MenuIcon />, label: "وجباتي" },
    { to: "/user/vacuum", end: false, icon: <VacuumIcon />, label: "فاكيوم" },
    { to: "/user/general-menu", end: false, icon: <ClipboardListIcon />, label: "المنيو" },
    { to: "/user/favorites", end: false, icon: <HeartIcon filled={false} />, label: "المفضلة" },
    { to: "/user/more", end: false, icon: <MoreIcon />, label: "المزيد" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Top Header */}
      <header className="bg-black shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-orange-500">CROSSFAT</h1>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `${topNavLinkClasses} ${isActive ? topNavActiveClass : topNavInactiveClass}`}>
                  {item.icon}<span className="mr-2">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400">مرحباً بك</p>
                </div>
                <button onClick={handleLogout} className={`${topNavLinkClasses} ${topNavInactiveClass} !p-3`} title="تسجيل الخروج">
                  <LogoutIcon />
                </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content with padding for bottom nav */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      
      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 shadow-lg z-50 flex justify-around">
         {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `${bottomNavLinkClasses} ${isActive ? bottomNavActiveClass : bottomNavInactiveClass}`}>
                {item.icon}
                <span>{item.label}</span>
            </NavLink>
         ))}
      </nav>
    </div>
  );
};

export default UserDashboard;