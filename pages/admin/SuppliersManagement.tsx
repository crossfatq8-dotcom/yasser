import React, { useState, useEffect } from 'react';
import { useData } from '../../data/DataContext';
import { Supplier, Invoice } from '../../types';
import { PrintIcon, PlusIcon, EditIcon, DeleteIcon } from '../../components/icons/IconComponents';
import Modal from '../../components/Modal';

// Manage Suppliers Modal
const ManageSuppliersModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
    const [name, setName] = useState('');
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setEditingSupplier(null);
            setName('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            updateSupplier({ ...editingSupplier, name });
        } else {
            addSupplier({ id: `sup-${Date.now()}`, name });
        }
        setEditingSupplier(null);
        setName('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إدارة الموردين">
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="اسم المورد" required className="flex-grow bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">{editingSupplier ? 'تحديث' : 'إضافة'}</button>
                {editingSupplier && <button type="button" onClick={() => { setEditingSupplier(null); setName(''); }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400">إلغاء</button>}
            </form>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {suppliers.map(supplier => (
                    <li key={supplier.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                        <span>{supplier.name}</span>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingSupplier(supplier); setName(supplier.name); }} className="text-blue-400"><EditIcon/></button>
                            <button onClick={() => deleteSupplier(supplier.id)} className="text-red-400"><DeleteIcon/></button>
                        </div>
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

// Invoice Form Modal
const InvoiceFormModal: React.FC<{ isOpen: boolean; onClose: () => void; invoice: Invoice | null; }> = ({ isOpen, onClose, invoice }) => {
    const { suppliers, addInvoice, updateInvoice } = useData();
    const [formData, setFormData] = useState<Partial<Invoice>>({ items: [] });

    useEffect(() => {
        if (invoice) {
            setFormData(invoice);
        } else {
            setFormData({ date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', items: [{ name: '', pricePerUnit: 0, quantity: 1, unit: 'kg' }] });
        }
    }, [invoice, isOpen]);

    useEffect(() => {
        const total = (formData.items || []).reduce((sum, item) => {
            const price = item.pricePerUnit || 0;
            const qty = item.quantity || 0;
            return sum + (price * qty);
        }, 0);
        
        if (formData.totalAmount !== total) {
             setFormData(prev => ({ ...prev, totalAmount: total }));
        }
    }, [formData.items]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'paidAmount') ? Number(value) : value }));
    };

    const handleItemChange = (index: number, field: keyof Invoice['items'][number], value: string | number) => {
        const newItems = [...(formData.items || [])];
        const item = { ...newItems[index] };
        if (item) {
             if (field === 'quantity' || field === 'pricePerUnit') {
                (item as any)[field] = Number(value);
            } else {
                (item as any)[field] = value;
            }
            newItems[index] = item;
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };
    
    const addItem = () => {
        const newItems = [...(formData.items || []), { name: '', pricePerUnit: 0, quantity: 1, unit: 'kg' }];
        setFormData(prev => ({...prev, items: newItems as any}));
    };

    const removeItem = (index: number) => {
        const newItems = (formData.items || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = (formData.items || []).filter(item => item.name.trim() !== '');
        const finalData = { ...formData, items: finalItems };

        if (invoice) {
            updateInvoice(finalData as Invoice);
        } else {
            addInvoice({ id: `invc-${Date.now()}`, ...finalData } as Invoice);
        }
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">رقم الفاتورة</label>
                        <input type="text" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">المورد</label>
                        <select name="supplierId" value={formData.supplierId || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                            <option value="">اختر مورد</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">تاريخ الفاتورة</label>
                        <input type="date" name="date" value={formData.date || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">طريقة الدفع</label>
                        <select name="paymentMethod" value={formData.paymentMethod || 'cash'} onChange={handleChange} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white">
                            <option value="cash">كاش</option>
                            <option value="credit">آجل</option>
                            <option value="installments">دفعات</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">المبلغ الإجمالي (محسوب)</label>
                        <input type="number" step="0.01" name="totalAmount" value={formData.totalAmount ? formData.totalAmount.toFixed(2) : '0.00'} readOnly className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">المبلغ المدفوع</label>
                        <input type="number" step="0.01" name="paidAmount" value={formData.paidAmount || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                    </div>
                </div>

                <fieldset className="border border-gray-600 p-4 rounded-md">
                    <legend className="px-2 text-orange-400">الأصناف الموردة</legend>
                    <div className="grid grid-cols-12 gap-2 items-center text-xs text-gray-400 px-1 mb-2">
                        <div className="col-span-3">الصنف</div>
                        <div className="col-span-2">سعر الوحدة</div>
                        <div className="col-span-2">الكمية</div>
                        <div className="col-span-2">الوحدة</div>
                        <div className="col-span-2 text-center">الإجمالي</div>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(formData.items || []).map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <input type="text" placeholder="اسم الصنف" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="col-span-3 bg-gray-700 border-gray-500 rounded-md py-1 px-2 text-white text-sm" />
                                <input type="number" step="0.01" placeholder="السعر" value={item.pricePerUnit || ''} onChange={e => handleItemChange(index, 'pricePerUnit', e.target.value)} className="col-span-2 bg-gray-700 border-gray-500 rounded-md py-1 px-2 text-white text-sm" />
                                <input type="number" placeholder="الكمية" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="col-span-2 bg-gray-700 border-gray-500 rounded-md py-1 px-2 text-white text-sm" />
                                <select value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="col-span-2 bg-gray-700 border-gray-500 rounded-md py-1 px-2 text-white text-sm">
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="liter">liter</option>
                                    <option value="ml">ml</option>
                                    <option value="piece">piece</option>
                                </select>
                                <div className="col-span-2 bg-gray-800 text-center py-1 px-2 rounded-md text-sm text-orange-400 font-mono">
                                    {((item.pricePerUnit || 0) * (item.quantity || 0)).toFixed(2)}
                                </div>
                                <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center">
                                    <DeleteIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addItem} className="mt-3 text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" />
                        إضافة صنف
                    </button>
                </fieldset>

                 <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ</button>
                </div>
            </form>
        </Modal>
    )
}

const SuppliersManagement: React.FC = () => {
    const { suppliers, invoices, deleteInvoice } = useData();
    const [isSuppliersModalOpen, setIsSuppliersModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
    
    const invoicesBySupplier = suppliers.map(supplier => ({
        ...supplier,
        invoices: invoices.filter(inv => inv.supplierId === supplier.id)
                         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));

    const grandTotalPurchases = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const grandTotalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const grandTotalDue = grandTotalPurchases - grandTotalPaid;


    const handleAddInvoice = () => {
        setEditingInvoice(null);
        setIsInvoiceModalOpen(true);
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsInvoiceModalOpen(true);
    };

    const toggleInvoiceDetails = (invoiceId: string) => {
        setExpandedInvoiceId(prev => (prev === invoiceId ? null : invoiceId));
    };

    return (
        <div id="report-suppliers" className="space-y-6">
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 20mm; }
                    body * { visibility: hidden; }
                    #report-suppliers, #report-suppliers * { visibility: visible; }
                    #report-suppliers { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print, .no-print * { display: none !important; }
                    .details-row { display: table-row !important; } /* Ensure details are printed */
                }
            `}</style>
            <div className="flex justify-between items-center mb-4 no-print">
                <h1 className="text-4xl font-bold text-white">إدارة الموردين والفواتير</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsSuppliersModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">إدارة الموردين</button>
                    <button onClick={handleAddInvoice} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"><PlusIcon /> إضافة فاتورة</button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"><PrintIcon /> طباعة</button>
                </div>
            </div>

            <div className="space-y-6">
                {invoicesBySupplier.map(supplier => {
                    const supplierTotalPurchases = supplier.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
                    const supplierTotalPaid = supplier.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
                    const supplierTotalDue = supplierTotalPurchases - supplierTotalPaid;

                    return (
                        <div key={supplier.id} className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
                            <h3 className="text-lg font-bold text-orange-400 bg-gray-800 p-3">{supplier.name}</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-right text-gray-300">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-600">
                                        <tr>
                                            <th className="px-6 py-3">رقم الفاتورة</th>
                                            <th className="px-6 py-3">التاريخ</th>
                                            <th className="px-6 py-3">الإجمالي</th>
                                            <th className="px-6 py-3">المدفوع</th>
                                            <th className="px-6 py-3">المتبقي</th>
                                            <th className="px-6 py-3">الحالة</th>
                                            <th className="px-6 py-3 no-print">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplier.invoices.map(invoice => {
                                            const remaining = invoice.totalAmount - invoice.paidAmount;
                                            const isPaid = remaining <= 0;
                                            const isExpanded = expandedInvoiceId === invoice.id;
                                            return (
                                                <React.Fragment key={invoice.id}>
                                                    <tr className="border-b border-gray-600 hover:bg-gray-600/50 cursor-pointer" onClick={() => toggleInvoiceDetails(invoice.id)}>
                                                        <td className="px-6 py-4 font-mono text-white flex items-center gap-2">
                                                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                            {invoice.invoiceNumber}
                                                        </td>
                                                        <td className="px-6 py-4">{invoice.date}</td>
                                                        <td className="px-6 py-4 font-mono">{invoice.totalAmount.toFixed(2)} د.ك</td>
                                                        <td className="px-6 py-4 font-mono text-green-400">{invoice.paidAmount.toFixed(2)} د.ك</td>
                                                        <td className="px-6 py-4 font-mono font-bold text-orange-400">{remaining.toFixed(2)} د.ك</td>
                                                        <td className="px-6 py-4">
                                                            {isPaid ? (
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-900">مدفوعة</span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-200 text-yellow-900">مستحقة</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 no-print">
                                                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                                <button onClick={() => handleEditInvoice(invoice)} className="text-blue-400"><EditIcon/></button>
                                                                <button onClick={() => deleteInvoice(invoice.id)} className="text-red-400"><DeleteIcon/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="bg-gray-800 details-row">
                                                            <td colSpan={7} className="p-4">
                                                                <h4 className="font-semibold text-gray-200 mb-2">الأصناف الموردة:</h4>
                                                                {invoice.items.length > 0 ? (
                                                                     <table className="min-w-full text-xs text-right text-gray-300">
                                                                        <thead className="border-b border-gray-700">
                                                                            <tr>
                                                                                <th className="py-1 pr-2 text-right">الصنف</th>
                                                                                <th className="py-1 px-2 text-center">سعر الوحدة</th>
                                                                                <th className="py-1 px-2 text-center">الكمية</th>
                                                                                <th className="py-1 pl-2 text-center">الإجمالي</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {invoice.items.map((item, index) => (
                                                                                <tr key={index}>
                                                                                    <td className="py-1 pr-2">{item.name}</td>
                                                                                    <td className="py-1 px-2 font-mono text-center">{(item.pricePerUnit || 0).toFixed(2)}</td>
                                                                                    <td className="py-1 px-2 font-mono text-center">{item.quantity} {item.unit}</td>
                                                                                    <td className="py-1 pl-2 font-mono text-center">{((item.pricePerUnit || 0) * item.quantity).toFixed(2)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                ) : <p className="text-xs text-gray-400">لا توجد أصناف مسجلة لهذه الفاتورة.</p>}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                        {supplier.invoices.length === 0 && (
                                             <tr><td colSpan={7} className="text-center text-gray-400 py-4">لا توجد فواتير لهذا المورد.</td></tr>
                                        )}
                                    </tbody>
                                     <tfoot>
                                        <tr className="bg-gray-800 font-bold border-t-2 border-gray-500">
                                            <td colSpan={2} className="px-6 py-3 text-white">إجمالي المورد</td>
                                            <td className="px-6 py-3 font-mono">{supplierTotalPurchases.toFixed(2)} د.ك</td>
                                            <td className="px-6 py-3 font-mono text-green-400">{supplierTotalPaid.toFixed(2)} د.ك</td>
                                            <td className="px-6 py-3 font-mono text-orange-400">{supplierTotalDue.toFixed(2)} د.ك</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-orange-500">
                <h3 className="text-xl font-bold text-white mb-4">الملخص المالي العام</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400">إجمالي المشتريات</p>
                        <p className="text-2xl font-bold text-white mt-1">{grandTotalPurchases.toFixed(2)} د.ك</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400">إجمالي المدفوعات</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">{grandTotalPaid.toFixed(2)} د.ك</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400">إجمالي المستحق</p>
                        <p className="text-2xl font-bold text-orange-400 mt-1">{grandTotalDue.toFixed(2)} د.ك</p>
                    </div>
                </div>
            </div>

            <ManageSuppliersModal isOpen={isSuppliersModalOpen} onClose={() => setIsSuppliersModalOpen(false)} />
            <InvoiceFormModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} invoice={editingInvoice} />
        </div>
    );
};

export default SuppliersManagement;