
import React, { useState } from 'react';
import { DiscountCode, Package } from '../../types';
import Modal from '../../components/Modal';
import { useData } from '../../data/DataContext';

const DiscountManagement: React.FC = () => {
  const { packages, discountCodes, addDiscountCode, updateDiscountCode, deleteDiscountCode } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [allPackagesChecked, setAllPackagesChecked] = useState(false);

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedCode(null);
    setSelectedPackages([]);
    setAllPackagesChecked(false);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (code: DiscountCode) => {
    setModalMode('edit');
    setSelectedCode(code);
    setSelectedPackages(code.applicablePackageIds || []);
    setAllPackagesChecked(code.applicablePackageIds === null);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (code: DiscountCode) => {
    setSelectedCode(code);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCode(null);
  };

  const handleConfirmDelete = () => {
    if (selectedCode) {
      deleteDiscountCode(selectedCode.id);
    }
    setIsConfirmOpen(false);
    setSelectedCode(null);
  };

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const applicablePackageIds = allPackagesChecked ? null : selectedPackages;

    const discountAmounts: DiscountCode['discountAmounts'] = {};
    const d20 = formData.get('discount_20');
    const d26 = formData.get('discount_26');
    const d30 = formData.get('discount_30');

    if (d20) discountAmounts['20'] = Number(d20);
    if (d26) discountAmounts['26'] = Number(d26);
    if (d30) discountAmounts['30'] = Number(d30);


    const discountData: DiscountCode = {
      id: selectedCode?.id || `dc-${Date.now()}`,
      code: (formData.get('code') as string).toUpperCase(),
      discountAmounts,
      applicablePackageIds: applicablePackageIds,
    };

    if (modalMode === 'add') {
      addDiscountCode(discountData);
    } else {
      updateDiscountCode(discountData);
    }
    
    handleCloseModal();
  };
  
  const handlePackageSelection = (packageId: string) => {
    setSelectedPackages(prev => 
        prev.includes(packageId) 
        ? prev.filter(id => id !== packageId) 
        : [...prev, packageId]
    );
  };

  const getApplicablePackagesText = (pkgIds: string[] | null) => {
    if (pkgIds === null) {
        return <span className="text-green-400">جميع الباقات</span>;
    }
    if (pkgIds.length === 0) {
        return <span className="text-yellow-400">لا ينطبق على أي باقة</span>;
    }
    return pkgIds.map(id => packages.find(p => p.id === id)?.name || id).join(', ');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">إدارة الخصومات</h1>
        <button onClick={handleAddClick} className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
          إضافة كود خصم
        </button>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">الكود</th>
                <th scope="col" className="px-6 py-3">تفاصيل الخصم</th>
                <th scope="col" className="px-6 py-3">الباقات المطبقة</th>
                <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((code: DiscountCode) => (
                <tr key={code.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="px-6 py-4 font-mono text-lg font-medium text-orange-400 whitespace-nowrap">{code.code}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs">
                        {code.discountAmounts['20'] && <span><strong>20 يوم:</strong> {code.discountAmounts['20'].toFixed(2)} د.ك</span>}
                        {code.discountAmounts['26'] && <span><strong>26 يوم:</strong> {code.discountAmounts['26'].toFixed(2)} د.ك</span>}
                        {code.discountAmounts['30'] && <span><strong>30 يوم:</strong> {code.discountAmounts['30'].toFixed(2)} د.ك</span>}
                        {!code.discountAmounts['20'] && !code.discountAmounts['26'] && !code.discountAmounts['30'] && <span className="text-gray-400">لا يوجد</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getApplicablePackagesText(code.applicablePackageIds)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEditClick(code)} className="font-medium text-blue-400 hover:underline">تعديل</button>
                    <button onClick={() => handleDeleteClick(code)} className="font-medium text-red-400 hover:underline mr-4">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'إضافة كود خصم جديد' : 'تعديل كود الخصم'}
      >
        <form onSubmit={handleSaveChanges} className="space-y-4">
            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300">رمز الكود</label>
                <input type="text" id="code" name="code" defaultValue={selectedCode?.code || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
            </div>

            <fieldset className="border border-gray-600 p-4 rounded-md">
                <legend className="px-2 text-orange-400">مبالغ الخصم حسب مدة الاشتراك</legend>
                <p className="text-xs text-gray-400 mb-3">اترك الحقل فارغاً إذا كان الخصم لا ينطبق على مدة معينة.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="discount_20" className="block text-sm font-medium text-gray-300">خصم 20 يوم (د.ك)</label>
                        <input type="number" id="discount_20" name="discount_20" defaultValue={selectedCode?.discountAmounts?.[20] || ''} min="0.01" step="0.01" className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white" />
                    </div>
                    <div>
                        <label htmlFor="discount_26" className="block text-sm font-medium text-gray-300">خصم 26 يوم (د.ك)</label>
                        <input type="number" id="discount_26" name="discount_26" defaultValue={selectedCode?.discountAmounts?.[26] || ''} min="0.01" step="0.01" className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white" />
                    </div>
                    <div>
                        <label htmlFor="discount_30" className="block text-sm font-medium text-gray-300">خصم 30 يوم (د.ك)</label>
                        <input type="number" id="discount_30" name="discount_30" defaultValue={selectedCode?.discountAmounts?.[30] || ''} min="0.01" step="0.01" className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white" />
                    </div>
                </div>
            </fieldset>
            
            <fieldset className="border border-gray-600 p-4 rounded-md">
                <legend className="px-2 text-orange-400">تطبيق على الباقات</legend>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input id="allPackages" name="allPackages" type="checkbox" checked={allPackagesChecked} onChange={(e) => {
                            setAllPackagesChecked(e.target.checked);
                            if(e.target.checked) setSelectedPackages([])
                        }} className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-500 rounded focus:ring-orange-500" />
                        <label htmlFor="allPackages" className="mr-3 block text-sm font-medium text-gray-300">تطبيق على جميع الباقات</label>
                    </div>
                    <div className="pl-6 pt-2 border-r border-gray-600 mr-2">
                        <p className="text-sm text-gray-400 mb-2">أو اختر باقات محددة:</p>
                        <div className="space-y-1">
                            {packages.map(pkg => (
                                <div key={pkg.id} className="flex items-center">
                                    <input 
                                        id={`pkg-${pkg.id}`} 
                                        name={`pkg-${pkg.id}`} 
                                        type="checkbox" 
                                        checked={selectedPackages.includes(pkg.id)}
                                        onChange={() => handlePackageSelection(pkg.id)}
                                        disabled={allPackagesChecked}
                                        className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-500 rounded focus:ring-orange-500 disabled:opacity-50" 
                                    />
                                    <label htmlFor={`pkg-${pkg.id}`} className="mr-3 block text-sm font-medium text-gray-300 disabled:opacity-50">{pkg.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </fieldset>

            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="تأكيد الحذف">
        <p className="text-gray-300">هل أنت متأكد من أنك تريد حذف كود الخصم "{selectedCode?.code}"؟</p>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
          <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">حذف</button>
        </div>
      </Modal>
    </div>
  );
};

export default DiscountManagement;