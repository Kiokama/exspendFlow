const fs = require('fs');

const content = `import React, { useState } from "react";
import { Budget, Expense, SharedSpace, CategoryKey } from "../types";
import { CATEGORIES, CATEGORY_LIST } from "../data/categories";
import { formatVND } from "../utils/formatters";
import { Wallet, AlertTriangle, Plus, Check, Edit2, Trash2, X } from "lucide-react";

interface BudgetViewProps {
  budgets: Budget[];
  expenses: Expense[];
  activeSpace: SharedSpace;
  onUpdateBudget: (budget: Partial<Budget>) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  expenses,
  activeSpace,
  onUpdateBudget,
  onDeleteBudget
}) => {
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState<number | "">("");
  const [nameInput, setNameInput] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryKey>("Shopping");

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculate current month spending per category
  const categorySpentMap: Record<string, number> = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      let effective = e.amount;
      if (e.isRefund) effective = -effective;
      categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + effective;
    }
  });

  const handleEditClick = (budget: Budget) => {
    setEditingBudgetId(budget.id);
    setLimitInput(budget.monthlyLimit);
    setNameInput(budget.name || CATEGORIES[budget.category]?.label || "Ngân sách");
  };

  const handleSaveBudget = (budget: Budget) => {
    if (typeof limitInput === "number" && limitInput > 0) {
      onUpdateBudget({
        id: budget.id,
        name: nameInput.trim() || budget.name,
        monthlyLimit: limitInput,
        category: budget.category
      });
    } else {
      onDeleteBudget(budget.id);
    }
    setEditingBudgetId(null);
  };

  const handleCreateNew = () => {
    if (typeof limitInput === "number" && limitInput > 0 && nameInput.trim()) {
      onUpdateBudget({
        name: nameInput.trim(),
        monthlyLimit: limitInput,
        category: newCategory
      });
      setShowAddForm(false);
      setLimitInput("");
      setNameInput("");
    }
  };

  const cancelEdit = () => {
    setEditingBudgetId(null);
    setShowAddForm(false);
    setLimitInput("");
    setNameInput("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-500" />
            Quản lý ngân sách • {activeSpace.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Thiết lập hạn mức ngân sách và kiểm soát chi tiêu
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingBudgetId(null);
            setLimitInput("");
            setNameInput("");
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-xs text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          Thêm ngân sách
        </button>
      </div>

      {showAddForm && (
        <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 animate-fadeIn">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-4">Tạo Ngân Sách Mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Tên ngân sách</label>
              <input
                type="text"
                placeholder="VD: Tiền đi chợ tháng này"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Danh mục áp dụng</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as CategoryKey)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
              >
                {CATEGORY_LIST.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Hạn mức (VND)</label>
              <input
                type="number"
                step="100000"
                placeholder="0"
                value={limitInput}
                onChange={e => setLimitInput(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateNew}
              disabled={!nameInput.trim() || !limitInput}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu Ngân Sách
            </button>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {budgets.length === 0 && !showAddForm ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Wallet className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chưa có ngân sách nào được thiết lập.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const catInfo = CATEGORIES[budget.category];
            const limit = budget.monthlyLimit;
            // Tracing spending for the category 
            const spent = categorySpentMap[budget.category] || 0;
            const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isOver = limit > 0 && spent > limit;
            const isWarning = limit > 0 && percentage >= 85 && !isOver;
            const isEditing = editingBudgetId === budget.id;

            return (
              <div 
                key={budget.id} 
                className={\`p-5 rounded-2xl bg-white dark:bg-gray-800 border transition shadow-xs \${
                  isOver 
                    ? "border-red-500 ring-2 ring-red-500/20" 
                    : isWarning 
                    ? "border-amber-500 ring-2 ring-amber-500/20" 
                    : "border-gray-200 dark:border-gray-700"
                }\`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={\`w-9 h-9 rounded-xl flex items-center justify-center font-bold border \${catInfo?.bgColor}\`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {budget.name || catInfo?.label}
                      </h3>
                      <span className="text-[11px] text-gray-500">
                        Danh mục: {catInfo?.label}
                      </span>
                    </div>
                  </div>
                  {isOver && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Vượt mức!
                    </span>
                  )}
                  {isWarning && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                      Sắp vượt ({percentage}%)
                    </span>
                  )}
                </div>

                {/* Limit setting view or edit mode */}
                {isEditing ? (
                  <div className="space-y-2 my-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Tên ngân sách</label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Hạn mức (VND)</label>
                      <input
                        type="number"
                        step="100000"
                        value={limitInput}
                        onChange={e => setLimitInput(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSaveBudget(budget)}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                        title="Xóa ngân sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs my-2">
                    <span className="text-gray-500">
                      Đã chi: <strong className="text-gray-900 dark:text-white">{formatVND(spent)}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">
                        Hạn mức: <strong className="text-blue-600 dark:text-blue-400">{formatVND(limit)}</strong>
                      </span>
                      <button
                        onClick={() => handleEditClick(budget)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress Bar with Color Warning */}
                {!isEditing && (
                  <div className="space-y-1 mt-2">
                    <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div 
                        className={\`h-full rounded-full transition-all duration-500 \${
                          isOver 
                            ? "bg-red-500" 
                            : isWarning 
                            ? "bg-amber-500" 
                            : "bg-emerald-500"
                        }\`}
                        style={{ width: \`\${Math.min(100, percentage)}%\` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>{percentage}% hạn mức</span>
                      <span>Còn lại: {formatVND(Math.max(0, limit - spent))}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
`
fs.writeFileSync('src/components/BudgetView.tsx', content);
