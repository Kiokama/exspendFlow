import React from "react";
import { formatVND } from "../utils/formatters";
import { TrendingUp, AlertTriangle, CheckCircle2, Flame, Calendar, DollarSign } from "lucide-react";

interface CashflowVelocityCardProps {
  currentMonthSpent: number;
  monthlyBudgetLimit: number;
}

export const CashflowVelocityCard: React.FC<CashflowVelocityCardProps> = ({
  currentMonthSpent,
  monthlyBudgetLimit
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Number of days in current month
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(0, totalDaysInMonth - currentDay);
  const monthProgressPct = Math.round((currentDay / totalDaysInMonth) * 100);

  // Daily burn rate
  const dailyBurnRate = currentDay > 0 ? Math.round(currentMonthSpent / currentDay) : 0;
  // Projected month-end spend
  const projectedMonthEnd = currentMonthSpent + (dailyBurnRate * daysRemaining);

  // Budget pace analysis
  const hasBudget = monthlyBudgetLimit > 0;
  const budgetSpentPct = hasBudget ? Math.round((currentMonthSpent / monthlyBudgetLimit) * 100) : 0;
  const projectedBudgetPct = hasBudget ? Math.round((projectedMonthEnd / monthlyBudgetLimit) * 100) : 0;

  // Status determination
  let status: "saving" | "on_track" | "warning";
  if (!hasBudget) {
    status = "on_track";
  } else if (budgetSpentPct > monthProgressPct + 15 || projectedMonthEnd > monthlyBudgetLimit) {
    status = "warning";
  } else if (budgetSpentPct < monthProgressPct - 10) {
    status = "saving";
  } else {
    status = "on_track";
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Tốc độ chi tiêu & Dự báo tháng
            </h3>
            <p className="text-[11px] text-slate-500">
              Ngày {currentDay}/{totalDaysInMonth} · Đã qua {monthProgressPct}% của tháng {currentMonth + 1}
            </p>
          </div>
        </div>

        {/* Quiet Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${
            status === "warning"
              ? "bg-rose-500"
              : status === "saving"
              ? "bg-emerald-500"
              : "bg-rose-400"
          }`} />
          <span className={
            status === "warning"
              ? "text-rose-600 dark:text-rose-400"
              : status === "saving"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }>
            {status === "warning" ? "Chi nhanh hơn dự kiến" : status === "saving" ? "Tiết kiệm tốt" : "Đúng tiến độ"}
          </span>
        </div>
      </div>

      {/* Primary Metrics Row (Responsive High Density) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex sm:flex-col justify-between items-center sm:items-start">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tốc độ chi trung bình
          </span>
          <div className="text-right sm:text-left sm:mt-1">
            <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white block">
              {formatVND(dailyBurnRate)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              mỗi ngày
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex sm:flex-col justify-between items-center sm:items-start">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Dự báo cuối tháng
          </span>
          <div className="text-right sm:text-left sm:mt-1">
            <span className={`text-sm sm:text-base font-bold font-mono block ${
              hasBudget && projectedMonthEnd > monthlyBudgetLimit
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-900 dark:text-white"
            }`}>
              {formatVND(projectedMonthEnd)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              còn {daysRemaining} ngày
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex sm:flex-col justify-between items-center sm:items-start">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Hạn mức tháng
          </span>
          <div className="text-right sm:text-left sm:mt-1">
            <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white block">
              {hasBudget ? formatVND(monthlyBudgetLimit) : "Chưa thiết lập"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {hasBudget ? `Đã dùng ${budgetSpentPct}%` : "Chưa cài ngân sách"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Comparison Bar */}
      {hasBudget && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Tiến độ tháng: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{monthProgressPct}%</strong></span>
            <span>Đã dùng: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{budgetSpentPct}%</strong></span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            {/* Budget spent fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetSpentPct > 100
                  ? "bg-rose-500"
                  : budgetSpentPct > monthProgressPct + 10
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
            />
            {/* Marker for current day of month */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-white z-10 rounded-full opacity-80"
              style={{ left: `${monthProgressPct}%` }}
              title={`Hôm nay là ngày ${currentDay} (${monthProgressPct}% của tháng)`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>0 ₫</span>
            <span>Mốc ngày {currentDay}</span>
            <span>{formatVND(monthlyBudgetLimit)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
