

export enum UserRole {
  Admin = 'admin',
  Subscriber = 'subscriber',
  Employee = 'employee',
}

export interface Address {
  governorate: string;
  area: string;
  block: string;
  street: string;
  houseNumber: string;
  building?: string;
  floor?: string;
  apartment?: string;
}

export const DISLIKED_INGREDIENTS = [
    'ثوم', 'بصل', 'سبايسي', 'سمك', 'لحم', 'كوسة', 'باذنجان',
    'ملفوف', 'بروكلي', 'زهرة', 'شمندر', 'مشروم'
] as const;

export type DislikedIngredient = typeof DISLIKED_INGREDIENTS[number];


export interface User {
  id: string;
  name: string;
  phone: string;
  password: string; 
  role: UserRole.Admin | UserRole.Subscriber;
  address: Address;
  subscription?: Subscription;
  dislikedIngredients?: DislikedIngredient[];
  favoriteMealIds: string[];
}

export enum MealCategory {
  Breakfast = 'فطور',
  Lunch = 'غداء',
  Dinner = 'عشاء',
  Salad = 'سلطة',
  Dessert = 'سناك حلا',
  Soup = 'شوربة',
}

export interface Package {
  id: string;
  name: string;
  description: string;
  prices: {
    [MealCategory.Breakfast]: number;
    [MealCategory.Lunch]: number;
    [MealCategory.Dinner]: number;
    [MealCategory.Salad]: number;
    [MealCategory.Dessert]: number;
    [MealCategory.Soup]: number;
  };
}

export interface DiscountCode {
    id: string;
    code: string;
    discountAmounts: {
        '20'?: number;
        '26'?: number;
        '30'?: number;
    };
    applicablePackageIds: string[] | null; // null means all packages
}

export type PaymentMethod = 'link' | 'cash' | 'knet';
export type PaymentStatus = 'pending' | 'paid';
export type SubscriptionDuration = 6 | 12 | 20 | 26 | 30;
export type DeliveryShift = 'morning' | 'evening';


export interface Subscription {
  packageId: string;
  mealComposition: MealCategory[];
  startDate: string;
  duration: SubscriptionDuration;
  status: 'active' | 'expired' | 'paused';
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  discountCode?: string;
  deliveryShift: DeliveryShift;
  areaId: string;
  pausedDays: string[]; // dates when subscription is paused
  pauseDaysAvailable: number;
}

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  imageUrl: string;
  description: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DailyMenu {
  date: string; // YYYY-MM-DD
  meals: {
    [MealCategory.Breakfast]: string[]; // Array of Meal IDs
    [MealCategory.Lunch]: string[];
    [MealCategory.Dinner]: string[];
    [MealCategory.Salad]: string[];
    [MealCategory.Dessert]: string[];
    [MealCategory.Soup]: string[];
  };
}

export interface UserMealSelection {
  userId: string;
  date: string;
  selections: {
    [composedKey: string]: string; // Key is like 'Lunch-0', 'Lunch-1'. Value is Meal ID
  };
}

// Types for Reports
export interface InventoryItem {
  id: string;
  name: string;
  unit: 'kg' | 'g' | 'liter' | 'ml' | 'piece';
  minStock: number;
}

export type TransactionType = 'add' | 'withdraw';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  date: string; // YYYY-MM-DD
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  date: string; // YYYY-MM-DD
  items: {
    name: string;
    pricePerUnit: number;
    quantity: number;
    unit: string;
  }[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'credit' | 'installments';
}

export interface DriverAssignment {
  shift: DeliveryShift;
  areaIds: string[];
}

export interface Driver {
  id: string;
  name: string;
  assignments: DriverAssignment[];
}

export interface Area {
  id: string;
  name: string;
}

export enum ExpenseCategory {
    Salaries = 'رواتب',
    Rent = 'إيجار',
    Utilities = 'فواتير ومرافق',
    SupplierPurchases = 'مشتريات (من الموردين)',
    OtherPurchases = 'مشتريات أخرى',
    Maintenance = 'صيانة',
    Delivery = 'مصروفات توصيل',
    Printing = 'مصروفات طباعة',
    Marketing = 'دعاية وإعلان',
    Miscellaneous = 'مصروفات نثرية',
}

export interface Expense {
    id: string;
    date: string; // YYYY-MM-DD
    category: ExpenseCategory;
    description: string;
    amount: number;
}


export const PERMISSIONS = {
    dashboard: "عرض الرئيسية",
    menu: "إدارة المنيو",
    subscribers: "إدارة المشتركين",
    packages: "إدارة الباقات",
    discounts: "إدارة الخصومات",
    reports: "عرض التقارير",
    employees: "إدارة الموظفين",
    permissions: "إدارة الصلاحيات",
    expenses: "إدارة المصروفات",
    payroll: "إدارة الرواتب",
    suppliers: "إدارة الموردين",
    partnerWithdrawals: "مسحوبات الشركاء",
    appearance: "إدارة الواجهة",
    vacuumRecipes: "وصفات الفاكيوم",
    netProfit: "عرض صافي الربح",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type Permissions = {
    [K in PermissionKey]: boolean;
};

export interface Employee {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole.Employee;
  permissions: Permissions;
  photoUrl: string;
  phone: string;
  civilId: string;
  age: number;
  jobTitle: string;
  salary: number;
  address: string;
  bankName: string;
  iban: string;
  hireDate: string;
  startDate: string;
}

export interface PayrollRecord {
    employeeId: string;
    month: number; // 0-11
    year: number;
    attendanceDays: number;
    deductions: number;
    bonuses: number;
    advance: number;
}

export interface DailyDeliveryStatus {
    date: string; // YYYY-MM-DD
    statuses: {
        [userId: string]: 'delivered' | 'pending';
    };
}

// --- Vacuum Feature Types ---

export interface Marinade {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  refrigerationHours: number;
  cookingMethod: string;
  cookingTime: string;
  equipmentNeeded: string;
}

export interface VacuumPackage {
  id: string;
  name: string;
  type: 'chicken' | 'beef';
  weightGrams: 100 | 150 | 200;
  pricePerKg: number;
  imageUrl: string;
}

export interface VacuumOrderItem {
  packageId: string;
  marinadeId: string;
  quantityKg: number;
}

export interface VacuumOrder {
  id: string;
  userId: string;
  userName: string;
  orderDate: string; // YYYY-MM-DD
  deliveryDate: string; // YYYY-MM-DD (orderDate + 2 days)
  items: VacuumOrderItem[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  status: 'pending' | 'preparing' | 'delivered';
}

export interface PartnerWithdrawal {
    id: string;
    date: string; // YYYY-MM-DD
    partnerName: string;
    amount: number;
}