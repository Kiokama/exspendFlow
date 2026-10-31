import React, { useState } from "react";
import { User, Achievement, UserSettings, SharedSpace } from "../types";
import { User as UserIcon, ShieldCheck, Award, Moon, Sun, DollarSign, Lock, Cloud, Download, Languages, ChevronRight, LogOut, Sparkles, CheckCircle2, Users, Edit3 } from "lucide-react";
import { exportToCSV } from "../utils/export";

interface ProfileAndSettingsViewProps {
  currentUser: User;
  achievements: Achievement[];
  activeSpace: SharedSpace;
  expenses: any[];
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  onOpenPairing: () => void;
  onOpenEditProfile: () => void;
}

export const ProfileAndSettingsView: React.FC<ProfileAndSettingsViewProps> = ({
  currentUser,
  achievements,
  activeSpace,
  expenses,
  onOpenAuth,
  onOpenOnboarding,
  onOpenPairing,
  onOpenEditProfile
}) => {
  const [settings, setSettings] = useState<UserSettings>({
    currency: "VND",
    darkMode: document.documentElement.classList.contains("dark"),
    biometricEnabled: true,
    cloudSync: true,
    language: "vi",
    notificationsEnabled: true
  });

  const toggleDarkMode = () => {
    const nextDark = !settings.darkMode;
    setSettings(prev => ({ ...prev, darkMode: nextDark }));
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleExportCSV = () => {
    exportToCSV(expenses, activeSpace.name, activeSpace.members);
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* User Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white truncate">{currentUser.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-300/30">
                PRO Member
              </span>
            </div>
            <p className="text-xs text-indigo-100 truncate mt-0.5">{currentUser.email}</p>
            {currentUser.bankName && (
              <p className="text-[11px] text-cyan-200 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {currentUser.bankName} - {currentUser.accountNumber}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEditProfile}
              className="px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/20 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Chỉnh sửa thông tin hồ sơ"
            >
              <Edit3 className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline">Sửa Hồ Sơ</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
              title="Đổi Tài Khoản"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Danh Hiệu & Huy Chương Tài Chính
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                ach.unlocked
                  ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-xs"
                  : "bg-slate-100/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                {ach.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{ach.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Settings List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Cài Đặt Ứng Dụng (Settings)
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
          
          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Giao Diện Tối (Dark Mode)</h4>
                <p className="text-xs text-slate-400">Tối ưu mắt & tiết kiệm pin OLED</p>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`w-12 h-7 rounded-full p-1 transition duration-300 ${
                settings.darkMode ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-300 ${
                  settings.darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Currency */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Đơn Vị Tiền Tệ</h4>
                <p className="text-xs text-slate-400">Đơn vị hiển thị số tiền mặc định</p>
              </div>
            </div>

            <select
              value={settings.currency}
              onChange={e => setSettings(prev => ({ ...prev, currency: e.target.value as any }))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="VND">₫ (VND)</option>
              <option value="USD">$ (USD)</option>
              <option value="EUR">€ (EUR)</option>
            </select>
          </div>

          {/* Biometric */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Khóa Sinh Trắc Học (Face ID)</h4>
                <p className="text-xs text-slate-400">Yêu cầu Face ID khi mở app</p>
              </div>
            </div>

            <button
              onClick={() => setSettings(prev => ({ ...prev, biometricEnabled: !prev.biometricEnabled }))}
              className={`w-12 h-7 rounded-full p-1 transition duration-300 ${
                settings.biometricEnabled ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-300 ${
                  settings.biometricEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Export Data */}
          <div
            onClick={handleExportCSV}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Xuất Dữ Liệu Báo Cáo (CSV)</h4>
                <p className="text-xs text-slate-400">Tải dữ liệu giao dịch về máy tính hoặc Excel</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Edit Profile Entry */}
          <div
            onClick={onOpenEditProfile}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Chỉnh Sửa Hồ Sơ Cá Nhân</h4>
                <p className="text-xs text-slate-400">Cập nhật tên, avatar, ngân hàng & số tài khoản nhận tiền</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Join Space with Code */}
          <div
            onClick={onOpenPairing}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Nhập Mã Mời Kết Nối Không Gian</h4>
                <p className="text-xs text-slate-400">Nhập mã DUO-XXXX từ bạn bè để gia nhập hoặc tạo mới</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Onboarding Restart */}
          <div
            onClick={onOpenOnboarding}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Xem Lại Hướng Dẫn Tính Năng</h4>
                <p className="text-xs text-slate-400">Mở lại Onboarding giới thiệu tính năng</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

        </div>
      </div>
    </div>
  );
};
