

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Package, Meal, DailyMenu, UserMealSelection, DiscountCode, InventoryItem, Supplier, Invoice, Driver, Area, InventoryTransaction, Employee, Expense, PayrollRecord, DailyDeliveryStatus, UserRole, PERMISSIONS, MealCategory, TransactionType, Subscription, DriverAssignment, VacuumPackage, Marinade, VacuumOrder, PartnerWithdrawal } from '../types';
import { 
    MOCK_USERS, MOCK_PACKAGES, MOCK_MEALS, MOCK_DAILY_MENU, MOCK_USER_SELECTIONS, MOCK_DISCOUNT_CODES,
    MOCK_INVENTORY, MOCK_SUPPLIERS, MOCK_INVOICES, MOCK_DRIVERS, MOCK_AREAS, MOCK_INVENTORY_TRANSACTIONS, MOCK_EMPLOYEES, MOCK_EXPENSES, MOCK_PAYROLL_RECORDS,
    MOCK_BANNER_IMAGES, MOCK_DELIVERY_STATUS, MOCK_VACUUM_PACKAGES, MOCK_MARINADES, MOCK_VACUUM_ORDERS, MOCK_PARTNER_WITHDRAWALS
} from './mockData';

// DataContext
interface DataContextType {
    // State
    users: User[];
    packages: Package[];
    meals: Meal[];
    dailyMenu: DailyMenu;
    userSelections: UserMealSelection[];
    discountCodes: DiscountCode[];
    inventory: InventoryItem[];
    suppliers: Supplier[];
    invoices: Invoice[];
    drivers: Driver[];
    areas: Area[];
    inventoryTransactions: InventoryTransaction[];
    employees: Employee[];
    expenses: Expense[];
    payrollRecords: PayrollRecord[];
    bannerImages: string[];
    logoUrl: string | null;
    deliveryStatuses: DailyDeliveryStatus[];
    whatsAppNumber: string;
    vacuumPackages: VacuumPackage[];
    marinades: Marinade[];
    vacuumOrders: VacuumOrder[];
    partnerWithdrawals: PartnerWithdrawal[];

    // Functions
    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    addPackage: (pkg: Package) => void;
    updatePackage: (pkg: Package) => void;
    deletePackage: (packageId: string) => void;
    addMeal: (meal: Meal) => void;
    updateMeal: (meal: Meal) => void;
    deleteMeal: (mealId: string) => void;
    updateUserSelections: (userId: string, date: string, selections: UserMealSelection['selections']) => void;
    addDiscountCode: (code: DiscountCode) => void;
    updateDiscountCode: (code: DiscountCode) => void;
    deleteDiscountCode: (codeId: string) => void;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
    updateInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (itemId: string) => void;
    addInventoryTransaction: (itemId: string, type: TransactionType, quantity: number) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (invoice: Invoice) => void;
    deleteInvoice: (invoiceId: string) => void;
    addDriver: (driver: Omit<Driver, 'id'>) => void;
    updateDriver: (driver: Driver) => void;
    deleteDriver: (driverId: string) => void;
    addArea: (area: Omit<Area, 'id'>) => void;
    updateArea: (area: Area) => void;
    deleteArea: (areaId: string) => void;
    addEmployee: (employee: Employee) => void;
    updateEmployee: (employee: Employee) => void;
    deleteEmployee: (employeeId: string) => void;
    addExpense: (expense: Expense) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
    addOrUpdatePayrollRecord: (record: PayrollRecord) => void;
    addBannerImage: (imageUrl: string) => void;
    deleteBannerImage: (imageUrl: string) => void;
    updateLogo: (logoUrl: string) => void;
    updateDeliveryStatus: (date: string, userId: string, status: 'delivered' | 'pending') => void;
    togglePauseDay: (userId: string, date: string) => void;
    toggleFavoriteMeal: (userId: string, mealId: string) => void;
    updateWhatsAppNumber: (number: string) => void;
    addVacuumOrder: (order: VacuumOrder) => void;
    addMarinade: (marinade: Marinade) => void;
    updateMarinade: (marinade: Marinade) => void;
    deleteMarinade: (marinadeId: string) => void;
    addPartnerWithdrawal: (withdrawal: PartnerWithdrawal) => void;
    updatePartnerWithdrawal: (withdrawal: PartnerWithdrawal) => void;
    deletePartnerWithdrawal: (withdrawalId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [packages, setPackages] = useState<Package[]>(MOCK_PACKAGES);
    const [meals, setMeals] = useState<Meal[]>(MOCK_MEALS);
    const [dailyMenu, setDailyMenu] = useState<DailyMenu>(MOCK_DAILY_MENU);
    const [userSelections, setUserSelections] = useState<UserMealSelection[]>(MOCK_USER_SELECTIONS);
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(MOCK_DISCOUNT_CODES);
    const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
    const [areas, setAreas] = useState<Area[]>(MOCK_AREAS);
    const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(MOCK_INVENTORY_TRANSACTIONS);
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(MOCK_PAYROLL_RECORDS);
    const [bannerImages, setBannerImages] = useState<string[]>(MOCK_BANNER_IMAGES);
    const [logoUrl, setLogoUrl] = useState<string | null>('https://picsum.photos/200/200?random=100');
    const [deliveryStatuses, setDeliveryStatuses] = useState<DailyDeliveryStatus[]>(MOCK_DELIVERY_STATUS);
    const [whatsAppNumber, setWhatsAppNumber] = useState('96512345678');
    const [vacuumPackages, setVacuumPackages] = useState<VacuumPackage[]>(MOCK_VACUUM_PACKAGES);
    const [marinades, setMarinades] = useState<Marinade[]>(MOCK_MARINADES);
    const [vacuumOrders, setVacuumOrders] = useState<VacuumOrder[]>(MOCK_VACUUM_ORDERS);
    const [partnerWithdrawals, setPartnerWithdrawals] = useState<PartnerWithdrawal[]>(MOCK_PARTNER_WITHDRAWALS);

    // --- Users ---
    const addUser = (user: User) => setUsers(prev => [...prev, user]);
    const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    const deleteUser = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));

    // --- Packages ---
    const addPackage = (pkg: Package) => setPackages(prev => [...prev, pkg]);
    const updatePackage = (updatedPkg: Package) => setPackages(prev => prev.map(p => p.id === updatedPkg.id ? updatedPkg : p));
    const deletePackage = (packageId: string) => {
        const isUsed = users.some(u => u.subscription?.packageId === packageId);
        if (isUsed) {
            alert('لا يمكن حذف نظام تسعير مستخدم من قبل مشترك.');
            return;
        }
        setPackages(prev => prev.filter(p => p.id !== packageId));
    };
    
    // --- Meals ---
    const addMeal = (meal: Meal) => {
        setMeals(prev => [...prev, meal]);
        setDailyMenu(prev => ({
            ...prev,
            meals: {
                ...prev.meals,
                [meal.category]: [...prev.meals[meal.category], meal.id]
            }
        }))
    };
    const updateMeal = (updatedMeal: Meal) => setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
    const deleteMeal = (mealId: string) => {
        const mealToDelete = meals.find(m => m.id === mealId);
        if (!mealToDelete) return;

        setMeals(prev => prev.filter(m => m.id !== mealId));
        setDailyMenu(prev => {
            const newMenu = { ...prev };
            newMenu.meals[mealToDelete.category] = newMenu.meals[mealToDelete.category].filter(id => id !== mealId);
            return newMenu;
        });
    };

    // --- User Selections ---
    const updateUserSelections = (userId: string, date: string, selections: UserMealSelection['selections']) => {
        setUserSelections(currentSelections => {
            const newSelections = [...currentSelections];
            const existingSelectionIndex = newSelections.findIndex(s => s.userId === userId && s.date === date);
            
            if (Object.keys(selections).length === 0 && existingSelectionIndex > -1) {
                 newSelections.splice(existingSelectionIndex, 1);
            } else if (existingSelectionIndex > -1) {
                newSelections[existingSelectionIndex] = { ...newSelections[existingSelectionIndex], selections };
            } else if (Object.keys(selections).length > 0) {
                newSelections.push({ userId, date, selections });
            }
            return newSelections;
        });
    };

    // --- Discount Codes ---
    const addDiscountCode = (code: DiscountCode) => setDiscountCodes(prev => [...prev, code]);
    const updateDiscountCode = (updatedCode: DiscountCode) => setDiscountCodes(prev => prev.map(c => c.id === updatedCode.id ? updatedCode : c));
    const deleteDiscountCode = (codeId: string) => setDiscountCodes(prev => prev.filter(c => c.id !== codeId));

    // --- Inventory ---
    const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => setInventory(prev => [...prev, { ...item, id: `inv-${Date.now()}` }]);
    const updateInventoryItem = (updatedItem: InventoryItem) => setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    const deleteInventoryItem = (itemId: string) => setInventory(prev => prev.filter(i => i.id !== itemId));
    const addInventoryTransaction = (itemId: string, type: TransactionType, quantity: number) => {
        const newTransaction: InventoryTransaction = {
            id: `t-${Date.now()}`,
            itemId,
            type,
            quantity,
            date: new Date().toISOString().split('T')[0],
        };
        setInventoryTransactions(prev => [...prev, newTransaction]);
    };

    // --- Suppliers & Invoices ---
    const addSupplier = (supplier: Omit<Supplier, 'id'>) => setSuppliers(prev => [...prev, { ...supplier, id: `sup-${Date.now()}` }]);
    const updateSupplier = (updatedSupplier: Supplier) => setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    const deleteSupplier = (supplierId: string) => setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    const addInvoice = (invoice: Invoice) => setInvoices(prev => [...prev, invoice]);
    const updateInvoice = (updatedInvoice: Invoice) => setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    const deleteInvoice = (invoiceId: string) => setInvoices(prev => prev.filter(i => i.id !== invoiceId));

    // --- Drivers & Areas ---
    const addDriver = (driver: Omit<Driver, 'id'>) => setDrivers(prev => [...prev, { ...driver, id: `drv-${Date.now()}` }]);
    const updateDriver = (updatedDriver: Driver) => setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    const deleteDriver = (driverId: string) => {
       const today = new Date();
       today.setHours(0, 0, 0, 0);

       const isDriverAssigned = users.some(user => {
            if (!user.subscription || user.subscription.status !== 'active') return false;

            const startDate = new Date(user.subscription.startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + user.subscription.duration);

            if (today < startDate || today >= endDate) return false;

            const driverForSub = findDriverForSubscriber(user, drivers);
            return driverForSub?.driver.id === driverId;
       });
       
       if(isDriverAssigned){
           alert("لا يمكن حذف سائق مرتبط بمشترك فعال حالياً.");
           return;
       }
       setDrivers(prev => prev.filter(d => d.id !== driverId));
    };
    
    const findDriverForSubscriber = (subscriber: User, drivers: Driver[]): { driver: Driver, shift: string } | null => {
        if (!subscriber.subscription) return null;
        const { areaId, deliveryShift } = subscriber.subscription;

        for (const driver of drivers) {
            for (const assignment of driver.assignments) {
                if (assignment.shift === deliveryShift && assignment.areaIds.includes(areaId)) {
                    return { driver, shift: deliveryShift };
                }
            }
        }
        return null;
    };


    const addArea = (area: Omit<Area, 'id'>) => setAreas(prev => [...prev, { ...area, id: `area-${Date.now()}` }]);
    const updateArea = (updatedArea: Area) => setAreas(prev => prev.map(a => a.id === updatedArea.id ? updatedArea : a));
    const deleteArea = (areaId: string) => {
        const isUsed = drivers.some(d => d.assignments.some(a => a.areaIds.includes(areaId)));
        if (isUsed) {
            alert('لا يمكن حذف منطقة مرتبطة بسائق.');
            return;
        }
        setAreas(prev => prev.filter(a => a.id !== areaId));
    };
    
    // --- Employees & Payroll ---
    const addEmployee = (employee: Employee) => setEmployees(prev => [...prev, employee]);
    const updateEmployee = (updatedEmployee: Employee) => setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    const deleteEmployee = (employeeId: string) => setEmployees(prev => prev.filter(e => e.id !== employeeId));
    const addOrUpdatePayrollRecord = (record: PayrollRecord) => {
        setPayrollRecords(prev => {
            const index = prev.findIndex(r => r.employeeId === record.employeeId && r.year === record.year && r.month === record.month);
            if (index > -1) {
                const newRecords = [...prev];
                newRecords[index] = record;
                return newRecords;
            }
            return [...prev, record];
        });
    };
    
    // --- Expenses ---
    const addExpense = (expense: Expense) => setExpenses(prev => [...prev, expense]);
    const updateExpense = (updatedExpense: Expense) => setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    const deleteExpense = (expenseId: string) => setExpenses(prev => prev.filter(e => e.id !== expenseId));

    // --- Appearance ---
    const addBannerImage = (imageUrl: string) => setBannerImages(prev => [...prev, imageUrl]);
    const deleteBannerImage = (imageUrl: string) => setBannerImages(prev => prev.filter(url => url !== imageUrl));
    const updateLogo = (newLogoUrl: string) => setLogoUrl(newLogoUrl);
    const updateWhatsAppNumber = (number: string) => setWhatsAppNumber(number);


    // --- Subscription Management ---
    const updateDeliveryStatus = (date: string, userId: string, status: 'delivered' | 'pending') => {
        setDeliveryStatuses(prev => {
            const newStatuses = [...prev];
            let dayStatus = newStatuses.find(ds => ds.date === date);
            if (dayStatus) {
                dayStatus.statuses[userId] = status;
            } else {
                newStatuses.push({ date, statuses: { [userId]: status } });
            }
            return newStatuses;
        });
    };

    const togglePauseDay = (userId: string, date: string) => {
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId && u.subscription) {
                const isPaused = u.subscription.pausedDays.includes(date);
                if (!isPaused && u.subscription.pauseDaysAvailable <= 0) {
                    alert("لقد استنفذت جميع أيام الإيقاف المتاحة.");
                    return u;
                }
                const newPausedDays = isPaused
                    ? u.subscription.pausedDays.filter(d => d !== date)
                    : [...u.subscription.pausedDays, date];
                
                const newPauseDaysAvailable = isPaused
                    ? u.subscription.pauseDaysAvailable + 1
                    : u.subscription.pauseDaysAvailable - 1;

                return {
                    ...u,
                    subscription: {
                        ...u.subscription,
                        pausedDays: newPausedDays,
                        pauseDaysAvailable: newPauseDaysAvailable,
                    }
                };
            }
            return u;
        }));
    };
    
    // --- Favorites ---
    const toggleFavoriteMeal = (userId: string, mealId: string) => {
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                const isFavorite = u.favoriteMealIds.includes(mealId);
                const newFavorites = isFavorite
                    ? u.favoriteMealIds.filter(id => id !== mealId)
                    : [...u.favoriteMealIds, mealId];
                return { ...u, favoriteMealIds: newFavorites };
            }
            return u;
        }));
    };

    // --- Vacuum ---
    const addVacuumOrder = (order: VacuumOrder) => setVacuumOrders(prev => [...prev, order]);
    const addMarinade = (marinade: Marinade) => setMarinades(prev => [...prev, marinade]);
    const updateMarinade = (updatedMarinade: Marinade) => setMarinades(prev => prev.map(m => m.id === updatedMarinade.id ? updatedMarinade : m));
    const deleteMarinade = (marinadeId: string) => setMarinades(prev => prev.filter(m => m.id !== marinadeId));
    
    // --- Partner Withdrawals ---
    const addPartnerWithdrawal = (withdrawal: PartnerWithdrawal) => setPartnerWithdrawals(prev => [...prev, withdrawal]);
    const updatePartnerWithdrawal = (updatedWithdrawal: PartnerWithdrawal) => setPartnerWithdrawals(prev => prev.map(w => w.id === updatedWithdrawal.id ? updatedWithdrawal : w));
    const deletePartnerWithdrawal = (withdrawalId: string) => setPartnerWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));

    const value: DataContextType = {
        users, packages, meals, dailyMenu, userSelections, discountCodes, inventory, suppliers, invoices, drivers, areas, inventoryTransactions, employees, expenses, payrollRecords, bannerImages, logoUrl, deliveryStatuses, whatsAppNumber, vacuumPackages, marinades, vacuumOrders, partnerWithdrawals,
        addUser, updateUser, deleteUser, addPackage, updatePackage, deletePackage, addMeal, updateMeal, deleteMeal, updateUserSelections, addDiscountCode, updateDiscountCode, deleteDiscountCode,
        addInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryTransaction, addSupplier, updateSupplier, deleteSupplier, addInvoice, updateInvoice, deleteInvoice, addDriver, updateDriver, deleteDriver, addArea, updateArea, deleteArea,
        addEmployee, updateEmployee, deleteEmployee, addExpense, updateExpense, deleteExpense, addOrUpdatePayrollRecord, addBannerImage, deleteBannerImage, updateLogo, updateWhatsAppNumber, updateDeliveryStatus, togglePauseDay, toggleFavoriteMeal,
        addVacuumOrder, addMarinade, updateMarinade, deleteMarinade,
        addPartnerWithdrawal, updatePartnerWithdrawal, deletePartnerWithdrawal,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};