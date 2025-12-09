import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Auth';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const rememberedCredential = localStorage.getItem('rememberedCredential');
    if (rememberedCredential) {
      setCredential(rememberedCredential);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const loggedInUser = auth.login(credential, password, rememberMe);
    if (loggedInUser) {
      if (loggedInUser.role === UserRole.Admin || loggedInUser.role === UserRole.Employee) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setError('بيانات الدخول غير صحيحة.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?random=99')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-2xl text-right">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">أهلاً بك</h1>
            <p className="mt-2 text-lg text-gray-300">سجل دخولك للمتابعة</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="credential" className="sr-only">اسم المستخدم أو رقم الهاتف</label>
              <input
                id="credential"
                name="credential"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border-2 border-orange-500/50 bg-gray-800 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm text-right"
                placeholder="اسم المستخدم أو رقم الهاتف"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">كلمة المرور</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border-2 border-orange-500/50 bg-gray-800 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm text-right"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-200">
                تذكرني
              </label>
            </div>
             <div className="text-sm">
              <Link to="/user/subscribe/low-calorie" className="font-medium text-orange-400 hover:text-orange-300">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-300"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;