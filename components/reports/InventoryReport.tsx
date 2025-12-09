import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../data/DataContext';
import { InventoryItem, InventoryTransaction, TransactionType } from '../../types';
import { PrintIcon, PlusIcon, EditIcon, DeleteIcon } from '../icons/IconComponents';
import Modal from '../Modal';

const TransactionLogModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
}> = ({ isOpen, onClose, item }) => {
    const { inventoryTransactions, addInventoryTransaction } = useData();
    const [type, setType] = useState<TransactionType>('add');
    const [quantity, setQuantity] = useState<number | ''>('');

    if (!item) return null;
    
    const transactions = inventoryTransactions
        .filter(t => t.itemId === item.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let runningBalance = transactions.reduce((acc, t) => acc + (t.type === 'add' ? t.quantity : -t.quantity), 0);
    
    const transactionsWithBalance = transactions.map(t => {
        const balanceAfter = runningBalance;
        runningBalance -= (t.type === 'add' ? t.quantity : -t.quantity);
        return { ...t, balanceAfter };
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity > 0) {
            addInventoryTransaction(item.id, type, Number(quantity));
            setQuantity('');
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`سجل الحركات: ${item.name}`}>
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-md space-y-3">
                    <h4 className="font-semibold text-lg text-white">تسجيل حركة جديدة</h4>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300">نوع الحركة</label>
                            <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                                <option value="add">إضافة كمية</option>
                                <option value="withdraw">سحب كمية</option>
                            </select>
                        </div>
                         <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300">الكمية</label>
                            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="0.01" step="0.01" required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                        </div>
                        <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">تسجيل</button>
                    </div>
                </form>

                <div className="max-h-80 overflow-y-auto">
                    <table className="min-w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-600 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">التاريخ</th>
                                <th className="px-4 py-2">الحركة</th>
                                <th className="px-4 py-2">الكمية</th>
                                <th className="px-4 py-2">الرصيد بعد الحركة</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-700">
                            {transactionsWithBalance.map(t => (
                                <tr key={t.id} className="border-b border-gray-600">
                                    <td className="px-4 py-2">{t.date}</td>
                                    <td className={`px-4 py-2 font-semibold ${t.type === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                                        {t.type === 'add' ? 'إضافة' : 'سحب'}
                                    </td>
                                    <td className="px-4 py-2">{t.quantity}</td>
                                    <td className="px-4 py-2 font-mono">{t.balanceAfter} {item.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {transactions.length === 0 && <p className="text-center text-gray-400 p-4">لا توجد حركات مسجلة لهذا الصنف.</p>}
                </div>
            </div>
        </Modal>
    );
}

const InventoryFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
}> = ({ isOpen, onClose, item }) => {
    const { addInventoryItem, updateInventoryItem } = useData();
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({ unit: 'kg' }); // Default value
        }
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'minStock' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item) {
            updateInventoryItem(formData as InventoryItem);
        } else {
            addInventoryItem(formData as Omit<InventoryItem, 'id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'تعديل الصنف' : 'إضافة صنف جديد للمخزون'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">اسم المنتج</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="minStock" className="block text-sm font-medium text-gray-300">الحد الأدنى للمخزون</label>
                        <input type="number" id="minStock" name="minStock" value={formData.minStock || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-300">الوحدة</label>
                        <select id="unit" name="unit" value={formData.unit || 'kg'} onChange={handleChange} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="liter">liter</option>
                            <option value="ml">ml</option>
                            <option value="piece">piece</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

const InventoryReport: React.FC = () => {
    const { inventory, inventoryTransactions, deleteInventoryItem } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const inventoryWithStock = useMemo(() => {
        return inventory.map(item => {
            const stock = inventoryTransactions
                .filter(t => t.itemId === item.id)
                .reduce((acc, t) => acc + (t.type === 'add' ? t.quantity : -t.quantity), 0);
            return { ...item, currentStock: stock };
        });
    }, [inventory, inventoryTransactions]);

    const handleAddItem = () => {
        setSelectedItem(null);
        setIsFormModalOpen(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsFormModalOpen(true);
    };
    
    const handleViewLog = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsLogModalOpen(true);
    };

    return (
        <div id="report-inventory">
             <style>
            {`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 20mm;
                    }
                    body * { visibility: hidden; }
                    #report-inventory, #report-inventory * { visibility: visible; }
                    #report-inventory { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}
            </style>
            <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-2xl font-semibold text-gray-200">تقرير المخزون</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddItem}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        <PlusIcon />
                        إضافة صنف
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        <PrintIcon />
                        طباعة
                    </button>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-600">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم المنتج</th>
                            <th scope="col" className="px-6 py-3">الرصيد المتوفر</th>
                            <th scope="col" className="px-6 py-3">الحد الأدنى</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3 no-print">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryWithStock.map(item => {
                            const isLowStock = item.currentStock <= item.minStock;
                            return (
                                <tr key={item.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.name}</td>
                                    <td className={`px-6 py-4 font-bold ${isLowStock ? 'text-red-400' : ''}`}>{item.currentStock} {item.unit}</td>
                                    <td className="px-6 py-4">{item.minStock} {item.unit}</td>
                                    <td className="px-6 py-4">
                                        {isLowStock ? (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-900">
                                                بحاجة لإعادة طلب
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-900">
                                                متوفر
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 no-print">
                                        <div className="flex gap-4">
                                            <button onClick={() => handleViewLog(item)} className="font-medium text-blue-400 hover:underline">عرض السجل</button>
                                            <button onClick={() => handleEditItem(item)} className="text-blue-400"><EditIcon/></button>
                                            <button onClick={() => deleteInventoryItem(item.id)} className="text-red-400"><DeleteIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <InventoryFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} item={selectedItem} />
            <TransactionLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} item={selectedItem} />
        </div>
    );
};

export default InventoryReport;