import React, { useState } from "react";
import { SavingsGoal, SharedSpace, User } from "../types";
import { formatVND } from "../utils/formatters";
import { Target, Plus, PiggyBank, Sparkles, TrendingUp, Calendar, Heart, Plane, Bike } from "lucide-react";

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  activeSpace: SharedSpace;
  currentUser: User;
  onAddGoal: (goal: Partial<SavingsGoal>) => void;
  onContribute: (goalId: string, amount: number) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  activeSpace,
  currentUser,
  onAddGoal,
  onContribute
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<SavingsGoal | null>(null);

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const [contribAmount, setContribAmount] = useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    onAddGoal({
      spaceId: activeSpace.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline
    });

    setTitle("");
    setTargetAmount("");
    setIsCreateOpen(false);
  };

  const handleContribSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContribution || !contribAmount) return;

    onContribute(selectedGoalForContribution.id, Number(contribAmount));
    setContribAmount("");
    setSelectedGoalForContribution(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-pink-500" />
            Mục Tiêu Tiết Kiệm (Savings Goals)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Xây dựng quỹ tương lai chung: Mua xe, Đi Nhật, Mua nhà, Quỹ đám cưới...
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Tạo Mục Tiêu Mới
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between space-y-4 hover:border-pink-300 dark:hover:border-pink-800 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-pink-500" />
                    {goal.title}
                  </span>
                  <span className="text-xs font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-1 rounded-full">
                    {percent}%
                  </span>
                </div>

                {goal.deadline && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Hạn chót: {goal.deadline}</span>
                  </p>
                )}
              </div>

              {/* Progress Bar Display */}
              <div className="space-y-1.5">
                <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>{formatVND(goal.currentAmount)}</span>
                  <span className="text-gray-400">/ {formatVND(goal.targetAmount)}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setSelectedGoalForContribution(goal)}
                className="w-full py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 font-bold text-xs rounded-xl border border-pink-200 dark:border-pink-800 transition flex items-center justify-center gap-1.5"
              >
                <PiggyBank className="w-4 h-4 text-pink-500" />
                <span>Nạp Tiền Vào Quỹ</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Tạo Mục Tiêu Tiết Kiệm Mới
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Tên mục tiêu
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Mua xe máy, Đi du lịch Nhật, Quỹ cưới..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Mục tiêu số tiền cần đạt (VND)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="20000000"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Ngày hoàn thành dự kiến
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Lưu Mục Tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {selectedGoalForContribution && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Gửi Tiết Kiệm: {selectedGoalForContribution.title}
            </h3>

            <form onSubmit={handleContribSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Số tiền nạp vào quỹ (VND)
                </label>
                <input
                  type="number"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  placeholder="500000"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForContribution(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Xác Nhận Nạp Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
