import React, { useState } from "react";
import { User, Achievement, UserSettings, SharedSpace } from "../types";
import { NavTab } from "./Sidebar";
import { 
  User as UserIcon, 
  ShieldCheck, 
  Award, 
  Moon, 
  Sun, 
  DollarSign, 
  Lock, 
  Download, 
  ChevronRight, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Edit3,
  Wallet,
  Target,
  Repeat,
  Clock,
  Calendar,
  History,
  ArrowLeftRight,
  PieChart
} from "lucide-react";
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
  onSelectTab?: (tab: NavTab) => void;
}

export const ProfileAndSettingsView: React.FC<ProfileAndSettingsViewProps> = ({
  currentUser,
  achievements,
  activeSpace,
  expenses,
  onOpenAuth,
  onOpenOnboarding,
  onOpenPairing,
  onOpenEditProfile,
  onSelectTab
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

  const hubFeatures = [
    { id: "wallets" as NavTab, label: "Ví Tiền & Tài Sản", desc: "Quản lý số dư các ví, thẻ & tài khoản", icon: <Wallet className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-950/60" },
    { id: "goals" as NavTab, label: "Mục Tiêu Tiết Kiệm", desc: "Kế hoạch tích lũy chung cho tương lai", icon: <Target className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50 dark:bg-emerald-950/60" },
    { id: "recurring" as NavTab, label: "Chi Phí Định Kỳ", desc: "Tiền trọ, net, điện nước tự động", icon: <Repeat className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-950/60" },
    { id: "bills" as NavTab, label: "Hóa Đơn & Đăng Ký", desc: "Theo dõi hạn nộp & dịch vụ định kỳ", icon: <Clock className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50 dark:bg-amber-950/60" },
    { id: "calendar" as NavTab, label: "Lịch Chi Tiêu", desc: "Xem chi tiêu theo từng ngày trên lịch", icon: <Calendar className="w-5 h-5 text-rose-500" />, bg: "bg-rose-50 dark:bg-rose-950/60" },
    { id: "timeline" as NavTab, label: "Dòng Thời Gian", desc: "Nhật ký hoạt động chi tiết giữa hai bạn", icon: <History className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50 dark:bg-indigo-950/60" },
    { id: "settle" as NavTab, label: "Cấn Trừ Nợ (VietQR)", desc: "Quyết toán nhanh số dư nợ đưa về 0 ₫", icon: <ArrowLeftRight className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50 dark:bg-amber-950/60" },
    { id: "budgets" as NavTab, label: "Hạn Mức Ngân Sách", desc: "Đặt cảnh báo chi tiêu từng danh mục", icon: <PieChart className="w-5 h-5 text-pink-500" />, bg: "bg-pink-50 dark:bg-pink-950/60" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 animate-fadeIn">
      
      {/* User Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 sm:gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">{currentUser.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-300/30 shrink-0">
                PRO Member
              </span>
            </div>
            <p className="text-xs text-rose-100 truncate mt-0.5">{currentUser.email}</p>
            {currentUser.bankName && (
              <p className="text-[11px] text-pink-200 mt-1 flex items-center gap-1 truncate">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {currentUser.bankName} - {currentUser.accountNumber}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenEditProfile}
              className="px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/20 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="Chỉnh sửa thông tin hồ sơ"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sửa</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer active:scale-95"
              title="Đổi Tài Khoản"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Hub for Mobile: All App Modules in One Tap */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Trung Tâm Tiện Ích & Công Cụ
          </h3>
          <span className="text-[11px] text-slate-400">8 chức năng</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {hubFeatures.map(feat => (
            <button
              key={feat.id}
              onClick={() => onSelectTab?.(feat.id)}
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-rose-300 dark:hover:border-rose-800 transition active:scale-95 text-left flex flex-col justify-between group cursor-pointer min-h-[96px]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-xl ${feat.bg} group-hover:scale-105 transition-transform`}>
                  {feat.icon}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-rose-500 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {feat.label}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {feat.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Huy Chương & Danh Hiệu Tài Chính
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                ach.unlocked
                  ? "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-2xs"
                  : "bg-slate-100/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <Award className="w-4.5 h-4.5" />
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
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Cài Đặt & Không Gian
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
          
          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Giao Diện Tối (Dark Mode)</h4>
                <p className="text-xs text-slate-400">Dễ nhìn ban đêm & tiết kiệm pin</p>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`w-12 h-7 rounded-full p-1 transition duration-300 cursor-pointer ${
                settings.darkMode ? "bg-rose-600" : "bg-slate-200"
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
              className={`w-12 h-7 rounded-full p-1 transition duration-300 cursor-pointer ${
                settings.biometricEnabled ? "bg-rose-600" : "bg-slate-200"
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
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Xuất Báo Cáo Chi Tiêu (CSV)</h4>
                <p className="text-xs text-slate-400">Tải file bảng tính Excel để lưu trữ</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Edit Profile Entry */}
          <div
            onClick={onOpenEditProfile}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Chỉnh Sửa Hồ Sơ Cá Nhân</h4>
                <p className="text-xs text-slate-400">Tên, ảnh đại diện, số tài khoản nhận tiền</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Join Space with Code */}
          <div
            onClick={onOpenPairing}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Quản Lý Không Gian & Mã Mời</h4>
                <p className="text-xs text-slate-400">Tạo không gian mới hoặc nhập mã mời từ bạn bè</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Onboarding Restart */}
          <div
            onClick={onOpenOnboarding}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Xem Lại Hướng Dẫn Tính Năng</h4>
                <p className="text-xs text-slate-400">Khám phá toàn bộ tính năng hữu ích của DuoExpense</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

        </div>
      </div>
    </div>
  );
};
