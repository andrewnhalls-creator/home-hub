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
export type NotificationCategory =
  | "recordatorios"
  | "calendario"
  | "tareas"
  | "pagos"
  | "suscripciones"
  | "documentos"
  | "menu"
  | "compra"
  | "actividad_hogar"
  | "resumen_diario"
  | "resumen_semanal";

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
  monthly_budget: number | null;
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
  shopping_list_id: string | null;
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

export type ShoppingListStatus = "borrador" | "activa" | "comprada" | "archivada";

export interface ShoppingList {
  id: string;
  household_id: string;
  name: string;
  week_start_date: string | null;
  week_end_date: string | null;
  planned_budget: number | null;
  actual_total: number | null;
  currency: string;
  main_store: string | null;
  status: ShoppingListStatus;
  shopping_date: string | null;
  paid_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  archived_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface ShoppingTrip {
  id: string;
  household_id: string;
  shopping_list_id: string;
  store: string | null;
  total_amount: number;
  currency: string;
  shopping_date: string | null;
  paid_by: string | null;
  receipt_url: string | null;
  notes: string | null;
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
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface PaymentInstance {
  id: string;
  household_id: string;
  fixed_payment_id: string | null;
  due_date: string;
  amount: number;
  currency: string;
  status: "pendiente" | "pagado" | "vencido" | "omitido";
  paid_date: string | null;
  paid_by: string | null;
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
  shopping_list_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
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
  deleted_at: string | null;
  deleted_by: string | null;
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
  deleted_at: string | null;
  deleted_by: string | null;
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
  archived_at: string | null;
  archived_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
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
  end_date: string | null;
  event_time: string | null;
  is_all_day: boolean;
  repeat_frequency: RepeatFrequency;
  remind_before_minutes: number | null;
  is_private: boolean;
  color: string | null;
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

export type MortgageStatus = "activa" | "pagada" | "cancelada";
export type MortgagePaymentStatus = "pendiente" | "pagado" | "omitido";

export interface Mortgage {
  id: string;
  household_id: string;
  name: string;
  lender: string | null;
  original_principal: number;
  current_balance: number;
  monthly_payment: number;
  interest_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  payment_day: number | null;
  currency: string;
  status: MortgageStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  archived_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface MortgagePayment {
  id: string;
  household_id: string;
  mortgage_id: string;
  due_date: string;
  paid_date: string | null;
  amount: number;
  principal_amount: number | null;
  interest_amount: number | null;
  extra_payment: number;
  status: MortgagePaymentStatus;
  paid_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationEvent {
  id: string;
  household_id: string;
  user_id: string;
  category: NotificationCategory;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
