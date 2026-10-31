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
  ArrowLeftRight,
  Sparkles,
  X,
  SlidersHorizontal,
  ChevronDown
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  const activeFilterCount = (selectedCategory !== "ALL" ? 1 : 0) + 
                            (selectedPayer !== "ALL" ? 1 : 0) + 
                            (dateFilter !== "ALL" ? 1 : 0) + 
                            (sortBy !== "NEWEST" ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedPayer("ALL");
    setDateFilter("ALL");
    setSortBy("NEWEST");
    setSearch("");
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sổ giao dịch • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Chi tiết các khoản chi chung & lịch sử cấn trừ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onExportCSV}
            className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-xs shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm khoản chi</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher: Expense Items vs Settle Up Receipts */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-full sm:w-fit border border-slate-200/80 dark:border-slate-700/60">
        <button
          onClick={() => setActiveSubTab("EXPENSES")}
          className={`flex-1 sm:flex-initial min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "EXPENSES"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Khoản chi ({expenses.length})
        </button>

        <button
          onClick={() => setActiveSubTab("SETTLEMENTS")}
          className={`flex-1 sm:flex-initial min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "SETTLEMENTS"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Lịch sử cấn trừ ({settlements.length})
        </button>
      </div>

      {activeSubTab === "EXPENSES" ? (
        <div className="space-y-3">
          
          {/* Mobile Search Bar + Filter Trigger */}
          <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
            
            <div className="flex items-center gap-2">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm tên khoản chi, ghi chú..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Advanced Filter Toggle Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`min-h-[42px] px-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                  showAdvancedFilters || activeFilterCount > 0
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
                title="Mở bộ lọc nâng cao"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden xs:inline">Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Horizontal Chip Filter Strip (Mobile Friendly) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              
              {/* Filter Chip 1: All */}
              <button
                onClick={() => setDateFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  dateFilter === "ALL"
                    ? "bg-rose-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Tất cả thời gian
              </button>

              {/* Filter Chip 2: Today */}
              <button
                onClick={() => setDateFilter("TODAY")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  dateFilter === "TODAY"
                    ? "bg-rose-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                📅 Hôm nay
              </button>

              {/* Filter Chip 3: This Month */}
              <button
                onClick={() => setDateFilter("THIS_MONTH")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  dateFilter === "THIS_MONTH"
                    ? "bg-rose-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                🗓️ Tháng này
              </button>

              {/* Filter Chip 4: Payer A */}
              <button
                onClick={() => setSelectedPayer(selectedPayer === memberA.id ? "ALL" : memberA.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  selectedPayer === memberA.id
                    ? "bg-rose-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <img src={memberA.avatar} alt={memberA.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>{memberA.name} chi</span>
              </button>

              {/* Filter Chip 5: Payer B */}
              <button
                onClick={() => setSelectedPayer(selectedPayer === memberB.id ? "ALL" : memberB.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  selectedPayer === memberB.id
                    ? "bg-rose-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <img src={memberB.avatar} alt={memberB.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>{memberB.name} chi</span>
              </button>

            </div>

            {/* Advanced Filters Expandable Drawer */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
                
                {/* Category Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Danh mục chi tiêu
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="ALL">Tất cả danh mục ({expenses.length})</option>
                    {Object.values(CATEGORIES).map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Order Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Thứ tự sắp xếp
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="NEWEST">Mới nhất trước (Gần đây)</option>
                    <option value="HIGHEST">Số tiền cao nhất trước</option>
                  </select>
                </div>

                {activeFilterCount > 0 && (
                  <div className="sm:col-span-2 flex justify-end pt-1">
                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Không tìm thấy khoản chi nào
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Thử thay đổi từ khóa tìm kiếm hoặc bấm đặt lại bộ lọc.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredExpenses.map(exp => {
                  const cat = CATEGORIES[exp.category] || CATEGORIES.Other;
                  const payer = (exp.paidById === currentUser.id ? currentUser : activeSpace.members.find(m => m.id === exp.paidById)) ||
                    (exp.paidById === "user_nam" ? { name: "Hoàng Nam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam" } :
                     exp.paidById === "user_mai" ? { name: "Ngọc Mai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai" } :
                     currentUser);
                  return (
                    <div 
                      key={exp.id} 
                      className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Left info - Clickable to view details */}
                      <div 
                        onClick={() => onSelectExpense?.(exp)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 active:scale-[0.99] transition-transform"
                      >
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${cat.bgColor} shadow-2xs group-hover:scale-105 transition-transform`}>
                          <CategoryIcon category={exp.category} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                            {exp.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.label}</span>
                            <span>•</span>
                            <span>{formatDate(exp.date)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <img src={payer.avatar} alt={payer.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                              <span className="truncate max-w-[80px]">{payer.name}</span>
                            </span>
                            <span>•</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {exp.isPersonal ? "Cá nhân" : (
                                <>
                                  {exp.splitType === "50_50" && "Chia 50/50"}
                                  {exp.splitType === "PERCENTAGE" && `${exp.splitDetails?.userAPercent ?? 50}%/${exp.splitDetails?.userBPercent ?? 50}%`}
                                  {exp.splitType === "EXACT" && "Chia cụ thể"}
                                </>
                              )}
                            </span>
                          </div>

                          {exp.note && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                              "{exp.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right amount & action controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right">
                          <div className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
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
                                className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition"
                              >
                                Có
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 rounded-lg text-gray-500 hover:text-gray-700 text-[10px] font-semibold"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => onEditExpense(exp)}
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 active:scale-95 transition cursor-pointer"
                                title="Chỉnh sửa khoản chi"
                                aria-label="Sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingId(exp.id)}
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-95 transition cursor-pointer"
                                title="Xóa khoản chi"
                                aria-label="Xóa"
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
        </div>
      ) : (
        /* Settlement History List */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {settlements.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs">
              Chưa có lịch sử cấn trừ nợ nào.
            </div>
          ) : (
            settlements.map(set => {
              const fromUser = activeSpace.members.find(m => m.id === set.fromUserId) || memberA;
              const toUser = activeSpace.members.find(m => m.id === set.toUserId) || memberB;
              return (
                <div key={set.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {fromUser.name} đã cấn trừ cho {toUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ngày {formatDate(set.date)} • {set.method} {set.note ? `• ${set.note}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-black font-mono text-amber-600 dark:text-amber-400 shrink-0">
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
