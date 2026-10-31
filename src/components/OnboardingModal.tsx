import React, { useState } from "react";
import { Sparkles, PieChart, Wallet, ShieldCheck, ArrowRight, Check } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: Sparkles,
      iconBg: "from-rose-500 to-pink-600",
      title: "Quét Hóa Đơn AI Smart Receipts",
      description: "Chụp ảnh hóa đơn siêu thị, nhà hàng hoặc dán tin nhắn ngân hàng. Gemini AI sẽ tự động phân tích số tiền, danh mục và chia tiền cực kỳ chính xác.",
      badge: "AI Powered"
    },
    {
      icon: Wallet,
      iconBg: "from-purple-500 to-pink-600",
      title: "Quản Lý Đa Ví & Tài Sản 360°",
      description: "Theo dõi toàn bộ Tài khoản ngân hàng, Thẻ tín dụng, Ví MoMo, Tiền mặt và Khoản đầu tư tại một nơi duy nhất với giao diện DuoExpense hiện đại.",
      badge: "Multi-Wallet"
    },
    {
      icon: PieChart,
      iconBg: "from-emerald-500 to-teal-600",
      title: "Lập Ngân Sách & Quỹ Tiết Kiệm",
      description: "Đặt hạn mức ngân sách từng danh mục, nhận cảnh báo thông minh trước khi tiêu quá đà và tự động tích lũy quỹ cho các mục tiêu tương lai.",
      badge: "Smart Budgets"
    }
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentStep];
  const IconComp = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[520px]">
        {/* Top Header Controls */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            {slide.badge}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            Bỏ Qua (Skip)
          </button>
        </div>

        {/* Slide Graphic Illustration */}
        <div className="flex flex-col items-center text-center my-6">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${slide.iconBg} flex items-center justify-center shadow-xl shadow-rose-500/20 mb-6 p-0.5 animate-pulse`}>
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
              <IconComp className="w-12 h-12 text-rose-600 dark:text-rose-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {slide.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            {slide.description}
          </p>
        </div>

        {/* Indicators & Navigation Buttons */}
        <div className="space-y-6">
          {/* Step Indicators */}
          <div className="flex justify-center items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-8 bg-rose-600 dark:bg-rose-400"
                    : "w-2 bg-slate-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.98] transition shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {currentStep === slides.length - 1 ? (
              <>
                <span>Bắt Đầu Khám Phá</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
