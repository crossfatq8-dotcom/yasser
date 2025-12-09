
import React, { useState, useEffect } from 'react';
import { useData } from '../../data/DataContext';
import { getActiveSubscribersForDate, getTodayDateString } from './reportUtils';
import { Address, Driver, Area, DeliveryShift, DriverAssignment, User } from '../../types';
import { PrintIcon, EditIcon, DeleteIcon } from '../icons/IconComponents';
import Modal from '../Modal';

interface DeliveryUser extends User {
    isVacuum?: boolean;
}

const formatAddress = (address: Address) => {
    const { governorate, area, block, street, houseNumber, building, floor, apartment } = address;
    const main = `${governorate}، ${area}، ق${block}، ش${street}، م${houseNumber}`;
    const optional = [
        building ? `عمارة ${building}` : '',
        floor ? `دور ${floor}` : '',
        apartment ? `شقة ${apartment}` : ''
    ].filter(Boolean).join('، ');
    return optional ? `${main} (${optional})` : main;
};

// Management Modal Component
const ManageDriversModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { drivers, areas, addDriver, updateDriver, deleteDriver, addArea, updateArea, deleteArea } = useData();
    const [activeTab, setActiveTab] = useState<'drivers' | 'areas'>('drivers');
    
    // State for Driver editing
    const [driverName, setDriverName] = useState('');
    const [driverAssignments, setDriverAssignments] = useState<DriverAssignment[]>([]);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    // State for Area editing
    const [areaName, setAreaName] = useState('');
    const [editingArea, setEditingArea] = useState<Area | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setEditingDriver(null); setDriverName(''); setDriverAssignments([]);
            setEditingArea(null); setAreaName('');
        }
    }, [isOpen]);

    // Driver Handlers
    const handleDriverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAssignments = driverAssignments.filter(a => a.areaIds.length > 0);
        if (editingDriver) {
            updateDriver({ ...editingDriver, name: driverName, assignments: finalAssignments });
        } else {
            addDriver({ id: `drv-${Date.now()}`, name: driverName, assignments: finalAssignments });
        }
        setEditingDriver(null);
        setDriverName('');
        setDriverAssignments([]);
    };
    
    const handleDriverAreaSelection = (shift: DeliveryShift, areaId: string) => {
        setDriverAssignments(prev => {
            const newAssignments = [...prev];
            let shiftAssignment = newAssignments.find(a => a.shift === shift);
            if (!shiftAssignment) {
                shiftAssignment = { shift, areaIds: [] };
                newAssignments.push(shiftAssignment);
            }
            
            const areaExists = shiftAssignment.areaIds.includes(areaId);
            if(areaExists) {
                shiftAssignment.areaIds = shiftAssignment.areaIds.filter(id => id !== areaId);
            } else {
                shiftAssignment.areaIds.push(areaId);
            }
            return newAssignments;
        });
    };
    
    // Area Handlers
    const handleAreaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingArea) {
            updateArea({ ...editingArea, name: areaName });
        } else {
            addArea({ id: `area-${Date.now()}`, name: areaName });
        }
        setEditingArea(null);
        setAreaName('');
    }

    const shiftNames: { [key in DeliveryShift]: string } = {
        morning: 'الفترة الصباحية (6ص - 12ظ)',
        evening: 'الفترة المسائية (4م - 10م)'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إدارة السائقين والمناطق">
            <div className="border-b border-gray-600 mb-4">
                <nav className="-mb-px flex space-x-4 space-x-reverse" aria-label="Tabs">
                    <button onClick={() => setActiveTab('drivers')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'drivers' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                        السائقين
                    </button>
                    <button onClick={() => setActiveTab('areas')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'areas' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                        المناطق
                    </button>
                </nav>
            </div>
            
            {activeTab === 'drivers' && (
                <div>
                    <form onSubmit={handleDriverSubmit} className="space-y-4">
                        <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="اسم السائق" required className="w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                        
                        {(['morning', 'evening'] as DeliveryShift[]).map(shift => {
                            const currentAssignment = driverAssignments.find(a => a.shift === shift);
                            return (
                                <fieldset key={shift} className="border border-gray-600 p-3 rounded-md">
                                    <legend className="px-2 text-sm text-orange-400">{shiftNames[shift]}</legend>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                                        {areas.map(area => (
                                            <div key={area.id} className="flex items-center">
                                                <input id={`driver-${shift}-area-${area.id}`} type="checkbox" 
                                                    checked={currentAssignment?.areaIds.includes(area.id) || false}
                                                    onChange={() => handleDriverAreaSelection(shift, area.id)} 
                                                    className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-500 rounded focus:ring-orange-500" />
                                                <label htmlFor={`driver-${shift}-area-${area.id}`} className="mr-2 text-sm text-gray-300">{area.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            );
                        })}
                        
                        <div className="flex gap-2 justify-end">
                             <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">{editingDriver ? 'تحديث السائق' : 'إضافة سائق'}</button>
                            {editingDriver && <button type="button" onClick={() => { setEditingDriver(null); setDriverName(''); setDriverAssignments([]); }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400">إلغاء التعديل</button>}
                        </div>
                    </form>
                     <hr className="my-4 border-gray-600" />
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {drivers.map(driver => (
                            <li key={driver.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                <div>
                                    <span className="font-semibold">{driver.name}</span>
                                    {driver.assignments.map(a => (
                                        <span key={a.shift} className="text-xs text-gray-400 block">
                                            <strong>{shiftNames[a.shift]}:</strong> {a.areaIds.map(id => areas.find(area => area.id === id)?.name).join(', ') || 'لا يوجد'}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingDriver(driver); setDriverName(driver.name); setDriverAssignments(driver.assignments); }} className="text-blue-400"><EditIcon/></button>
                                    <button onClick={() => deleteDriver(driver.id)} className="text-red-400"><DeleteIcon/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
             {activeTab === 'areas' && (
                <div>
                    <form onSubmit={handleAreaSubmit} className="flex gap-2 mb-4">
                        <input type="text" value={areaName} onChange={e => setAreaName(e.target.value)} placeholder="اسم المنطقة الجديدة" required className="flex-grow bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">{editingArea ? 'تحديث' : 'إضافة'}</button>
                        {editingArea && <button type="button" onClick={() => { setEditingArea(null); setAreaName(''); }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400">إلغاء</button>}
                    </form>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {areas.map(area => (
                            <li key={area.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                <span>{area.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingArea(area); setAreaName(area.name); }} className="text-blue-400"><EditIcon/></button>
                                    <button onClick={() => deleteArea(area.id)} className="text-red-400"><DeleteIcon/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Modal>
    );
};


const DriversReport: React.FC = () => {
    const { users, drivers, vacuumOrders } = useData();
    const today = getTodayDateString();
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    
    const activeSubscribers = getActiveSubscribersForDate(today, users);

    const subscribersByDriverAndShift = activeSubscribers.reduce((acc, user) => {
        const result = findDriverForSubscriber(user, drivers, user.subscription!.deliveryShift, user.subscription!.areaId);
        if (result) {
            const { driver, shift } = result;
            const key = `${driver.id}-${shift}`;
            if (!acc[key]) {
                acc[key] = { driver, shift, subscribers: [] };
            }
            acc[key].subscribers.push(user);
        }
        return acc;
    }, {} as Record<string, { driver: Driver; shift: string; subscribers: DeliveryUser[] }>);

    // Integrate Vacuum Orders
    const vacuumOrdersForToday = vacuumOrders.filter(order => order.deliveryDate === today);
    vacuumOrdersForToday.forEach(order => {
        const user = users.find(u => u.id === order.userId);
        if (user && user.subscription) { // Assuming user still has a subscription to get areaId
            // Vacuum orders are assigned to the morning shift by default
            const result = findDriverForSubscriber(user, drivers, 'morning', user.subscription.areaId);
            if (result) {
                const { driver, shift } = result;
                const key = `${driver.id}-${shift}`;
                if (!subscribersByDriverAndShift[key]) {
                    subscribersByDriverAndShift[key] = { driver, shift, subscribers: [] };
                }
                // Avoid adding duplicates if user has both subscription and vacuum
                if (!subscribersByDriverAndShift[key].subscribers.some(sub => sub.id === user.id && sub.isVacuum)) {
                    subscribersByDriverAndShift[key].subscribers.push({ ...user, isVacuum: true });
                }
            }
        }
    });


    const reportData = Object.values(subscribersByDriverAndShift);

    const totalSlots = 6;
    const reportSlots = Array.from({ length: totalSlots }, (_, index) => {
        return reportData[index] || null;
    });

    const shiftNames: { [key in DeliveryShift]: string } = {
        morning: 'الفترة الصباحية (6ص - 12ظ)',
        evening: 'الفترة المسائية (4م - 10م)'
    };


    return (
         <div id="report-drivers">
            <style>
            {`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 15mm;
                    }
                    body * { visibility: hidden; }
                    #report-drivers, #report-drivers * { visibility: visible; }
                    #report-drivers { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .driver-column { page-break-inside: avoid; }
                }
            `}
            </style>
            <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-2xl font-semibold text-gray-200">تقرير السائقين ليوم: {today}</h2>
                <div className="flex gap-2">
                     <button
                        onClick={() => setIsManageModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        إدارة السائقين والمناطق
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reportSlots.map((slot, index) => {
                    if (slot) {
                        const { driver, shift, subscribers } = slot;
                        return (
                             <div key={`${driver.id}-${shift}`} className="driver-column bg-gray-700 rounded-lg overflow-hidden flex flex-col">
                                <div className="bg-gray-800 p-3 border-b-2 border-orange-500">
                                    <h3 className="text-lg font-bold text-white">
                                        {driver.name}
                                    </h3>
                                    <p className="text-sm text-gray-300">{shiftNames[shift as DeliveryShift]}</p>
                                </div>
                                <div className="p-3 space-y-3 overflow-y-auto flex-grow">
                                    {subscribers.map(user => (
                                        <div key={`${user.id}-${user.isVacuum ? 'v' : 's'}`} className="bg-gray-600/50 p-2 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <p className="text-white font-semibold">{user.name}</p>
                                                {user.isVacuum && (
                                                    <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">فاكيوم</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-300">{user.phone}</p>
                                            <p className="text-xs mt-1 text-gray-200">{formatAddress(user.address)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    } else {
                        return (
                            <div key={`placeholder-${index}`} className="bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center min-h-[200px]">
                                <span className="text-gray-500">خانة سائق فارغة</span>
                            </div>
                        )
                    }
                })}
            </div>

            <ManageDriversModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} />
        </div>
    );
};

// Helper function to find a driver for a specific delivery
const findDriverForSubscriber = (subscriber: User, drivers: Driver[], deliveryShift: DeliveryShift, areaId: string): { driver: Driver, shift: string } | null => {
    for (const driver of drivers) {
        for (const assignment of driver.assignments) {
            if (assignment.shift === deliveryShift && assignment.areaIds.includes(areaId)) {
                return { driver, shift: deliveryShift };
            }
        }
    }
    return null;
};


export default DriversReport;