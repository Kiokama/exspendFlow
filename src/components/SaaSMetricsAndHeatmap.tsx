import React, { useState, useEffect } from "react";
import { Expense, SharedSpace, Merchant } from "../types";
import { formatVND } from "../utils/formatters";
import { TrendingUp, ShoppingBag, DollarSign, Calendar, Flame, Store, User, Users, Sun, Moon } from "lucide-react";

interface SaaSMetricsAndHeatmapProps {
  expenses: Expense[];
  activeSpace: SharedSpace;
}

export const SaaSMetricsAndHeatmap: React.FC<SaaSMetricsAndHeatmapProps> = ({ expenses, activeSpace }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filterMode, setFilterMode] = useState<"ALL" | "PERSONAL" | "SHARED">("ALL");

  useEffect(() => {
    async function loadMerchants() {
      try {
        const res = await fetch(`/api/merchants?spaceId=${activeSpace.id}`);
        const data = await res.json();
        setMerchants(data);
      } catch (err) {
        console.error("Failed loading merchants:", err);
      }
    }
    loadMerchants();
  }, [activeSpace.id]);

  const filteredExpenses = expenses.filter(e => {
    if (filterMode === "PERSONAL") return e.isPersonal;
    if (filterMode === "SHARED") return !e.isPersonal;
    return true;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerDay = totalExpense > 0 ? Math.round(totalExpense / 30) : 0;

  const personalExpenseTotal = expenses.filter(e => e.isPersonal).reduce((sum, e) => sum + e.amount, 0);
  const sharedExpenseTotal = expenses.filter(e => !e.isPersonal).reduce((sum, e) => sum + e.amount, 0);

  // Find highest expense
  const largestExpense = filteredExpenses.length > 0 
    ? Math.max(...filteredExpenses.map(e => e.amount))
    : 0;

  // GitHub Style Spending Heatmap Data for last 28 days
  const today = new Date();
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayTotal = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);

    let intensity = "bg-gray-100 dark:bg-gray-800";
    if (dayTotal > 2000000) intensity = "bg-emerald-700 text-white";
    else if (dayTotal > 1000000) intensity = "bg-emerald-500 text-white";
    else if (dayTotal > 300000) intensity = "bg-emerald-300 dark:bg-emerald-600 text-slate-900";
    else if (dayTotal > 0) intensity = "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";

    return {
      dateStr,
      dayNumber: d.getDate(),
      total: dayTotal,
      intensity
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Personal vs Shared Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            SaaS KPI Dashboard & Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Tổng quan chỉ số tài chính chuyên sâu & biểu đồ nhiệt mật độ chi tiêu
          </p>
        </div>

        {/* Filter Personal vs Shared */}
        <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === "ALL" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMode("SHARED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterMode === "SHARED" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-500" />
            <span>Chung ({formatVND(sharedExpenseTotal)})</span>
          </button>
          <button
            onClick={() => setFilterMode("PERSONAL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterMode === "PERSONAL" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-500" />
            <span>Cá nhân ({formatVND(personalExpenseTotal)})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Tổng Chi Tiêu</span>
          <div className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white mt-1">
            {formatVND(totalExpense)}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full inline-block mt-2">
            ↑ 12% so với tháng trước
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Trung Bình / Ngày</span>
          <div className="text-base sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatVND(avgPerDay)}
          </div>
          <span className="text-[10px] text-gray-400 block mt-2">
            Dựa trên chu kỳ 30 ngày
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Danh Mục Lớn Nhất</span>
          <div className="text-base sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            Housing / Ăn Uống
          </div>
          <span className="text-[10px] text-gray-400 block mt-2">
            Chiếm ~54% ngân sách
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Khoản Chi Lớn Nhất</span>
          <div className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {formatVND(largestExpense)}
          </div>
          <span className="text-[10px] text-gray-400 block mt-2">
            Thanh toán đợt vừa qua
          </span>
        </div>

      </div>

      {/* Spending Contribution Heatmap (GitHub Style) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-500" />
            Biểu Đồ Nhiệt Chi Tiêu 28 Ngày (Spending Heatmap)
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>Chi ít</span>
            <span className="w-3 h-3 rounded-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
            <span className="w-3 h-3 rounded-xs bg-emerald-200" />
            <span className="w-3 h-3 rounded-xs bg-emerald-400" />
            <span className="w-3 h-3 rounded-xs bg-emerald-600" />
            <span>Chi nhiều</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {heatmapDays.map((hd, i) => (
            <div
              key={i}
              title={`${hd.dateStr}: ${formatVND(hd.total)}`}
              className={`h-10 sm:h-12 rounded-xl p-1 sm:p-2 border border-gray-200/50 dark:border-gray-700/50 flex flex-col justify-between transition cursor-pointer hover:scale-105 ${hd.intensity}`}
            >
              <span className="text-[10px] font-bold opacity-80">{hd.dayNumber}</span>
              {hd.total > 0 && (
                <span className="text-[9px] font-extrabold truncate">
                  {Math.round(hd.total / 1000)}k
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Merchants & Behavioral Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Top Merchants */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-rose-500" />
            Thương Hiệu & Nơi Chi Tiêu Hàng Đầu (Merchants)
          </h3>

          <div className="space-y-3">
            {merchants.map(m => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{m.name}</h4>
                  <p className="text-[11px] text-gray-400">{m.transactionCount} giao dịch • {m.category}</p>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {formatVND(m.totalSpent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Analytics */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Phân Tích Thói Quen (Mini Analytics)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <span className="text-amber-800 dark:text-amber-300 font-bold block">Bữa ăn trung bình</span>
              <span className="text-sm font-extrabold text-amber-900 dark:text-amber-100 block mt-1">145.000 ₫</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
              <span className="text-rose-800 dark:text-rose-300 font-bold block">Cuối tuần vs Trong tuần</span>
              <span className="text-sm font-extrabold text-rose-900 dark:text-rose-100 block mt-1">62% Cuối tuần</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-emerald-800 dark:text-emerald-300 font-bold block">Buổi sáng vs Buổi tối</span>
              <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 block mt-1">75% Chi buổi tối</span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
              <span className="text-purple-800 dark:text-purple-300 font-bold block">Hóa đơn siêu thị TB</span>
              <span className="text-sm font-extrabold text-purple-900 dark:text-purple-100 block mt-1">620.000 ₫</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
