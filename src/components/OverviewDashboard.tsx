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
  Receipt 
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
  onSelectExpense
}) => {
  const [activityFilter, setActivityFilter] = useState<"all" | "today">("all");

  const balance = calculateBalance(expenses, settlements, activeSpace.members);

  const memberA = activeSpace.members[0] || currentUser;
  const memberB = activeSpace.members[1] || currentUser;

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

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Top Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tổng quan tài chính • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Không gian chung của <strong className="text-slate-800 dark:text-slate-200">{memberA.name}</strong> và <strong className="text-slate-800 dark:text-slate-200">{memberB.name}</strong>
          </p>
        </div>

        {/* Desktop Quick Actions (hidden on mobile to prevent duplicate CTAs with bottom nav) */}
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

      {/* Hero Debt & Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        
        {/* Main Hero Card: Net Debt Status (Tone Hồng / Rose & Pink Theme) */}
        <div className="md:col-span-2 relative rounded-2xl p-4 sm:p-6 shadow-xs border transition-all duration-200 border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/90 via-pink-50/50 to-white dark:from-[#1f0b16] dark:via-[#160a14] dark:to-[#1a0c18] flex flex-col justify-between">
          
          {/* Top Header: Title & Context */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-400">
                {balance.netDebt === 0 ? <CheckCircle2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase block">
                  Tình trạng công nợ
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Không gian: <span className="font-semibold text-slate-900 dark:text-white">{activeSpace.name}</span>
                </div>
              </div>
            </div>

            {/* Quiet status tag in tone hồng */}
            <div className="text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Tự động đối soát</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="my-2">
            {balance.netDebt === 0 || !balance.debtor ? (
              <div className="py-3 px-1 sm:p-4 rounded-xl flex items-center gap-3.5 sm:gap-4 transition-all">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Số dư cân bằng</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60">
                      0 ₫ tồn đọng
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Không có khoản nợ tồn đọng. Mọi chi phí chung giữa hai bạn đã được chia sẻ đều đặn.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Status Indicator & Clear Typographic Amount */}
                <div>
                  <div className="flex items-center gap-2 mb-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span>{balance.debtor.id === currentUser.id ? "Khoản bạn cần trả cho bạn cùng phòng" : "Khoản bạn sẽ nhận lại"}</span>
                    <span className="text-rose-300 dark:text-rose-700">·</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/70 px-2 py-0.5 rounded-md border border-rose-200/80 dark:border-rose-800/60 text-xs">
                      {balance.debtor.id === currentUser.id ? "Chờ chuyển khoản" : "Chờ hoàn tiền"}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                    {formatVND(balance.netDebt)}
                  </div>
                </div>

                {/* Avatar Connection & Clean Summary */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-rose-200/80 dark:border-rose-800/50 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-800/60">
                      <img src={balance.debtor.avatar} alt={balance.debtor.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-rose-300" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{balance.debtor.name}</span>
                    </div>

                    <ArrowLeftRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />

                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-800/60">
                      <img src={balance.creditor?.avatar} alt={balance.creditor?.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-pink-300" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{balance.creditor?.name}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                    {balance.debtor.id === currentUser.id ? "Chuyển tiền cho " : `${balance.debtor.name} cần chuyển cho `}
                    <strong className="text-rose-600 dark:text-rose-400 font-semibold">{balance.creditor?.name}</strong> để cân bằng số dư.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar: Members & Primary Action Button */}
          <div className="pt-3.5 mt-3.5 border-t border-rose-200/70 dark:border-rose-900/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                <img 
                  src={memberA.avatar} 
                  alt={memberA.name} 
                  className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover border border-rose-300 dark:border-rose-700" 
                />
                <img 
                  src={memberB.avatar} 
                  alt={memberB.name} 
                  className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover border border-pink-300 dark:border-pink-700" 
                />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {memberA.name} <span className="text-rose-400">&</span> {memberB.name}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenSettleUp}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-rose-500/25 transition-all duration-150 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>Thanh toán cấn trừ</span>
            </button>
          </div>
        </div>

        {/* Total Monthly Expenses & Contribution Breakdown Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Tổng chi tháng này
              </span>
              <span className="text-xs font-medium text-slate-400">
                Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
              </span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono tracking-tight">
              {formatVND(currentMonthSpent)}
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {totalBudgetLimit > 0 
                ? `Đã dùng ${Math.round((currentMonthSpent / totalBudgetLimit) * 100)}% ngân sách (${formatVND(totalBudgetLimit)})` 
                : "Chưa thiết lập hạn mức ngân sách"}
            </p>
          </div>

          {/* Member Spending Ratio Progress Bar & Ratio Visual */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              <span>Đóng góp thực tế:</span>
              <span className="text-xs text-slate-400 font-normal">Tỷ lệ thanh toán</span>
            </div>

            {/* Proportion Bar */}
            {currentMonthSpent > 0 && (
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200/50 dark:border-slate-700/50">
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
            
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                  <img src={memberA.avatar} alt={memberA.name} className="w-5 h-5 rounded-full object-cover border border-rose-500" />
                  {memberA.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono">{formatVND(balance.userATotalPaid)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                  <img src={memberB.avatar} alt={memberB.name} className="w-5 h-5 rounded-full object-cover border border-pink-400" />
                  {memberB.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono">{formatVND(balance.userBTotalPaid)}</span>
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

      {/* Unified Activity & Transactions Feed (Eliminates Duplicate Sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left 2 Cols: Activity Feed with Segmented Filter */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          
          {/* Header & Segmented Filter Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Nhật ký chi tiêu
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activityFilter === "today" ? `Hôm nay · ${formattedToday}` : `Các giao dịch phát sinh gần nhất`}
                </span>
              </div>
            </div>

            {/* Filter Toggle + View All Link */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center text-xs font-semibold">
                <button
                  onClick={() => setActivityFilter("all")}
                  className={`min-h-[32px] px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activityFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Gần đây
                </button>
                <button
                  onClick={() => setActivityFilter("today")}
                  className={`min-h-[32px] px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activityFilter === "today"
                      ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold"
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
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg"
              >
                <span>Xem tất cả ({expenses.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today Spending Summary Strip (Shown when today has expenses) */}
          {todayExpenses.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tổng chi hôm nay:</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">{formatVND(todayTotalSpent)}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 flex-wrap">
                <span className="flex items-center gap-1">
                  <img src={memberA.avatar} alt={memberA.name} className="w-4 h-4 rounded-full object-cover border border-rose-300" />
                  <span>{memberA.name}: <strong className="text-slate-900 dark:text-white font-mono">{formatVND(todayUserASpent)}</strong></span>
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>
                <span className="flex items-center gap-1">
                  <img src={memberB.avatar} alt={memberB.name} className="w-4 h-4 rounded-full object-cover border border-pink-300" />
                  <span>{memberB.name}: <strong className="text-slate-900 dark:text-white font-mono">{formatVND(todayUserBSpent)}</strong></span>
                </span>
              </div>
            </div>
          )}

          {/* Transaction List */}
          {displayedExpenses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200 dark:border-slate-700">
                <Receipt className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {activityFilter === "today" ? "Chưa có giao dịch nào trong hôm nay" : "Chưa có giao dịch nào"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {activityFilter === "today" ? "Các khoản chi phát sinh hôm nay sẽ xuất hiện tại đây." : "Bắt đầu bằng cách thêm khoản chi chung đầu tiên."}
              </p>
              <button
                onClick={onOpenAddExpense}
                className="mt-3 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm khoản chi</span>
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
                    className="min-h-[50px] py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border ${cat.bgColor} shadow-xs`}>
                        <CategoryIcon category={exp.category} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {exp.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                          <span>•</span>
                          <span>{formatDate(exp.date)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <img src={payer.avatar} alt={payer.name} className="w-3.5 h-3.5 rounded-full object-cover border border-slate-300" />
                            {payer.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                        {formatVND(exp.amount)}
                      </div>
                      <div className="text-[11px] font-semibold mt-0.5">
                        {exp.isPersonal ? (
                          <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50">Cá nhân</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            {exp.splitType === "50_50" && "Chia 50/50"}
                            {exp.splitType === "PERCENTAGE" && `${exp.splitDetails?.userAPercent ?? 50}% / ${exp.splitDetails?.userBPercent ?? 50}%`}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <PieChartIcon className="w-3.5 h-3.5" />
              </div>
              <span>Danh mục chi tiêu</span>
            </h3>
            <button
              onClick={() => onSelectTab("analytics")}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Xem chi tiết
            </button>
          </div>

          <div className="space-y-3.5">
            {sortedCategories.slice(0, 5).map(({ catInfo, total }) => {
              const percentage = currentMonthSpent > 0 ? Math.round((total / currentMonthSpent) * 100) : 0;
              return (
                <div key={catInfo.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: catInfo.color }} />
                      {catInfo.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {formatVND(total)} <span className="text-slate-400 font-sans text-xs font-normal">({percentage}%)</span>
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
