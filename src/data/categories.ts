import { CategoryInfo, CategoryKey } from "../types";

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  Housing: {
    key: "Housing",
    label: "Nhà ở & Thuê phòng",
    iconName: "Home",
    color: "#3B82F6", // blue
    bgColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  Groceries: {
    key: "Groceries",
    label: "Đi chợ & Siêu thị",
    iconName: "ShoppingBag",
    color: "#10B981", // emerald
    bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  },
  Dating: {
    key: "Dating",
    label: "Hẹn hò & Ăn ngoài",
    iconName: "Utensils",
    color: "#E11D48", // rose-600
    bgColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
  },
  Utilities: {
    key: "Utilities",
    label: "Điện, Nước & Internet",
    iconName: "Zap",
    color: "#F59E0B", // amber
    bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  Shopping: {
    key: "Shopping",
    label: "Mua sắm chung",
    iconName: "Gift",
    color: "#8B5CF6", // purple
    bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  },
  Entertainment: {
    key: "Entertainment",
    label: "Giải trí & Du lịch",
    iconName: "Film",
    color: "#06B6D4", // cyan
    bgColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
  },
  Transportation: {
    key: "Transportation",
    label: "Di chuyển & Xăng xe",
    iconName: "Car",
    color: "#6366F1", // indigo
    bgColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
  },
  Health: {
    key: "Health",
    label: "Sức khỏe & Y tế",
    iconName: "HeartPulse",
    color: "#EF4444", // red
    bgColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  },
  Other: {
    key: "Other",
    label: "Chi phí khác",
    iconName: "MoreHorizontal",
    color: "#6B7280", // gray
    bgColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
  }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
