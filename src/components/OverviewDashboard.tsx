import React, { useState } from "react";
import { Expense, SharedSpace, User, Settlement, Budget } from "../types";
import { calculateBalance, formatVND, formatDate } from "../utils/formatters";
import { CATEGORIES } from "../data/categories";
import { CategoryIcon } from "./CategoryIcon";
import { CashflowVelocityCard } from "./CashflowVelocityCard";
import { 
  ArrowLeftRight, 
  Plus, 
  Sparkles, 
  Download, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowUpRight,
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Receipt,
  Building2,
  ChevronRight,
  Zap,
  ArrowRight
} from "lucide-react";

interface OverviewDashboardProps {
  activeSpace: SharedSpace;
  currentUser: User;
  expenses: Expense[];
  settlements: Settlement[];
  budgets: Budget[];
  onOpenAddExpense: () => void;
  onOpenAIScan: () => void;
  onOpenSettleUp: () => void;
  onExportCSV: () => void;
  onSelectTab: (tab: any) => void;
  onSelectExpense?: (expense: Expense) => void;
  onOpenBankSms?: () => void;
  onOpenItemizedSplit?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  activeSpace,
  currentUser,
  expenses,
  settlements,
  budgets,
  onOpenAddExpense,
  onOpenAIScan,
  onOpenSettleUp,
  onExportCSV,
  onSelectTab,
  onSelectExpense,
  onOpenBankSms,
  onOpenItemizedSplit
}) => {
  const [activityFilter, setActivityFilter] = useState<"all" | "today">("all");

  const balance = calculateBalance(expenses, settlements, activeSpace.members);

  const memberA = activeSpace.members[0] || currentUser;
  const memberB = activeSpace.members[1] || currentUser;
  const partner = activeSpace.members.find(m => m.id !== currentUser.id) || memberB;

  // Calculate today's spending
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const today = new Date();
  const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  const todayExpenses = expenses.filter(e => isToday(e.date) && !e.isPersonal);
  const todayTotalSpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const todayUserASpent = todayExpenses
    .filter(e => e.paidById === memberA.id)
    .reduce((sum, e) => sum + e.amount, 0);

  const todayUserBSpent = todayExpenses
    .filter(e => e.paidById === memberB.id)
    .reduce((sum, e) => sum + e.amount, 0);

  // Sort expenses by date descending
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const displayedExpenses = activityFilter === "today" ? todayExpenses : recentExpenses;

  // Calculate budget total & spent
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const currentMonthSpent = balance.totalSpentThisMonth;

  // Category totals for current month
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([catKey, total]) => ({
      catInfo: CATEGORIES[catKey as keyof typeof CATEGORIES] || CATEGORIES.Other,
      total
    }))
    .sort((a, b) => b.total - a.total);

  const isUserDebtor = balance.debtor?.id === currentUser.id;
  const isUserCreditor = balance.creditor?.id === currentUser.id;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-2">
      
      {/* Top Banner & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 sm:pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tổng quan tài chính
            </h1>
            <span className="hidden xs:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60">
              {activeSpace.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Không gian chung giữa <strong className="text-slate-800 dark:text-slate-200">{memberA.name}</strong> & <strong className="text-slate-800 dark:text-slate-200">{memberB.name}</strong>
          </p>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenAIScan}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>AI Quét Hóa Đơn</span>
          </button>

          <button
            onClick={onExportCSV}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khoản chi</span>
          </button>
        </div>
      </div>

      {/* Main Fintech Duo Balance & Debt Hero Card */}
      <div className="relative rounded-3xl p-4.5 sm:p-6 shadow-md border transition-all duration-200 border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/95 via-pink-50/60 to-white dark:from-[#200c17] dark:via-[#170a14] dark:to-[#1b0d19] overflow-hidden">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header Status */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-rose-100 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400">
              {balance.netDebt === 0 ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <CreditCard className="w-4.5 h-4.5" />}
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-wider text-rose-600 dark:text-rose-400 uppercase block">
                Tình trạng đối soát
              </span>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Sổ: <span className="font-semibold text-slate-900 dark:text-white">{activeSpace.name}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Status Badge */}
          {balance.netDebt === 0 ? (
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cân bằng 0 ₫</span>
            </div>
          ) : (
            <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs ${
              isUserDebtor
                ? "text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800"
                : "text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isUserDebtor ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
              <span>{isUserDebtor ? "Cần hoàn tiền" : "Chờ nhận tiền"}</span>
            </div>
          )}
        </div>

        {/* Main Debt Amount & Flow */}
        <div className="my-1 sm:my-2">
          {balance.netDebt === 0 || !balance.debtor ? (
            <div className="py-2 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Chi tiêu hoàn toàn cân bằng!
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Hai bạn không còn khoản nợ nào tồn đọng. Mọi chi phí chung đã được đối soát 100%.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Debt Description */}
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {isUserDebtor ? (
                  <span>Khoản bạn cần chuyển cho <strong className="text-rose-600 dark:text-rose-400 font-bold">{balance.creditor?.name}</strong>:</span>
                ) : isUserCreditor ? (
                  <span><strong className="text-emerald-600 dark:text-emerald-400 font-bold">{balance.debtor.name}</strong> cần chuyển cho bạn:</span>
                ) : (
                  <span>{balance.debtor.name} cần chuyển cho {balance.creditor?.name}:</span>
                )}
              </div>

              {/* Massive Amount Display */}
              <div className="flex items-baseline gap-2">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                  {formatVND(balance.netDebt)}
                </div>
              </div>

              {/* Avatar Connection Strip */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between gap-2 shadow-2xs">
                {/* Debtor */}
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    src={balance.debtor.avatar} 
                    alt={balance.debtor.name} 
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-400/40"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {balance.debtor.name}
                    </span>
                    <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-medium leading-none">
                      Người nợ
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center shrink-0 px-1">
                  <ArrowRight className="w-4 h-4 text-rose-400 stroke-[2.5]" />
                  <span className="text-[9px] font-bold text-slate-400">chuyển</span>
                </div>

                {/* Creditor */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="min-w-0 text-right">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {balance.creditor?.name}
                    </span>
                    <span className="block text-[10px] text-emerald-500 dark:text-emerald-400 font-medium leading-none">
                      Người nhận
                    </span>
                  </div>
                  <img 
                    src={balance.creditor?.avatar} 
                    alt={balance.creditor?.name} 
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-400/40"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Settle Up VietQR */}
        <div className="pt-3.5 mt-3.5 border-t border-rose-200/70 dark:border-rose-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-1.5">
              <img src={memberA.avatar} alt={memberA.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />
              <img src={memberB.avatar} alt={memberB.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {memberA.name} & {memberB.name}
            </span>
          </div>

          <button
            onClick={onOpenSettleUp}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-500/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span>Thanh toán VietQR</span>
          </button>
        </div>
      </div>

      {/* Mobile-First 4-Key Quick Action Strip (Thumb Zone) */}
      <div className="grid grid-cols-4 gap-2">
        {/* Action 1: Add Expense */}
        <button
          onClick={onOpenAddExpense}
          className="min-h-[64px] flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-rose-300 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1 group-hover:bg-rose-600 group-hover:text-white transition">
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Thêm chi
          </span>
        </button>

        {/* Action 2: AI Bill Scan */}
        <button
          onClick={onOpenAIScan}
          className="min-h-[64px] flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-pink-300 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-1 group-hover:bg-pink-600 group-hover:text-white transition">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Quét AI
          </span>
        </button>

        {/* Action 3: Bank SMS Import */}
        <button
          onClick={onOpenBankSms || onOpenAddExpense}
          className="min-h-[64px] flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-blue-300 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:bg-blue-600 group-hover:text-white transition">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Dán SMS
          </span>
        </button>

        {/* Action 4: Itemized Split */}
        <button
          onClick={onOpenItemizedSplit || onOpenAddExpense}
          className="min-h-[64px] flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 active:scale-95 transition-all text-center group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Receipt className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            Chia món
          </span>
        </button>
      </div>

      {/* Financial Metrics Cards (Mobile-optimized 2-Col Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Monthly Spent & Budget Progress */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Tổng chi tháng này
              </span>
              <span className="text-[11px] text-slate-400">
                Th{new Date().getMonth() + 1}/{new Date().getFullYear()}
              </span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">
              {formatVND(currentMonthSpent)}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {totalBudgetLimit > 0 
                ? `Đã dùng ${Math.round((currentMonthSpent / totalBudgetLimit) * 100)}% ngân sách (${formatVND(totalBudgetLimit)})` 
                : "Chưa thiết lập hạn mức ngân sách"}
            </p>
          </div>

          {totalBudgetLimit > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentMonthSpent > totalBudgetLimit 
                      ? "bg-rose-500" 
                      : (currentMonthSpent / totalBudgetLimit) > 0.8 
                        ? "bg-amber-500" 
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.round((currentMonthSpent / totalBudgetLimit) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Member Spending Ratio Breakdown */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="uppercase tracking-wider text-[11px] font-bold">Tỷ lệ thanh toán thực tế</span>
              <span className="text-[11px] text-slate-400">Tháng này</span>
            </div>

            {/* Proportion Bar */}
            {currentMonthSpent > 0 && (
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200/50 dark:border-slate-700/50 mt-2.5">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-l-full transition-all duration-500" 
                  style={{ width: `${Math.round((balance.userATotalPaid / (balance.userATotalPaid + balance.userBTotalPaid || 1)) * 100)}%` }}
                />
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-300 rounded-r-full transition-all duration-500" 
                  style={{ width: `${100 - Math.round((balance.userATotalPaid / (balance.userATotalPaid + balance.userBTotalPaid || 1)) * 100)}%` }}
                />
              </div>
            )}

            <div className="space-y-2 pt-2.5">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <img src={memberA.avatar} alt={memberA.name} className="w-4 h-4 rounded-full object-cover border border-rose-500" />
                  <span className="truncate max-w-[100px]">{memberA.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatVND(balance.userATotalPaid)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <img src={memberB.avatar} alt={memberB.name} className="w-4 h-4 rounded-full object-cover border border-pink-400" />
                  <span className="truncate max-w-[100px]">{memberB.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatVND(balance.userBTotalPaid)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Spending Velocity & Cashflow Pace Tracker */}
      <CashflowVelocityCard
        currentMonthSpent={currentMonthSpent}
        monthlyBudgetLimit={totalBudgetLimit}
      />

      {/* Activity Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
          
          {/* Header & Filter Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Nhật ký chi tiêu
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activityFilter === "today" ? `Hôm nay · ${formattedToday}` : `Các giao dịch phát sinh gần nhất`}
                </span>
              </div>
            </div>

            {/* Filter Toggle + View All Link */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center text-xs font-semibold">
                <button
                  onClick={() => setActivityFilter("all")}
                  className={`min-h-[32px] px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activityFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Gần đây
                </button>
                <button
                  onClick={() => setActivityFilter("today")}
                  className={`min-h-[32px] px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activityFilter === "today"
                      ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <span>Hôm nay</span>
                  {todayExpenses.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {todayExpenses.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => onSelectTab("expenses")}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 px-2 py-1.5"
              >
                <span>Xem tất cả ({expenses.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Today Spending Summary Strip */}
          {todayExpenses.length > 0 && (
            <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tổng hôm nay:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">{formatVND(todayTotalSpent)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <img src={memberA.avatar} alt={memberA.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                  <strong className="text-slate-900 dark:text-white font-mono">{formatVND(todayUserASpent)}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <img src={memberB.avatar} alt={memberB.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                  <strong className="text-slate-900 dark:text-white font-mono">{formatVND(todayUserBSpent)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Transaction List */}
          {displayedExpenses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200 dark:border-slate-700">
                <Receipt className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {activityFilter === "today" ? "Chưa có giao dịch nào trong hôm nay" : "Chưa có giao dịch nào"}
              </p>
              <button
                onClick={onOpenAddExpense}
                className="mt-3 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm khoản chi ngay</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {displayedExpenses.map(exp => {
                const cat = CATEGORIES[exp.category] || CATEGORIES.Other;
                const payer = (exp.paidById === currentUser.id ? currentUser : activeSpace.members.find(m => m.id === exp.paidById)) ||
                  (exp.paidById === "user_nam" ? { name: "Hoàng Nam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam" } :
                   exp.paidById === "user_mai" ? { name: "Ngọc Mai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai" } :
                   currentUser);
                return (
                  <div 
                    key={exp.id} 
                    onClick={() => onSelectExpense?.(exp)}
                    className="min-h-[52px] py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 border ${cat.bgColor} shadow-2xs`}>
                        <CategoryIcon category={exp.category} className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {exp.title}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                          <span>•</span>
                          <span>{formatDate(exp.date)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <img src={payer.avatar} alt={payer.name} className="w-3.5 h-3.5 rounded-full object-cover border border-slate-300" />
                            <span className="truncate max-w-[80px]">{payer.name}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                        {formatVND(exp.amount)}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {exp.isPersonal ? (
                          <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md border border-amber-200 dark:border-amber-900/50">Cá nhân</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            {exp.splitType === "50_50" && "Chia 50/50"}
                            {exp.splitType === "PERCENTAGE" && `${exp.splitDetails?.userAPercent ?? 50}%/${exp.splitDetails?.userBPercent ?? 50}%`}
                            {exp.splitType === "EXACT" && "Chia cụ thể"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Category Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <span>Phân loại chi tiêu</span>
            </h3>
            <button
              onClick={() => onSelectTab("analytics")}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Chi tiết
            </button>
          </div>

          <div className="space-y-3">
            {sortedCategories.slice(0, 5).map(({ catInfo, total }) => {
              const percentage = currentMonthSpent > 0 ? Math.round((total / currentMonthSpent) * 100) : 0;
              return (
                <div key={catInfo.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: catInfo.color }} />
                      {catInfo.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {formatVND(total)} <span className="text-slate-400 font-sans text-[11px] font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%`, backgroundColor: catInfo.color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
