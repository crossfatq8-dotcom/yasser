import React, { useState } from 'react';
import { useData } from '../../data/DataContext';
import { Marinade } from '../../types';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../../components/icons/IconComponents';

const VacuumRecipesManagement: React.FC = () => {
    const { marinades, addMarinade, updateMarinade, deleteMarinade } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedMarinade, setSelectedMarinade] = useState<Marinade | null>(null);

    const handleAddClick = () => {
        setModalMode('add');
        setSelectedMarinade(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (marinade: Marinade) => {
        setModalMode('edit');
        setSelectedMarinade(marinade);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (marinadeId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الوصفة؟')) {
            deleteMarinade(marinadeId);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMarinade(null);
    };

    const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const marinadeData: Marinade = {
            id: selectedMarinade?.id || `mar-${Date.now()}`,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            ingredients: formData.get('ingredients') as string,
            instructions: formData.get('instructions') as string,
            refrigerationHours: Number(formData.get('refrigerationHours')),
            cookingMethod: formData.get('cookingMethod') as string,
            cookingTime: formData.get('cookingTime') as string,
            equipmentNeeded: formData.get('equipmentNeeded') as string,
        };

        if (modalMode === 'add') {
            addMarinade(marinadeData);
        } else {
            updateMarinade(marinadeData);
        }

        handleCloseModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">إدارة وصفات الفاكيوم</h1>
                <button onClick={handleAddClick} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
                    <PlusIcon />
                    إضافة وصفة
                </button>
            </div>

            <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-600">
                            <tr>
                                <th scope="col" className="px-6 py-3">اسم الوصفة</th>
                                <th scope="col" className="px-6 py-3">طريقة الطهو</th>
                                <th scope="col" className="px-6 py-3">وقت الطهو</th>
                                <th scope="col" className="px-6 py-3">ساعات التبريد</th>
                                <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marinades.map((marinade) => (
                                <tr key={marinade.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                                    <td className="px-6 py-4 font-medium text-white">{marinade.name}</td>
                                    <td className="px-6 py-4">{marinade.cookingMethod}</td>
                                    <td className="px-6 py-4">{marinade.cookingTime}</td>
                                    <td className="px-6 py-4">{marinade.refrigerationHours} ساعات</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleEditClick(marinade)} className="font-medium text-blue-400 hover:underline"><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(marinade.id)} className="font-medium text-red-400 hover:underline mr-4"><DeleteIcon /></button>
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
                title={modalMode === 'add' ? 'إضافة وصفة جديدة' : 'تعديل الوصفة'}
            >
                <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">اسم الوصفة</label>
                            <input type="text" id="name" name="name" defaultValue={selectedMarinade?.name || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="refrigerationHours" className="block text-sm font-medium text-gray-300">ساعات التبريد اللازمة</label>
                            <input type="number" id="refrigerationHours" name="refrigerationHours" defaultValue={selectedMarinade?.refrigerationHours || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">الوصف</label>
                        <input type="text" id="description" name="description" defaultValue={selectedMarinade?.description || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div>
                        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-300">المكونات والمقادير</label>
                        <textarea id="ingredients" name="ingredients" rows={4} defaultValue={selectedMarinade?.ingredients || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" placeholder="مثال: لومي أسود: 1 ملعقة..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-300">طريقة التحضير</label>
                        <textarea id="instructions" name="instructions" rows={4} defaultValue={selectedMarinade?.instructions || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white"></textarea>
                    </div>
                    <fieldset className="border border-gray-600 p-4 rounded-md">
                        <legend className="px-2 text-orange-400">تعليمات الطهو للعميل</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="cookingMethod" className="block text-sm font-medium text-gray-300">طريقة الطهو</label>
                                <input type="text" id="cookingMethod" name="cookingMethod" defaultValue={selectedMarinade?.cookingMethod || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" placeholder="مثال: شوي على الجريل"/>
                            </div>
                            <div>
                                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-300">وقت الطهو</label>
                                <input type="text" id="cookingTime" name="cookingTime" defaultValue={selectedMarinade?.cookingTime || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" placeholder="مثال: 15-20 دقيقة"/>
                            </div>
                            <div>
                                <label htmlFor="equipmentNeeded" className="block text-sm font-medium text-gray-300">الأجهزة المستخدمة</label>
                                <input type="text" id="equipmentNeeded" name="equipmentNeeded" defaultValue={selectedMarinade?.equipmentNeeded || ''} required className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white" placeholder="مثال: جريل، فرن"/>
                            </div>
                        </div>
                    </fieldset>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VacuumRecipesManagement;