import React from "react";
import { AuditLog, SharedSpace, Expense, Settlement } from "../types";
import { formatDate, formatVND } from "../utils/formatters";
import { MessageSquare, Heart, PlusCircle, Edit3, Trash2, ArrowLeftRight, Clock, Sparkles } from "lucide-react";

interface TimelineFeedViewProps {
  logs: AuditLog[];
  expenses: Expense[];
  settlements: Settlement[];
  activeSpace: SharedSpace;
}

export const TimelineFeedView: React.FC<TimelineFeedViewProps> = ({ logs, activeSpace }) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-rose-500" />
          Dòng Thời Gian (Activity Feed)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Cập nhật realtime mọi hoạt động thu chi & thanh toán của các thành viên trong {activeSpace.name}
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-pink-500 before:to-rose-300">
        {logs.map((log, index) => {
          return (
            <div key={log.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-2 border-rose-500 flex items-center justify-center shadow-xs">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>

              {/* Card Container */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {log.userName}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    {log.action}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                  {log.details}
                </div>

                {/* Social interactions sub-bar */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-4 text-xs text-gray-400">
                  <button className="flex items-center gap-1.5 hover:text-red-500 transition cursor-pointer">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Đã thả tim</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-rose-500 transition cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
