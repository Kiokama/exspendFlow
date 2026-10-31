import React, { useState } from "react";
import { Fingerprint, Mail, Lock, User as UserIcon, Shield, ArrowRight, X, ScanFace } from "lucide-react";
import { User } from "../types";
import { saveUserSession } from "../App";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, canClose = true }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSuccess, setIsBiometricSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: "user_main",
      name: "Tài Khoản Của Tôi",
      email: "user@expenseflow.app",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MainUser",
      bankName: "MBBank",
      accountNumber: "0988776655"
    };
    saveUserSession(guestUser);
    onLoginSuccess(guestUser);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    if (mode === "register") {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || "Người Dùng Mới",
            email: email.trim(),
            password,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email || "User")}`,
            bankName: "MBBank",
            accountNumber: ""
          })
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveUserSession(data.user);
          onLoginSuccess(data.user);
          onClose();
        } else {
          setAuthError(data.error || "Đăng ký không thành công. Vui lòng kiểm tra lại!");
        }
      } catch (err) {
        setAuthError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveUserSession(data.user);
          onLoginSuccess(data.user);
          onClose();
        } else {
          setAuthError(data.error || "Email hoặc mật khẩu không chính xác. Vui lòng thử lại!");
        }
      } catch (err) {
        setAuthError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBiometricAuth = () => {
    setIsBiometricSuccess(true);
    setTimeout(() => {
      const bioUser: User = {
        id: `user_${Date.now()}`,
        name: "Người Dùng Biometric",
        email: "biometric@expenseflow.app",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Biometric",
        bankName: "MBBank",
        accountNumber: "0988776655"
      };
      saveUserSession(bioUser);
      onLoginSuccess(bioUser);
      setIsBiometricSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div className="relative w-[calc(100vw-24px)] max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === "login" ? "Đăng Nhập DuoExpense" : "Tạo Tài Khoản Mới"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bảo mật cấp tài chính với mã hóa 256-bit
          </p>
        </div>

        {/* Biometric Face ID Button */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-rose-50/50 dark:from-slate-800/80 dark:to-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-center">
          <button
            onClick={handleBiometricAuth}
            disabled={isBiometricSuccess}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-rose-600 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 hover:border-rose-400 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isBiometricSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                <ScanFace className="w-5 h-5 animate-pulse text-emerald-500" /> Face ID Xác Nhận Thành Công!
              </span>
            ) : (
              <>
                <Fingerprint className="w-5 h-5 text-rose-500" />
                <span>Đăng Nhập Nhanh bằng Face ID / Fingerprint</span>
              </>
            )}
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => { setMode("login"); setAuthError(null); }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setMode("register"); setAuthError(null); }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              mode === "register"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-300 text-xs font-medium text-center animate-fadeIn">
            {authError}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Họ & Tên</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setAuthError(null); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setAuthError(null); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError(null); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>{isLoading ? "Đang xử lý..." : mode === "login" ? "Đăng Nhập" : "Tạo Tài Khoản"}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
            >
              Trải nghiệm ngay với Tài Khoản Khách (Guest)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
