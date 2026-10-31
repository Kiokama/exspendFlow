import React, { useState } from "react";
import { BillReminder } from "../types";
import { formatVND } from "../utils/formatters";
import { Calendar, Wifi, Tv, Zap, Music, CheckCircle2, Clock, CreditCard, BellRing, Plus } from "lucide-react";

interface BillsReminderViewProps {
  bills: BillReminder[];
  onPayBill: (billId: string) => void;
  onAddBill?: (bill: Partial<BillReminder>) => void;
}

export const BillsReminderView: React.FC<BillsReminderViewProps> = ({ bills, onPayBill, onAddBill }) => {
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "paid">("pending");
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<BillReminder["frequency"]>("MONTHLY");

  const filteredBills = bills.filter(b => {
    if (filterMode === "pending") return !b.isPaid;
    if (filterMode === "paid") return b.isPaid;
    return true;
  });

  const getBillIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("wifi") || lower.includes("fpt") || lower.includes("mạng")) return <Wifi className="w-5 h-5 text-blue-500" />;
    if (lower.includes("netflix") || lower.includes("tv")) return <Tv className="w-5 h-5 text-rose-500" />;
    if (lower.includes("điện") || lower.includes("evn")) return <Zap className="w-5 h-5 text-amber-500" />;
    if (lower.includes("spotify") || lower.includes("nhạc")) return <Music className="w-5 h-5 text-emerald-500" />;
    return <Calendar className="w-5 h-5 text-purple-500" />;
  };

  const totalUpcoming = bills.filter(b => !b.isPaid).reduce((acc, b) => acc + b.amount, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    if (onAddBill) {
      onAddBill({
        title,
        amount: Number(amount),
        dueDate,
        frequency,
        category: "Utilities",
        isPaid: false
      });
    }

    setTitle("");
    setAmount("");
    setDueDate(new Date().toISOString().split("T")[0]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Nhắc Nhở Hóa Đơn & Đăng Ký (Bills & Subs)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tự động theo dõi các khoản phí định kỳ không bị phạt trễ hạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hóa Đơn</span>
          </button>
          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Summary Alert Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cần Thanh Toán Tháng Này
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng cộng {bills.filter(b => !b.isPaid).length} hóa đơn sắp đến hạn
            </p>
          </div>
        </div>

        <span className="text-lg font-black text-amber-600 dark:text-amber-400">
          {formatVND(totalUpcoming)}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold max-w-xs">
        <button
          onClick={() => setFilterMode("pending")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filterMode === "pending"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Sắp Tới ({bills.filter(b => !b.isPaid).length})
        </button>
        <button
          onClick={() => setFilterMode("paid")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filterMode === "paid"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Đã Thanh Toán
        </button>
        <button
          onClick={() => setFilterMode("all")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filterMode === "all"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Tất Cả
        </button>
      </div>

      {/* Bills Cards List */}
      <div className="space-y-3">
        {filteredBills.map(bill => (
          <div
            key={bill.id}
            className={`p-4 rounded-2xl border transition flex items-center justify-between ${
              bill.isPaid
                ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75"
                : "bg-white dark:bg-slate-900 border-rose-100/80 dark:border-slate-800 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                {getBillIcon(bill.title)}
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {bill.title}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3 h-3 text-rose-500" /> Hạn thanh toán: {bill.dueDate}
                </p>
              </div>
            </div>

            <div className="text-right flex items-center gap-3">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {formatVND(bill.amount)}
                </p>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {bill.frequency}
                </span>
              </div>

              {bill.isPaid ? (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã Trả
                </span>
              ) : (
                <button
                  onClick={() => onPayBill(bill.id)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/20 transition cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Thanh Toán
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleAddSubmit} className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm Hóa Đơn Mới</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tên Hóa Đơn / Dịch Vụ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tiền Internet FPT, Netflix, Tiền điện..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Số Tiền (VND)</label>
                <input
                  type="number"
                  placeholder="0 ₫"
                  value={amount}
                  onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ngày Hạn Thanh Toán</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tần Suất</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as BillReminder["frequency"])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MONTHLY">Hàng Tháng (Monthly)</option>
                  <option value="WEEKLY">Hàng Tuần (Weekly)</option>
                  <option value="YEARLY">Hàng Năm (Yearly)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                Lưu Hóa Đơn
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
