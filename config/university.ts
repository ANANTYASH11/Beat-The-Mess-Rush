// ==============================================================================
// CONFIG / UNIVERSITY, BRAND & MESS SPECIFICATION
// Single source of truth for UniQ ("Mess ki line ab online!").
// Every page, component, seed script, API route, and copy string reads from here.
// ==============================================================================

export interface BrandConfig {
  name: string;
  tagline: string;
  descriptor: string;
  credit: string;
}

export interface MessConfig {
  id: string;
  name: string;
  shortName: string;
  hostel: string;
  category: 'CENTRAL' | 'BOYS_HOSTEL' | 'BOYS_STUDIO' | 'GIRLS_HOSTEL' | 'GIRLS_STUDIO';
  gender: 'BOYS' | 'GIRLS' | 'ALL';
  zone?: 'NORTH' | 'SOUTH' | null;
  dietType?: string;
  dietFlag?: string | null;
  seats: number | null; // NULL until verified by LPU mess office ("Not set yet")
  students: number | null;
  counters: number | null;
  serviceRatePerCounter?: number | null;
  dataSource: 'unverified' | 'verified';
  notes?: string | null;
  demoSeats: number;
  demoStudents: number;
  demoCounters: number;
  demoServiceRate: number;
}

export interface MealConfig {
  name: string;
  start: string; // HH:mm (24-hr format)
  end: string;   // HH:mm (24-hr format)
}

export interface MenuItemConfig {
  name: string;
  category: 'Main' | 'Curry' | 'Bread' | 'Sweet' | 'Side' | 'Snack';
  avgGramsPerPlate: number;
  unitCostInr?: number;
  isPopular?: boolean;
}

export interface WeeklyMenuConfig {
  [day: string]: {
    [meal: string]: MenuItemConfig[];
  };
}

export interface UniversityConfig {
  name: string;
  shortName: string;
  city: string;
  brand: BrandConfig;
  messes: MessConfig[];
  meals: MealConfig[];
  slotLengthMinutes: number;
  peakWindows: {
    lunch: string;
    dinner: string;
  };
  rollNumberFormat: string;
  rollNumberExample: string;
  weeklyMenu: WeeklyMenuConfig;
  messCommittee: {
    contactName: string;
    contactEmail: string;
  };
  ngoContact: string;
  costPerKgFood: number;
  yourName: string;
  yourCourse: string;
  githubUrl: string;
}

const UNIVERSITY_NAME = "Lovely Professional University";
const UNIVERSITY_SHORT = "LPU";
const UNIVERSITY_CITY = "Phagwara, Punjab";

export const brand: BrandConfig = {
  name: "UniQ",
  tagline: "Mess ki line ab online!",
  descriptor: `Mess queue and food waste manager for ${UNIVERSITY_NAME}`,
  credit: `Built as a student project for ${UNIVERSITY_NAME}. Not an official LPU service.`,
};

export const LPU_MESS_CONFIGS: MessConfig[] = [
  // CENTRAL (2)
  {
    id: "central-mess-north",
    name: "Central Mess North",
    shortName: "Central North",
    hostel: "Central Block North",
    category: "CENTRAL",
    gender: "ALL",
    zone: "NORTH",
    dietType: "mixed/unknown",
    dietFlag: "confirm",
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Central dining facility; diet unverified, pending confirmation.",
    demoSeats: 500,
    demoStudents: 900,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "central-mess-south",
    name: "Central Mess South",
    shortName: "Central South",
    hostel: "Central Block South",
    category: "CENTRAL",
    gender: "ALL",
    zone: "SOUTH",
    dietType: "mixed/unknown",
    dietFlag: "confirm",
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Central dining facility; diet unverified, pending confirmation.",
    demoSeats: 500,
    demoStudents: 900,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },

  // BOYS_HOSTEL (7)
  {
    id: "boys-hostel-1",
    name: "Boys Hostel Mess 1",
    shortName: "Boys Hostel 1",
    hostel: "Boys Hostel 1",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-hostel-2",
    name: "Boys Hostel Mess 2",
    shortName: "Boys Hostel 2",
    hostel: "Boys Hostel 2",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-hostel-3",
    name: "Boys Hostel Mess 3",
    shortName: "Boys Hostel 3",
    hostel: "Boys Hostel 3",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-hostel-4",
    name: "Boys Hostel Mess 4",
    shortName: "Boys Hostel 4",
    hostel: "Boys Hostel 4",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-hostel-5",
    name: "Boys Hostel Mess 5",
    shortName: "Boys Hostel 5",
    hostel: "Boys Hostel 5",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-hostel-6",
    name: "Boys Hostel Mess 6",
    shortName: "Boys Hostel 6",
    hostel: "Boys Hostel 6",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-hostel-7",
    name: "Boys Hostel Mess 7",
    shortName: "Boys Hostel 7",
    hostel: "Boys Hostel 7",
    category: "BOYS_HOSTEL",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 600,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },

  // BOYS_STUDIO (2)
  {
    id: "boys-studio-1",
    name: "Boys Studio Mess 1",
    shortName: "Boys Studio 1",
    hostel: "Boys Studio 1",
    category: "BOYS_STUDIO",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Boys studio dining.",
    demoSeats: 250,
    demoStudents: 400,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "boys-studio-2",
    name: "Boys Studio Mess 2",
    shortName: "Boys Studio 2",
    hostel: "Boys Studio 2",
    category: "BOYS_STUDIO",
    gender: "BOYS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Boys studio dining.",
    demoSeats: 250,
    demoStudents: 400,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },

  // GIRLS_HOSTEL (6)
  {
    id: "girls-hostel-1",
    name: "Girls Hostel Mess 1",
    shortName: "Girls Hostel 1",
    hostel: "Girls Hostel 1",
    category: "GIRLS_HOSTEL",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 550,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "girls-hostel-2",
    name: "Girls Hostel Mess 2",
    shortName: "Girls Hostel 2",
    hostel: "Girls Hostel 2",
    category: "GIRLS_HOSTEL",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 550,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "girls-hostel-3",
    name: "Girls Hostel Mess 3",
    shortName: "Girls Hostel 3",
    hostel: "Girls Hostel 3",
    category: "GIRLS_HOSTEL",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 550,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "girls-hostel-4",
    name: "Girls Hostel Mess 4",
    shortName: "Girls Hostel 4",
    hostel: "Girls Hostel 4",
    category: "GIRLS_HOSTEL",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 550,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "girls-hostel-5",
    name: "Girls Hostel Mess 5",
    shortName: "Girls Hostel 5",
    hostel: "Girls Hostel 5",
    category: "GIRLS_HOSTEL",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 550,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "girls-hostel-6",
    name: "Girls Hostel Mess 6",
    shortName: "Girls Hostel 6",
    hostel: "Girls Hostel 6",
    category: "GIRLS_HOSTEL",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Standard vegetarian mess.",
    demoSeats: 350,
    demoStudents: 550,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },

  // GIRLS_STUDIO (2)
  {
    id: "girls-studio-1",
    name: "Girls Studio Mess 1",
    shortName: "Girls Studio 1",
    hostel: "Girls Studio 1",
    category: "GIRLS_STUDIO",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Girls studio dining.",
    demoSeats: 250,
    demoStudents: 400,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
  {
    id: "girls-studio-2",
    name: "Girls Studio Mess 2",
    shortName: "Girls Studio 2",
    hostel: "Girls Studio 2",
    category: "GIRLS_STUDIO",
    gender: "GIRLS",
    zone: null,
    dietType: "veg",
    dietFlag: null,
    seats: null,
    students: null,
    counters: null,
    dataSource: "unverified",
    notes: "Girls studio dining.",
    demoSeats: 250,
    demoStudents: 400,
    demoCounters: 4,
    demoServiceRate: 3.0,
  },
];

export const university: UniversityConfig = {
  name: UNIVERSITY_NAME,
  shortName: UNIVERSITY_SHORT,
  city: UNIVERSITY_CITY,
  brand,
  messes: LPU_MESS_CONFIGS,
  meals: [
    { name: "Breakfast", start: "08:00", end: "09:30" },
    { name: "Lunch", start: "12:30", end: "14:30" },
    { name: "Snacks", start: "17:00", end: "18:30" },
    { name: "Dinner", start: "19:30", end: "21:30" },
  ],
  slotLengthMinutes: 15,
  peakWindows: {
    lunch: "13:15",
    dinner: "20:15",
  },
  rollNumberFormat: "^[0-9]{8}$",
  rollNumberExample: "12200014",
  messCommittee: {
    contactName: "LPU Mess Committee (Student Representative)",
    contactEmail: "mess.committee@lpu.co.in",
  },
  ngoContact: "LPU NSS & Robin Hood Army Phagwara (+91 98765 43210)",
  costPerKgFood: 42,
  yourName: "Student Developer",
  yourCourse: "B.Tech CSE, Lovely Professional University",
  githubUrl: "https://github.com/ANANTYASH11/Beat-The-Mess-Rush",

  weeklyMenu: {
    Monday: {
      Breakfast: [
        { name: "Stuffed Aloo Paratha", category: "Bread", avgGramsPerPlate: 180, unitCostInr: 35, isPopular: true },
        { name: "Ven Pongal", category: "Main", avgGramsPerPlate: 150, unitCostInr: 32 },
        { name: "Steamed Idli & Sambhar", category: "Main", avgGramsPerPlate: 140, unitCostInr: 28 },
        { name: "Bread Butter Toast", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 22 },
        { name: "Masala Chai", category: "Side", avgGramsPerPlate: 120, unitCostInr: 15 },
        { name: "Filter Coffee", category: "Side", avgGramsPerPlate: 120, unitCostInr: 18 },
        { name: "Hot Milk", category: "Side", avgGramsPerPlate: 150, unitCostInr: 20 },
      ],
      Lunch: [
        { name: "Steamed Basmati Rice", category: "Main", avgGramsPerPlate: 160, unitCostInr: 35 },
        { name: "Tawa Phulka Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 30 },
        { name: "Amritsari Chhole", category: "Curry", avgGramsPerPlate: 140, unitCostInr: 55, isPopular: true },
        { name: "South Indian Sambhar", category: "Curry", avgGramsPerPlate: 120, unitCostInr: 35 },
        { name: "Seasonal Sabzi", category: "Curry", avgGramsPerPlate: 110, unitCostInr: 45 },
        { name: "Fresh Curd / Dahi", category: "Side", avgGramsPerPlate: 90, unitCostInr: 25 },
      ],
      Snacks: [
        { name: "Veg Grilled Sandwich", category: "Main", avgGramsPerPlate: 130, unitCostInr: 40, isPopular: true },
        { name: "Evening Masala Tea", category: "Side", avgGramsPerPlate: 120, unitCostInr: 15 },
        { name: "Evening Coffee", category: "Side", avgGramsPerPlate: 120, unitCostInr: 18 },
      ],
      Dinner: [
        { name: "Dal Tadka", category: "Curry", avgGramsPerPlate: 130, unitCostInr: 40 },
        { name: "Jeera Veg Pulao", category: "Main", avgGramsPerPlate: 160, unitCostInr: 42 },
        { name: "Aloo Gobi Matar", category: "Curry", avgGramsPerPlate: 110, unitCostInr: 45 },
        { name: "Butter Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 32 },
        { name: "Desi Ghee Suji Halwa", category: "Sweet", avgGramsPerPlate: 90, unitCostInr: 50, isPopular: true },
      ],
    },
    Tuesday: {
      Breakfast: [
        { name: "Masala Idli & Sambhar", category: "Main", avgGramsPerPlate: 190, unitCostInr: 40 },
        { name: "Coconut Chutney", category: "Side", avgGramsPerPlate: 50, unitCostInr: 50 },
        { name: "Fresh Banana", category: "Side", avgGramsPerPlate: 100, unitCostInr: 30 },
        { name: "Filter Coffee / Milk", category: "Side", avgGramsPerPlate: 150, unitCostInr: 30 },
      ],
      Lunch: [
        { name: "Kadhi Pakora", category: "Curry", avgGramsPerPlate: 140, unitCostInr: 75, isPopular: true },
        { name: "Steamed White Rice", category: "Main", avgGramsPerPlate: 160, unitCostInr: 40 },
        { name: "Bhindi Do Pyaza", category: "Curry", avgGramsPerPlate: 100, unitCostInr: 70 },
        { name: "Fresh Phulka Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Green Salad & Papad", category: "Side", avgGramsPerPlate: 60, unitCostInr: 35 },
      ],
      Snacks: [
        { name: "Veg Cutlet & Sauce", category: "Snack", avgGramsPerPlate: 110, unitCostInr: 50 },
        { name: "Hot Tea", category: "Side", avgGramsPerPlate: 150, unitCostInr: 20 },
      ],
      Dinner: [
        { name: "Dal Makhani", category: "Curry", avgGramsPerPlate: 130, unitCostInr: 110, isPopular: true },
        { name: "Mix Veg Handi", category: "Curry", avgGramsPerPlate: 110, unitCostInr: 65 },
        { name: "Jeera Pulao", category: "Main", avgGramsPerPlate: 150, unitCostInr: 45 },
        { name: "Butter Naan / Roti", category: "Bread", avgGramsPerPlate: 85, unitCostInr: 55 },
        { name: "Moong Dal Halwa", category: "Sweet", avgGramsPerPlate: 75, unitCostInr: 180, isPopular: true },
      ],
    },
    Wednesday: {
      Breakfast: [
        { name: "Aloo Paratha & Curd", category: "Main", avgGramsPerPlate: 200, unitCostInr: 55, isPopular: true },
        { name: "Mint Pickle & Butter", category: "Side", avgGramsPerPlate: 30, unitCostInr: 50 },
        { name: "Tea / Bournvita Milk", category: "Side", avgGramsPerPlate: 150, unitCostInr: 25 },
      ],
      Lunch: [
        { name: "Chole Bhature / Kulche", category: "Curry", avgGramsPerPlate: 160, unitCostInr: 85, isPopular: true },
        { name: "Jeera Rice", category: "Main", avgGramsPerPlate: 150, unitCostInr: 42 },
        { name: "Tawa Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Lauki Chana Dal", category: "Curry", avgGramsPerPlate: 100, unitCostInr: 45 },
        { name: "Cucumber Onion Salad", category: "Side", avgGramsPerPlate: 70, unitCostInr: 30 },
      ],
      Snacks: [
        { name: "Bread Pakora", category: "Snack", avgGramsPerPlate: 120, unitCostInr: 40, isPopular: true },
        { name: "Cardamom Tea", category: "Side", avgGramsPerPlate: 150, unitCostInr: 20 },
      ],
      Dinner: [
        { name: "Homestyle Chicken Curry / Shahi Paneer", category: "Curry", avgGramsPerPlate: 150, unitCostInr: 190, isPopular: true },
        { name: "Yellow Dal Fry", category: "Curry", avgGramsPerPlate: 110, unitCostInr: 70 },
        { name: "Steamed Rice", category: "Main", avgGramsPerPlate: 150, unitCostInr: 42 },
        { name: "Fresh Chapati", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Kheer", category: "Sweet", avgGramsPerPlate: 80, unitCostInr: 120 },
      ],
    },
    Thursday: {
      Breakfast: [
        { name: "Crispy Medu Vada & Sambhar", category: "Main", avgGramsPerPlate: 180, unitCostInr: 45, isPopular: true },
        { name: "Tomato & Coconut Chutney", category: "Side", avgGramsPerPlate: 60, unitCostInr: 40 },
        { name: "Tea / Coffee", category: "Side", avgGramsPerPlate: 150, unitCostInr: 25 },
      ],
      Lunch: [
        { name: "Moong Dal Tadka", category: "Curry", avgGramsPerPlate: 120, unitCostInr: 75 },
        { name: "Matar Paneer", category: "Curry", avgGramsPerPlate: 130, unitCostInr: 160, isPopular: true },
        { name: "Steamed Rice", category: "Main", avgGramsPerPlate: 160, unitCostInr: 42 },
        { name: "Phulka Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Curd & Fryums", category: "Side", avgGramsPerPlate: 80, unitCostInr: 40 },
      ],
      Snacks: [
        { name: "Pani Puri / Bhel Puri", category: "Snack", avgGramsPerPlate: 130, unitCostInr: 45, isPopular: true },
        { name: "Cutting Chai", category: "Side", avgGramsPerPlate: 150, unitCostInr: 20 },
      ],
      Dinner: [
        { name: "Kashmiri Dum Aloo", category: "Curry", avgGramsPerPlate: 120, unitCostInr: 70 },
        { name: "Panchmel Dal", category: "Curry", avgGramsPerPlate: 110, unitCostInr: 80 },
        { name: "Peas Pulao", category: "Main", avgGramsPerPlate: 150, unitCostInr: 45 },
        { name: "Tawa Paratha", category: "Bread", avgGramsPerPlate: 85, unitCostInr: 55 },
        { name: "Rasgulla", category: "Sweet", avgGramsPerPlate: 70, unitCostInr: 140 },
      ],
    },
    Friday: {
      Breakfast: [
        { name: "Pav Bhaji / Upma", category: "Main", avgGramsPerPlate: 190, unitCostInr: 50, isPopular: true },
        { name: "Sprouts Chaat", category: "Side", avgGramsPerPlate: 70, unitCostInr: 45 },
        { name: "Tea / Milk", category: "Side", avgGramsPerPlate: 150, unitCostInr: 25 },
      ],
      Lunch: [
        { name: "Rajma Masala", category: "Curry", avgGramsPerPlate: 130, unitCostInr: 95, isPopular: true },
        { name: "Steamed Jeera Rice", category: "Main", avgGramsPerPlate: 160, unitCostInr: 42 },
        { name: "Aloo Baingan Masala", category: "Curry", avgGramsPerPlate: 100, unitCostInr: 55 },
        { name: "Fresh Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Mix Pickle & Papad", category: "Side", avgGramsPerPlate: 40, unitCostInr: 30 },
      ],
      Snacks: [
        { name: "Veg Puff / Patties", category: "Snack", avgGramsPerPlate: 110, unitCostInr: 45 },
        { name: "Hot Coffee", category: "Side", avgGramsPerPlate: 150, unitCostInr: 25 },
      ],
      Dinner: [
        { name: "Hyderabadi Veg Biryani / Egg Biryani", category: "Main", avgGramsPerPlate: 220, unitCostInr: 130, isPopular: true },
        { name: "Mirchi Ka Salan", category: "Curry", avgGramsPerPlate: 90, unitCostInr: 65 },
        { name: "Cucumber Raita", category: "Side", avgGramsPerPlate: 90, unitCostInr: 40 },
        { name: "Rumali Roti", category: "Bread", avgGramsPerPlate: 70, unitCostInr: 50 },
        { name: "Ice Cream Scoop", category: "Sweet", avgGramsPerPlate: 65, unitCostInr: 110, isPopular: true },
      ],
    },
    Saturday: {
      Breakfast: [
        { name: "Puri Bhaji (Halwai Style)", category: "Main", avgGramsPerPlate: 210, unitCostInr: 55, isPopular: true },
        { name: "Suji Halwa", category: "Sweet", avgGramsPerPlate: 70, unitCostInr: 80 },
        { name: "Tea / Milk", category: "Side", avgGramsPerPlate: 150, unitCostInr: 25 },
      ],
      Lunch: [
        { name: "Sambhar & Lemon Rice", category: "Main", avgGramsPerPlate: 170, unitCostInr: 50 },
        { name: "Paneer Bhurji / Aloo Shimla", category: "Curry", avgGramsPerPlate: 120, unitCostInr: 150, isPopular: true },
        { name: "Tawa Roti", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Chana Dal Fry", category: "Curry", avgGramsPerPlate: 110, unitCostInr: 75 },
        { name: "Curd", category: "Side", avgGramsPerPlate: 80, unitCostInr: 40 },
      ],
      Snacks: [
        { name: "Maggi / Masala Pasta", category: "Snack", avgGramsPerPlate: 140, unitCostInr: 40, isPopular: true },
        { name: "Masala Chai", category: "Side", avgGramsPerPlate: 150, unitCostInr: 20 },
      ],
      Dinner: [
        { name: "Dal Palak", category: "Curry", avgGramsPerPlate: 120, unitCostInr: 75 },
        { name: "Kadhai Paneer / Butter Chicken", category: "Curry", avgGramsPerPlate: 140, unitCostInr: 210, isPopular: true },
        { name: "Steamed Rice", category: "Main", avgGramsPerPlate: 150, unitCostInr: 42 },
        { name: "Garlic Butter Naan", category: "Bread", avgGramsPerPlate: 85, unitCostInr: 60, isPopular: true },
        { name: "Shahi Tukda", category: "Sweet", avgGramsPerPlate: 75, unitCostInr: 150 },
      ],
    },
    Sunday: {
      Breakfast: [
        { name: "Masala Dosa with Chutneys & Sambhar", category: "Main", avgGramsPerPlate: 220, unitCostInr: 65, isPopular: true },
        { name: "Boiled Eggs / Fruit Bowl", category: "Side", avgGramsPerPlate: 100, unitCostInr: 50 },
        { name: "Filter Coffee", category: "Side", avgGramsPerPlate: 150, unitCostInr: 30 },
      ],
      Lunch: [
        { name: "Special Festive Thali: Dal Makhani", category: "Curry", avgGramsPerPlate: 130, unitCostInr: 110, isPopular: true },
        { name: "Paneer Tikka Masala", category: "Curry", avgGramsPerPlate: 140, unitCostInr: 220, isPopular: true },
        { name: "Jeera Pulao", category: "Main", avgGramsPerPlate: 160, unitCostInr: 45 },
        { name: "Missi Roti & Naan", category: "Bread", avgGramsPerPlate: 90, unitCostInr: 55 },
        { name: "Angoori Jamun", category: "Sweet", avgGramsPerPlate: 70, unitCostInr: 160 },
      ],
      Snacks: [
        { name: "Chai & Biscuits / Banana", category: "Snack", avgGramsPerPlate: 80, unitCostInr: 25 },
        { name: "Cold Coffee", category: "Side", avgGramsPerPlate: 180, unitCostInr: 40, isPopular: true },
      ],
      Dinner: [
        { name: "Light Khichdi / Dal Fry", category: "Main", avgGramsPerPlate: 180, unitCostInr: 45 },
        { name: "Aloo Jeera", category: "Curry", avgGramsPerPlate: 100, unitCostInr: 50 },
        { name: "Tawa Phulka", category: "Bread", avgGramsPerPlate: 80, unitCostInr: 50 },
        { name: "Tomato Soup & Croutons", category: "Side", avgGramsPerPlate: 120, unitCostInr: 40 },
        { name: "Vanilla Custard with Fruits", category: "Sweet", avgGramsPerPlate: 85, unitCostInr: 95 },
      ],
    },
  },
};

// ==============================================================================
// HELPER UTILITIES
// ==============================================================================

/**
 * Returns the meal configuration for a given meal name (e.g. "Lunch", "Dinner").
 */
export function getMealConfig(mealName: string): MealConfig {
  const found = university.meals.find(
    (m) => m.name.toLowerCase() === mealName.toLowerCase()
  );
  if (found) return found;
  // Default fallback if unmatched
  return mealName.toLowerCase().includes('dinner')
    ? { name: 'Dinner', start: '19:30', end: '21:30' }
    : { name: 'Lunch', start: '12:30', end: '14:30' };
}

/**
 * Dynamically generates 15-minute slot intervals from meal start to end time.
 * e.g. "12:30" to "14:30" -> ["12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15"]
 */
export function generateSlotsForMeal(
  mealName: string,
  slotIntervalMinutes: number = university.slotLengthMinutes
): string[] {
  const meal = getMealConfig(mealName);
  const [startHour, startMin] = meal.start.split(':').map(Number);
  const [endHour, endMin] = meal.end.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  const slots: string[] = [];
  for (let mins = startTotalMinutes; mins < endTotalMinutes; mins += slotIntervalMinutes) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }

  return slots.length > 0 ? slots : ['12:30', '12:45', '13:00', '13:15', '13:30', '13:45'];
}

/**
 * Calculates end timestamp of a slot based on slotLengthMinutes.
 * e.g. "12:30" -> "12:45"
 */
export function getSlotEnd(
  slotStart: string,
  lengthMinutes: number = university.slotLengthMinutes
): string {
  const [h, m] = slotStart.split(':').map(Number);
  const totalMins = h * 60 + m + lengthMinutes;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

/**
 * Validates a roll number against the university's rollNumberFormat.
 */
export function isValidRollNumber(rollNumber: string): boolean {
  if (!rollNumber || typeof rollNumber !== 'string') return false;
  try {
    const regex = new RegExp(university.rollNumberFormat, 'i');
    return regex.test(rollNumber.trim());
  } catch {
    return rollNumber.trim().length >= 4;
  }
}

/**
 * Returns mess configuration by ID or code.
 */
export function getMessById(idOrCode: string): MessConfig {
  const found = university.messes.find(
    (m) => m.id === idOrCode || m.name.toLowerCase() === idOrCode.toLowerCase()
  );
  return found || university.messes[0];
}

/**
 * Returns the default primary mess hall.
 */
export function getDefaultMess(): MessConfig {
  return university.messes[0];
}

/**
 * Returns the day-of-week string (e.g. "Monday") for a given date or today.
 */
export function getDayOfWeek(date?: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = date || new Date();
  return days[d.getDay()];
}

/**
 * Returns the menu items for a specified day and meal.
 */
export function getMenuForDayAndMeal(day: string, meal: string): MenuItemConfig[] {
  const dayMenu = university.weeklyMenu[day] || university.weeklyMenu['Monday'];
  return dayMenu?.[meal] || dayMenu?.['Lunch'] || [];
}
