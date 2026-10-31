import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

interface SplashScreenProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGetStarted?: () => void;
  onStart?: () => void;
  onOpenOnboarding?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isOpen = true,
  onClose,
  onGetStarted,
  onStart,
  onOpenOnboarding
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    if (onGetStarted) onGetStarted();
    else if (onStart) onStart();
    else if (onClose) onClose();
  };

  const handleOnboarding = () => {
    if (onOpenOnboarding) onOpenOnboarding();
    else handleStart();
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-br from-slate-950 via-rose-950/50 to-slate-900 text-white overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Logo */}
      <div className="pt-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 p-0.5 shadow-2xl shadow-rose-500/40 mb-4 animate-bounce">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Wallet className="w-8 h-8 text-rose-400" />
          </div>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-300 bg-rose-950/60 border border-rose-800/60 px-3 py-1 rounded-full backdrop-blur-md">
          DuoExpense · Quản Lý Chi Tiêu Đôi
        </span>
      </div>

      {/* Middle Illustration & Value Prop */}
      <div className="flex flex-col items-center text-center max-w-sm my-auto">
        {/* Animated Card Mockup */}
        <div className="relative w-64 h-36 mb-8 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 p-5 shadow-2xl shadow-rose-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/20">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-white/80">DuoExpense Premium</span>
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-white">42.850.000 ₫</span>
            <p className="text-[10px] text-rose-100 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-300" /> +14.2% tiết kiệm tháng này
            </p>
          </div>
          {/* Subtle floating glass badge */}
          <div className="absolute -bottom-4 -right-4 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-400 shadow-xl flex items-center gap-1.5 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI Auto-Synced
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Gắn Kết <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-rose-200">Tài Chính Đôi</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
          Quản lý chi tiêu chung, chia tiền tự động, đối soát VietQR và ngân sách minh bạch cho các cặp đôi.
        </p>
      </div>

      {/* Bottom Action Controls */}
      <div className="w-full max-w-sm flex flex-col gap-3 pb-6">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Mở Ứng Dụng Ngay</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleOnboarding}
          className="w-full py-3 rounded-2xl font-medium text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer"
        >
          Xem Hướng Dẫn Tính Năng (Onboarding)
        </button>
      </div>
    </div>
  );
};
