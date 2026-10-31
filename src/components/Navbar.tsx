import React, { useState } from "react";
import { SharedSpace, User, AppNotification } from "../types";
import { 
  Users, 
  Copy, 
  Check, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  ChevronDown, 
  ArrowLeftRight,
  Receipt,
  Sparkles,
  LogIn,
  UserPlus,
  Link as LinkIcon
} from "lucide-react";

interface NavbarProps {
  spaces: SharedSpace[];
  activeSpace: SharedSpace;
  setActiveSpace: (space: SharedSpace) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  notifications: AppNotification[];
  onOpenAddExpense: () => void;
  onOpenAIScan: () => void;
  onOpenPairing: () => void;
  onOpenAIChat?: () => void;
  onOpenNotificationsModal?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  spaces,
  activeSpace,
  setActiveSpace,
  currentUser,
  setCurrentUser,
  allUsers,
  darkMode,
  setDarkMode,
  notifications,
  onOpenAddExpense,
  onOpenAIScan,
  onOpenPairing,
  onOpenAIChat,
  onOpenNotificationsModal,
  onOpenAuth
}) => {
  const [copied, setCopied] = useState(false);
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const partner = activeSpace.members.find(m => m.id !== currentUser.id) || allUsers.find(u => u.id !== currentUser.id) || currentUser;

  const copyInviteCode = () => {
    navigator.clipboard.writeText(activeSpace.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Left: App Brand & Active Space Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shadow-rose-500/20">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                DuoExpense
              </span>
              <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-semibold">
                Sổ chi tiêu đôi
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Active Space Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 min-w-0">
            <Users className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="max-w-[100px] xs:max-w-[140px] sm:max-w-[180px] truncate">{activeSpace.name}</span>
          </div>

          {/* Button to enter space code / join space */}
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shrink-0"
            title="Bấm để nhập mã mời kết nối vào không gian khác"
          >
            <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Nhập mã kết nối</span>
          </button>

          {/* Quick Invite Code */}
          <button
            onClick={copyInviteCode}
            title="Bấm để sao chép mã kết nối"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition"
          >
            <span>Mã: <strong className="font-mono">{activeSpace.inviteCode}</strong></span>
            {copied ? <Check className="w-3.5 h-3.5 text-rose-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        {/* Right Controls: AI Scan, AI Chat, Quick Add, User Profile, Theme & Notifications */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* AI Chat Drawer Button */}
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 transition cursor-pointer"
              title="Hỏi trợ lý AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Trợ lý</span>
            </button>
          )}

          {/* AI Receipt / Text Scanner Button (Desktop/Tablet) */}
          <button
            id="ai-scan-button"
            onClick={onOpenAIScan}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Quét hóa đơn & Nhận diện thông minh"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Quét hóa đơn</span>
          </button>

          {/* Quick Add Expense (Desktop/Tablet) */}
          <button
            id="quick-add-expense-button"
            onClick={onOpenAddExpense}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thêm khoản chi</span>
          </button>

          {/* Current User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Tài khoản cá nhân"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-500/30"
              />
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                  {currentUser.email}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Tài khoản của bạn
                </div>
                
                <div className="px-3 py-2 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-700 mb-1">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</div>
                  </div>
                </div>

                {onOpenAuth && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-rose-500" />
                    <span>Đổi tài khoản / Đăng ký mới</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Đổi giao diện Sáng / Tối"
            aria-label="Đổi giao diện Sáng / Tối"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                if (onOpenNotificationsModal) onOpenNotificationsModal();
                else setShowNotifications(!showNotifications);
              }}
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">Thông báo mới</span>
                  <span className="text-[10px] text-gray-400">{notifications.length} thông báo</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{n.title}</div>
                      <div className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">{n.message}</div>
                      <div className="text-[9px] text-gray-400 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
