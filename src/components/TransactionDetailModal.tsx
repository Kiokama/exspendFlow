import React, { useState } from "react";
import { Expense, SharedSpace, User } from "../types";
import { formatVND } from "../utils/formatters";
import { X, Calendar, MapPin, Tag, Share2, Edit2, Trash2, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

interface TransactionDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  activeSpace: SharedSpace;
  currentUser: User;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  activeSpace,
  currentUser,
  onEdit,
  onDelete
}) => {
  const [showReceiptZoom, setShowReceiptZoom] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !expense) return null;

  const paidUser = activeSpace.members.find(m => m.id === expense.paidById) || currentUser;
  const userA = activeSpace.members[0] || currentUser;
  const userB = activeSpace.members[1] || currentUser;

  const handleShare = () => {
    const text = `ExpenseFlow Transaction: ${expense.title} - ${formatVND(expense.amount)} (${expense.date}) paid by ${paidUser.name}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  let shareA = 0;
  let shareB = 0;
  if (expense.isPersonal) {
    if (expense.paidById === userA.id) shareA = expense.amount;
    else shareB = expense.amount;
  } else if (expense.splitType === "50_50") {
    shareA = expense.amount / 2;
    shareB = expense.amount / 2;
  } else if (expense.splitType === "PERCENTAGE") {
    const pA = expense.splitDetails?.userAPercent ?? 50;
    const pB = expense.splitDetails?.userBPercent ?? 50;
    shareA = (expense.amount * pA) / 100;
    shareB = (expense.amount * pB) / 100;
  } else if (expense.splitType === "EXACT") {
    shareA = expense.splitDetails?.userAAmount ?? (expense.amount / 2);
    shareB = expense.splitDetails?.userBAmount ?? (expense.amount / 2);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] sm:pb-0">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden flex justify-center pt-1 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              {expense.category}
            </span>
            {expense.isPersonal && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                Cá Nhân
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition relative cursor-pointer"
              title="Chia sẻ giao dịch"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow">
                  Đã copy!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-2 overflow-y-auto space-y-6 my-2">
          {/* Main Amount & Title Card */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-rose-50/50 to-pink-50/30 dark:from-slate-800/80 dark:to-rose-950/40 border border-rose-100 dark:border-rose-900/40">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {expense.title}
            </h3>
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight my-2">
              {formatVND(expense.amount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {expense.date}
            </p>
          </div>

          {/* Paid By & Split Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chi Tiết Phân Chia & Trả Tiền
            </h4>
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Người ứng trước:</span>
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <img src={paidUser.avatar} alt={paidUser.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{paidUser.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Quy tắc chia:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {expense.isPersonal ? "Cá nhân (Không chia)" : expense.splitType === "50_50" ? "Chia đều 50/50" : expense.splitType === "PERCENTAGE" ? "Chia theo tỷ lệ %" : "Số tiền cụ thể"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400">{userA.name}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {formatVND(shareA)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400">{userB.name}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {formatVND(shareB)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Mock */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-xs">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Địa điểm giao dịch</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hà Nội, Việt Nam (Auto-tagged)</p>
            </div>
          </div>

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tags Gắn Kèm</h4>
              <div className="flex flex-wrap gap-1.5">
                {expense.tags.map((t, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-rose-500" /> #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Receipt Image */}
          {expense.receiptUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ảnh Hóa Đơn / Biên Lai</h4>
              <div
                onClick={() => setShowReceiptZoom(true)}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group max-h-48"
              >
                <img src={expense.receiptUrl} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                  <FileText className="w-4 h-4" /> Bấm để phóng to
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {showConfirmDelete ? (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fadeIn">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Xác nhận xóa khoản chi "{expense.title}"?
              </p>
              <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-0.5">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(expense.id);
                  setShowConfirmDelete(false);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(expense);
              }}
              className="py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" /> Chỉnh Sửa
            </button>

            <button
              onClick={() => setShowConfirmDelete(true)}
              className="py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/50 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showReceiptZoom && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowReceiptZoom(false)}>
          <img src={expense.receiptUrl} alt="Zoomed Receipt" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
};
