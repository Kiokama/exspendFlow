import React, { useState, useEffect } from "react";
import { FavoriteTemplate, SharedSpace, User } from "../types";
import { formatVND } from "../utils/formatters";
import { Zap, Sparkles, Plus } from "lucide-react";

interface FavoriteTemplatesBarProps {
  activeSpace: SharedSpace;
  currentUser: User;
  onQuickAdd: (template: FavoriteTemplate) => void;
}

export const FavoriteTemplatesBar: React.FC<FavoriteTemplatesBarProps> = ({
  activeSpace,
  currentUser,
  onQuickAdd
}) => {
  const [templates, setTemplates] = useState<FavoriteTemplate[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch(`/api/templates?spaceId=${activeSpace.id}`);
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Failed loading templates:", err);
      }
    }
    loadTemplates();
  }, [activeSpace.id]);

  if (templates.length === 0) return null;

  return (
    <div className="bg-rose-50/60 dark:bg-rose-950/20 p-3 sm:p-3.5 rounded-xl border border-rose-100/90 dark:border-rose-900/40 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Mẫu chi tiêu 1-chạm</span>
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Chạm để tạo nhanh
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 overscroll-contain">
        {templates.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => onQuickAdd(tpl)}
            className="min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors group shrink-0 cursor-pointer active:scale-[0.98]"
          >
            <span className="text-xs font-semibold">{tpl.title}</span>
            <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 group-hover:text-white bg-rose-50 dark:bg-slate-900 group-hover:bg-rose-700 px-2 py-0.5 rounded-md">
              {formatVND(tpl.amount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
