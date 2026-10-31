export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bankName?: string;
  accountNumber?: string;
}

export interface SharedSpace {
  id: string;
  name: string;
  inviteCode: string;
  description: string;
  icon: string; // Icon name e.g. "Home", "Plane", "Heart"
  members: User[];
  createdAt: string;
}

export type CategoryKey = 
  | "Housing"
  | "Groceries"
  | "Dating"
  | "Utilities"
  | "Shopping"
  | "Entertainment"
  | "Transportation"
  | "Health"
  | "Other";

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
}

export type SplitType = "50_50" | "PERCENTAGE" | "EXACT";

export interface SplitDetails {
  userAId: string;
  userAPercent?: number;
  userAAmount?: number;
  userBId: string;
  userBPercent?: number;
  userBAmount?: number;
  // Support for >2 members split
  memberSplits?: { [userId: string]: number }; // percentage or exact amount
}

export interface SplitHistoryRecord {
  id: string;
  timestamp: string;
  modifiedBy: string;
  modifiedByName: string;
  oldSplitType: SplitType;
  newSplitType: SplitType;
  description: string;
}

export interface Expense {
  id: string;
  spaceId: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: CategoryKey;
  paidById: string; // User ID who paid
  splitType: SplitType;
  splitDetails: SplitDetails;
  note?: string;
  receiptUrl?: string;
  receipts?: string[]; // Multi-receipt attachments
  tags?: string[]; // e.g. ["Food", "Date", "Birthday"]
  isRefund?: boolean; // Refund transaction
  isPersonal?: boolean; // Personal vs Shared expense
  merchant?: string; // Merchant name e.g. "Highlands", "Grab"
  splitHistory?: SplitHistoryRecord[];
  createdAt: string;
  createdBy: string;
}

export interface Settlement {
  id: string;
  spaceId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: string;
  method: "VIETQR" | "CASH" | "MOMO" | "ZALOPAY" | "BANK_TRANSFER";
  note?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  spaceId: string;
  name: string;
  category: CategoryKey;
  monthlyLimit: number;
}

export interface RecurringExpense {
  id: string;
  spaceId: string;
  title: string;
  amount: number;
  category: CategoryKey;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  paidById: string;
  nextDueDate: string;
  icon?: string;
  active: boolean;
}

export interface SavingsGoal {
  id: string;
  spaceId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
}

export interface FavoriteTemplate {
  id: string;
  spaceId: string;
  title: string;
  amount: number;
  category: CategoryKey;
  paidById: string;
  note?: string;
  tags?: string[];
  icon?: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: CategoryKey;
  logoUrl?: string;
  totalSpent: number;
  transactionCount: number;
}

export interface AuditLog {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  action: "CREATE_EXPENSE" | "UPDATE_EXPENSE" | "DELETE_EXPENSE" | "SETTLE_UP" | "CREATE_SPACE" | "RECURRING_TRIGGERED" | "GOAL_CONTRIBUTION";
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  spaceId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "EXPENSE_ADDED" | "EXPENSE_UPDATED" | "SETTLE_RECORDED" | "BUDGET_WARNING" | "RECURRING_DUE" | "GOAL_REACHED";
}

export interface BalanceSummary {
  totalSpentThisMonth: number;
  userATotalPaid: number;
  userBTotalPaid: number;
  userAShare: number;
  userBShare: number;
  netDebt: number;
  creditor: User | null;
  debtor: User | null;
}

export interface Wallet {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "CREDIT_CARD" | "E_WALLET" | "INVESTMENT";
  balance: number;
  currency: string;
  accountNumber?: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  category: CategoryKey;
  dueDate: string; // YYYY-MM-DD
  merchant?: string;
  isPaid: boolean;
  frequency: "MONTHLY" | "WEEKLY" | "YEARLY";
  icon?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserSettings {
  currency: "VND" | "USD" | "EUR";
  darkMode: boolean;
  biometricEnabled: boolean;
  pinCode?: string;
  cloudSync: boolean;
  language: "vi" | "en";
  notificationsEnabled: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  dataSummary?: any;
}

export interface ReceiptLineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  assignedUserIds: string[];
}

export interface BankNotificationParsed {
  title: string;
  amount: number;
  category: CategoryKey;
  type: "EXPENSE" | "INCOME";
  date: string;
  merchant?: string;
  note?: string;
  detectedBank?: string;
  rawText: string;
  accountNumberSnippet?: string;
}

