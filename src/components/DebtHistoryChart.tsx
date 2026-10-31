import React from "react";
import { Settlement, Expense, SharedSpace } from "../types";
import { formatVND } from "../utils/formatters";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowLeftRight, CheckCircle2, History, ShieldAlert } from "lucide-react";

interface DebtHistoryChartProps {
  expenses: Expense[];
  settlements: Settlement[];
  activeSpace: SharedSpace;
  onOpenSettleUp: () => void;
}

export const DebtHistoryChart: React.FC<DebtHistoryChartProps> = ({
  expenses,
  settlements,
  activeSpace,
  onOpenSettleUp
}) => {
  // Generate historical debt milestones mock/calculated timeline
  const debtTimeline = [
    { date: "01/08", debt: 1200000, note: "Khởi tạo khoản chi thuê nhà" },
    { date: "05/08", debt: 900000, note: "Mai mua siêu thị cấn trừ" },
    { date: "10/08", debt: 400000, note: "Chuyển khoản VietQR 500k" },
    { date: "15/08", debt: 0, note: "Đã tất toán sạch sẽ (Settle Up)" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-amber-500" />
            Lịch Sử & Biểu Đồ Tình Trạng Nợ
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Theo dõi xu hướng biến động số dư nợ theo mốc thời gian giữa các thành viên
          </p>
        </div>

        <button
          onClick={onOpenSettleUp}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Thanh Toán / Cấn Trừ Nợ</span>
        </button>
      </div>

      {/* Chart Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
          Xu hướng biến động dư nợ ròng (VND)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={debtTimeline}>
              <defs>
                <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" stroke="#888888" fontSize={11} />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatVND(Number(val)), "Số dư nợ"]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}
              />
              <Area
                type="monotone"
                dataKey="debt"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#debtGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          Các Mốc Biến Động Số Dư
        </h3>

        <div className="space-y-3">
          {debtTimeline.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  item.debt === 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }`}>
                  {item.debt === 0 ? <CheckCircle2 className="w-4 h-4" /> : `${idx + 1}`}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {item.note}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Ngày: {item.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs sm:text-sm font-black ${item.debt === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {item.debt === 0 ? "0 ₫ (Sạch nợ)" : formatVND(item.debt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
