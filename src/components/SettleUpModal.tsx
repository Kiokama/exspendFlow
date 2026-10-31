import React, { useState } from "react";
import { SharedSpace, User, Settlement, Expense } from "../types";
import { calculateBalance, formatVND, getVietQRUrl } from "../utils/formatters";
import confetti from "canvas-confetti";
import { useToast } from "../context/ToastContext";
import { 
  X, 
  ArrowLeftRight, 
  CheckCircle2, 
  QrCode, 
  Wallet, 
  Building2, 
  Banknote, 
  Send,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSettlement: (settlement: Partial<Settlement>) => void;
  activeSpace: SharedSpace;
  currentUser: User;
  users?: User[];
  expenses: Expense[];
  settlements: Settlement[];
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  onConfirmSettlement,
  activeSpace,
  currentUser,
  users = [],
  expenses,
  settlements
}) => {
  const { showSuccess } = useToast();
  const balance = calculateBalance(expenses, settlements, activeSpace.members);

  const [method, setMethod] = useState<"VIETQR" | "ZALOPAY" | "MOMO" | "CASH" | "BANK_TRANSFER">("VIETQR");
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [note, setNote] = useState("Thanh toán cấn trừ chi tiêu");
  const [copied, setCopied] = useState(false);

  const [tempAccount, setTempAccount] = useState("");
  const [overrideAccount, setOverrideAccount] = useState("");
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  if (!isOpen) return null;

  // Synchronize latest user profile details (bankName, accountNumber, name, avatar) across accounts!
  const resolveUserWithLatestData = (u: User | null): User | null => {
    if (!u) return null;

    // Check if user matches currentUser
    const isCurrent = u.id === currentUser.id || 
      (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (u.name && currentUser.name && u.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase());

    // Find matching user in users list passed from App.tsx
    const systemUser = users?.find(item => 
      item.id === u.id || 
      (item.email && u.email && item.email.toLowerCase() === u.email.toLowerCase()) ||
      (item.name && u.name && item.name.trim().toLowerCase() === u.name.trim().toLowerCase())
    );

    // Find matching member in active space
    const spaceMember = activeSpace?.members?.find(m => 
      m.id === u.id || 
      (m.email && u.email && m.email.toLowerCase() === u.email.toLowerCase()) ||
      (m.name && u.name && m.name.trim().toLowerCase() === u.name.trim().toLowerCase())
    );

    let base: User = {
      ...u,
      ...(spaceMember || {}),
      ...(systemUser || {}),
      ...(isCurrent ? currentUser : {})
    };

    // Ensure accountNumber and bankName fall back if missing on base object
    if (!base.accountNumber) {
      base.accountNumber = systemUser?.accountNumber || spaceMember?.accountNumber || (isCurrent ? currentUser.accountNumber : "") || "";
    }
    if (!base.bankName) {
      base.bankName = systemUser?.bankName || spaceMember?.bankName || (isCurrent ? currentUser.bankName : "") || "MBBank";
    }

    if (overrideAccount) {
      base = { ...base, accountNumber: overrideAccount };
    }

    return base;
  };

  const debtor = resolveUserWithLatestData(balance.debtor);
  const creditor = resolveUserWithLatestData(balance.creditor);

  const maxAmount = balance.netDebt;
  const settleAmount = typeof customAmount === "number" ? customAmount : maxAmount;

  // Determine bank or wallet code for automatic QR generation
  const getQRBankCode = () => {
    if (!creditor) return "MBBank";
    if (method === "ZALOPAY") return "ZaloPay";
    if (method === "MOMO") return "MoMo";
    return creditor.bankName || "MBBank";
  };

  // VietQR / ZaloPay / MoMo Code URL using accurate creditor bank/wallet and account number
  const qrBankCode = getQRBankCode();
  const activeAccountNumber = creditor?.accountNumber || overrideAccount;
  const qrUrl = creditor && activeAccountNumber 
    ? getVietQRUrl(qrBankCode, activeAccountNumber, settleAmount, `DuoExpense ${activeSpace.name}`, creditor.name)
    : null;

  const handleQuickSaveAccount = async () => {
    if (!tempAccount.trim() || !creditor) return;
    const clean = tempAccount.trim();
    setOverrideAccount(clean);

    try {
      await fetch(`/api/users/${creditor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creditor, accountNumber: clean })
      });
      showSuccess("Đã lưu số tài khoản!", `STK ${clean} đã được áp dụng tạo mã QR.`);
    } catch (e) {
      // Fallback local update
    }
  };

  const handleCopyAccount = () => {
    if (!creditor?.accountNumber) return;
    navigator.clipboard.writeText(creditor.accountNumber);
    setCopied(true);
    showSuccess("Đã sao chép số tài khoản!", `${creditor.accountNumber} (${creditor.bankName || "MBBank"})`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtor || !creditor || settleAmount <= 0) return;

    onConfirmSettlement({
      spaceId: activeSpace.id,
      fromUserId: debtor.id,
      toUserId: creditor.id,
      amount: settleAmount,
      date: new Date().toISOString().split("T")[0],
      method,
      note
    });

    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] sm:pb-0">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs shadow-rose-500/20">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Thanh toán & Cấn trừ nợ (Settle Up)
              </h2>
              <p className="text-[11px] text-gray-500">Đưa số dư nợ chung về 0 ₫</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSettleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Debt Summary Banner */}
          {maxAmount === 0 || !debtor || !creditor ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Tài khoản hoàn toàn cân bằng!
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Không có khoản nợ nào cần thanh toán lúc này.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs text-rose-300 font-semibold">
                <span>Số tiền cấn trừ đề xuất:</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold">
                  {debtor.name} ➔ {creditor.name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={debtor.avatar} alt={debtor.name} className="w-10 h-10 rounded-full ring-2 ring-rose-400 object-cover" />
                  <div>
                    <span className="text-xs text-gray-300 block">{debtor.name} trả</span>
                    <strong className="text-lg font-extrabold text-rose-400">{formatVND(settleAmount)}</strong>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-gray-300 block">Nhận bởi</span>
                    <strong className="text-sm font-bold text-white">{creditor.name}</strong>
                  </div>
                  <img src={creditor.avatar} alt={creditor.name} className="w-9 h-9 rounded-full ring-2 ring-pink-400 object-cover" />
                </div>
              </div>

              {/* Bank Details */}
              <div className="pt-2 border-t border-white/10 text-[11px] text-rose-100">
                {isEditingAccount ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-amber-300 font-bold">Cập nhật nhanh Số tài khoản của {creditor.name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nhập số tài khoản/SĐT ví..."
                        value={tempAccount}
                        onChange={(e) => setTempAccount(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-rose-400 bg-rose-950/50 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickSaveAccount();
                          setIsEditingAccount(false);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingAccount(false)}
                        className="px-2 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs transition cursor-pointer shrink-0"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : creditor.accountNumber ? (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span>STK nhận: <strong className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/20 transition" onClick={() => { setTempAccount(creditor.accountNumber || ""); setIsEditingAccount(true); }} title="Nhấn để sửa STK">{creditor.accountNumber}</strong> ({creditor.bankName || "MBBank"})</span>
                      <span className="ml-2 text-rose-200">• Chủ TK: {creditor.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-bold transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Đã chép" : "Coppy STK"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{creditor.name} chưa điền Số tài khoản.</span>
                    <button onClick={() => setIsEditingAccount(true)} className="underline font-bold text-amber-400 cursor-pointer ml-1">Cập nhật ngay</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {maxAmount > 0 && debtor && creditor && (
            <>
              {/* Settle Amount Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Số tiền thanh toán (VND):
                </label>
                <input
                  type="number"
                  required
                  step="1000"
                  max={maxAmount}
                  value={settleAmount}
                  onChange={e => setCustomAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-extrabold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Phương thức thanh toán:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "VIETQR", label: "VietQR Ngân hàng", icon: <QrCode className="w-4 h-4 text-rose-500" /> },
                    { id: "ZALOPAY", label: "Ví ZaloPay", icon: <QrCode className="w-4 h-4 text-sky-500" /> },
                    { id: "MOMO", label: "Ví MoMo", icon: <Wallet className="w-4 h-4 text-pink-500" /> },
                    { id: "BANK_TRANSFER", label: "Chuyển khoản tay", icon: <Building2 className="w-4 h-4 text-rose-400" /> },
                    { id: "CASH", label: "Tiền mặt", icon: <Banknote className="w-4 h-4 text-emerald-500" /> }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        method === m.id
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {m.icon}
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic QR Code Preview for VietQR, ZaloPay, MoMo */}
              {(method === "VIETQR" || method === "ZALOPAY" || method === "MOMO") && (
                qrUrl ? (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {method === "ZALOPAY" && "Mã QR ZaloPay Tự Động"}
                        {method === "MOMO" && "Mã QR Ví MoMo Tự Động"}
                        {method === "VIETQR" && "Mã VietQR Ngân Hàng Tự Động"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        method === "ZALOPAY" ? "bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300" :
                        method === "MOMO" ? "bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300" :
                        "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                      }`}>
                        {method === "ZALOPAY" ? "ZaloPay QR" : method === "MOMO" ? "MoMo QR" : "Napas247 Auto"}
                      </span>
                    </div>

                    <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl shadow-md border flex items-center justify-center">
                      <img 
                        src={qrUrl} 
                        alt={`${method} QR Code`} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const fallbackData = `Nguoi nhan: ${creditor.name} (${creditor.bankName || "MBBank"}) - STK: ${activeAccountNumber} - So tien: ${settleAmount} VND`;
                          e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fallbackData)}`;
                        }}
                      />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-left text-[11px] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Ngân hàng / Ví:</span>
                        <strong className="text-gray-800 dark:text-gray-200">
                          {method === "ZALOPAY" ? "Ví ZaloPay" : method === "MOMO" ? "Ví MoMo" : (creditor.bankName || "MBBank")}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Số tài khoản / SĐT:</span>
                        <div className="flex items-center gap-1">
                          <strong className="font-mono text-rose-600 dark:text-rose-400">{activeAccountNumber}</strong>
                          <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-gray-500 cursor-pointer"
                            title="Sao chép STK"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Người nhận:</span>
                        <strong className="text-gray-800 dark:text-gray-200">{creditor.name}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Số tiền tự động:</span>
                        <strong className="text-amber-600 dark:text-amber-400 font-bold">{formatVND(settleAmount)}</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Mở ứng dụng {method === "ZALOPAY" ? "ZaloPay / Zalo" : method === "MOMO" ? "MoMo" : "Banking (MB, VCB, TCB...)"} quét mã để tự điền chính xác thông tin.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2.5">
                    <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Chưa có số tài khoản / số điện thoại nhận tiền
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Người nhận (<strong>{creditor.name}</strong>) chưa có số tài khoản. Vui lòng cập nhật STK ở phần chi tiết bên trên để hiển thị mã QR.
                    </p>
                  </div>
                )
              )}

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú cấn trừ:
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Xác nhận đã thanh toán cấn trừ</span>
              </button>
            </>
          )}

        </form>
      </div>
    </div>
  );
};
