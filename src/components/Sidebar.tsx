import React from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowLeftRight, 
  PieChart, 
  Wallet, 
  Users, 
  History,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Repeat,
  Target,
  TrendingUp,
  Bot
} from "lucide-react";

export type NavTab = 
  | "dashboard" 
  | "expenses" 
  | "wallets"
  | "bills"
  | "calendar"
  | "timeline"
  | "recurring"
  | "goals"
  | "saas"
  | "debt_history"
  | "settle" 
  | "analytics" 
  | "budgets" 
  | "spaces" 
  | "profile"
  | "audit";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAIScan: () => void;
  onOpenAIChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAIScan, onOpenAIChat }) => {
  const [showMore, setShowMore] = React.useState(false);

  const mainMenuItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Tổng quan", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "expenses", label: "Sổ chi tiêu", icon: <Receipt className="w-4 h-4" /> },
    { id: "analytics", label: "Thống kê & Ngân sách", icon: <PieChart className="w-4 h-4" /> },
    { id: "settle", label: "Cấn trừ nợ (Settle Up)", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: "profile", label: "Cài đặt & Không gian", icon: <Users className="w-4 h-4" /> },
  ];

  const extraMenuItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "wallets", label: "Ví tiền & Tài sản", icon: <Wallet className="w-4 h-4" /> },
    { id: "goals", label: "Mục tiêu tiết kiệm", icon: <Target className="w-4 h-4" /> },
    { id: "recurring", label: "Chi phí định kỳ", icon: <Repeat className="w-4 h-4" /> },
    { id: "bills", label: "Hóa đơn & Đăng ký", icon: <Clock className="w-4 h-4" /> },
    { id: "audit", label: "Lịch sử hoạt động", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu Chính
        </div>
        {mainMenuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Collapsible Extra Tools */}
        <div className="pt-2">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
          >
            <span>{showMore ? "Thu gọn công cụ" : "Chức năng bổ sung..."}</span>
            <span className="text-[10px]">{showMore ? "▲" : "▼"}</span>
          </button>

          {showMore && (
            <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-rose-100 dark:border-rose-900/40">
              {extraMenuItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Input & Assistant Tools Card */}
      <div className="mt-6 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/40 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-rose-950 dark:text-rose-200 font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Công cụ nhập nhanh</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Quét hóa đơn giấy hoặc nhập liệu bằng giọng nói tiếng Việt.
        </p>
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            onClick={onOpenAIScan}
            className="py-1.5 px-2 rounded-lg bg-rose-100/80 hover:bg-rose-200/80 dark:bg-rose-900/40 dark:hover:bg-rose-850/60 text-rose-800 dark:text-rose-200 font-medium text-[11px] transition text-center cursor-pointer"
          >
            Quét ảnh
          </button>
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              className="py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <Bot className="w-3 h-3" />
              <span>Trợ lý</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
