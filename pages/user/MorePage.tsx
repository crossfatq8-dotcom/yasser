import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { SubscriptionIcon, EditIcon, TermsIcon, LogoutIcon } from '../../components/icons/IconComponents';

const MorePage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { to: "/user/my-info", icon: <SubscriptionIcon />, label: "بياناتي واشتراكي" },
        { to: "/user/edit-profile", icon: <EditIcon />, label: "تعديل بياناتي" },
        { to: "/user/terms", icon: <TermsIcon />, label: "الشروط والأحكام" },
    ];

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">المزيد</h1>
            <div className="bg-gray-900/50 rounded-xl shadow-sm space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center p-4 text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                        <div className="text-orange-500">{item.icon}</div>
                        <span className="mr-4 font-semibold">{item.label}</span>
                        <span className="mr-auto text-gray-500">&larr;</span>
                    </Link>
                ))}
                
                <div className="p-4">
                    <button
                        onClick={() => alert('ميزة تغيير اللغة ستكون متاحة قريباً!')}
                        className="w-full flex items-center p-4 text-white hover:bg-gray-800/50 rounded-lg transition-colors text-right"
                    >
                        <div className="text-orange-500">🌐</div>
                        <span className="mr-4 font-semibold">تغيير اللغة (العربية)</span>
                        <span className="mr-auto text-gray-500">&larr;</span>
                    </button>
                </div>
                
                 <div className="p-4 !pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 bg-red-600/20 text-red-400 font-bold py-3 px-6 rounded-lg hover:bg-red-600/40 transition-colors"
                    >
                        <LogoutIcon />
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MorePage;