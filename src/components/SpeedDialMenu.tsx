import React, { useState } from "react";
import { 
  Plus, 
  X, 
  Building2, 
  Sparkles, 
  Receipt, 
  ArrowLeftRight, 
  CreditCard 
} from "lucide-react";

interface SpeedDialMenuProps {
  onOpenAddExpense: () => void;
  onOpenBankSms: () => void;
  onOpenAIScan: () => void;
  onOpenItemizedSplit: () => void;
  onOpenSettleUp: () => void;
}

export const SpeedDialMenu: React.FC<SpeedDialMenuProps> = ({
  onOpenAddExpense,
  onOpenBankSms,
  onOpenAIScan,
  onOpenItemizedSplit,
  onOpenSettleUp
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        />
      )}

      {/* Floating Speed Dial Container (Desktop & Tablet) */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-50 flex-col items-end gap-2.5">
        
        {/* Expanded Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-slideUp">
            
            {/* Option 1: Bank SMS Fast Parser */}
            <button
              onClick={() => handleAction(onOpenBankSms)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition group cursor-pointer"
            >
              <span className="text-xs font-bold whitespace-nowrap">Dán SMS Ngân Hàng</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
                <Building2 className="w-4 h-4" />
              </div>
            </button>

            {/* Option 2: Itemized Dishes Split */}
            <button
              onClick={() => handleAction(onOpenItemizedSplit)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition group cursor-pointer"
            >
              <span className="text-xs font-bold whitespace-nowrap">Chia Từng Món (Dish Split)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <Receipt className="w-4 h-4" />
              </div>
            </button>

            {/* Option 3: AI Smart Camera / Prompt Scan */}
            <button
              onClick={() => handleAction(onOpenAIScan)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition group cursor-pointer"
            >
              <span className="text-xs font-bold whitespace-nowrap">AI Quét Hóa Đơn</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                <Sparkles className="w-4 h-4" />
              </div>
            </button>

            {/* Option 4: Settle Up VietQR */}
            <button
              onClick={() => handleAction(onOpenSettleUp)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition group cursor-pointer"
            >
              <span className="text-xs font-bold whitespace-nowrap">Quyết Toán VietQR</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </button>

            {/* Option 5: Standard Manual Add */}
            <button
              onClick={() => handleAction(onOpenAddExpense)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition group cursor-pointer"
            >
              <span className="text-xs font-bold whitespace-nowrap">Thêm Chi Tiêu Thủ Công</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
                <CreditCard className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Master Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? "bg-slate-800 dark:bg-slate-700 rotate-45 scale-95"
              : "bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/35 ring-4 ring-rose-500/20"
          }`}
          title={isOpen ? "Đóng menu" : "Thao tác nhanh"}
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>

      </div>
    </>
  );
};
