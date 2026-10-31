import React, { useState } from "react";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  WalletCards, 
  Plus, 
  Sparkles,
  Building2,
  Receipt,
  ArrowLeftRight,
  X
} from "lucide-react";

export type MobileTab = "home" | "transactions" | "stats" | "budgets" | "profile";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  onOpenAddExpense: () => void;
  onOpenAIScan: () => void;
  onOpenBankSms?: () => void;
  onOpenItemizedSplit?: () => void;
  onOpenSettleUp?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddExpense,
  onOpenAIScan,
  onOpenBankSms,
  onOpenItemizedSplit,
  onOpenSettleUp
}) => {
  const [showQuickSheet, setShowQuickSheet] = useState(false);

  const handleAction = (callback?: () => void) => {
    setShowQuickSheet(false);
    if (callback) callback();
  };

  return (
    <>
      {/* Mobile Quick Action Bottom Sheet Drawer */}
      {showQuickSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowQuickSheet(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] animate-slideUp space-y-3">
            {/* Pull Handle Bar */}
            <div className="flex justify-center -mt-1 pb-1">
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thao tác nhanh
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn hình thức nhập chi tiêu hoặc quyết toán
                </p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition cursor-pointer"
                aria-label="Đóng bảng thao tác nhanh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fast Action Rows */}
            <div className="space-y-2 pt-1">
              
              {/* Option 1: Manual Expense */}
              <button
                onClick={() => handleAction(onOpenAddExpense)}
                className="w-full min-h-[48px] flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.99] cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Thêm chi tiêu thủ công
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Nhập số tiền, danh mục, tỷ lệ chia đôi hoặc %
                  </div>
                </div>
              </button>

              {/* Option 2: AI Receipt Scan */}
              <button
                onClick={() => handleAction(onOpenAIScan)}
                className="w-full min-h-[48px] flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.99] cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Quét hóa đơn AI & Giọng nói
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Chụp bill hoặc đọc nội dung chi tiêu tự động trích xuất
                  </div>
                </div>
              </button>

              {/* Option 3: Bank SMS Paste */}
              {onOpenBankSms && (
                <button
                  onClick={() => handleAction(onOpenBankSms)}
                  className="w-full min-h-[48px] flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.99] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Dán SMS / Thông báo ngân hàng
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Hỗ trợ tin nhắn biến động số dư Vietcombank, Techcombank, MoMo,...
                    </div>
                  </div>
                </button>
              )}

              {/* Option 4: Dish-by-dish split */}
              {onOpenItemizedSplit && (
                <button
                  onClick={() => handleAction(onOpenItemizedSplit)}
                  className="w-full min-h-[48px] flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.99] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Chia từng món trong bill
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Tách bill ăn uống theo người dùng và phân bổ VAT
                    </div>
                  </div>
                </button>
              )}

              {/* Option 5: Settle Up VietQR */}
              {onOpenSettleUp && (
                <button
                  onClick={() => handleAction(onOpenSettleUp)}
                  className="w-full min-h-[48px] flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.99] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Quyết toán VietQR (Cấn trừ)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Tạo mã QR chuyển khoản chính xác để đưa số dư về 0 ₫
                    </div>
                  </div>
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Dock */}
      <nav 
        aria-label="Thanh điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-end relative">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab("home")}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
              activeTab === "home"
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "home" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5 font-medium">Trang Chủ</span>
          </button>

          {/* Tab 2: Transactions */}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
              activeTab === "transactions"
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "transactions" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5 font-medium">Giao Dịch</span>
          </button>

          {/* Middle Center Action Button (+) */}
          <div className="relative -top-2 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowQuickSheet(prev => !prev)}
              className={`w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30 active:scale-95 transition-all duration-150 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 cursor-pointer ${
                showQuickSheet ? "rotate-45" : ""
              }`}
              title="Thao tác nhanh"
              aria-label="Thao tác nhanh"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Tạo</span>
          </div>

          {/* Tab 3: Statistics */}
          <button
            onClick={() => setActiveTab("stats")}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
              activeTab === "stats"
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "stats" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5 font-medium">Thống Kê</span>
          </button>

          {/* Tab 4: Budgets */}
          <button
            onClick={() => setActiveTab("budgets")}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
              activeTab === "budgets"
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "budgets" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <WalletCards className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5 font-medium">Ngân Sách</span>
          </button>

        </div>
      </nav>
    </>
  );
};
