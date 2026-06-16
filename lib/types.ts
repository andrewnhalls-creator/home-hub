export type Priority = "baja" | "normal" | "alta";
export type TaskStatus = "pendiente" | "hecho" | "vencido";
export type RepeatFrequency = "ninguna" | "diaria" | "semanal" | "mensual" | "anual";
export type ChoreFrequency = "puntual" | "diaria" | "semanal" | "quincenal" | "mensual";
export type MealType = "desayuno" | "comida" | "cena" | "snack";
export type Difficulty = "fácil" | "media" | "difícil";
export type BillingCycle = "mensual" | "trimestral" | "anual";
export type WishlistStatus = "idea" | "aprobado" | "comprado" | "descartado";
export type CategoryModule =
  | "shopping"
  | "finance"
  | "reminders"
  | "chores"
  | "documents"
  | "wishlist"
  | "meals";
export type HouseholdRole = "owner" | "member";

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_language: string;
  avatar_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  locale: string;
  currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  display_name: string | null;
  created_at: string;
}

export interface HouseholdInvite {
  id: string;
  household_id: string;
  code: string;
  created_by: string | null;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  household_id: string;
  module: CategoryModule;
  name: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  household_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category_id: string | null;
  store: string | null;
  priority: Priority;
  notes: string | null;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  prep_time_minutes: number | null;
  difficulty: Difficulty | null;
  servings: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category_id: string | null;
  created_at: string;
}

export interface MealPlan {
  id: string;
  household_id: string;
  planned_date: string;
  meal_type: MealType;
  recipe_id: string | null;
  custom_name: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  assigned_to: string | null;
  category_id: string | null;
  repeat_frequency: RepeatFrequency;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface Chore {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  frequency: ChoreFrequency | null;
  next_due_date: string | null;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FixedPayment {
  id: string;
  household_id: string;
  name: string;
  amount: number;
  currency: string;
  category_id: string | null;
  due_day: number | null;
  payment_method: string | null;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  household_id: string;
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  category_id: string | null;
  paid_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string | null;
  priority: Priority;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  amount: number;
  contribution_date: string;
  contributed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  household_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  renewal_date: string | null;
  category_id: string | null;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdDocument {
  id: string;
  household_id: string;
  title: string;
  document_type: string | null;
  provider: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  storage_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  household_id: string;
  name: string;
  estimated_cost: number | null;
  currency: string;
  priority: Priority;
  target_month: string | null;
  url: string | null;
  status: WishlistStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  is_all_day: boolean;
  repeat_frequency: RepeatFrequency;
  remind_before_minutes: number | null;
  is_private: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface ActivityLogEntry {
  id: string;
  household_id: string;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  action: string | null;
  summary: string | null;
  created_at: string;
}
