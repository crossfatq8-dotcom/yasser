import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPage: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">الشروط والأحكام</h1>
            <div className="bg-gray-900/50 p-6 rounded-xl shadow-sm space-y-4 text-gray-300">
                <h2 className="text-xl font-semibold text-orange-400">1. مقدمة</h2>
                <p>
                    مرحبًا بك في تطبيقنا. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
                </p>

                <h2 className="text-xl font-semibold text-orange-400">2. الاشتراك والدفع</h2>
                <p>
                    يتم تجديد الاشتراكات تلقائيًا ما لم يتم إلغاؤها. جميع المدفوعات غير قابلة للاسترداد.
                </p>

                <h2 className="text-xl font-semibold text-orange-400">3. سياسة الإيقاف</h2>
                <p>
                    يمكن للمشتركين إيقاف اشتراكهم لعدد محدود من الأيام. سيتم تمديد فترة الاشتراك بناءً على عدد الأيام التي تم إيقافها.
                </p>
                
                <h2 className="text-xl font-semibold text-orange-400">4. التوصيل</h2>
                <p>
                   نحن غير مسؤولين عن أي تأخير في التوصيل ناتج عن ظروف خارجة عن إرادتنا.
                </p>
                
                 <div className="pt-6 text-center">
                    <button onClick={() => navigate(-1)} className="px-8 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
                        العودة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;