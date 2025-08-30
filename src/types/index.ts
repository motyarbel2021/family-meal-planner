// Types for the Family Meal Planning Application
// Based on the specification provided

export interface Child {
  id: string;
  name: string;
  color: string;
  dietaryTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface MenuItem {
  id: string;
  name: string;
  mealTypes: MealType[];
  ingredients: Ingredient[];
  tags: string[];
  defaultServings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemSelection {
  menuItemId: string;
  servings: number;
  notes?: string;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD format
  breakfast: {
    byChild: Record<string, MenuItemSelection[]>; // childId -> MenuItemSelections
  };
  lunch: MenuItemSelection[];
  dinner: MenuItemSelection[];
}

export interface WeekPlan {
  weekId: string;
  children: Child[];
  days: DayPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface PantryItem {
  name: string;
  unit: string;
  quantity: number;
}

export interface GroceryItem {
  name: string;
  unit: string;
  quantity: number;
  category: string;
  isInPantry: boolean;
}

export interface WeekPreset {
  id: string;
  name: string;
  description: string;
  weekPlan: Omit<WeekPlan, 'weekId' | 'createdAt' | 'updatedAt'>;
  createdAt: string;
}

// Enum types
export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type UnitType = 
  | 'גרם' | 'קילוגרם' 
  | 'מיליליטר' | 'ליטר' 
  | 'כוס' | 'כפות' | 'כפית'
  | 'יחידה' | 'יחידות'
  | 'חבילה' | 'שקית'
  | 'פרוסה' | 'פרוסות';

export type GroceryCategory = 
  | 'ירקות ופירות'
  | 'בשר ודגים'
  | 'חלב וביצים'
  | 'לחם ומאפים'
  | 'יבשים וקטניות'
  | 'שמורים ומתובלים'
  | 'אחר';

// Chat bot types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  processed?: boolean;
}

export interface ChatBotResponse {
  message: string;
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'add_meal' | 'update_meal' | 'remove_meal' | 'set_servings';
  data: any;
}

// Database bindings for Cloudflare
export interface Bindings {
  DB: D1Database;
  KV?: KVNamespace;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Week planning utilities
export interface WeekRange {
  startDate: string;
  endDate: string;
  days: string[];
}

// Privacy consent types  
export interface PrivacyConsent {
  hasConsented: boolean;
  consentDate: string;
  version: string;
  cloudServicesEnabled: boolean;
}