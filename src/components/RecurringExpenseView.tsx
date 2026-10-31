import React, { useState } from "react";
import { RecurringExpense, SharedSpace, CategoryKey, User } from "../types";
import { formatVND } from "../utils/formatters";
import { Repeat, Plus, Zap, Trash2, Calendar, CheckCircle2, Tv, Wifi, Dumbbell, Home as HomeIcon } from "lucide-react";

interface RecurringExpenseViewProps {
  recurringList: RecurringExpense[];
  activeSpace: SharedSpace;
  currentUser: User;
  onAddRecurring: (data: Partial<RecurringExpense>) => void;
  onDeleteRecurring: (id: string) => void;
  onTriggerRecurring: (id: string) => void;
}

export const RecurringExpenseView: React.FC<RecurringExpenseViewProps> = ({
  recurringList,
  activeSpace,
  currentUser,
  onAddRecurring,
  onDeleteRecurring,
  onTriggerRecurring
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryKey>("Utilities");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [nextDueDate, setNextDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddRecurring({
      spaceId: activeSpace.id,
      title,
      amount: Number(amount),
      category,
      frequency,
      paidById: currentUser.id,
      nextDueDate: nextDueDate || new Date().toISOString().split("T")[0]
    });

    setTitle("");
    setAmount("");
    setIsModalOpen(false);
  };

  const getFrequencyBadge = (freq: RecurringExpense["frequency"]) => {
    switch (freq) {
      case "DAILY": return "Hàng ngày";
      case "WEEKLY": return "Hàng tuần";
      case "MONTHLY": return "Hàng tháng";
      case "YEARLY": return "Hàng năm";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-6 h-6 text-purple-500" />
            Chi Phí Định Kỳ & Đăng Ký (Subscriptions)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Tự động quản lý Tiền nhà, Điện, Internet, Netflix, Spotify, Gym...
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Thêm Khoản Định Kỳ
        </button>
      </div>

      {/* Grid of Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurringList.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Repeat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {getFrequencyBadge(item.frequency)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Đến hạn: {item.nextDueDate}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteRecurring(item.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Số tiền định kỳ</span>
                <span className="text-base sm:text-lg font-extrabold text-purple-600 dark:text-purple-400">
                  {formatVND(item.amount)}
                </span>
              </div>

              <button
                onClick={() => onTriggerRecurring(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tạo khoản chi ngay</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Thêm Khoản Chi Định Kỳ Mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Tên dịch vụ / Khoản định kỳ
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Tiền nhà, Netflix, Gym, Internet..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Số tiền định kỳ (VND)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="260000"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Tần suất lặp lại
                </label>
                <select
                  value={frequency}
                  onChange={(e: any) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="DAILY">Hàng ngày (Daily)</option>
                  <option value="WEEKLY">Hàng tuần (Weekly)</option>
                  <option value="MONTHLY">Hàng tháng (Monthly)</option>
                  <option value="YEARLY">Hàng năm (Yearly)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
