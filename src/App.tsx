import React, { useState, useEffect } from "react";
import { 
  SharedSpace, 
  User, 
  Expense, 
  Settlement, 
  Budget, 
  AuditLog, 
  AppNotification, 
  CategoryKey,
  RecurringExpense,
  SavingsGoal,
  FavoriteTemplate,
  Wallet,
  BillReminder,
  Achievement
} from "./types";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavTab } from "./components/Sidebar";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { ExpensesList } from "./components/ExpensesList";
import { AnalyticsView } from "./components/AnalyticsView";
import { BudgetView } from "./components/BudgetView";
import { AuditLogView } from "./components/AuditLogView";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { AISmartInputModal } from "./components/AISmartInputModal";
import { SettleUpModal } from "./components/SettleUpModal";
import { PairingModal } from "./components/PairingModal";
import { AIChatDrawer } from "./components/AIChatDrawer";
import { CalendarView } from "./components/CalendarView";
import { TimelineFeedView } from "./components/TimelineFeedView";
import { RecurringExpenseView } from "./components/RecurringExpenseView";
import { SavingsGoalsView } from "./components/SavingsGoalsView";
import { DebtHistoryChart } from "./components/DebtHistoryChart";
import { SaaSMetricsAndHeatmap } from "./components/SaaSMetricsAndHeatmap";
import { FavoriteTemplatesBar } from "./components/FavoriteTemplatesBar";
import { SmartSearchAndFilterModal, FilterOptions } from "./components/SmartSearchAndFilterModal";

import { SplashScreen } from "./components/SplashScreen";
import { OnboardingModal } from "./components/OnboardingModal";
import { EditProfileModal } from "./components/EditProfileModal";
import { AuthModal } from "./components/AuthModal";
import { TransactionDetailModal } from "./components/TransactionDetailModal";
import { WalletsView } from "./components/WalletsView";
import { BillsReminderView } from "./components/BillsReminderView";
import { NotificationsModal } from "./components/NotificationsModal";
import { ProfileAndSettingsView } from "./components/ProfileAndSettingsView";
import { MobileBottomNav, MobileTab } from "./components/MobileBottomNav";
import { BankSmsImportModal } from "./components/BankSmsImportModal";
import { ItemizedReceiptSplitModal } from "./components/ItemizedReceiptSplitModal";
import { SpeedDialMenu } from "./components/SpeedDialMenu";
import { exportToCSV } from "./utils/export";
import { calculateBalance, formatVND } from "./utils/formatters";
import { useToast } from "./context/ToastContext";
import { Users, Link as LinkIcon, Plus } from "lucide-react";

export function saveUserSession(user: User) {
  localStorage.setItem("expense_flow_user", JSON.stringify({
    user,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
  }));
}

export function getUserSession(): User | null {
  const saved = localStorage.getItem("expense_flow_user");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        if (parsed.user && parsed.user.id) {
          if (parsed.expires && Date.now() > parsed.expires) {
            localStorage.removeItem("expense_flow_user");
            return null;
          }
          return parsed.user;
        } else if (parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

export default function App() {
  const { showSuccess, showError, showInfo } = useToast();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("expense_flow_theme");
    return saved ? saved === "dark" : false;
  });
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const sessionUser = getUserSession();
    if (sessionUser) return sessionUser;
    
    return {
      id: "user_main",
      name: "Tài Khoản Của Tôi",
      email: "user@expenseflow.app",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MainUser",
      bankName: "MBBank",
      accountNumber: "0988776655"
    };
  });

  const [spaces, setSpaces] = useState<SharedSpace[]>([]);
  const [activeSpace, setActiveSpace] = useState<SharedSpace | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Auth & Visibility state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getUserSession());
  const [showSplash, setShowSplash] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(() => !getUserSession());
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [selectedDetailExpense, setSelectedDetailExpense] = useState<Expense | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Partial<Expense> | null>(null);
  const [isAIScanOpen, setIsAIScanOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [pairingTab, setPairingTab] = useState<"LIST" | "CREATE" | "JOIN">("JOIN");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({ keyword: "" });

  // Bank SMS Fast-Import & Itemized Split States
  const [isBankSmsOpen, setIsBankSmsOpen] = useState(false);
  const [isItemizedSplitOpen, setIsItemizedSplitOpen] = useState(false);
  const [itemizedInitialItems, setItemizedInitialItems] = useState<any[]>([]);
  const [itemizedInitialTitle, setItemizedInitialTitle] = useState("");

  const handleSaveProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    saveUserSession(updatedUser);

    setUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      if (exists) {
        return prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      }
      return [...prev, updatedUser];
    });

    setSpaces(prev => prev.map(s => ({
      ...s,
      members: s.members.map(m => m.id === updatedUser.id ? { ...m, ...updatedUser } : m)
    })));

    setActiveSpace(prev => {
      if (!prev) return null;
      return {
        ...prev,
        members: prev.members.map(m => m.id === updatedUser.id ? { ...m, ...updatedUser } : m)
      };
    });
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("expense_flow_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("expense_flow_theme", "light");
    }
  }, [darkMode]);

  // Load initial backend data & user-specific allowed spaces
  useEffect(() => {
    async function loadData() {
      try {
        const uRes = await fetch("/api/users");
        const uData = await uRes.json();
        setUsers(uData);

        const userToFetch = currentUser || uData[0];
        if (userToFetch) {
          const sRes = await fetch(`/api/spaces?userId=${userToFetch.id}`);
          const sData: SharedSpace[] = await sRes.json();
          setSpaces(sData);

          if (sData.length > 0) {
            setActiveSpace(prev => (prev && sData.some(s => s.id === prev.id) ? prev : sData[0]));
          } else {
            setActiveSpace(null);
          }
        }
      } catch (err) {
        console.error("Failed loading initial data:", err);
      }
    }
    loadData();
  }, [currentUser?.id]);

  // Fetch space specific data when active space changes
  useEffect(() => {
    if (!activeSpace) return;

    async function loadSpaceData() {
      try {
        const [eRes, setRes, bRes, logRes, recRes, goalRes, wRes, billRes, achRes, notifRes] = await Promise.all([
          fetch(`/api/expenses?spaceId=${activeSpace.id}`),
          fetch(`/api/settlements?spaceId=${activeSpace.id}`),
          fetch(`/api/budgets?spaceId=${activeSpace.id}`),
          fetch(`/api/audit-logs?spaceId=${activeSpace.id}`),
          fetch(`/api/recurring?spaceId=${activeSpace.id}`),
          fetch(`/api/goals?spaceId=${activeSpace.id}`),
          fetch(`/api/wallets`),
          fetch(`/api/bills`),
          fetch(`/api/achievements`),
          fetch(`/api/notifications?spaceId=${activeSpace.id}`)
        ]);

        const eData = await eRes.json();
        const setData = await setRes.json();
        const bData = await bRes.json();
        const logData = await logRes.json();
        const recData = await recRes.json();
        const goalData = await goalRes.json();
        const wData = await wRes.json();
        const billData = await billRes.json();
        const achData = await achRes.json();
        const notifData = await notifRes.json();

        setExpenses(eData);
        setSettlements(setData);
        setBudgets(bData);
        setAuditLogs(logData);
        setRecurringExpenses(recData);
        setSavingsGoals(goalData);
        setWallets(wData);
        setBills(billData);
        setAchievements(achData);
        setNotifications(notifData);
      } catch (err) {
        console.error("Failed loading space data:", err);
      }
    }

    loadSpaceData();
  }, [activeSpace?.id]);

  // Handle Save Expense (Create or Update)
  const handleSaveExpense = async (expenseData: Partial<Expense>) => {
    if (!activeSpace) return;

    try {
      if (expenseData.id) {
        // Update
        const res = await fetch(`/api/expenses/${expenseData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...expenseData, updatedBy: currentUser.id })
        });
        const updated = await res.json();
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
        showSuccess("Cập nhật khoản chi thành công!", `Đã lưu các thay đổi cho "${updated.title}"`);
      } else {
        // Create
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...expenseData,
            spaceId: activeSpace.id,
            createdBy: currentUser.id
          })
        });
        const created = await res.json();
        setExpenses(prev => [created, ...prev]);
        showSuccess("Thêm khoản chi mới thành công!", `"${created.title}" - ${formatVND(created.amount)}`);

        const notifRes = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spaceId: activeSpace.id,
            title: "Thêm khoản chi mới",
            message: `${currentUser.name} đã thêm "${created.title}" - ${formatVND(created.amount)}`,
            type: "EXPENSE_ADDED"
          })
        });
        const createdNotif = await notifRes.json();
        setNotifications(prev => [createdNotif, ...prev]);
      }

      // Refresh audit logs
      const logRes = await fetch(`/api/audit-logs?spaceId=${activeSpace.id}`);
      const logData = await logRes.json();
      setAuditLogs(logData);

    } catch (err) {
      console.error("Error saving expense:", err);
      showError("Lỗi lưu khoản chi", "Không thể hoàn tất thao tác. Vui lòng thử lại.");
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeSpace) return;

    try {
      await fetch(`/api/expenses/${expenseId}?userId=${currentUser.id}&spaceId=${activeSpace.id}`, {
        method: "DELETE"
      });

      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      showInfo("Đã xóa khoản chi", "Khoản chi đã được gỡ khỏi danh sách.");

      const logRes = await fetch(`/api/audit-logs?spaceId=${activeSpace.id}`);
      const logData = await logRes.json();
      setAuditLogs(logData);
    } catch (err) {
      console.error("Error deleting expense:", err);
      showError("Lỗi xóa khoản chi", "Không thể xóa khoản chi này.");
    }
  };

  // Handle Confirm Settlement (Settle Up)
  const handleConfirmSettlement = async (settlementData: Partial<Settlement>) => {
    if (!activeSpace) return;

    try {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settlementData, spaceId: activeSpace.id })
      });
      const created = await res.json();
      setSettlements(prev => [created, ...prev]);
      showSuccess("Thanh toán cấn trừ nợ thành công!", `Đã ghi nhận cấn trừ ${formatVND(created.amount)}`);

      const notifRes = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: activeSpace.id,
          title: "Thanh toán cấn trừ nợ",
          message: `${currentUser.name} đã ghi nhận cấn trừ ${formatVND(created.amount)}`,
          type: "SETTLE_RECORDED"
        })
      });
      const createdNotif = await notifRes.json();
      setNotifications(prev => [createdNotif, ...prev]);

      const logRes = await fetch(`/api/audit-logs?spaceId=${activeSpace.id}`);
      const logData = await logRes.json();
      setAuditLogs(logData);
    } catch (err) {
      console.error("Error recording settlement:", err);
      showError("Lỗi cấn trừ nợ", "Vui lòng thử lại sau.");
    }
  };

  // Handle Add Recurring Expense
  const handleAddRecurring = async (data: Partial<RecurringExpense>) => {
    if (!activeSpace) return;
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, spaceId: activeSpace.id })
      });
      const created = await res.json();
      setRecurringExpenses(prev => [...prev, created]);
      showSuccess("Thêm lịch chi định kỳ thành công!", `"${created.title}" - ${formatVND(created.amount)}`);
    } catch (err) {
      console.error("Error creating recurring expense:", err);
      showError("Lỗi tạo chi định kỳ", "Không thể khởi tạo mục chi định kỳ.");
    }
  };

  // Handle Trigger Recurring Expense
  const handleTriggerRecurring = async (id: string) => {
    if (!activeSpace) return;
    try {
      const res = await fetch(`/api/recurring/${id}/trigger`, {
        method: "POST"
      });
      const createdExpense = await res.json();
      setExpenses(prev => [createdExpense, ...prev]);
      showSuccess("Đã thực thi chi định kỳ!", `Đã tự động tạo khoản chi "${createdExpense.title}"`);

      const recRes = await fetch(`/api/recurring?spaceId=${activeSpace.id}`);
      setRecurringExpenses(await recRes.json());
    } catch (err) {
      console.error("Error triggering recurring expense:", err);
      showError("Lỗi thực thi chi định kỳ", "Không thể tự động thêm khoản chi.");
    }
  };

  // Handle Delete Recurring
  const handleDeleteRecurring = async (id: string) => {
    try {
      await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      setRecurringExpenses(prev => prev.filter(r => r.id !== id));
      showInfo("Đã xóa lịch chi định kỳ", "Mục chi định kỳ đã được gỡ bỏ.");
    } catch (err) {
      console.error("Error deleting recurring:", err);
      showError("Lỗi xóa chi định kỳ", "Vui lòng thử lại.");
    }
  };

  // Handle Add Goal
  const handleAddGoal = async (data: Partial<SavingsGoal>) => {
    if (!activeSpace) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, spaceId: activeSpace.id })
      });
      const created = await res.json();
      setSavingsGoals(prev => [...prev, created]);
      showSuccess("Tạo mục tiêu tiết kiệm thành công!", `Mục tiêu "${created.title}" đã được thiết lập.`);
    } catch (err) {
      console.error("Error creating goal:", err);
      showError("Lỗi tạo mục tiêu", "Vui lòng nhập đầy đủ thông tin.");
    }
  };

  // Handle Goal Contribution
  const handleContributeGoal = async (goalId: string, amount: number) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const updated = await res.json();
      setSavingsGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
      showSuccess("Nạp tiền tiết kiệm thành công!", `Đã thêm ${formatVND(amount)} vào "${updated.title}"`);
    } catch (err) {
      console.error("Error contributing to goal:", err);
      showError("Lỗi nạp tiền", "Không thể cập nhật mục tiêu tiết kiệm.");
    }
  };

  // Handle Quick Add Template
  const handleQuickAddTemplate = (tpl: FavoriteTemplate) => {
    handleSaveExpense({
      title: tpl.title,
      amount: tpl.amount,
      category: tpl.category,
      paidById: currentUser.id,
      splitType: (tpl as any).splitType || "50_50",
      date: new Date().toISOString().split("T")[0]
    });
  };

  // Handle Update Budget
  const handleUpdateBudget = async (budget: Partial<Budget>) => {
    if (!activeSpace) return;
    try {
      if (budget.id) {
        // Update existing budget
        const res = await fetch(`/api/budgets/${budget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(budget)
        });
        const data = await res.json();
        setBudgets(data.budgets);
        showSuccess("Cập nhật ngân sách thành công!", "Thông tin ngân sách đã được lưu.");
      } else {
        // Create new budget
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...budget,
            spaceId: activeSpace.id,
          })
        });
        const data = await res.json();
        setBudgets(data.budgets);
        showSuccess("Thêm ngân sách thành công!", "Ngân sách mới đã được tạo.");
      }
    } catch (err) {
      console.error("Error updating budget:", err);
      showError("Lỗi cập nhật ngân sách", "Vui lòng thử lại.");
    }
  };

  // Handle Delete Budget
  const handleDeleteBudget = async (id: string) => {
    if (!activeSpace) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setBudgets(prev => prev.filter(b => b.id !== id));
        showSuccess("Đã xóa ngân sách", "Ngân sách này đã được xóa.");
      }
    } catch (err) {
      console.error("Error deleting budget:", err);
      showError("Lỗi xóa ngân sách", "Vui lòng thử lại.");
    }
  };

  // Handle Create Space
  const handleCreateSpace = async (name: string, description: string) => {
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          creatorId: currentUser.id
        })
      });
      const newSp = await res.json();
      setSpaces(prev => [...prev, newSp]);
      setActiveSpace(newSp);
      showSuccess("Tạo không gian mới thành công!", `Đã tạo và chuyển sang không gian "${newSp.name}".`);
    } catch (err) {
      console.error("Error creating space:", err);
      showError("Lỗi tạo không gian", "Vui lòng thử lại.");
    }
  };

  // Handle Join Space by Code
  const handleJoinSpace = async (inviteCode: string) => {
    try {
      const res = await fetch("/api/spaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          userId: currentUser.id
        })
      });
      if (!res.ok) {
        const err = await res.json();
        showError("Không thể tham gia", err.error || "Mã không hợp lệ.");
        return;
      }
      const sp = await res.json();
      setSpaces(prev => prev.some(s => s.id === sp.id) ? prev : [...prev, sp]);
      setActiveSpace(sp);
      showSuccess("Tham gia không gian thành công!", `Bạn đã gia nhập không gian "${sp.name}".`);
    } catch (err) {
      console.error("Error joining space:", err);
      showError("Lỗi kết nối", "Vui lòng kiểm tra lại kết nối mạng.");
    }
  };

  // Handlers for Wallets & Bills
  const handlePayBill = async (billId: string) => {
    if (!activeSpace) return;
    try {
      const res = await fetch(`/api/bills/${billId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: activeSpace.id,
          userId: currentUser.id
        })
      });
      const data = await res.json();
      if (data.bill) {
        setBills(prev => prev.map(b => b.id === billId ? data.bill : b));
      }
      if (data.expense) {
        setExpenses(prev => [data.expense, ...prev]);
      }
      const logRes = await fetch(`/api/audit-logs?spaceId=${activeSpace.id}`);
      setAuditLogs(await logRes.json());
      showSuccess("Thanh toán hóa đơn thành công!", "Lịch sử chi tiêu đã được cập nhật.");
    } catch (err) {
      console.error("Error paying bill:", err);
      showError("Lỗi thanh toán hóa đơn", "Không thể xử lý giao dịch thanh toán.");
    }
  };

  const handleAddWallet = async (wallet: Partial<Wallet>) => {
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wallet)
      });
      const created = await res.json();
      setWallets(prev => [...prev, created]);
      showSuccess("Thêm tài khoản ví thành công!", `Ví "${created.name || ''}" đã được liên kết.`);
    } catch (err) {
      console.error("Error adding wallet:", err);
      showError("Lỗi thêm ví", "Vui lòng thử lại.");
    }
  };

  const handleAddBill = async (billData: Partial<BillReminder>) => {
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData)
      });
      const created = await res.json();
      setBills(prev => [created, ...prev]);
      showSuccess("Thêm nhắc nhở hóa đơn thành công!", `Nhắc nhở "${created.title}" đã khởi tạo.`);
    } catch (err) {
      console.error("Error adding bill:", err);
      showError("Lỗi thêm nhắc nhở", "Không thể tạo nhắc nhở mới.");
    }
  };

  const handleAIParsedResult = (data: any) => {
    let paidById = currentUser.id;
    if (data.paidBy && activeSpace) {
      const p = data.paidBy.toLowerCase().replace('user_', '');
      const m1 = activeSpace.members[0];
      const m2 = activeSpace.members[1];
      if (m2 && m2.name.toLowerCase().includes(p)) {
        paidById = m2.id;
      } else if (m1 && m1.name.toLowerCase().includes(p)) {
        paidById = m1.id;
      }
    }
    const partialData: Partial<Expense> = {
      title: data.title || "",
      amount: data.amount || 0,
      category: data.category || "Other",
      splitType: data.splitType || "50_50",
      paidById: paidById,
      splitDetails: {
        userAId: activeSpace?.members[0]?.id || "",
        userBId: activeSpace?.members[1]?.id || "",
        userAPercent: data.userAPercent || 50,
        userBPercent: data.userBPercent || 50
      },
      note: data.note || ""
    };
    setEditingExpense(partialData);
    setIsAddModalOpen(true);
  };

  const handleApplyBankSmsExpense = (data: {
    title: string;
    amount: number;
    category: CategoryKey;
    date: string;
    note?: string;
    isPersonal?: boolean;
    isRefund?: boolean;
    merchant?: string;
  }) => {
    const partialData: Partial<Expense> = {
      title: data.title,
      amount: data.amount,
      category: data.category,
      date: data.date,
      paidById: currentUser.id,
      splitType: "50_50",
      splitDetails: {
        userAId: activeSpace?.members[0]?.id || currentUser.id,
        userBId: activeSpace?.members[1]?.id || currentUser.id,
        userAPercent: 50,
        userBPercent: 50
      },
      note: data.note || "",
      isPersonal: data.isPersonal || false,
      isRefund: data.isRefund || false,
      merchant: data.merchant
    };
    setEditingExpense(partialData);
    setIsAddModalOpen(true);
    showSuccess("Đã trích xuất tin nhắn ngân hàng!", "Vui lòng xem lại và lưu khoản chi.");
  };

  const handleSaveItemizedSplitExpense = (expenseData: {
    title: string;
    amount: number;
    category: CategoryKey;
    date: string;
    paidById: string;
    splitType: "EXACT";
    splitDetails: {
      userAId: string;
      userAAmount: number;
      userBId: string;
      userBAmount: number;
    };
    note: string;
  }) => {
    handleSaveExpense({
      ...expenseData,
      spaceId: activeSpace?.id
    });
    showSuccess("Đã lưu khoản chi chia từng món!", "Công nợ giữa các thành viên đã được cập nhật chính xác.");
  };

  // Convert NavTab to MobileTab for bottom nav
  const getMobileTab = (): MobileTab => {
    if (activeTab === "expenses") return "transactions";
    if (activeTab === "analytics" || activeTab === "saas" || activeTab === "debt_history" || activeTab === "budgets") return "stats";
    if (activeTab === "profile" || activeTab === "wallets" || activeTab === "goals" || activeTab === "recurring" || activeTab === "bills" || activeTab === "calendar" || activeTab === "timeline" || activeTab === "settle" || activeTab === "spaces" || activeTab === "audit") return "profile";
    return "home";
  };

  const handleMobileTabChange = (mTab: MobileTab) => {
    if (mTab === "home") setActiveTab("dashboard");
    else if (mTab === "transactions") setActiveTab("expenses");
    else if (mTab === "stats") setActiveTab("analytics");
    else if (mTab === "budgets") setActiveTab("budgets");
    else if (mTab === "profile") setActiveTab("profile");
  };

  if (!activeSpace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6 animate-fadeIn">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-rose-600 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Chào mừng, {currentUser.name}! 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vui lòng chọn 1 trong 2 hình thức dưới đây để bắt đầu quản lý chi tiêu:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option 1: Join Existing Space */}
            <div
              onClick={() => {
                setPairingTab("JOIN");
                setIsPairingOpen(true);
              }}
              className="group p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                  Tham Gia Không Gian Có Sẵn
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Nhập mã kết nối (<code className="text-rose-600 dark:text-rose-400 font-mono font-bold">DUO-XXXX</code>) do người ấy hoặc bạn bè chia sẻ.
                </p>
              </div>
              <button className="w-full py-2.5 px-3 bg-rose-600 group-hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs shadow-rose-500/20 cursor-pointer">
                Nhập Mã Mời Kết Nối →
              </button>
            </div>

            {/* Option 2: Create New Space */}
            <div
              onClick={() => {
                setPairingTab("CREATE");
                setIsPairingOpen(true);
              }}
              className="group p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  Tạo Không Gian Mới
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tự tạo không gian quản lý chi tiêu riêng và nhận mã mời để gửi cho thành viên khác.
                </p>
              </div>
              <button className="w-full py-2.5 px-3 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs">
                Tạo Không Gian Mới →
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
            >
              Đổi sang tài khoản khác
            </button>
          </div>
        </div>

        <PairingModal
          isOpen={isPairingOpen}
          onClose={() => setIsPairingOpen(false)}
          spaces={spaces}
          activeSpace={{ id: "", name: "Chưa chọn không gian", inviteCode: "", description: "", icon: "", members: [currentUser], createdAt: "" }}
          setActiveSpace={setActiveSpace}
          onCreateSpace={handleCreateSpace}
          onJoinSpace={handleJoinSpace}
          initialTab={pairingTab}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            saveUserSession(user);
            setIsAuthOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navigation */}
      <Navbar
        spaces={spaces}
        activeSpace={activeSpace}
        setActiveSpace={setActiveSpace}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notifications={notifications}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onOpenAIScan={() => setIsAIScanOpen(true)}
        onOpenPairing={() => setIsPairingOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenNotificationsModal={() => setIsNotifModalOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAIScan={() => setIsAIScanOpen(true)}
          onOpenAIChat={() => setIsAIChatOpen(true)}
        />

        {/* Tab Content View */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-[calc(6.5rem+env(safe-area-inset-bottom,16px))] md:pb-8 min-w-0 space-y-4 sm:space-y-6">
          
          {/* Favorite Templates Bar (1-Tap Quick Log) */}
          <FavoriteTemplatesBar
            activeSpace={activeSpace}
            currentUser={currentUser}
            onQuickAdd={handleQuickAddTemplate}
          />

          {activeTab === "dashboard" && (
            <OverviewDashboard
              activeSpace={activeSpace}
              currentUser={currentUser}
              expenses={expenses}
              settlements={settlements}
              budgets={budgets}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddModalOpen(true);
              }}
              onOpenAIScan={() => setIsAIScanOpen(true)}
              onOpenSettleUp={() => setIsSettleUpOpen(true)}
              onExportCSV={() => exportToCSV(expenses, activeSpace.name, activeSpace.members)}
              onSelectTab={setActiveTab}
              onSelectExpense={(exp) => setSelectedDetailExpense(exp)}
              onOpenBankSms={() => setIsBankSmsOpen(true)}
              onOpenItemizedSplit={() => {
                setItemizedInitialItems([]);
                setItemizedInitialTitle("Chia từng món");
                setIsItemizedSplitOpen(true);
              }}
            />
          )}

          {activeTab === "expenses" && (
            <ExpensesList
              expenses={expenses}
              settlements={settlements}
              activeSpace={activeSpace}
              currentUser={currentUser}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddModalOpen(true);
              }}
              onEditExpense={exp => {
                setEditingExpense(exp);
                setIsAddModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onExportCSV={() => exportToCSV(expenses, activeSpace.name, activeSpace.members)}
              onSelectExpense={(exp) => setSelectedDetailExpense(exp)}
            />
          )}

          {activeTab === "wallets" && (
            <WalletsView
              wallets={wallets}
              onAddWallet={handleAddWallet}
            />
          )}

          {activeTab === "bills" && (
            <BillsReminderView
              bills={bills}
              onPayBill={handlePayBill}
              onAddBill={handleAddBill}
            />
          )}

          {activeTab === "profile" && (
            <ProfileAndSettingsView
              currentUser={currentUser}
              achievements={achievements}
              activeSpace={activeSpace}
              expenses={expenses}
              onOpenAuth={() => {
                setIsAuthenticated(false);
                setIsAuthOpen(true);
              }}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenPairing={() => setIsPairingOpen(true)}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarView
              expenses={expenses}
              activeSpace={activeSpace}
              onEditExpense={exp => {
                setEditingExpense(exp);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === "timeline" && (
            <TimelineFeedView
              logs={auditLogs}
              expenses={expenses}
              settlements={settlements}
              activeSpace={activeSpace}
            />
          )}

          {activeTab === "recurring" && (
            <RecurringExpenseView
              recurringList={recurringExpenses}
              activeSpace={activeSpace}
              currentUser={currentUser}
              onAddRecurring={handleAddRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onTriggerRecurring={handleTriggerRecurring}
            />
          )}

          {activeTab === "goals" && (
            <SavingsGoalsView
              goals={savingsGoals}
              activeSpace={activeSpace}
              currentUser={currentUser}
              onAddGoal={handleAddGoal}
              onContribute={handleContributeGoal}
            />
          )}

          {activeTab === "saas" && (
            <SaaSMetricsAndHeatmap
              expenses={expenses}
              activeSpace={activeSpace}
            />
          )}

          {activeTab === "debt_history" && (
            <DebtHistoryChart
              expenses={expenses}
              settlements={settlements}
              activeSpace={activeSpace}
              onOpenSettleUp={() => setIsSettleUpOpen(true)}
            />
          )}

          {activeTab === "settle" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold">Cấn Trừ Nợ & Trả Nợ</h2>
                <p className="text-xs text-gray-500 mb-4">
                  Bấm nút bên dưới để xem số dư hiện tại và tạo giao dịch cấn trừ nợ với VietQR hoặc ví điện tử.
                </p>
                <button
                  onClick={() => setIsSettleUpOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
                >
                  Mở Bảng Cấn Trừ Nợ (Settle Up)
                </button>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              <AnalyticsView
                expenses={expenses}
                activeSpace={activeSpace}
              />
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <BudgetView
                  budgets={budgets}
                  expenses={expenses}
                  activeSpace={activeSpace}
                  onUpdateBudget={handleUpdateBudget}
                  onDeleteBudget={handleDeleteBudget}
                />
              </div>
            </div>
          )}

          {activeTab === "budgets" && (
            <BudgetView
              budgets={budgets}
              expenses={expenses}
              activeSpace={activeSpace}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {activeTab === "spaces" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold">Quản lý không gian chi tiêu</h2>
                <p className="text-xs text-gray-500 mb-4">Tạo không gian mới hoặc kết nối với người ấy bằng mã mời.</p>
                <button
                  onClick={() => setIsPairingOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs shadow-rose-500/20 cursor-pointer"
                >
                  Mở Quản Lý Không Gian & Mã Mời
                </button>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <AuditLogView
              logs={auditLogs}
              activeSpace={activeSpace}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        activeSpace={activeSpace}
      />

      <SmartSearchAndFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={setActiveFilters}
        allUsers={users}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveExpense}
        activeSpace={activeSpace || {
          id: "space_default",
          name: "Không gian của tôi",
          inviteCode: "EXP999",
          description: "Mặc định",
          icon: "Home",
          members: [currentUser],
          createdAt: new Date().toISOString()
        }}
        currentUser={currentUser}
        initialData={editingExpense}
        onOpenAIScan={() => setIsAIScanOpen(true)}
        onOpenBankSms={() => setIsBankSmsOpen(true)}
      />

      <AISmartInputModal
        isOpen={isAIScanOpen}
        onClose={() => setIsAIScanOpen(false)}
        onParsedResult={handleAIParsedResult}
        onOpenItemizedSplit={(items, title) => {
          setItemizedInitialItems(items);
          setItemizedInitialTitle(title);
          setIsItemizedSplitOpen(true);
        }}
      />

      <BankSmsImportModal
        isOpen={isBankSmsOpen}
        onClose={() => setIsBankSmsOpen(false)}
        onApplyParsedExpense={handleApplyBankSmsExpense}
      />

      {activeSpace && (
        <ItemizedReceiptSplitModal
          isOpen={isItemizedSplitOpen}
          onClose={() => setIsItemizedSplitOpen(false)}
          activeSpace={activeSpace}
          currentUser={currentUser}
          initialItems={itemizedInitialItems}
          initialTitle={itemizedInitialTitle}
          onSaveSplitExpense={handleSaveItemizedSplitExpense}
        />
      )}

      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        onConfirmSettlement={handleConfirmSettlement}
        activeSpace={activeSpace}
        currentUser={currentUser}
        users={users}
        expenses={expenses}
        settlements={settlements}
      />

      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        spaces={spaces}
        activeSpace={activeSpace}
        setActiveSpace={setActiveSpace}
        onCreateSpace={handleCreateSpace}
        onJoinSpace={handleJoinSpace}
      />

      {/* Premium Fintech Overlays */}
      <SplashScreen
        isOpen={showSplash}
        onClose={() => setShowSplash(false)}
        onGetStarted={() => {
          setShowSplash(false);
          setIsOnboardingOpen(true);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        canClose={isAuthenticated}
        onClose={() => {
          if (isAuthenticated) {
            setIsAuthOpen(false);
          }
        }}
        onLoginSuccess={usr => {
          setCurrentUser(usr);
          setIsAuthenticated(true);
          saveUserSession(usr);
          
          if (activeSpace && !activeSpace.members.some(m => m.id === usr.id)) {
            setActiveSpace({
              ...activeSpace,
              members: [...activeSpace.members, usr]
            });
          }
          
          setIsAuthOpen(false);
        }}
      />

      <TransactionDetailModal
        expense={selectedDetailExpense}
        isOpen={!!selectedDetailExpense}
        onClose={() => setSelectedDetailExpense(null)}
        activeSpace={activeSpace}
        currentUser={currentUser}
        onEdit={exp => {
          setEditingExpense(exp);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteExpense}
      />

      <NotificationsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={async () => {
          if (!activeSpace) return;
          try {
            await fetch("/api/notifications/read-all", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ spaceId: activeSpace.id })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          } catch (e) {
            console.error(e);
          }
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      {/* Mobile Sticky Dock Navigation (5 Tabs) */}
      <MobileBottomNav
        activeTab={getMobileTab()}
        setActiveTab={handleMobileTabChange}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onOpenAIScan={() => setIsAIScanOpen(true)}
        onOpenBankSms={() => setIsBankSmsOpen(true)}
        onOpenItemizedSplit={() => {
          setItemizedInitialItems([]);
          setItemizedInitialTitle("Chia từng món");
          setIsItemizedSplitOpen(true);
        }}
        onOpenSettleUp={() => setIsSettleUpOpen(true)}
      />

      {/* Floating Speed Dial Action Trigger */}
      <SpeedDialMenu
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onOpenBankSms={() => setIsBankSmsOpen(true)}
        onOpenAIScan={() => setIsAIScanOpen(true)}
        onOpenItemizedSplit={() => {
          setItemizedInitialItems([]);
          setItemizedInitialTitle("Chia từng món");
          setIsItemizedSplitOpen(true);
        }}
        onOpenSettleUp={() => setIsSettleUpOpen(true)}
      />

    </div>
  );
}
