import React from "react";
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
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
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

  // Sort expenses by date descending to show true recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

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
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Tổng quan tài chính • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Không gian chung của <strong className="text-gray-800 dark:text-gray-200">{memberA.name}</strong> và <strong className="text-gray-800 dark:text-gray-200">{memberB.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={onOpenAIScan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>AI Quét Hóa Đơn</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khoản chi</span>
          </button>
        </div>
      </div>

      {/* Hero Debt & Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Main Hero Card: Net Debt Status (Tone Hồng / Rose & Pink Theme) */}
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl p-5 sm:p-6 md:p-7 shadow-xs border transition-all duration-200 border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/90 via-pink-50/50 to-white dark:from-[#1f0b16] dark:via-[#160a14] dark:to-[#1a0c18] flex flex-col justify-between">
          
          {/* Subtle Decorative Ambient Pink Glows */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-pink-400/15 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header: Title & Context */}
          <div className="relative z-10 flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-400 shadow-xs">
                {balance.netDebt === 0 ? <CheckCircle2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase block">
                  Tình trạng công nợ
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Không gian: <span className="font-semibold text-slate-900 dark:text-white">{activeSpace.name}</span>
                </div>
              </div>
            </div>

            {/* Quiet status tag in tone hồng */}
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Tự động đối soát</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 my-2 space-y-5">
            {balance.netDebt === 0 || !balance.debtor ? (
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-rose-200/80 dark:border-rose-800/50 shadow-xs backdrop-blur-xs flex items-center gap-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Số dư cân bằng</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60">
                      0đ tồn đọng
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Không có khoản nợ tồn đọng. Mọi chi phí chung giữa hai bạn đã được chia sẻ đều đặn.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Indicator & Clear Typographic Amount */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span>{balance.debtor.id === currentUser.id ? "Khoản bạn cần trả cho bạn cùng phòng" : "Khoản bạn sẽ nhận lại"}</span>
                    <span className="text-rose-300 dark:text-rose-700">·</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/70 px-2 py-0.5 rounded-md border border-rose-200/80 dark:border-rose-800/60 text-[11px]">
                      {balance.debtor.id === currentUser.id ? "Chờ chuyển khoản" : "Chờ hoàn tiền"}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                    {formatVND(balance.netDebt)}
                  </div>
                </div>

                {/* Avatar Connection & Clean Summary */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-rose-200/80 dark:border-rose-800/50 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-800/60">
                      <img src={balance.debtor.avatar} alt={balance.debtor.name} className="w-6 h-6 rounded-full object-cover border border-rose-300" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{balance.debtor.name}</span>
                    </div>

                    <ArrowLeftRight className="w-3.5 h-3.5 text-rose-400" />

                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-800/60">
                      <img src={balance.creditor?.avatar} alt={balance.creditor?.name} className="w-6 h-6 rounded-full object-cover border border-pink-300" />
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
          <div className="relative z-10 pt-4 mt-4 border-t border-rose-200/70 dark:border-rose-900/50 flex flex-wrap items-center justify-between gap-3">
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
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-rose-500/25 transition-all duration-150 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>Thanh toán cấn trừ</span>
            </button>
          </div>
        </div>

        {/* Total Monthly Expenses & Contribution Breakdown Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              <span>Đóng góp thực tế:</span>
              <span className="text-[11px] text-slate-400 font-normal">Tỷ lệ thanh toán</span>
            </div>

            {/* Proportion Bar */}
            {currentMonthSpent > 0 && (
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200/50 dark:border-slate-700/50">
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
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                  <img src={memberA.avatar} alt={memberA.name} className="w-5 h-5 rounded-full object-cover border border-rose-500" />
                  {memberA.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatVND(balance.userATotalPaid)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                  <img src={memberB.avatar} alt={memberB.name} className="w-5 h-5 rounded-full object-cover border border-pink-400" />
                  {memberB.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatVND(balance.userBTotalPaid)}</span>
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

      {/* Dedicated Today's Expenses Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Chi tiêu hôm nay
                </h3>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  · {formattedToday}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Các khoản chi dùng chung phát sinh trong ngày
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-500/20 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm chi tiêu</span>
          </button>
        </div>

        {/* Today's Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Today Total */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Tổng chi hôm nay
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatVND(todayTotalSpent)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {todayExpenses.length} giao dịch ghi nhận
            </div>
          </div>

          {/* Member A Today */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                {memberA.name} chi
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatVND(todayUserASpent)}
              </div>
            </div>
            <img src={memberA.avatar} alt={memberA.name} className="w-8 h-8 rounded-full object-cover border border-rose-300 dark:border-rose-900/50 shrink-0" />
          </div>

          {/* Member B Today */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                {memberB.name} chi
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatVND(todayUserBSpent)}
              </div>
            </div>
            <img src={memberB.avatar} alt={memberB.name} className="w-8 h-8 rounded-full object-cover border border-pink-300 dark:border-pink-900/50 shrink-0" />
          </div>
        </div>

        {/* Today's Transactions List / Empty State */}
        {todayExpenses.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Chưa có khoản chi nào trong hôm nay
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ghi nhận các chi tiêu phát sinh để cập nhật số dư chung.
            </p>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 pb-2">
              Các khoản chi trong ngày ({todayExpenses.length}):
            </div>
            {todayExpenses.map(exp => {
              const cat = CATEGORIES[exp.category] || CATEGORIES.Other;
              const payer = (exp.paidById === currentUser.id ? currentUser : activeSpace.members.find(m => m.id === exp.paidById)) ||
                (exp.paidById === "user_nam" ? { name: "Hoàng Nam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam" } :
                 exp.paidById === "user_mai" ? { name: "Ngọc Mai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai" } :
                 currentUser);
              return (
                <div
                  key={exp.id}
                  onClick={() => onSelectExpense?.(exp)}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 border ${cat.bgColor}`}>
                      <CategoryIcon category={exp.category} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {exp.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold">{cat.label}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <img src={payer.avatar} alt={payer.name} className="w-3.5 h-3.5 rounded-full object-cover border border-slate-300" />
                          {payer.name} trả
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {formatVND(exp.amount)}
                    </div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                      {exp.splitType === "50_50" ? "Chia 50/50" : "Tùy chỉnh"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Grid: Recent Transactions vs Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Transactions Activity List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span>Giao dịch gần đây</span>
            </h3>
            <button
              onClick={() => onSelectTab("expenses")}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <span>Xem tất cả ({expenses.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200 dark:border-slate-700">
                <Receipt className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chưa có giao dịch nào</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Bắt đầu bằng cách thêm khoản chi chung đầu tiên.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentExpenses.map(exp => {
                const cat = CATEGORIES[exp.category] || CATEGORIES.Other;
                const payer = (exp.paidById === currentUser.id ? currentUser : activeSpace.members.find(m => m.id === exp.paidById)) ||
                  (exp.paidById === "user_nam" ? { name: "Hoàng Nam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam" } :
                   exp.paidById === "user_mai" ? { name: "Ngọc Mai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai" } :
                   currentUser);
                return (
                  <div 
                    key={exp.id} 
                    onClick={() => onSelectExpense?.(exp)}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded-2xl transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 border ${cat.bgColor} group-hover:scale-105 transition-transform duration-200 shadow-sm`}>
                        <CategoryIcon category={exp.category} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {exp.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.label}</span>
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
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {formatVND(exp.amount)}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {exp.isPersonal ? (
                          <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50">Cá nhân</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            {exp.splitType === "50_50" && "Chia 50/50"}
                            {exp.splitType === "PERCENTAGE" && `Chia ${exp.splitDetails?.userAPercent ?? 50}% / ${exp.splitDetails?.userBPercent ?? 50}%`}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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

          <div className="space-y-4">
            {sortedCategories.slice(0, 5).map(({ catInfo, total }) => {
              const percentage = currentMonthSpent > 0 ? Math.round((total / currentMonthSpent) * 100) : 0;
              return (
                <div key={catInfo.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: catInfo.color }} />
                      {catInfo.label}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatVND(total)} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
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
