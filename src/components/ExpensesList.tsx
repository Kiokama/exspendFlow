import React, { useState } from "react";
import { Expense, SharedSpace, User, Settlement } from "../types";
import { CATEGORIES } from "../data/categories";
import { CategoryIcon } from "./CategoryIcon";
import { formatVND, formatDate } from "../utils/formatters";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Plus, 
  Download, 
  DollarSign,
  ArrowLeftRight,
  Sparkles
} from "lucide-react";

interface ExpensesListProps {
  expenses: Expense[];
  settlements: Settlement[];
  activeSpace: SharedSpace;
  currentUser: User;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onExportCSV: () => void;
  onSelectExpense?: (expense: Expense) => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  settlements,
  activeSpace,
  currentUser,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onExportCSV,
  onSelectExpense
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPayer, setSelectedPayer] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "THIS_MONTH">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "HIGHEST">("NEWEST");
  const [activeSubTab, setActiveSubTab] = useState<"EXPENSES" | "SETTLEMENTS">("EXPENSES");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const memberA = activeSpace.members[0] || currentUser;
  const memberB = activeSpace.members[1] || currentUser;

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  };

  // Filter logic
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          (e.note || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || e.category === selectedCategory;
    const matchesPayer = selectedPayer === "ALL" || e.paidById === selectedPayer;
    let matchesDate = true;
    if (dateFilter === "TODAY") {
      matchesDate = isToday(e.date);
    } else if (dateFilter === "THIS_MONTH") {
      matchesDate = isThisMonth(e.date);
    }
    return matchesSearch && matchesCategory && matchesPayer && matchesDate;
  }).sort((a, b) => {
    if (sortBy === "NEWEST") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.amount - a.amount;
    }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Danh sách giao dịch • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Xem, tìm kiếm, sửa và xuất file các khoản chi chung
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khoản chi</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher: Expense Items vs Settle Up Receipts */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-850 w-fit border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab("EXPENSES")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeSubTab === "EXPENSES"
              ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Khoản chi ({expenses.length})
        </button>

        <button
          onClick={() => setActiveSubTab("SETTLEMENTS")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeSubTab === "SETTLEMENTS"
              ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Lịch sử cấn trừ ({settlements.length})
        </button>
      </div>

      {activeSubTab === "EXPENSES" ? (
        <>
          {/* Filters & Search Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 bg-white dark:bg-gray-800 p-3.5 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 sm:top-3" />
              <input
                type="text"
                placeholder="Tìm tên khoản chi, ghi chú..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base sm:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Time Filter */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base sm:text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">Tất cả thời gian</option>
              <option value="TODAY">📅 Hôm nay</option>
              <option value="THIS_MONTH">🗓️ Tháng này</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base sm:text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">Tất cả danh mục</option>
              {Object.values(CATEGORIES).map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>

            {/* Payer Filter */}
            <select
              value={selectedPayer}
              onChange={e => setSelectedPayer(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base sm:text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">Tất cả người trả</option>
              <option value={memberA.id}>Trả bởi {memberA.name}</option>
              <option value={memberB.id}>Trả bởi {memberB.name}</option>
            </select>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base sm:text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="NEWEST">Mới nhất trước</option>
                <option value="HIGHEST">Số tiền cao nhất</option>
              </select>
            </div>

          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Không tìm thấy khoản chi nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredExpenses.map(exp => {
                  const cat = CATEGORIES[exp.category] || CATEGORIES.Other;
                  const payer = (exp.paidById === currentUser.id ? currentUser : activeSpace.members.find(m => m.id === exp.paidById)) ||
                    (exp.paidById === "user_nam" ? { name: "Hoàng Nam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam" } :
                     exp.paidById === "user_mai" ? { name: "Ngọc Mai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai" } :
                     currentUser);
                  return (
                    <div 
                      key={exp.id} 
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group"
                    >
                      {/* Left info - Clickable to view details */}
                      <div 
                        onClick={() => onSelectExpense?.(exp)}
                        className="flex items-start gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${cat.bgColor} group-hover:scale-105 transition-transform`}>
                          <CategoryIcon category={exp.category} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {exp.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                            <span>·</span>
                            <span>{formatDate(exp.date)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <img src={payer.avatar} alt={payer.name} className="w-3.5 h-3.5 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                              {payer.name} chi
                            </span>
                            <span>·</span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {exp.isPersonal ? "Cá nhân" : (
                                <>
                                  {exp.splitType === "50_50" && "Chia 50/50"}
                                  {exp.splitType === "PERCENTAGE" && `Chia ${exp.splitDetails?.userAPercent ?? 50}% / ${exp.splitDetails?.userBPercent ?? 50}%`}
                                  {exp.splitType === "EXACT" && "Chia cụ thể"}
                                </>
                              )}
                            </span>
                          </div>

                          {exp.note && (
                            <p className="text-xs text-slate-400 italic">
                              "{exp.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right amount & action controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right">
                          <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white">
                            {formatVND(exp.amount)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {deletingId === exp.id ? (
                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 p-1 rounded-xl animate-fadeIn">
                              <span className="text-[10px] font-bold text-red-600 dark:text-red-300 px-1">Xóa?</span>
                              <button
                                onClick={() => {
                                  onDeleteExpense(exp.id);
                                  setDeletingId(null);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition"
                              >
                                Có
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-1.5 py-0.5 rounded-lg text-gray-500 hover:text-gray-700 text-[10px] font-semibold"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => onEditExpense(exp)}
                                className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition cursor-pointer"
                                title="Chỉnh sửa khoản chi"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingId(exp.id)}
                                className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                title="Xóa khoản chi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Settlement History List */
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs divide-y divide-gray-100 dark:divide-gray-700">
          {settlements.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Chưa có lịch sử cấn trừ nợ nào.
            </div>
          ) : (
            settlements.map(set => {
              const fromUser = activeSpace.members.find(m => m.id === set.fromUserId) || memberA;
              const toUser = activeSpace.members.find(m => m.id === set.toUserId) || memberB;
              return (
                <div key={set.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {fromUser.name} đã chuyển cấn trừ cho {toUser.name}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Ngày {formatDate(set.date)} • Phương thức: {set.method} {set.note ? `• ${set.note}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    {formatVND(set.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
