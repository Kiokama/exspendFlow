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
  Sparkles,
  LogIn,
  Link as LinkIcon,
  Receipt
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
    <header className="sticky top-0 z-30 w-full border-b border-gray-200/90 dark:border-gray-800/90 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Left: App Brand & Active Space Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          
          {/* Mobile: Interactive Space Switcher Pill with Dual Avatars */}
          <button
            onClick={onOpenPairing}
            className="flex sm:hidden items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-left active:scale-95 transition-all cursor-pointer min-w-0 max-w-[210px]"
            title="Nhấn để đổi không gian hoặc ghép đôi"
          >
            {/* Overlapping Avatars */}
            <div className="flex -space-x-2 shrink-0">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover border border-rose-300"
              />
              <img 
                src={partner.avatar} 
                alt={partner.name} 
                className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover border border-pink-300"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {activeSpace.name}
              </span>
              <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-semibold truncate leading-none">
                Mã: {activeSpace.inviteCode}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-rose-500 shrink-0 opacity-70" />
          </button>

          {/* Desktop Brand Logo */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-xs shadow-rose-500/20">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                DuoExpense
              </span>
              <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-semibold leading-tight">
                Sổ chi tiêu đôi
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Desktop Active Space Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 min-w-0">
            <Users className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="max-w-[160px] truncate">{activeSpace.name}</span>
          </div>

          {/* Desktop Button to enter space code / join space */}
          <button
            onClick={onOpenPairing}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shrink-0"
            title="Bấm để nhập mã mời kết nối vào không gian khác"
          >
            <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Mã kết nối</span>
          </button>

          {/* Desktop Quick Invite Code */}
          <button
            onClick={copyInviteCode}
            title="Bấm để sao chép mã kết nối"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition"
          >
            <span>Mã: <strong className="font-mono">{activeSpace.inviteCode}</strong></span>
            {copied ? <Check className="w-3.5 h-3.5 text-rose-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        {/* Right Controls: AI Assistant, User Profile, Theme & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* AI Chat Drawer Button */}
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
              title="Hỏi trợ lý AI tài chính"
              aria-label="Trợ lý AI"
            >
              <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="hidden xs:inline">Trợ lý AI</span>
            </button>
          )}

          {/* Desktop AI Receipt Scan Button */}
          <button
            id="ai-scan-button"
            onClick={onOpenAIScan}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Quét hóa đơn & Nhận diện thông minh"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Quét bill</span>
          </button>

          {/* Desktop Quick Add Expense Button */}
          <button
            id="quick-add-expense-button"
            onClick={onOpenAddExpense}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Thêm khoản chi</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                if (onOpenNotificationsModal) onOpenNotificationsModal();
                else setShowNotifications(!showNotifications);
              }}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">Thông báo mới</span>
                  <span className="text-[10px] text-gray-400">{notifications.length} thông báo</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 text-xs">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{n.title}</div>
                      <div className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">{n.message}</div>
                      <div className="text-[9px] text-gray-400 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
            title="Đổi giao diện Sáng / Tối"
            aria-label="Đổi giao diện Sáng / Tối"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Current User Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 active:scale-95 transition cursor-pointer"
              title="Tài khoản cá nhân"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-rose-500/30"
              />
              <div className="hidden lg:block text-left pr-1">
                <span className="block text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 leading-none">
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

        </div>
      </div>
    </header>
  );
};
