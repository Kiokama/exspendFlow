import React from "react";
import { AuditLog, SharedSpace } from "../types";
import { formatDate } from "../utils/formatters";
import { History, ShieldCheck, User, PlusCircle, Edit3, Trash2, ArrowLeftRight } from "lucide-react";

interface AuditLogViewProps {
  logs: AuditLog[];
  activeSpace: SharedSpace;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, activeSpace }) => {
  const getActionBadge = (action: AuditLog["action"]) => {
    switch (action) {
      case "CREATE_EXPENSE":
        return { label: "Thêm chi tiêu", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300", icon: <PlusCircle className="w-3.5 h-3.5" /> };
      case "UPDATE_EXPENSE":
        return { label: "Sửa chi tiêu", color: "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300", icon: <Edit3 className="w-3.5 h-3.5" /> };
      case "DELETE_EXPENSE":
        return { label: "Xóa chi tiêu", color: "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300", icon: <Trash2 className="w-3.5 h-3.5" /> };
      case "SETTLE_UP":
        return { label: "Cấn trừ nợ", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300", icon: <ArrowLeftRight className="w-3.5 h-3.5" /> };
      default:
        return { label: "Tạo không gian", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300", icon: <History className="w-3.5 h-3.5" /> };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-rose-500" />
            Nhật ký minh bạch (Audit Log) • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Ghi chép tự động tất cả thao tác thêm, sửa, xóa khoản chi & cấn trừ nợ
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật & Minh bạch 100%</span>
        </div>
      </div>

      {/* Audit Trail List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs divide-y divide-gray-100 dark:divide-gray-700/60">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Chưa có thao tác nào ghi nhận trong nhật ký.
          </div>
        ) : (
          logs.map(log => {
            const badge = getActionBadge(log.action);
            return (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 ${badge.color}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {log.details}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span className="font-bold text-gray-700 dark:text-gray-300">{log.userName}</span>
                      <span>•</span>
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
