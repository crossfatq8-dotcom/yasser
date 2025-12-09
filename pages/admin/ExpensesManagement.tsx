
import React, { useState, useMemo } from 'react';
import { useData } from '../../data/DataContext';
import { Expense, ExpenseCategory } from '../../types';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../../components/icons/IconComponents';

const ExpensesManagement: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedExpense(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (expense: Expense) => {
    setModalMode('edit');
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleConfirmDelete = () => {
    if (selectedExpense) {
      deleteExpense(selectedExpense.id);
    }
    setIsConfirmOpen(false);
    setSelectedExpense(null);
  };

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const expenseData: Expense = {
      id: selectedExpense?.id || `exp-${Date.now()}`,
      date: formData.get('date') as string,
      category: formData.get('category') as ExpenseCategory,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
    };
    
    if (modalMode === 'add') {
      addExpense(expenseData);
    } else {
      updateExpense(expenseData);
    }
    
    handleCloseModal();
  };
  
  const totalThisMonth = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">إدارة المصروفات</h1>
        <button onClick={handleAddClick} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
          <PlusIcon />
          إضافة مصروف
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">إجمالي مصروفات هذا الشهر</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{totalThisMonth.toFixed(2)} د.ك</p>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">التاريخ</th>
                <th scope="col" className="px-6 py-3">الفئة</th>
                <th scope="col" className="px-6 py-3">الوصف</th>
                <th scope="col" className="px-6 py-3">المبلغ</th>
                <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense: Expense) => (
                <tr key={expense.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="px-6 py-4 whitespace-nowrap">{expense.date}</td>
                  <td className="px-6 py-4">{expense.category}</td>
                  <td className="px-6 py-4 font-medium text-white">{expense.description}</td>
                  <td className="px-6 py-4 font-mono text-orange-400">{expense.amount.toFixed(2)} د.ك</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEditClick(expense)} className="font-medium text-blue-400 hover:underline"><EditIcon /></button>
                    <button onClick={() => handleDeleteClick(expense)} className="font-medium text-red-400 hover:underline mr-4"><DeleteIcon /></button>
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
        title={modalMode === 'add' ? 'إضافة مصروف جديد' : 'تعديل المصروف'}
      >
        <form onSubmit={handleSaveChanges} className="space-y-4 text-right">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">التاريخ</label>
              <input type="date" id="date" name="date" defaultValue={selectedExpense?.date || new Date().toISOString().split('T')[0]} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">الفئة</label>
              <select id="category" name="category" defaultValue={selectedExpense?.category} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
            <input type="text" id="description" name="description" defaultValue={selectedExpense?.description} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">المبلغ (د.ك)</label>
              <input type="number" step="0.01" id="amount" name="amount" defaultValue={selectedExpense?.amount} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>

          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="تأكيد الحذف">
        <p className="text-gray-300">هل أنت متأكد من أنك تريد حذف هذا المصروف؟</p>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
          <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">حذف</button>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesManagement;
