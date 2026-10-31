import React, { useState } from "react";
import { 
  Home, 
  Receipt, 
  PieChart, 
  Menu, 
  Plus, 
  Sparkles,
  Building2,
  ArrowLeftRight,
  X,
  Wallet,
  Target,
  Clock,
  Repeat,
  ChevronRight
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
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 pb-[max(1.75rem,env(safe-area-inset-bottom,24px))] animate-slideUp space-y-3.5">
            {/* Pull Handle Bar */}
            <div className="flex justify-center -mt-1 pb-1">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Thao tác nhanh
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ghi chép chi tiêu, quét hóa đơn hoặc cấn trừ nợ
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
                className="w-full min-h-[52px] flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-rose-500/20">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Thêm chi tiêu thủ công
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Nhập số tiền, danh mục, tỷ lệ chia 50/50 hoặc %
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Option 2: AI Receipt Scan */}
              <button
                onClick={() => handleAction(onOpenAIScan)}
                className="w-full min-h-[52px] flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-rose-50/70 to-pink-50/50 dark:from-rose-950/30 dark:to-pink-950/20 hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/40 dark:hover:to-pink-900/30 border border-rose-200/80 dark:border-rose-900/50 text-left transition active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-pink-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                    <span>AI Quét Hóa Đơn & Giọng Nói</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-bold">HOT</span>
                  </div>
                  <div className="text-xs text-rose-700/80 dark:text-rose-300/80 truncate">
                    Chụp hóa đơn hoặc đọc lời nói để AI tự bóc tách
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
              </button>

              {/* Option 3: Bank SMS Paste */}
              {onOpenBankSms && (
                <button
                  onClick={() => handleAction(onOpenBankSms)}
                  className="w-full min-h-[52px] flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Dán SMS / Thông báo ngân hàng
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      VCB, Techcombank, MBBank, VPBank, MoMo,...
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Option 4: Dish-by-dish split */}
              {onOpenItemizedSplit && (
                <button
                  onClick={() => handleAction(onOpenItemizedSplit)}
                  className="w-full min-h-[52px] flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/20">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Chia từng món trong bill
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Tách món theo người dùng & phân bổ tiền tip/VAT
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Option 5: Settle Up VietQR */}
              {onOpenSettleUp && (
                <button
                  onClick={() => handleAction(onOpenSettleUp)}
                  className="w-full min-h-[52px] flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-700/60 text-left transition active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/20">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Quyết toán VietQR (Cấn trừ)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Tạo mã QR chuyển khoản chính xác để đưa số dư về 0 ₫
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Dock */}
      <nav 
        aria-label="Thanh điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,12px))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center relative">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab("home")}
            className={`min-h-[50px] flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
              activeTab === "home"
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === "home" ? "bg-rose-50 dark:bg-rose-950/80 scale-105" : ""}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${activeTab === "home" ? "font-bold" : "font-medium"}`}>
              Tổng Quan
            </span>
          </button>

          {/* Tab 2: Transactions */}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`min-h-[50px] flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
              activeTab === "transactions"
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === "transactions" ? "bg-rose-50 dark:bg-rose-950/80 scale-105" : ""}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${activeTab === "transactions" ? "font-bold" : "font-medium"}`}>
              Sổ Thu Chi
            </span>
          </button>

          {/* Middle Center Action Button (+) */}
          <div className="relative -top-2 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowQuickSheet(prev => !prev)}
              className={`w-13 h-13 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/35 active:scale-90 transition-all duration-200 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 cursor-pointer ${
                showQuickSheet ? "rotate-45" : ""
              }`}
              title="Thao tác nhanh"
              aria-label="Thao tác nhanh"
            >
              <Plus className="w-6 h-6 stroke-[2.8]" />
            </button>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">Tạo Mới</span>
          </div>

          {/* Tab 3: Statistics */}
          <button
            onClick={() => setActiveTab("stats")}
            className={`min-h-[50px] flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
              activeTab === "stats"
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === "stats" ? "bg-rose-50 dark:bg-rose-950/80 scale-105" : ""}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${activeTab === "stats" ? "font-bold" : "font-medium"}`}>
              Thống Kê
            </span>
          </button>

          {/* Tab 4: Hub / Profile Menu */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`min-h-[50px] flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
              activeTab === "profile"
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === "profile" ? "bg-rose-50 dark:bg-rose-950/80 scale-105" : ""}`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${activeTab === "profile" ? "font-bold" : "font-medium"}`}>
              Tiện Ích
            </span>
          </button>

        </div>
      </nav>
    </>
  );
};
