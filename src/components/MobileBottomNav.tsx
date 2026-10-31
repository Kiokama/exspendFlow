import React, { useState } from "react";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  WalletCards, 
  User as UserIcon, 
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
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] animate-slideUp space-y-3.5">
            {/* Pull Handle Bar */}
            <div className="flex justify-center -mt-1 pb-1">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Thao Tác Nhanh
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn hình thức nhập chi tiêu hoặc quyết toán
                </p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              
              {/* Option 1: Manual Expense */}
              <button
                onClick={() => handleAction(onOpenAddExpense)}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-left hover:bg-rose-100/70 dark:hover:bg-rose-900/50 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Thêm Chi Tiêu Thủ Công</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">Chuẩn</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Ghi chép số tiền, danh mục, chia 50/50 hoặc tỷ lệ %
                  </div>
                </div>
              </button>

              {/* Option 2: Bank SMS Paste */}
              {onOpenBankSms && (
                <button
                  onClick={() => handleAction(onOpenBankSms)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 text-left hover:bg-pink-100/60 dark:hover:bg-pink-900/50 active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/25">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Dán SMS / App Ngân Hàng</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400">Siêu Tốc</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      VCB, Techcombank, MB, ACB, VPBank, MoMo, ZaloPay
                    </div>
                  </div>
                </button>
              )}

              {/* Option 3: Dish-by-dish split */}
              {onOpenItemizedSplit && (
                <button
                  onClick={() => handleAction(onOpenItemizedSplit)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-left hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Chia Từng Món (Dish Split)</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Nhà hàng</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Tách bill ăn uống theo từng món và phân bổ VAT/phí
                    </div>
                  </div>
                </button>
              )}

              {/* Option 4: AI Receipt Scan */}
              <button
                onClick={() => handleAction(onOpenAIScan)}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-left hover:bg-rose-100/60 dark:hover:bg-rose-900/50 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>AI Quét Hóa Đơn & Nhập Giọng Nói</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">Gemini</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Chụp bill hoặc nhập tiếng Việt tự nhiên tự động điền
                  </div>
                </div>
              </button>

              {/* Option 5: Settle Up VietQR */}
              {onOpenSettleUp && (
                <button
                  onClick={() => handleAction(onOpenSettleUp)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-left hover:bg-amber-100/60 dark:hover:bg-amber-900/50 active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Quyết Toán VietQR (Settle Up)</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">Cấn trừ</span>
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,10px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-end relative">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "home"
                ? "text-rose-600 dark:text-rose-400 font-extrabold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "home" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">Trang Chủ</span>
          </button>

          {/* Tab 2: Transactions */}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "transactions"
                ? "text-rose-600 dark:text-rose-400 font-extrabold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "transactions" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">Giao Dịch</span>
          </button>

          {/* Middle Center Floating Action Button (+) */}
          <div className="relative -top-3.5 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowQuickSheet(prev => !prev)}
              className={`w-13 h-13 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 text-white shadow-lg shadow-rose-500/35 active:scale-95 transition-all duration-200 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 cursor-pointer ${
                showQuickSheet ? "rotate-45 bg-slate-800" : ""
              }`}
              title="Thao tác nhanh / Thêm khoản chi"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1">Thao Tác</span>
          </div>

          {/* Tab 3: Statistics */}
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "stats"
                ? "text-rose-600 dark:text-rose-400 font-extrabold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "stats" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">Thống Kê</span>
          </button>

          {/* Tab 4: Budgets */}
          <button
            onClick={() => setActiveTab("budgets")}
            className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "budgets"
                ? "text-rose-600 dark:text-rose-400 font-extrabold"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === "budgets" ? "bg-rose-50 dark:bg-rose-950/60" : ""}`}>
              <WalletCards className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">Ngân Sách</span>
          </button>

        </div>
      </nav>
    </>
  );
};
