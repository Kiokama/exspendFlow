import React, { useState } from "react";
import { Expense, SharedSpace, User } from "../types";
import { CATEGORIES } from "../data/categories";
import { formatVND } from "../utils/formatters";
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { PieChart, TrendingUp, Users, Calendar } from "lucide-react";

interface AnalyticsViewProps {
  expenses: Expense[];
  activeSpace: SharedSpace;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ expenses, activeSpace }) => {
  const [timeFilter, setTimeFilter] = useState<"THIS_MONTH" | "ALL_TIME">("THIS_MONTH");

  const memberA = activeSpace.members[0] || { id: "user_nam", name: "Hoàng Nam" };
  const memberB = activeSpace.members[1] || { id: "user_mai", name: "Ngọc Mai" };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredExpenses = expenses.filter(e => {
    if (timeFilter === "THIS_MONTH") {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
    return true;
  });

  const totalSpent = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Category Pie Data
  const categoryMap: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.entries(categoryMap).map(([key, val]) => {
    const cat = CATEGORIES[key as keyof typeof CATEGORIES] || CATEGORIES.Other;
    return {
      name: cat.label,
      value: val,
      color: cat.color
    };
  });

  // Member Paid Comparison Data
  let memberAPaid = 0;
  let memberBPaid = 0;
  filteredExpenses.forEach(e => {
    if (e.paidById === memberA.id) memberAPaid += e.amount;
    if (e.paidById === memberB.id) memberBPaid += e.amount;
  });

  const barData = [
    {
      name: "Đóng góp chi trả",
      [memberA.name]: memberAPaid,
      [memberB.name]: memberBPaid
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Thống kê & Biểu đồ • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Phân tích cơ cấu chi tiêu & so sánh tỷ lệ đóng góp của cả hai
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => setTimeFilter("THIS_MONTH")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              timeFilter === "THIS_MONTH"
                ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            Tháng này
          </button>

          <button
            onClick={() => setTimeFilter("ALL_TIME")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              timeFilter === "ALL_TIME"
                ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            Tất cả thời gian
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Tổng chi tiêu kỳ này</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatVND(totalSpent)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{memberA.name} đã chi</span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            {formatVND(memberAPaid)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{memberB.name} đã chi</span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            {formatVND(memberBPaid)}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Categories */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-500" />
            Cơ cấu chi tiêu theo danh mục
          </h3>

          {pieData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs">Chưa có dữ liệu chi tiêu</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatVND(Number(value))} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Member Comparison */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500" />
            So sánh chi trả giữa 2 người
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={v => formatVND(v)} />
                <Tooltip formatter={(value: any) => formatVND(Number(value))} />
                <Legend />
                <Bar dataKey={memberA.name} fill="#E11D48" radius={[8, 8, 0, 0]} />
                <Bar dataKey={memberB.name} fill="#EC4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
