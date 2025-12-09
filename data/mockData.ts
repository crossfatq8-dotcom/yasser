

import { User, UserRole, Meal, MealCategory, DailyMenu, UserMealSelection, Package, DiscountCode, InventoryItem, Supplier, Invoice, Driver, Area, DeliveryShift, InventoryTransaction, Employee, Expense, ExpenseCategory, PayrollRecord, PERMISSIONS, DailyDeliveryStatus, VacuumPackage, Marinade, VacuumOrder, Address, DislikedIngredient, PartnerWithdrawal } from '../types';

// Helper to create dates relative to today
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const MOCK_BANNER_IMAGES: string[] = [
    'https://picsum.photos/800/300?random=101',
    'https://picsum.photos/800/300?random=102',
    'https://picsum.photos/800/300?random=103',
    'https://picsum.photos/800/300?random=104',
    'https://picsum.photos/800/300?random=105',
    'https://picsum.photos/800/300?random=106',
    'https://picsum.photos/800/300?random=107',
    'https://picsum.photos/800/300?random=108',
];


export const MOCK_PACKAGES: Package[] = [
  {
    id: 'low-calorie',
    name: 'لو كالوري',
    description: '75 جرام بروتين / 75 جرام كارب',
    prices: {
        [MealCategory.Breakfast]: 0.5,
        [MealCategory.Lunch]: 0.8,
        [MealCategory.Dinner]: 0.9,
        [MealCategory.Salad]: 0.3,
        [MealCategory.Dessert]: 0.35,
        [MealCategory.Soup]: 0.2,
    },
  },
  {
    id: 'beauty-life',
    name: 'بيوتي لايف',
    description: '85جرام بروتين / 85 جرام كارب',
    prices: {
        [MealCategory.Breakfast]: 0.750,
        [MealCategory.Lunch]: 0.95,
        [MealCategory.Dinner]: 1.2,
        [MealCategory.Salad]: 0.3,
        [MealCategory.Dessert]: 0.35,
        [MealCategory.Soup]: 0.2,
    },
  },
  {
    id: 'slim-life',
    name: 'سلم لايف',
    description: '100 جرام بروتين / 100 جرام كارب',
    prices: {
        [MealCategory.Breakfast]: 0.8,
        [MealCategory.Lunch]: 1.1,
        [MealCategory.Dinner]: 1.45,
        [MealCategory.Salad]: 0.3,
        [MealCategory.Dessert]: 0.35,
        [MealCategory.Soup]: 0.2,
    },
  },
  {
    id: 'lifestyle',
    name: 'لايف ستايل',
    description: '120 جرام بروتين / 120 جرام كارب',
    prices: {
        [MealCategory.Breakfast]: 0.85,
        [MealCategory.Lunch]: 1.25,
        [MealCategory.Dinner]: 1.6,
        [MealCategory.Salad]: 0.3,
        [MealCategory.Dessert]: 0.35,
        [MealCategory.Soup]: 0.2,
    },
  },
  {
    id: 'life-fitness',
    name: 'لايف فتنس',
    description: '150 جرام بروتين / 150 جرام كارب',
    prices: {
        [MealCategory.Breakfast]: 0.9,
        [MealCategory.Lunch]: 1.4,
        [MealCategory.Dinner]: 1.8,
        [MealCategory.Salad]: 0.3,
        [MealCategory.Dessert]: 0.35,
        [MealCategory.Soup]: 0.2,
    },
  },
  {
    id: 'oversize',
    name: 'أوفر سايز',
    description: '200 جرام بروتين / 200 جرام كارب',
    prices: {
        [MealCategory.Breakfast]: 1.05,
        [MealCategory.Lunch]: 1.65,
        [MealCategory.Dinner]: 1.95,
        [MealCategory.Salad]: 0.3,
        [MealCategory.Dessert]: 0.35,
        [MealCategory.Soup]: 0.2,
    },
  }
];

export const MOCK_DISCOUNT_CODES: DiscountCode[] = [
    {
        id: 'dc-1',
        code: 'SAVE10',
        discountAmounts: { '20': 5, '26': 7, '30': 10 },
        applicablePackageIds: null, // All packages
    },
    {
        id: 'dc-2',
        code: 'LOWCAL',
        discountAmounts: { '30': 15 },
        applicablePackageIds: ['low-calorie'],
    }
];

export const MOCK_AREAS: Area[] = [
    { id: 'area-1', name: 'حولي' },
    { id: 'area-2', name: 'السالمية' },
    { id: 'area-3', name: 'مشرف' },
    { id: 'area-4', name: 'مدينة الكويت' },
];

export const MOCK_DRIVERS: Driver[] = [
    { 
        id: 'drv-1', 
        name: 'محمد', 
        assignments: [
            { shift: 'morning', areaIds: ['area-1', 'area-2'] }
        ]
    },
    { 
        id: 'drv-2', 
        name: 'خالد', 
        assignments: [
            { shift: 'evening', areaIds: ['area-3', 'area-4'] }
        ]
    },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'المدير العام',
    phone: '0500000000',
    password: '1234',
    role: UserRole.Admin,
    address: { governorate: '', area: '', block: '', street: '', houseNumber: '' },
    favoriteMealIds: [],
  },
  {
    id: 'user-1',
    name: 'أحمد محمود',
    phone: '0512345678',
    password: '1111',
    role: UserRole.Subscriber,
    address: {
      governorate: 'حولي',
      area: 'السالمية',
      block: '5',
      street: '10',
      houseNumber: '15',
    },
    subscription: {
      packageId: 'low-calorie',
      mealComposition: [MealCategory.Lunch, MealCategory.Dinner],
      startDate: getRelativeDate(0),
      duration: 30,
      status: 'active',
      paymentDate: getRelativeDate(-2),
      paymentMethod: 'knet',
      paymentStatus: 'paid',
      deliveryShift: 'morning',
      areaId: 'area-2',
      pausedDays: [],
      pauseDaysAvailable: 3,
    },
    dislikedIngredients: ['سمك', 'سبايسي'],
    favoriteMealIds: ['l1', 'd3'],
  },
  {
    id: 'user-2',
    name: 'فاطمة علي',
    phone: '0598765432',
    password: '2222',
    role: UserRole.Subscriber,
    address: {
      governorate: 'العاصمة',
      area: 'مدينة الكويت',
      block: '2',
      street: 'صالح شهاب',
      houseNumber: '33',
      building: 'برج السلام',
      floor: '12',
      apartment: '12A'
    },
    subscription: {
      packageId: 'slim-life',
      mealComposition: [MealCategory.Lunch, MealCategory.Lunch, MealCategory.Dinner, MealCategory.Soup],
      startDate: getRelativeDate(0),
      duration: 20,
      status: 'active',
      paymentDate: getRelativeDate(0),
      paymentMethod: 'link',
      paymentStatus: 'pending',
      discountCode: 'SAVE10',
      deliveryShift: 'evening',
      areaId: 'area-4',
      pausedDays: [],
      pauseDaysAvailable: 3,
    },
    dislikedIngredients: ['ثوم'],
    favoriteMealIds: [],
  },
];

export const MOCK_MEALS: Meal[] = [
  // Breakfasts
  { id: 'b1', name: 'شوفان بالفواكه', category: MealCategory.Breakfast, imageUrl: 'https://picsum.photos/400/300?random=1', description: 'شوفان صحي مع الفواكه الموسمية الطازجة.', macros: { calories: 320, protein: 12, carbs: 45, fat: 10 } },
  { id: 'b2', name: 'بيض أومليت بالخضار', category: MealCategory.Breakfast, imageUrl: 'https://picsum.photos/400/300?random=2', description: 'بيض مخفوق مع تشكيلة من الخضروات الطازجة.', macros: { calories: 280, protein: 20, carbs: 8, fat: 18 } },
  { id: 'b3', name: 'بان كيك بروتين', category: MealCategory.Breakfast, imageUrl: 'https://picsum.photos/400/300?random=3', description: 'بان كيك غني بالبروتين مع قليل من شراب القيقب.', macros: { calories: 400, protein: 25, carbs: 35, fat: 15 } },
  // Lunches
  { id: 'l1', name: 'صدور دجاج مشوية مع كينوا', category: MealCategory.Lunch, imageUrl: 'https://picsum.photos/400/300?random=4', description: 'صدور دجاج متبلة ومشوية تقدم مع الكينوا.', macros: { calories: 550, protein: 45, carbs: 40, fat: 20 } },
  { id: 'l2', name: 'سلمون بالفرن مع بطاطا حلوة', category: MealCategory.Lunch, imageUrl: 'https://picsum.photos/400/300?random=5', description: 'قطعة سلمون طازجة مع بطاطا حلوة مشوية.', macros: { calories: 600, protein: 40, carbs: 38, fat: 30 } },
  { id: 'l3', name: 'ستيك لحم مع خضار سوتيه', category: MealCategory.Lunch, imageUrl: 'https://picsum.photos/400/300?random=6', description: 'شريحة لحم بقري فاخرة مع خضروات موسمية.', macros: { calories: 620, protein: 50, carbs: 25, fat: 35 } },
  // Dinners
  { id: 'd1', name: 'سلطة سيزر بالدجاج', category: MealCategory.Dinner, imageUrl: 'https://picsum.photos/400/300?random=7', description: 'سلطة سيزر كلاسيكية مع قطع دجاج مشوي.', macros: { calories: 420, protein: 35, carbs: 15, fat: 25 } },
  { id: 'd2', name: 'زبادي يوناني بالمكسرات', category: MealCategory.Dinner, imageUrl: 'https://picsum.photos/400/300?random=8', description: 'وجبة عشاء خفيفة ومغذية.', macros: { calories: 350, protein: 22, carbs: 20, fat: 20 } },
  { id: 'd3', name: 'سمك فيليه أبيض مع بروكلي', category: MealCategory.Dinner, imageUrl: 'https://picsum.photos/400/300?random=9', description: 'سمك فيليه خفيف مطهو على البخار مع بروكلي.', macros: { calories: 400, protein: 38, carbs: 10, fat: 22 } },
  // Salads
  { id: 'sa1', name: 'سلطة يونانية', category: MealCategory.Salad, imageUrl: 'https://picsum.photos/400/300?random=10', description: 'خضروات طازجة مع جبنة فيتا وزيتون.', macros: { calories: 250, protein: 8, carbs: 12, fat: 18 } },
  { id: 'sa2', name: 'سلطة تبولة', category: MealCategory.Salad, imageUrl: 'https://picsum.photos/400/300?random=11', description: 'بقدونس، طماطم، برغل بصلصة الليمون.', macros: { calories: 220, protein: 5, carbs: 20, fat: 13 } },
  // Desserts
  { id: 'de1', name: 'تشيز كيك بروتين', category: MealCategory.Dessert, imageUrl: 'https://picsum.photos/400/300?random=12', description: 'قطعة تشيز كيك صحية وغنية بالبروتين.', macros: { calories: 180, protein: 15, carbs: 10, fat: 9 } },
  { id: 'de2', name: 'كرات الطاقة', category: MealCategory.Dessert, imageUrl: 'https://picsum.photos/400/300?random=13', description: 'كرات من التمر والشوفان والمكسرات.', macros: { calories: 150, protein: 5, carbs: 18, fat: 7 } },
  // Soups
  { id: 'so1', name: 'شوربة عدس', category: MealCategory.Soup, imageUrl: 'https://picsum.photos/400/300?random=14', description: 'شوربة عدس غنية وكريمية.', macros: { calories: 230, protein: 12, carbs: 30, fat: 7 } },
  { id: 'so2', name: 'شوربة فطر', category: MealCategory.Soup, imageUrl: 'https://picsum.photos/400/300?random=15', description: 'شوربة فطر طازج بالكريمة الخفيفة.', macros: { calories: 200, protein: 7, carbs: 15, fat: 13 } },
];


export const MOCK_DAILY_MENU: DailyMenu = {
  date: getRelativeDate(0),
  meals: {
    [MealCategory.Breakfast]: ['b1', 'b2', 'b3'],
    [MealCategory.Lunch]: ['l1', 'l2', 'l3'],
    [MealCategory.Dinner]: ['d1', 'd2', 'd3'],
    [MealCategory.Salad]: ['sa1', 'sa2'],
    [MealCategory.Dessert]: ['de1', 'de2'],
    [MealCategory.Soup]: ['so1', 'so2'],
  },
};

export const MOCK_USER_SELECTIONS: UserMealSelection[] = [
  {
    userId: 'user-1',
    date: getRelativeDate(0),
    selections: { 'غداء-0': 'l2', 'عشاء-0': 'd3' },
  },
  {
    userId: 'user-2',
    date: getRelativeDate(0),
    selections: { 'غداء-0': 'l1', 'غداء-1': 'l3', 'عشاء-0': 'd1', 'شوربة-0': 'so1' },
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv-1', name: 'صدور دجاج', unit: 'kg', minStock: 10 },
    { id: 'inv-2', name: 'أرز بسمتي', unit: 'kg', minStock: 20 },
    { id: 'inv-3', name: 'زيت زيتون', unit: 'liter', minStock: 5 },
    { id: 'inv-4', name: 'بروكلي', unit: 'kg', minStock: 5 },
];

export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
    { id: 't-1', itemId: 'inv-1', type: 'add', quantity: 50, date: getRelativeDate(-2) },
    { id: 't-2', itemId: 'inv-1', type: 'withdraw', quantity: 5, date: getRelativeDate(-1) },
    { id: 't-3', itemId: 'inv-1', type: 'withdraw', quantity: 7, date: getRelativeDate(0) },
    { id: 't-4', itemId: 'inv-2', type: 'add', quantity: 40, date: getRelativeDate(-5) },
    { id: 't-5', itemId: 'inv-2', type: 'withdraw', quantity: 10, date: getRelativeDate(-2) },
    { id: 't-6', itemId: 'inv-3', type: 'add', quantity: 10, date: getRelativeDate(-10) },
    { id: 't-7', itemId: 'inv-4', type: 'add', quantity: 15, date: getRelativeDate(-1) },
    { id: 't-8', itemId: 'inv-4', type: 'withdraw', quantity: 6, date: getRelativeDate(0) },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'شركة الأغذية المتحدة' },
    { id: 'sup-2', name: 'مزارع الخضروات الطازجة' },
];

export const MOCK_INVOICES: Invoice[] = [
    { 
        id: 'invc-1', invoiceNumber: '2024-001', supplierId: 'sup-1', date: getRelativeDate(-15),
        items: [
            { name: 'دجاج كامل', pricePerUnit: 2.5, quantity: 50, unit: 'kg' },
            { name: 'لحم بقري', pricePerUnit: 4, quantity: 30, unit: 'kg' },
        ],
        totalAmount: 245, paidAmount: 245, paymentMethod: 'cash'
    },
    { 
        id: 'invc-2', invoiceNumber: '2024-002', supplierId: 'sup-2', date: getRelativeDate(-10),
        items: [
             { name: 'طماطم', pricePerUnit: 0.5, quantity: 100, unit: 'kg' },
             { name: 'خيار', pricePerUnit: 0.4, quantity: 80, unit: 'kg' },
        ],
        totalAmount: 82, paidAmount: 50, paymentMethod: 'credit'
    },
];

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: 'emp-1', name: 'علي حسن', username: 'ali', password: 'password', role: UserRole.Employee,
        permissions: { ...Object.fromEntries(Object.keys(PERMISSIONS).map(k => [k, true])) as any }, // Full permissions
        photoUrl: 'https://i.pravatar.cc/150?u=emp1', phone: '98765432', civilId: '123456789012', age: 34,
        jobTitle: 'مدير المطبخ', salary: 1200, address: 'الكويت', bankName: 'بنك الكويت الوطني', iban: 'KW81NBOK0000000000001234567890',
        hireDate: '2022-01-15', startDate: '2022-02-01'
    },
    {
        id: 'emp-2', name: 'نورة سالم', username: 'noora', password: 'password', role: UserRole.Employee,
        permissions: {
            dashboard: true, menu: true, subscribers: true, packages: false, discounts: false, 
            reports: true, employees: false, permissions: false, expenses: false, payroll: false, suppliers: true,
            appearance: true, vacuumRecipes: true, netProfit: true, partnerWithdrawals: false,
        },
        photoUrl: 'https://i.pravatar.cc/150?u=emp2', phone: '12345678', civilId: '098765432109', age: 28,
        jobTitle: 'خدمة العملاء', salary: 800, address: 'الكويت', bankName: 'بنك الخليج', iban: 'KW54GULB0000000000009876543210',
        hireDate: '2023-05-20', startDate: '2023-06-01'
    }
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'exp-1', date: getRelativeDate(-5), category: ExpenseCategory.Rent, description: 'إيجار شهر يوليو', amount: 1500 },
    { id: 'exp-2', date: getRelativeDate(-3), category: ExpenseCategory.Utilities, description: 'فاتورة كهرباء', amount: 250 },
    { id: 'exp-3', date: getRelativeDate(-2), category: ExpenseCategory.Marketing, description: 'حملة إعلانية انستغرام', amount: 300 },
    { id: 'exp-4', date: getRelativeDate(-1), category: ExpenseCategory.OtherPurchases, description: 'شراء أطباق تغليف', amount: 120 },
    { id: 'exp-5', date: getRelativeDate(-1), category: ExpenseCategory.Printing, description: 'طباعة ملصقات', amount: 50 },
];

export const MOCK_PARTNER_WITHDRAWALS: PartnerWithdrawal[] = [
    { id: 'pw-1', date: getRelativeDate(-10), partnerName: 'شريك أ', amount: 500 },
    { id: 'pw-2', date: getRelativeDate(-2), partnerName: 'شريك ب', amount: 750 },
];

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

export const MOCK_PAYROLL_RECORDS: PayrollRecord[] = [
    { employeeId: 'emp-1', month: currentMonth, year: currentYear, attendanceDays: 30, deductions: 50, bonuses: 100, advance: 0 },
    { employeeId: 'emp-2', month: currentMonth, year: currentYear, attendanceDays: 28, deductions: 0, bonuses: 50, advance: 200 },
];

export const MOCK_DELIVERY_STATUS: DailyDeliveryStatus[] = [
    {
        date: getRelativeDate(0),
        statuses: {
            'user-1': 'pending',
            'user-2': 'pending'
        }
    }
];

// --- VACUUM MOCK DATA ---
export const MOCK_VACUUM_PACKAGES: VacuumPackage[] = [
    { id: 'vac-c-100', name: 'فاكيوم شرائح دجاج 100 جرام', type: 'chicken', weightGrams: 100, pricePerKg: 5.000, imageUrl: 'https://picsum.photos/400/300?random=201' },
    { id: 'vac-c-150', name: 'فاكيوم شرائح دجاج 150 جرام', type: 'chicken', weightGrams: 150, pricePerKg: 5.000, imageUrl: 'https://picsum.photos/400/300?random=202' },
    { id: 'vac-c-200', name: 'فاكيوم شرائح دجاج 200 جرام', type: 'chicken', weightGrams: 200, pricePerKg: 5.000, imageUrl: 'https://picsum.photos/400/300?random=203' },
    { id: 'vac-b-100', name: 'فاكيوم ستيك لحم 100 جرام', type: 'beef', weightGrams: 100, pricePerKg: 7.000, imageUrl: 'https://picsum.photos/400/300?random=204' },
    { id: 'vac-b-150', name: 'فاكيوم ستيك لحم 150 جرام', type: 'beef', weightGrams: 150, pricePerKg: 7.000, imageUrl: 'https://picsum.photos/400/300?random=205' },
    { id: 'vac-b-200', name: 'فاكيوم ستيك لحم 200 جرام', type: 'beef', weightGrams: 200, pricePerKg: 7.000, imageUrl: 'https://picsum.photos/400/300?random=206' },
];

const commonMarinadeProps = {
    cookingMethod: 'شوي على الجريل',
    cookingTime: '15-20 دقيقة',
    equipmentNeeded: 'جريل أو مقلاة شواء',
};

export const MOCK_MARINADES: Marinade[] = [
    { 
        id: 'mar-1', 
        name: 'البهارات الكويتية', 
        description: 'خلطة بهارات تقليدية غنية بنكهة الأصالة.',
        ingredients: 'لومي أسود، دارسين، هيل، كركم، فلفل أسود، ملح.',
        instructions: 'تخلط جميع المكونات وتفرك بها قطع اللحم أو الدجاج جيداً.',
        refrigerationHours: 4,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-2', 
        name: 'تتبيلة مجبوس', 
        description: 'نكهة المجبوس الكويتي الأصيل في تتبيلة خاصة.',
        ingredients: 'بهارات مجبوس جاهزة، معجون طماطم، بصل مفروم، ثوم مهروس، زيت.',
        instructions: 'يخلط المعجون مع البهارات والبصل والثوم والزيت، وتنقع بها القطع.',
        refrigerationHours: 6,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-3', 
        name: 'ليمون وزعفران', 
        description: 'مزيج منعش وفاخر يضيف لوناً وطعماً رائعاً.',
        ingredients: 'عصير ليمون طازج، زعفران منقوع، زيت زيتون، ملح وفلفل أبيض.',
        instructions: 'تخلط المكونات جيداً وتنقع بها القطع.',
        refrigerationHours: 2,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-4', 
        name: 'باربيكيو مدخن', 
        description: 'التتبيلة الأمريكية الكلاسيكية للشواء.',
        ingredients: 'صوص باربيكيو، بابريكا مدخنة، بودرة ثوم، بودرة بصل، سكر بني.',
        instructions: 'تدهن القطع بالخليط وتترك لتمتص النكهة.',
        refrigerationHours: 8,
        ...commonMarinadeProps,
        cookingMethod: 'شوي على الفحم أو بالفرن'
    },
    { 
        id: 'mar-5', 
        name: 'أعشاب وليمون', 
        description: 'نكهة البحر الأبيض المتوسط المنعشة والصحية.',
        ingredients: 'روزماري، زعتر، أوريجانو، بشر ليمون، ثوم مهروس، زيت زيتون.',
        instructions: 'تخلط الأعشاب مع باقي المكونات وتفرك بها القطع.',
        refrigerationHours: 3,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-6', 
        name: 'ترياكي حلو', 
        description: 'المذاق الياباني الشهير بلمسة حلوة.',
        ingredients: 'صوص صويا، سكر، زنجبيل طازج، ثوم، خل الأرز.',
        instructions: 'تخلط المكونات على نار هادئة حتى يذوب السكر ثم تترك لتبرد وتستخدم للتتبيل.',
        refrigerationHours: 4,
        ...commonMarinadeProps,
        cookingMethod: 'تشويح سريع في مقلاة (Stir-fry)'
    },
    { 
        id: 'mar-7', 
        name: 'تتبيلة تندوري', 
        description: 'النكهة الهندية الأصيلة للدجاج المشوي.',
        ingredients: 'زبادي، بهارات تندوري، زنجبيل، ثوم، عصير ليمون.',
        instructions: 'يخلط الزبادي مع البهارات والزنجبيل والثوم والليمون، وتنقع بها قطع الدجاج.',
        refrigerationHours: 12,
        ...commonMarinadeProps,
        cookingMethod: 'فرن عالي الحرارة أو جريل'
    },
    { 
        id: 'mar-8', 
        name: 'بهارات شاورما', 
        description: 'سر نكهة الشاورما اللذيذة للحم والدجاج.',
        ingredients: 'سبع بهارات، قرفة، هيل، قرنفل، بودرة ثوم، عصير ليمون، زيت زيتون.',
        instructions: 'تخلط جميع البهارات مع الليمون والزيت، وتتبل بها الشرائح.',
        refrigerationHours: 8,
        ...commonMarinadeProps,
        cookingMethod: 'شوي عمودي أو تشويح في مقلاة'
    },
    { 
        id: 'mar-9', 
        name: 'هريسة حارة', 
        description: 'لمسة شمال أفريقية حارة ومنعشة.',
        ingredients: 'معجون هريسة، كمون، كزبرة، زيت زيتون، ملح.',
        instructions: 'يخلط معجون الهريسة مع البهارات والزيت، وتدهن به القطع جيداً.',
        refrigerationHours: 4,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-10', 
        name: 'ثوم وأعشاب', 
        description: 'مزيج كلاسيكي يناسب جميع الأذواق.',
        ingredients: 'بودرة ثوم، بقدونس مجفف، زعتر بري، زيت زيتون، ملح وفلفل.',
        instructions: 'تخلط المكونات الجافة مع زيت الزيتون وتفرك بها قطع اللحم أو الدجاج.',
        refrigerationHours: 2,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-11', 
        name: 'بهارات كيجن', 
        description: 'نكهة لويزيانا الجريئة والحارة.',
        ingredients: 'بابريكا، فلفل كايين، بودرة بصل، بودرة ثوم، فلفل أسود، أوريغانو.',
        instructions: 'تخلط جميع البهارات الجافة وتستخدم لتتبيل الدجاج أو اللحم قبل الشواء.',
        refrigerationHours: 3,
        ...commonMarinadeProps,
    },
    { 
        id: 'mar-12', 
        name: 'خردل وشبت', 
        description: 'تتبيلة أوروبية منعشة مثالية مع السلمون والدجاج.',
        ingredients: 'خردل ديجون، شبت طازج مفروم، عصير ليمون، زيت زيتون.',
        instructions: 'تخلط المكونات جيداً وتدهن بها القطع قبل الطهي.',
        refrigerationHours: 1,
        ...commonMarinadeProps,
    },
];

export const MOCK_VACUUM_ORDERS: VacuumOrder[] = [
    {
        id: 'vo-1',
        userId: 'user-1',
        userName: 'أحمد محمود',
        orderDate: getRelativeDate(0),
        deliveryDate: getRelativeDate(2),
        items: [
            { packageId: 'vac-c-150', marinadeId: 'mar-4', quantityKg: 2 },
            { packageId: 'vac-b-200', marinadeId: 'mar-1', quantityKg: 1 },
        ],
        totalPrice: (2 * 5.000) + (1 * 7.000), // 17.000
        paymentMethod: 'knet',
        deliveryAddress: MOCK_USERS.find(u => u.id === 'user-1')?.address as Address,
        status: 'pending'
    },
    {
        id: 'vo-2',
        userId: 'user-2',
        userName: 'فاطمة علي',
        orderDate: getRelativeDate(-2),
        deliveryDate: getRelativeDate(0), // Scheduled for delivery today
        items: [
            { packageId: 'vac-c-100', marinadeId: 'mar-5', quantityKg: 3 },
        ],
        totalPrice: (3 * 5.000), // 15.000
        paymentMethod: 'knet',
        deliveryAddress: MOCK_USERS.find(u => u.id === 'user-2')?.address as Address,
        status: 'pending'
    }
];