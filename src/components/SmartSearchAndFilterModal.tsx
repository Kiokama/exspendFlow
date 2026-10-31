import React, { useState } from "react";
import { CategoryKey, User } from "../types";
import { Search, Filter, X, Tag, DollarSign, Calendar, User as UserIcon } from "lucide-react";

interface SmartSearchAndFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  allUsers: User[];
}

export interface FilterOptions {
  keyword: string;
  paidById?: string;
  category?: CategoryKey | "ALL";
  minAmount?: number;
  maxAmount?: number;
  tag?: string;
  isRefundOnly?: boolean;
  expenseType?: "ALL" | "PERSONAL" | "SHARED";
}

export const SmartSearchAndFilterModal: React.FC<SmartSearchAndFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  allUsers
}) => {
  const [keyword, setKeyword] = useState("");
  const [paidById, setPaidById] = useState<string>("ALL");
  const [category, setCategory] = useState<CategoryKey | "ALL">("ALL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [tag, setTag] = useState("");
  const [isRefundOnly, setIsRefundOnly] = useState(false);
  const [expenseType, setExpenseType] = useState<"ALL" | "PERSONAL" | "SHARED">("ALL");

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({
      keyword,
      paidById: paidById === "ALL" ? undefined : paidById,
      category: category === "ALL" ? undefined : category,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      tag: tag.trim() || undefined,
      isRefundOnly,
      expenseType
    });
    onClose();
  };

  const handleReset = () => {
    setKeyword("");
    setPaidById("ALL");
    setCategory("ALL");
    setMinAmount("");
    setMaxAmount("");
    setTag("");
    setIsRefundOnly(false);
    setExpenseType("ALL");
    onApplyFilters({ keyword: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-rose-500" />
            Tìm Kiếm & Bộ Lọc Nâng Cao (Smart Filter)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* Keyword Search */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Từ khóa tìm kiếm (Tên khoản chi, địa điểm, ghi chú)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ví dụ: Lotte Mart, Ăn lẩu, Pizza, Grab..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Paid By */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Người trả tiền
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white"
              >
                <option value="ALL">Tất cả thành viên</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Danh mục chi tiêu
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white"
              >
                <option value="ALL">Tất cả danh mục</option>
                <option value="Housing">Housing (Tiền nhà)</option>
                <option value="Groceries">Groceries (Siêu thị)</option>
                <option value="Dating">Dating (Hẹn hò)</option>
                <option value="Utilities">Utilities (Điện nước)</option>
                <option value="Shopping">Shopping (Mua sắm)</option>
                <option value="Entertainment">Entertainment (Giải trí)</option>
                <option value="Transportation">Transportation (Di chuyển)</option>
                <option value="Health">Health (Sức khỏe)</option>
              </select>
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Số tiền tối thiểu (VND)
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Số tiền tối đa (VND)
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="5000000"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tags & Refund Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Lọc theo Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Food, Date, Coffee..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Phân loại chi
              </label>
              <select
                value={expenseType}
                onChange={(e: any) => setExpenseType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white"
              >
                <option value="ALL">Cả cá nhân & dùng chung</option>
                <option value="SHARED">Chỉ dùng chung (Shared)</option>
                <option value="PERSONAL">Chỉ cá nhân (Personal)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="refundOnly"
              checked={isRefundOnly}
              onChange={(e) => setIsRefundOnly(e.target.checked)}
              className="rounded-md text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="refundOnly" className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              Chỉ hiển thị các khoản hoàn tiền (Refunds)
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 cursor-pointer transition"
            >
              Áp Dụng Bộ Lọc
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
