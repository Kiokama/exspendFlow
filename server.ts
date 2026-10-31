import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { syncCollection, saveDocument, deleteDocument } from "./src/lib/firebase-db";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
}

const GEMINI_MODELS = Array.from(new Set([
  "gemini-flash-latest",
  "gemini-3.5-flash",
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
].filter(Boolean) as string[]));

async function generateWithGeminiFallback(ai: GoogleGenAI, params: { contents: any; config: any }) {
  let lastError: any = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        ...params
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes("404") || 
        errMsg.includes("NOT_FOUND") || 
        errMsg.includes("available") || 
        errMsg.includes("429") || 
        errMsg.includes("RESOURCE_EXHAUSTED") || 
        errMsg.includes("quota")
      ) {
        console.warn(`Gemini model "${model}" error (${errMsg.slice(0, 100)}...), trying fallback model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// In-memory data interfaces
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  bankName?: string;
  accountNumber?: string;
}

interface SharedSpace {
  id: string;
  name: string;
  inviteCode: string;
  description: string;
  icon: string;
  members: User[];
  createdAt: string;
}

interface Expense {
  id: string;
  spaceId: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  paidById: string; // User ID
  splitType: "50_50" | "PERCENTAGE" | "EXACT";
  splitDetails: {
    userAId: string;
    userAPercent?: number;
    userAAmount?: number;
    userBId: string;
    userBPercent?: number;
    userBAmount?: number;
    memberSplits?: { [userId: string]: number };
  };
  note?: string;
  receiptUrl?: string;
  receipts?: string[];
  tags?: string[];
  isRefund?: boolean;
  isPersonal?: boolean;
  merchant?: string;
  createdAt: string;
  createdBy: string;
}

interface Settlement {
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

interface Budget {
  id: string;
  spaceId: string;
  name: string;
  category: string;
  monthlyLimit: number;
}

interface AuditLog {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  action: "CREATE_EXPENSE" | "UPDATE_EXPENSE" | "DELETE_EXPENSE" | "SETTLE_UP" | "CREATE_SPACE" | "RECURRING_TRIGGERED" | "GOAL_CONTRIBUTION";
  details: string;
  timestamp: string;
}

interface RecurringExpenseStore {
  id: string;
  spaceId: string;
  title: string;
  amount: number;
  category: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  paidById: string;
  nextDueDate: string;
  active: boolean;
}

interface SavingsGoalStore {
  id: string;
  spaceId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
}

interface FavoriteTemplateStore {
  id: string;
  spaceId: string;
  title: string;
  amount: number;
  category: string;
  paidById: string;
  note?: string;
  tags?: string[];
}

interface Wallet {
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

interface BillReminder {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string; // YYYY-MM-DD
  merchant?: string;
  isPaid: boolean;
  frequency: "MONTHLY" | "WEEKLY" | "YEARLY";
  icon?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// In-memory data collections
let users: User[] = [];
let spaces: SharedSpace[] = [];
let expenses: Expense[] = [];
let settlements: Settlement[] = [];
let budgets: Budget[] = [];
let auditLogs: AuditLog[] = [];
let recurringExpenses: RecurringExpenseStore[] = [];
let savingsGoals: SavingsGoalStore[] = [];
let favoriteTemplates: FavoriteTemplateStore[] = [];
let sampleWallets: Wallet[] = [];
let sampleBills: BillReminder[] = [];
let achievements: Achievement[] = [];
let appNotifications: any[] = [];

// Default initial seed datasets
const defaultWalletsSeed: Wallet[] = [];

const defaultBillsSeed: BillReminder[] = [];

const defaultAchievementsSeed: Achievement[] = [
  { id: "ac1", title: "Thợ Săn Ngân Sách", description: "Duy trì ngân sách không vượt quá 30 ngày liên tiếp", icon: "Award", unlocked: false },
  { id: "ac2", title: "Siêu Tiết Kiệm", description: "Trích tiết kiệm đạt mốc 10.000.000 ₫", icon: "ShieldCheck", unlocked: false },
  { id: "ac3", title: "Master AI Scan", description: "Quét 20 hóa đơn bằng AI Smart Camera", icon: "Sparkles", unlocked: false },
  { id: "ac4", title: "Tài Chính Minh Bạch", description: "Ghi chép 50 giao dịch không xót ngày nào", icon: "CheckCircle2", unlocked: false }
];

// Helper to safely get or create user & space for production readiness
function ensureDefaultUserAndSpace() {
  if (users.length === 0) {
    const defaultUser: User = {
      id: "user_main",
      name: "Tài Khoản Của Tôi",
      email: "user@expenseflow.app",
      password: "123456",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MainUser",
      bankName: "MBBank",
      accountNumber: "0988776655"
    };
    users.push(defaultUser);
    saveDocument("users", defaultUser);
  }

  if (spaces.length === 0) {
    const defaultSpace: SharedSpace = {
      id: "space_main",
      name: "Chi Tiêu Của Tôi 💳",
      inviteCode: `DUO-${Math.floor(1000 + Math.random() * 9000)}`,
      description: "Không gian quản lý chi tiêu cá nhân & nhóm",
      icon: "Home",
      members: [users[0]],
      createdAt: new Date().toISOString()
    };
    spaces.push(defaultSpace);
    saveDocument("spaces", defaultSpace);
  }

  if (sampleWallets.length === 0) {
    sampleWallets = [...defaultWalletsSeed];
    for (const w of sampleWallets) {
      saveDocument("wallets", w);
    }
  }

  if (sampleBills.length === 0) {
    sampleBills = [...defaultBillsSeed];
    for (const b of sampleBills) {
      saveDocument("bills", b);
    }
  }

  if (achievements.length === 0) {
    achievements = [...defaultAchievementsSeed];
    for (const a of achievements) {
      saveDocument("achievements", a);
    }
  }
}

function safeUser(id?: string): User {
  ensureDefaultUserAndSpace();
  if (id) {
    const found = users.find(u => u.id === id);
    if (found) return found;
  }
  return users[0];
}

function safeSpace(id?: string): SharedSpace {
  ensureDefaultUserAndSpace();
  if (id) {
    const found = spaces.find(s => s.id === id);
    if (found) return found;
  }
  return spaces[0];
}

// Helper to log audit trail
function addAuditLog(spaceId: string, userId: string, userName: string, action: AuditLog["action"], details: string) {
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    spaceId,
    userId,
    userName,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(log);
  saveDocument("auditLogs", log);
}

// ================= API ROUTES =================

// Auth & Users
app.get("/api/users", (req, res) => {
  ensureDefaultUserAndSpace();
  res.json(users);
});

app.post("/api/auth/register", (req, res) => {
  ensureDefaultUserAndSpace();
  const { name, email, password, avatar, bankName, accountNumber } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ email và mật khẩu." });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: "Email này đã được đăng ký. Vui lòng đăng nhập!" });
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name: name || "Người dùng mới",
    email: email.trim(),
    password: password,
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email || "User")}`,
    bankName: bankName || "MBBank",
    accountNumber: accountNumber ? accountNumber.trim() : ""
  };
  users.push(newUser);
  saveDocument("users", newUser);

  const { password: _p, ...cleanUser } = newUser;
  res.json({ success: true, user: cleanUser });
});

app.post("/api/auth/login", (req, res) => {
  ensureDefaultUserAndSpace();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ email và mật khẩu." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ success: false, error: "Tài khoản email này chưa được đăng ký trong hệ thống." });
  }

  if (!user.password) {
    user.password = password;
    saveDocument("users", user);
  } else if (password !== user.password) {
    return res.status(401).json({ success: false, error: "Mật khẩu không chính xác. Vui lòng thử lại!" });
  }

  const { password: _p, ...cleanUser } = user;
  res.json({ success: true, user: cleanUser });
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  let idx = users.findIndex(u => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...req.body };
  } else {
    // If user not in memory yet, upsert user
    const newUser: User = {
      id,
      name: req.body.name || "Tài Khoản Của Tôi",
      email: req.body.email || "user@expenseflow.app",
      avatar: req.body.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=MainUser",
      bankName: req.body.bankName || "MBBank",
      accountNumber: req.body.accountNumber || "0988776655",
      ...req.body
    };
    users.push(newUser);
    idx = users.length - 1;
  }
  
  saveDocument("users", users[idx]);

  // Also update user profile info inside all spaces member lists!
  spaces.forEach(s => {
    let spaceUpdated = false;
    s.members = s.members.map(m => {
      if (m.id === id) {
        spaceUpdated = true;
        return { ...m, ...users[idx] };
      }
      return m;
    });
    if (spaceUpdated) {
      saveDocument("spaces", s);
    }
  });

  res.json(users[idx]);
});

// Spaces API
app.get("/api/spaces", (req, res) => {
  ensureDefaultUserAndSpace();

  // Always enrich space member objects with latest user details (bankName, accountNumber, avatar, etc.)
  const enrichedSpaces = spaces.map(s => ({
    ...s,
    members: s.members.map(m => {
      const latestUser = users.find(u => u.id === m.id);
      return latestUser ? { ...m, ...latestUser } : m;
    })
  }));

  const { userId } = req.query;
  if (userId) {
    const userSpaces = enrichedSpaces.filter(s => s.members.some(m => m.id === userId));
    return res.json(userSpaces);
  }
  res.json(enrichedSpaces);
});

app.post("/api/spaces", (req, res) => {
  const { name, description, icon, creatorId } = req.body;
  const creator = safeUser(creatorId);
  
  const newSpace: SharedSpace = {
    id: `space_${Date.now()}`,
    name: name || "Không gian mới",
    description: description || "",
    icon: icon || "Users",
    inviteCode: `DUO-${Math.floor(1000 + Math.random() * 9000)}`,
    members: [creator],
    createdAt: new Date().toISOString()
  };

  spaces.push(newSpace);
  saveDocument("spaces", newSpace);
  addAuditLog(newSpace.id, creator.id, creator.name, "CREATE_SPACE", `Đã tạo không gian mới "${newSpace.name}"`);
  res.json(newSpace);
});

app.post("/api/spaces/join", (req, res) => {
  const { inviteCode, userId } = req.body;
  const targetSpace = spaces.find(s => s.inviteCode.toUpperCase() === inviteCode?.trim().toUpperCase());
  if (!targetSpace) {
    return res.status(404).json({ error: "Mã mời không tồn tại hoặc đã hết hạn" });
  }
  const user = safeUser(userId);
  if (!targetSpace.members.some(m => m.id === user.id)) {
    targetSpace.members.push(user);
    saveDocument("spaces", targetSpace);
  }
  res.json(targetSpace);
});

app.put("/api/spaces/:id", (req, res) => {
  const { id } = req.params;
  const idx = spaces.findIndex(s => s.id === id);
  if (idx !== -1) {
    spaces[idx] = { ...spaces[idx], ...req.body };
    saveDocument("spaces", spaces[idx]);
    res.json(spaces[idx]);
  } else {
    res.status(404).json({ error: "Không tìm thấy không gian" });
  }
});

app.delete("/api/spaces/:id", (req, res) => {
  const { id } = req.params;
  spaces = spaces.filter(s => s.id !== id);
  deleteDocument("spaces", id);
  res.json({ success: true });
});

// Expenses API
app.get("/api/expenses", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) {
    return res.json(expenses);
  }
  const spaceExpenses = expenses.filter(e => e.spaceId === spaceId);
  res.json(spaceExpenses);
});

app.post("/api/expenses", (req, res) => {
  const { spaceId, title, amount, date, category, paidById, splitType, splitDetails, note, receiptUrl, isPersonal, isRefund, tags, createdBy } = req.body;
  
  const creator = users.find(u => u.id === createdBy) || safeUser();
  const newExpense: Expense = {
    id: `exp_${Date.now()}`,
    spaceId: spaceId || spaces[0]?.id || "space_main",
    title: title || "Khoản chi mới",
    amount: Number(amount || 0),
    date: date || new Date().toISOString().split("T")[0],
    category: category || "Groceries",
    paidById: paidById || creator.id,
    splitType: splitType || "50_50",
    splitDetails: splitDetails || { userAId: creator.id, userBId: creator.id },
    note,
    receiptUrl,
    isPersonal: isPersonal || false,
    isRefund: isRefund || false,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    createdBy: creator.id
  };

  expenses.unshift(newExpense);
  saveDocument("expenses", newExpense);
  addAuditLog(newExpense.spaceId, creator.id, creator.name, "CREATE_EXPENSE", `Đã thêm khoản chi "${newExpense.title}" với số tiền ${Number(newExpense.amount).toLocaleString('vi-VN')} ₫`);
  res.json(newExpense);
});

app.put("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Không tìm thấy giao dịch" });
  }

  const prev = expenses[idx];
  const updated: Expense = {
    ...prev,
    ...req.body,
    amount: Number(req.body.amount || prev.amount)
  };

  expenses[idx] = updated;
  saveDocument("expenses", updated);
  const updater = users.find(u => u.id === req.body.updatedBy) || safeUser();
  addAuditLog(prev.spaceId, updater.id, updater.name, "UPDATE_EXPENSE", `Đã sửa khoản chi "${updated.title}" (${Number(updated.amount).toLocaleString('vi-VN')} ₫)`);
  res.json(updated);
});

app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { userId, spaceId } = req.query;
  const idx = expenses.findIndex(e => e.id === id);
  if (idx !== -1) {
    const deleted = expenses[idx];
    expenses.splice(idx, 1);
    deleteDocument("expenses", id);
    const user = users.find(u => u.id === userId) || safeUser();
    addAuditLog((spaceId as string) || deleted.spaceId, user.id, user.name, "DELETE_EXPENSE", `Đã xóa khoản chi "${deleted.title}"`);
  }
  res.json({ success: true });
});

// Settlements API
app.get("/api/settlements", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(settlements);
  res.json(settlements.filter(s => s.spaceId === spaceId));
});

app.post("/api/settlements", (req, res) => {
  const { spaceId, fromUserId, toUserId, amount, date, method, note } = req.body;
  
  const fromUser = users.find(u => u.id === fromUserId) || safeUser();
  const toUser = users.find(u => u.id === toUserId) || safeUser();

  const newSettlement: Settlement = {
    id: `set_${Date.now()}`,
    spaceId: spaceId || spaces[0]?.id || "space_main",
    fromUserId: fromUser.id,
    toUserId: toUser.id,
    amount: Number(amount || 0),
    date: date || new Date().toISOString().split("T")[0],
    method: method || "VIETQR",
    note,
    createdAt: new Date().toISOString()
  };

  settlements.unshift(newSettlement);
  saveDocument("settlements", newSettlement);
  addAuditLog(newSettlement.spaceId, fromUser.id, fromUser.name, "SETTLE_UP", `${fromUser.name} đã thanh toán cấn trừ ${Number(amount).toLocaleString('vi-VN')} ₫ cho ${toUser.name}`);
  res.json(newSettlement);
});

app.delete("/api/settlements/:id", (req, res) => {
  const { id } = req.params;
  settlements = settlements.filter(s => s.id !== id);
  deleteDocument("settlements", id);
  res.json({ success: true });
});

// Budgets API
app.get("/api/budgets", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(budgets);
  res.json(budgets.filter(b => b.spaceId === spaceId));
});

app.post("/api/budgets", (req, res) => {
  const { spaceId, name, category, monthlyLimit } = req.body;
  const budgetObj: Budget = {
    id: `budget_${Date.now()}`,
    spaceId,
    name: name || "Ngân sách mới",
    category,
    monthlyLimit: Number(monthlyLimit)
  };
  budgets.push(budgetObj);
  saveDocument("budgets", budgetObj);
  res.json({ success: true, budgets: budgets.filter(b => b.spaceId === spaceId) });
});

app.put("/api/budgets/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, monthlyLimit } = req.body;
  const idx = budgets.findIndex(b => b.id === id);
  if (idx !== -1) {
    budgets[idx] = {
      ...budgets[idx],
      name: name || budgets[idx].name,
      category: category || budgets[idx].category,
      monthlyLimit: monthlyLimit !== undefined ? Number(monthlyLimit) : budgets[idx].monthlyLimit
    };
    saveDocument("budgets", budgets[idx]);
    res.json({ success: true, budgets: budgets.filter(b => b.spaceId === budgets[idx].spaceId) });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/api/budgets/:id", (req, res) => {
  const { id } = req.params;
  const budget = budgets.find(b => b.id === id);
  if (budget) {
    budgets = budgets.filter(b => b.id !== id);
    deleteDocument("budgets", id);
    res.json({ success: true, budgets: budgets.filter(b => b.spaceId === budget.spaceId) });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

// Audit Logs API
app.get("/api/audit-logs", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(auditLogs);
  res.json(auditLogs.filter(l => l.spaceId === spaceId));
});

// Recurring Expenses API
app.get("/api/recurring", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(recurringExpenses);
  res.json(recurringExpenses.filter(r => r.spaceId === spaceId));
});

app.post("/api/recurring", (req, res) => {
  const { spaceId, title, amount, category, frequency, paidById, nextDueDate } = req.body;
  const newRec: RecurringExpenseStore = {
    id: `rec_${Date.now()}`,
    spaceId: spaceId || spaces[0]?.id || "space_main",
    title: title || "Khoản chi định kỳ",
    amount: Number(amount || 0),
    category: category || "Groceries",
    frequency: frequency || "MONTHLY",
    paidById: paidById || safeUser().id,
    nextDueDate: nextDueDate || new Date().toISOString().split("T")[0],
    active: true
  };
  recurringExpenses.unshift(newRec);
  saveDocument("recurringExpenses", newRec);
  res.json(newRec);
});

app.delete("/api/recurring/:id", (req, res) => {
  const { id } = req.params;
  recurringExpenses = recurringExpenses.filter(r => r.id !== id);
  deleteDocument("recurringExpenses", id);
  res.json({ success: true });
});

app.post("/api/recurring/:id/trigger", (req, res) => {
  const { id } = req.params;
  const rec = recurringExpenses.find(r => r.id === id);
  if (!rec) return res.status(404).json({ error: "Không tìm thấy khoản định kỳ" });

  const creator = safeUser(rec.paidById);
  const space = safeSpace(rec.spaceId);
  const memberA = space.members[0] || creator;
  const memberB = space.members[1] || creator;

  const newExp: Expense = {
    id: `exp_${Date.now()}`,
    spaceId: rec.spaceId,
    title: `[Tự động] ${rec.title}`,
    amount: rec.amount,
    date: new Date().toISOString().split("T")[0],
    category: rec.category,
    paidById: rec.paidById,
    splitType: "50_50",
    splitDetails: {
      userAId: memberA.id,
      userBId: memberB.id
    },
    note: `Tạo từ khoản chi định kỳ (${rec.frequency})`,
    createdAt: new Date().toISOString(),
    createdBy: rec.paidById
  };

  expenses.unshift(newExp);
  saveDocument("expenses", newExp);
  addAuditLog(rec.spaceId, creator.id, creator.name, "CREATE_EXPENSE", `Tự động tạo khoản chi định kỳ "${rec.title}" (${rec.amount.toLocaleString('vi-VN')} ₫)`);
  res.json(newExp);
});

// Savings Goals API
app.get("/api/goals", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(savingsGoals);
  res.json(savingsGoals.filter(g => g.spaceId === spaceId));
});

app.post("/api/goals", (req, res) => {
  const { spaceId, title, targetAmount, currentAmount, deadline, icon, color } = req.body;
  const newGoal: SavingsGoalStore = {
    id: `goal_${Date.now()}`,
    spaceId: spaceId || spaces[0]?.id || "space_main",
    title: title || "Mục tiêu mới",
    targetAmount: Number(targetAmount || 0),
    currentAmount: Number(currentAmount || 0),
    deadline,
    icon: icon || "Target",
    color: color || "blue"
  };
  savingsGoals.push(newGoal);
  saveDocument("savingsGoals", newGoal);
  res.json(newGoal);
});

app.post("/api/goals/:id/contribute", (req, res) => {
  const { id } = req.params;
  const { amount, userId } = req.body;
  const goal = savingsGoals.find(g => g.id === id);
  if (!goal) return res.status(404).json({ error: "Không tìm thấy mục tiêu" });

  goal.currentAmount += Number(amount || 0);
  saveDocument("savingsGoals", goal);
  const user = safeUser(userId);
  addAuditLog(goal.spaceId, user.id, user.name, "GOAL_CONTRIBUTION", `${user.name} đã trích tiết kiệm ${Number(amount).toLocaleString('vi-VN')} ₫ vào quỹ "${goal.title}"`);
  res.json(goal);
});

app.delete("/api/goals/:id", (req, res) => {
  const { id } = req.params;
  savingsGoals = savingsGoals.filter(g => g.id !== id);
  deleteDocument("savingsGoals", id);
  res.json({ success: true });
});

// Favorite Templates API
app.get("/api/templates", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(favoriteTemplates);
  res.json(favoriteTemplates.filter(t => t.spaceId === spaceId));
});

app.post("/api/templates", (req, res) => {
  const { spaceId, title, amount, category, paidById, note, tags } = req.body;
  const newTpl: FavoriteTemplateStore = {
    id: `tpl_${Date.now()}`,
    spaceId: spaceId || spaces[0]?.id || "space_main",
    title: title || "Mẫu chi tiêu",
    amount: Number(amount || 0),
    category: category || "Groceries",
    paidById: paidById || safeUser().id,
    note,
    tags
  };
  favoriteTemplates.push(newTpl);
  saveDocument("favoriteTemplates", newTpl);
  res.json(newTpl);
});

app.delete("/api/templates/:id", (req, res) => {
  const { id } = req.params;
  favoriteTemplates = favoriteTemplates.filter(t => t.id !== id);
  deleteDocument("favoriteTemplates", id);
  res.json({ success: true });
});

// Wallets API
app.get("/api/wallets", (req, res) => {
  ensureDefaultUserAndSpace();
  res.json(sampleWallets);
});

app.post("/api/wallets", (req, res) => {
  const { name, type, balance, accountNumber, icon, color, isDefault } = req.body;
  const newW: Wallet = {
    id: `w_${Date.now()}`,
    name: name || "Ví Mới",
    type: type || "BANK",
    balance: Number(balance || 0),
    currency: "VND",
    accountNumber,
    icon: icon || "Building2",
    color: color || "from-blue-600 to-indigo-700",
    isDefault: !!isDefault
  };
  sampleWallets.push(newW);
  saveDocument("wallets", newW);
  res.json(newW);
});

app.put("/api/wallets/:id", (req, res) => {
  const { id } = req.params;
  const idx = sampleWallets.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: "Không tìm thấy ví" });

  sampleWallets[idx] = {
    ...sampleWallets[idx],
    ...req.body,
    balance: req.body.balance !== undefined ? Number(req.body.balance) : sampleWallets[idx].balance
  };
  saveDocument("wallets", sampleWallets[idx]);
  res.json(sampleWallets[idx]);
});

app.delete("/api/wallets/:id", (req, res) => {
  const { id } = req.params;
  sampleWallets = sampleWallets.filter(w => w.id !== id);
  deleteDocument("wallets", id);
  res.json({ success: true });
});

// Bills API
app.get("/api/bills", (req, res) => {
  ensureDefaultUserAndSpace();
  res.json(sampleBills);
});

app.post("/api/bills", (req, res) => {
  const { title, amount, category, dueDate, merchant, frequency, icon } = req.body;
  const newBill: BillReminder = {
    id: `b_${Date.now()}`,
    title: title || "Hóa đơn mới",
    amount: Number(amount || 0),
    category: category || "Utilities",
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    merchant,
    isPaid: false,
    frequency: frequency || "MONTHLY",
    icon: icon || "Calendar"
  };
  sampleBills.unshift(newBill);
  saveDocument("bills", newBill);
  res.json(newBill);
});

app.post("/api/bills/:id/pay", (req, res) => {
  const { id } = req.params;
  const { spaceId, userId } = req.body;
  const bill = sampleBills.find(b => b.id === id);
  if (!bill) return res.status(404).json({ error: "Không tìm thấy hóa đơn" });

  bill.isPaid = true;
  saveDocument("bills", bill);

  const targetSpace = safeSpace(spaceId);
  const user = safeUser(userId);
  const memberA = targetSpace.members[0] || user;
  const memberB = targetSpace.members[1] || user;

  const newExp: Expense = {
    id: `exp_${Date.now()}`,
    spaceId: targetSpace.id,
    title: `Thanh toán: ${bill.title}`,
    amount: bill.amount,
    date: new Date().toISOString().split("T")[0],
    category: bill.category,
    paidById: user.id,
    splitType: "50_50",
    splitDetails: {
      userAId: memberA.id,
      userBId: memberB.id,
      userAPercent: 50,
      userBPercent: 50
    },
    note: `Hóa đơn định kỳ ${bill.frequency}`,
    createdAt: new Date().toISOString(),
    createdBy: user.id
  };

  expenses.unshift(newExp);
  saveDocument("expenses", newExp);
  addAuditLog(targetSpace.id, user.id, user.name, "CREATE_EXPENSE", `Đã thanh toán hóa đơn "${bill.title}" (${bill.amount.toLocaleString('vi-VN')} ₫)`);

  res.json({ success: true, bill, expense: newExp });
});

app.put("/api/bills/:id", (req, res) => {
  const { id } = req.params;
  const idx = sampleBills.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "Không tìm thấy hóa đơn" });

  sampleBills[idx] = {
    ...sampleBills[idx],
    ...req.body,
    amount: req.body.amount !== undefined ? Number(req.body.amount) : sampleBills[idx].amount
  };
  saveDocument("bills", sampleBills[idx]);
  res.json(sampleBills[idx]);
});

app.delete("/api/bills/:id", (req, res) => {
  const { id } = req.params;
  sampleBills = sampleBills.filter(b => b.id !== id);
  deleteDocument("bills", id);
  res.json({ success: true });
});

// Achievements API
app.get("/api/achievements", (req, res) => {
  ensureDefaultUserAndSpace();
  res.json(achievements);
});

app.post("/api/achievements/:id/unlock", (req, res) => {
  const { id } = req.params;
  const ach = achievements.find(a => a.id === id);
  if (!ach) return res.status(404).json({ error: "Không tìm thấy danh hiệu" });

  ach.unlocked = true;
  ach.unlockedAt = new Date().toISOString();
  saveDocument("achievements", ach);
  res.json(ach);
});

// Notifications API
app.get("/api/notifications", (req, res) => {
  const { spaceId } = req.query;
  if (!spaceId) return res.json(appNotifications);
  res.json(appNotifications.filter(n => n.spaceId === spaceId));
});

app.post("/api/notifications", (req, res) => {
  const { spaceId, title, message, time, type } = req.body;
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
    spaceId: spaceId || spaces[0]?.id || "space_main",
    title: title || "Thông báo",
    message: message || "",
    time: time || "Vừa xong",
    read: false,
    type: type || "BELL"
  };
  appNotifications.unshift(newNotif);
  saveDocument("appNotifications", newNotif);
  res.json(newNotif);
});

app.put("/api/notifications/read-all", (req, res) => {
  const { spaceId } = req.body;
  if (!spaceId) return res.json({ success: true });
  appNotifications = appNotifications.map(n => {
    if (n.spaceId === spaceId && !n.read) {
      const updated = { ...n, read: true };
      saveDocument("appNotifications", updated);
      return updated;
    }
    return n;
  });
  res.json({ success: true });
});

// Merchants API
app.get("/api/merchants", (req, res) => {
  const { spaceId } = req.query;
  const targetExpenses = spaceId ? expenses.filter(e => e.spaceId === spaceId) : expenses;

  const merchantMap: { [name: string]: { totalSpent: number; count: number; category: string } } = {};

  targetExpenses.forEach(exp => {
    let mName = (exp as any).merchant || exp.title || "Khác";
    if (!merchantMap[mName]) {
      merchantMap[mName] = { totalSpent: 0, count: 0, category: exp.category };
    }
    merchantMap[mName].totalSpent += exp.amount;
    merchantMap[mName].count += 1;
  });

  const list = Object.entries(merchantMap).map(([name, data], i) => ({
    id: `m_${i}`,
    name,
    category: data.category,
    totalSpent: data.totalSpent,
    transactionCount: data.count
  }));

  res.json(list);
});

// AI Financial Chat Assistant
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message, spaceId } = req.body;
    const ai = getGeminiClient();

    const targetSpace = spaces.find(s => s.id === spaceId) || safeSpace();
    const spaceExpenses = expenses.filter(e => e.spaceId === targetSpace.id);

    const totalSpent = spaceExpenses.reduce((acc, e) => acc + e.amount, 0);
    const memberA = targetSpace.members[0];
    const memberB = targetSpace.members[1] || memberA;

    const userAPaid = spaceExpenses.filter(e => e.paidById === memberA.id).reduce((acc, e) => acc + e.amount, 0);
    const userBPaid = memberB ? spaceExpenses.filter(e => e.paidById === memberB.id).reduce((acc, e) => acc + e.amount, 0) : 0;

    const expenseSummary = spaceExpenses.slice(0, 30).map(e => `- ${e.date}: ${e.title} (${e.amount.toLocaleString('vi-VN')} ₫) - Danh mục: ${e.category}`).join("\n");

    const systemInstruction = `Bạn là Trợ Lý Tài Chính Thông Minh AI cho ứng dụng DuoExpense dành cho cặp đôi/phòng trọ.
Bạn có quyền truy cập dữ liệu thực tế không gian "${targetSpace.name}":
- Tổng chi tiêu tháng: ${totalSpent.toLocaleString('vi-VN')} ₫
- ${memberA.name} đã trả: ${userAPaid.toLocaleString('vi-VN')} ₫
- ${memberB.name} đã trả: ${userBPaid.toLocaleString('vi-VN')} ₫
- Danh sách các khoản chi tiêu:
${expenseSummary}

Hãy trả lời câu hỏi của người dùng một cách thân thiện, chính xác, hài hước nhẹ nhàng, súc tích và có tính toán con số thực tế. Bạn có thể dự đoán chi tiêu cuối tháng, so sánh ai chi nhiều hơn, đưa ra lời khuyên tiết kiệm cụ thể!`;

    const response = await generateWithGeminiFallback(ai, {
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      reply: response.text || "Tôi đã xem qua dữ liệu nhưng chưa tìm ra câu trả lời phù hợp, bạn có thể hỏi lại chi tiết hơn nhé!"
    });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    res.status(500).json({
      success: false,
      error: "Không thể kết nối với Trợ lý AI. Vui lòng thử lại sau!"
    });
  }
});

// AI Smart Insights Generator
app.get("/api/ai-insights", async (req, res) => {
  const { spaceId } = req.query;
  const targetExpenses = spaceId ? expenses.filter(e => e.spaceId === spaceId) : expenses;

  if (targetExpenses.length === 0) {
    return res.json([
      {
        id: "ins_1",
        type: "SAVING",
        title: "Sẵn sàng ghi chép chi tiêu 🚀",
        description: "Không gian của bạn hiện chưa có giao dịch nào. Hãy thêm khoản chi đầu tiên hoặc dùng AI Smart Camera quét hóa đơn!",
        actionHint: "Bấm nút 'Thêm Khoản Chi' để bắt đầu quản lý tài chính"
      }
    ]);
  }

  const totalSpent = targetExpenses.reduce((acc, e) => acc + e.amount, 0);
  const foodSpent = targetExpenses.filter(e => e.category === "Groceries" || e.category === "Dating").reduce((acc, e) => acc + e.amount, 0);
  const avgPerTrans = Math.round(totalSpent / targetExpenses.length);

  const insights = [
    {
      id: "ins_1",
      type: "WARNING",
      title: "Tổng quan chi tiêu 📊",
      description: `Tổng chi tiêu hiện tại là ${totalSpent.toLocaleString('vi-VN')} ₫ với ${targetExpenses.length} khoản chi đã ghi nhận (trung bình ${avgPerTrans.toLocaleString('vi-VN')} ₫/giao dịch).`,
      actionHint: "Theo dõi ngân sách định kỳ để kiểm soát chi tiêu"
    },
    {
      id: "ins_2",
      type: "SAVING",
      title: "Phân tích nhóm Ăn uống & Sinh hoạt 🍲",
      description: `Tổng chi cho ăn uống & hẹn hò đạt ${foodSpent.toLocaleString('vi-VN')} ₫ (${totalSpent > 0 ? Math.round((foodSpent / totalSpent) * 100) : 0}% tổng chi tiêu).`,
      actionHint: "Tự nấu ăn tại nhà sẽ giúp tiết kiệm ngân sách hiệu quả"
    }
  ];

  res.json(insights);
});

// Gemini AI Parse Endpoint for text or receipt image
app.post("/api/gemini-parse", async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `Bạn là trợ lý tài chính thông minh phân tích hóa đơn hoặc mô tả chi tiêu bằng tiếng Việt cho cặp đôi.
Nhiệm vụ: Phân tích văn bản hoặc hình ảnh hóa đơn và trả về JSON chuẩn theo schema sau:
{
  "title": "Tên khoản chi ngắn gọn (Ví dụ: Đi siêu thị Lotte, Ăn lẩu Haidilao, Tiền điện tháng 7)",
  "amount": 350000 (Số tiền nguyên dương dạng number, tính theo VND),
  "category": "Housing" | "Groceries" | "Dating" | "Utilities" | "Shopping" | "Entertainment" | "Transportation" | "Health" | "Other",
  "splitType": "50_50" | "PERCENTAGE" | "EXACT",
  "userAPercent": 50 (hoặc số % của người A nếu đề cập),
  "userBPercent": 50 (hoặc số % của người B nếu đề cập),
  "paidBy": "user_nam" | "user_mai" (Nếu văn bản ghi Nam trả thì "user_nam", Mai trả thì "user_mai", mặc định "user_nam"),
  "note": "Ghi chú thêm nếu có",
  "lineItems": [
    {
      "id": "item_1",
      "name": "Tên món/mặt hàng",
      "quantity": 1,
      "price": 65000,
      "total": 65000
    }
  ]
}
Nếu hình ảnh hoặc mô tả có danh sách từng món ăn/hàng hóa, hãy trích xuất toàn bộ vào mảng "lineItems". Nếu không có danh sách chi tiết từng món, "lineItems" có thể là mảng rỗng [].`;

    const contents: any[] = [];
    if (imageBase64) {
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
        }
      });
    }

    contents.push({
      text: prompt || "Phân tích hóa đơn này và trích xuất thông tin chi tiêu cùng các món chi tiết."
    });

    const response = await generateWithGeminiFallback(ai, {
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Gemini parse error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Không thể phân tích dữ liệu bằng AI. Vui lòng thử lại."
    });
  }
});

// Vietnamese Bank SMS & Notification Parser API
app.post("/api/parse-bank-notification", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Nội dung thông báo không được để trống" });
    }

    const cleanText = text.trim();

    // 1. Bank pattern detection
    let detectedBank = "Ngân Hàng";
    if (/techcombank|tcb/i.test(cleanText)) detectedBank = "Techcombank";
    else if (/vietcombank|vcb|mbvcb/i.test(cleanText)) detectedBank = "Vietcombank";
    else if (/mb\s*bank|mbbank|mbb/i.test(cleanText)) detectedBank = "MB Bank";
    else if (/\bacb\b/i.test(cleanText)) detectedBank = "ACB";
    else if (/vpbank|vpb/i.test(cleanText)) detectedBank = "VPBank";
    else if (/tpbank/i.test(cleanText)) detectedBank = "TPBank";
    else if (/bidv/i.test(cleanText)) detectedBank = "BIDV";
    else if (/vietinbank|vtb/i.test(cleanText)) detectedBank = "VietinBank";
    else if (/momo/i.test(cleanText)) detectedBank = "MoMo";
    else if (/zalopay|zalo\s*pay/i.test(cleanText)) detectedBank = "ZaloPay";

    // 2. Type detection
    let type = "EXPENSE";
    if (
      cleanText.includes("+") ||
      /nhận được|nhan duoc|cộng|cong tien|hoàn tiền|hoan tien/i.test(cleanText)
    ) {
      type = "INCOME";
    }

    // 3. Amount extraction via Regex
    let amount = 0;
    const amountRegexes = [
      /([+-]?\s*\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?)\s*(?:vnd|vnđ|d|đ)/i,
      /(?:gd|giao dịch|thanh toán|số tiền|so tien|chuyển|nhận)[:\s]*([+-]?\s*\d{1,3}(?:[.,]\d{3})+)/i,
      /([+-]?\s*\d{1,3}(?:[.,]\d{3})+)\s*(?:tai|tại|cho|luc|lúc|ngay|ngày)/i,
      /([+-]?\s*\d{4,9})\s*(?:vnd|vnđ|d|đ)/i
    ];

    for (const rx of amountRegexes) {
      const match = cleanText.match(rx);
      if (match && match[1]) {
        const cleanStr = match[1].replace(/[^\d]/g, "");
        const val = parseInt(cleanStr, 10);
        if (!isNaN(val) && val > 0) {
          amount = val;
          break;
        }
      }
    }

    // 4. Content / Merchant extraction
    let merchant = "";
    const contentMatch = cleanText.match(/(?:nd|nội dung|noi dung|tai|tại|cho|ref)[:\s]+([^.\n;]+)/i);
    if (contentMatch && contentMatch[1]) {
      merchant = contentMatch[1].trim();
    }

    // Check known brands
    const knownBrands = ["Highlands", "The Coffee House", "Phúc Long", "Katinat", "Starbucks", "Circle K", "WinMart", "Co.opmart", "Lotte Mart", "Bách Hóa Xanh", "Shopee", "Grab", "Be", "Gojek", "Haidilao", "Pizza 4P's", "GS25"];
    for (const b of knownBrands) {
      if (new RegExp(b, "i").test(cleanText)) {
        merchant = b;
        break;
      }
    }

    // Date
    let date = new Date().toISOString().split("T")[0];
    const dateMatch = cleanText.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2].padStart(2, "0");
      const year = dateMatch[3] 
        ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) 
        : new Date().getFullYear().toString();
      const parsedDate = `${year}-${month}-${day}`;
      if (!isNaN(new Date(parsedDate).getTime())) {
        date = parsedDate;
      }
    }

    // If we have an amount, return immediately or refine with AI
    if (amount > 0) {
      let category = "Groceries";
      if (/xăng|xe|grab|be|gojek|taxi/i.test(merchant || cleanText)) category = "Transportation";
      else if (/điện|nước|internet|wifi/i.test(merchant || cleanText)) category = "Utilities";
      else if (/nhà|phòng|rent/i.test(merchant || cleanText)) category = "Housing";
      else if (/shopee|tiki|lazada|mua sắm|áo|quần/i.test(merchant || cleanText)) category = "Shopping";
      else if (/thuốc|bệnh viện|khám|gym/i.test(merchant || cleanText)) category = "Health";
      else if (/phim|cgv|du lịch|resort|karaoke/i.test(merchant || cleanText)) category = "Entertainment";
      else if (/cafe|cà phê|trà sữa|lẩu|nướng|ăn|dating/i.test(merchant || cleanText)) category = "Dating";

      return res.json({
        success: true,
        source: "regex",
        data: {
          title: merchant ? `Thanh toán ${merchant}` : `Giao dịch ${detectedBank}`,
          amount,
          category,
          type,
          date,
          merchant,
          detectedBank,
          note: `Trích xuất tự động từ SMS ${detectedBank}`
        }
      });
    }

    // Fallback to Gemini AI if regex could not extract amount
    const ai = getGeminiClient();
    const systemInstruction = `Bạn là chuyên gia phân tích tin nhắn SMS và thông báo biến động số dư ngân hàng Việt Nam (VCB, TCB, MB, ACB, MoMo, ZaloPay, etc).
Hãy đọc tin nhắn và trả về JSON:
{
  "title": "Tên chi tiêu hoặc tên người/đơn vị nhận tiền",
  "amount": 50000 (số tiền số nguyên VND),
  "category": "Housing" | "Groceries" | "Dating" | "Utilities" | "Shopping" | "Entertainment" | "Transportation" | "Health" | "Other",
  "type": "EXPENSE" | "INCOME",
  "date": "YYYY-MM-DD",
  "merchant": "Tên cửa hàng nếu có",
  "detectedBank": "Tên ngân hàng"
}`;

    const response = await generateWithGeminiFallback(ai, {
      contents: cleanText,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini",
      data: {
        title: parsed.title || "Giao dịch ngân hàng",
        amount: Number(parsed.amount || 0),
        category: parsed.category || "Groceries",
        type: parsed.type || "EXPENSE",
        date: parsed.date || new Date().toISOString().split("T")[0],
        merchant: parsed.merchant || "",
        detectedBank: parsed.detectedBank || detectedBank,
        note: `AI trích xuất từ SMS ${parsed.detectedBank || detectedBank}`
      }
    });
  } catch (err: any) {
    console.error("Bank notification parse error:", err);
    res.status(500).json({
      success: false,
      error: "Không thể phân tích tin nhắn ngân hàng. Vui lòng kiểm tra lại nội dung."
    });
  }
});

async function startServer() {
  try {
    console.log("🔥 Syncing data with Cloud Firestore...");
    users = await syncCollection("users", users);
    spaces = await syncCollection("spaces", spaces);
    expenses = await syncCollection("expenses", expenses);
    settlements = await syncCollection("settlements", settlements);
    budgets = await syncCollection("budgets", budgets);
    auditLogs = await syncCollection("auditLogs", auditLogs);
    recurringExpenses = await syncCollection("recurringExpenses", recurringExpenses);
    savingsGoals = await syncCollection("savingsGoals", savingsGoals);
    favoriteTemplates = await syncCollection("favoriteTemplates", favoriteTemplates);
    sampleWallets = await syncCollection("wallets", sampleWallets);
    sampleBills = await syncCollection("bills", sampleBills);
    achievements = await syncCollection("achievements", achievements);
    appNotifications = await syncCollection("appNotifications", appNotifications);

    // Ensure initial default user & space exist if database is fresh
    ensureDefaultUserAndSpace();

    console.log("✅ Firestore sync complete!");
  } catch (err) {
    console.error("Firestore startup sync error:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DuoExpense Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
