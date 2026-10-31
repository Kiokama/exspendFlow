import React, { useState } from "react";
import { Expense, SharedSpace } from "../types";
import { formatVND } from "../utils/formatters";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, DollarSign, Tag, User } from "lucide-react";

interface CalendarViewProps {
  expenses: Expense[];
  activeSpace: SharedSpace;
  onEditExpense: (expense: Expense) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ expenses, activeSpace, onEditExpense }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<{ dateStr: string; items: Expense[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Map expenses by YYYY-MM-DD
  const expenseMap: { [dateStr: string]: Expense[] } = {};
  expenses.forEach(e => {
    if (!expenseMap[e.date]) expenseMap[e.date] = [];
    expenseMap[e.date].push(e);
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-rose-500" />
            Lịch Chi Tiêu Theo Ngày
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Theo dõi dòng tiền trực quan từng ngày trong tháng của {activeSpace.name}
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-900 dark:text-white px-2">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs p-4 sm:p-6">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/60 pb-2">
          <span>Chủ nhật</span>
          <span>Thứ hai</span>
          <span>Thứ ba</span>
          <span>Thứ tư</span>
          <span>Thứ năm</span>
          <span>Thứ sáu</span>
          <span>Thứ bảy</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {paddingArray.map(p => (
            <div key={`pad-${p}`} className="h-20 sm:h-28 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 opacity-40" />
          ))}

          {daysArray.map(day => {
            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            const dayExpenses = expenseMap[dateStr] || [];
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

            const isToday = new Date().toISOString().split("T")[0] === dateStr;

            return (
              <div
                key={day}
                onClick={() => {
                  if (dayExpenses.length > 0) {
                    setSelectedDayExpenses({ dateStr, items: dayExpenses });
                  }
                }}
                className={`h-20 sm:h-28 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer relative group ${
                  isToday
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20"
                    : dayExpenses.length > 0
                    ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-400"
                    : "border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday ? "bg-rose-600 text-white" : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {day}
                  </span>
                  {dayExpenses.length > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-full">
                      {dayExpenses.length} khoản
                    </span>
                  )}
                </div>

                {dayTotal > 0 ? (
                  <div className="mt-1">
                    <div className="text-[11px] sm:text-xs font-extrabold text-emerald-700 dark:text-emerald-300 truncate">
                      💸 {formatVND(dayTotal)}
                    </div>
                    <div className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {dayExpenses[0].title}
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 select-none">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayExpenses && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-rose-500" />
                Giao Dịch Ngày {selectedDayExpenses.dateStr}
              </h3>
              <button
                onClick={() => setSelectedDayExpenses(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {selectedDayExpenses.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onEditExpense(item);
                    setSelectedDayExpenses(null);
                  }}
                  className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.category} • Trả bởi: {item.paidById === "user_nam" ? "Hoàng Nam" : "Ngọc Mai"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      {formatVND(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
