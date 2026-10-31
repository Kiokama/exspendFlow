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
    <div className="bg-rose-50/60 dark:bg-rose-950/20 p-3.5 sm:p-4 rounded-2xl border border-rose-100/80 dark:border-rose-900/40 shadow-2xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          Nhanh 1-Chạm (Favorite Templates)
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Chạm vào mẫu để thêm giao dịch tức thì
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {templates.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => onQuickAdd(tpl)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-2xs transition group shrink-0 cursor-pointer"
          >
            <span className="text-xs font-bold">{tpl.title}</span>
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 group-hover:text-white bg-rose-50 dark:bg-gray-800 group-hover:bg-rose-700 px-2 py-0.5 rounded-lg">
              {formatVND(tpl.amount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
