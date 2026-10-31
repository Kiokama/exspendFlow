import React, { useState, useEffect } from "react";
import { Expense, SharedSpace, User, SplitType, CategoryKey } from "../types";
import { CATEGORY_LIST } from "../data/categories";
import { formatVND } from "../utils/formatters";
import { predictCategoryFromTitle } from "../utils/categoryMatcher";
import { X, Sparkles, Image as ImageIcon, Calculator, Check, AlertCircle, Wand2, Building2 } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Partial<Expense>) => void;
  activeSpace: SharedSpace;
  currentUser: User;
  initialData?: Partial<Expense> | null;
  onOpenAIScan: () => void;
  onOpenBankSms?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activeSpace,
  currentUser,
  initialData,
  onOpenAIScan,
  onOpenBankSms
}) => {
  const userA = activeSpace.members[0] || currentUser;
  const userB = activeSpace.members[1] || currentUser;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<CategoryKey>("Groceries");
  const [hasManuallySelectedCategory, setHasManuallySelectedCategory] = useState(false);
  const [autoSuggestedCategory, setAutoSuggestedCategory] = useState<CategoryKey | null>(null);
  const [paidById, setPaidById] = useState<string>(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>("50_50");

  // Percentage split
  const [userAPercent, setUserAPercent] = useState<number>(50);
  const [userBPercent, setUserBPercent] = useState<number>(50);

  // Exact amount split
  const [userAAmount, setUserAAmount] = useState<number | "">("");
  const [userBAmount, setUserBAmount] = useState<number | "">("");

  const [note, setNote] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isPersonal, setIsPersonal] = useState(false);
  const [isRefund, setIsRefund] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setAmount(initialData.amount || "");
      setDate(initialData.date || new Date().toISOString().split("T")[0]);
      setCategory(initialData.category || "Groceries");
      setHasManuallySelectedCategory(true);
      setAutoSuggestedCategory(null);
      setPaidById(initialData.paidById || currentUser.id);
      setSplitType(initialData.splitType || "50_50");
      setUserAPercent(initialData.splitDetails?.userAPercent ?? 50);
      setUserBPercent(initialData.splitDetails?.userBPercent ?? 50);
      setUserAAmount(initialData.splitDetails?.userAAmount ?? "");
      setUserBAmount(initialData.splitDetails?.userBAmount ?? "");
      setNote(initialData.note || "");
      setReceiptUrl(initialData.receiptUrl || "");
      setIsPersonal(initialData.isPersonal || false);
      setIsRefund(initialData.isRefund || false);
      setTagsInput(initialData.tags ? initialData.tags.join(", ") : "");
    } else {
      // Reset form
      setTitle("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("Groceries");
      setHasManuallySelectedCategory(false);
      setAutoSuggestedCategory(null);
      setPaidById(currentUser.id);
      setSplitType("50_50");
      setUserAPercent(50);
      setUserBPercent(50);
      setUserAAmount("");
      setUserBAmount("");
      setNote("");
      setReceiptUrl("");
      setIsPersonal(false);
      setIsRefund(false);
      setTagsInput("");
    }
  }, [initialData, isOpen, currentUser.id]);

  if (!isOpen) return null;

  const numericAmount = typeof amount === "number" ? amount : 0;

  // Handle title change and auto category suggestion
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!hasManuallySelectedCategory) {
      const predicted = predictCategoryFromTitle(val);
      if (predicted) {
        setCategory(predicted);
        setAutoSuggestedCategory(predicted);
      } else {
        setAutoSuggestedCategory(null);
      }
    }
  };

  // Handle amount blur (Auto multiply by 1,000 for small amounts like 50 -> 50,000)
  const handleAmountBlur = () => {
    if (typeof amount === "number" && amount > 0 && amount < 1000) {
      setAmount(amount * 1000);
    }
  };

  // Sync percentages
  const handleUserAPercentChange = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setUserAPercent(clamped);
    setUserBPercent(100 - clamped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !numericAmount || numericAmount <= 0) return;

    let finalSplitDetails: any = {
      userAId: userA.id,
      userBId: userB.id
    };

    if (splitType === "PERCENTAGE") {
      finalSplitDetails.userAPercent = userAPercent;
      finalSplitDetails.userBPercent = userBPercent;
    } else if (splitType === "EXACT") {
      finalSplitDetails.userAAmount = typeof userAAmount === "number" ? userAAmount : numericAmount / 2;
      finalSplitDetails.userBAmount = typeof userBAmount === "number" ? userBAmount : numericAmount / 2;
    }

    const tagsArr = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    onSave({
      id: initialData?.id,
      spaceId: activeSpace.id,
      title: title.trim(),
      amount: numericAmount,
      date,
      category,
      paidById,
      splitType,
      splitDetails: finalSplitDetails,
      note: note.trim(),
      receiptUrl,
      isPersonal,
      isRefund,
      tags: tagsArr
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] sm:pb-0">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {initialData ? "Chỉnh sửa khoản chi" : "Thêm khoản chi mới"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ghi chép & phân chia minh bạch cho cả hai
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!initialData && (
              <>
                {onOpenBankSms && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBankSms();
                    }}
                    className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
                    title="Nhập nhanh từ SMS ngân hàng"
                  >
                    <Building2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Dán SMS</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAIScan();
                  }}
                  className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition cursor-pointer"
                  title="Nhập nhanh bằng AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span className="hidden sm:inline">AI Quét</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Tên khoản chi *
              </label>
            </div>
            <input
              type="text"
              required
              placeholder="Ví dụ: Tiền điện, Ăn tối, Thuê phòng, Siêu thị Winmart..."
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Số tiền (VND) *
                </label>
              </div>
              <input
                type="number"
                required
                step="any"
                placeholder="0 ₫"
                value={amount}
                onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")}
                onBlur={handleAmountBlur}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                Gõ <span className="font-semibold text-rose-500">50</span> ➔ tự động thành <span className="font-semibold text-rose-500">50.000 ₫</span> khi rời ô.
              </div>
              {/* Quick Amount Suggestion Chips */}
              <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[50000, 100000, 200000, 500000, 1000000].map(chipVal => (
                  <button
                    key={chipVal}
                    type="button"
                    onClick={() => setAmount(prev => (typeof prev === "number" ? prev + chipVal : chipVal))}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold hover:bg-rose-100 transition whitespace-nowrap cursor-pointer"
                  >
                    +{(chipVal / 1000)}k
                  </button>
                ))}
              </div>
              {numericAmount > 0 && (
                <div className="text-[11px] text-gray-700 dark:text-gray-300 font-bold mt-1">
                  Thành tiền: {formatVND(numericAmount)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Ngày thanh toán
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Danh mục chi tiêu
              </label>
              {autoSuggestedCategory && !hasManuallySelectedCategory && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
                  <Wand2 className="w-3 h-3" /> Tự động nhận diện
                </span>
              )}
            </div>
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value as CategoryKey);
                setHasManuallySelectedCategory(true);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {CATEGORY_LIST.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Who Paid (Paid By) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Người trả tiền (Paid by)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[userA, userB].map(member => {
                const isSelected = paidById === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPaidById(member.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border transition text-left cursor-pointer ${
                      isSelected
                        ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-500/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {isSelected ? "Đã trả tiền" : "Bấm để chọn"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flexible Split Options (Linh hồn của App!) */}
          {!isPersonal && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-rose-500" />
                  Quy tắc chia tiền (Flexible Split)
                </label>
              </div>

              {/* Split Type Selector Pills */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSplitType("50_50")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                    splitType === "50_50"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Chia 50/50
                </button>

                <button
                  type="button"
                  onClick={() => setSplitType("PERCENTAGE")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                    splitType === "PERCENTAGE"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Chia theo %
                </button>

                <button
                  type="button"
                  onClick={() => setSplitType("EXACT")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                    splitType === "EXACT"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Số tiền cụ thể
                </button>
              </div>

              {/* Render Split Inputs based on Split Type */}
              {splitType === "50_50" && (
                <div className="text-xs text-gray-600 dark:text-gray-400 p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span>Mỗi người chịu 50%:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">
                    {formatVND(numericAmount / 2)}
                  </strong>
                </div>
              )}

              {splitType === "PERCENTAGE" && (
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{userA.name}: <strong>{userAPercent}%</strong> ({formatVND((numericAmount * userAPercent) / 100)})</span>
                    <span>{userB.name}: <strong>{userBPercent}%</strong> ({formatVND((numericAmount * userBPercent) / 100)})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={userAPercent}
                    onChange={e => handleUserAPercentChange(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              )}

              {splitType === "EXACT" && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Phần của {userA.name}:
                    </label>
                    <input
                      type="number"
                      placeholder="0 ₫"
                      value={userAAmount}
                      onChange={e => {
                        const val = e.target.value ? Number(e.target.value) : "";
                        setUserAAmount(val);
                        if (typeof val === "number" && numericAmount) {
                          setUserBAmount(Math.max(0, numericAmount - val));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Phần của {userB.name}:
                    </label>
                    <input
                      type="number"
                      placeholder="0 ₫"
                      value={userBAmount}
                      onChange={e => {
                        const val = e.target.value ? Number(e.target.value) : "";
                        setUserBAmount(val);
                        if (typeof val === "number" && numericAmount) {
                          setUserAAmount(Math.max(0, numericAmount - val));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal vs Shared & Refund toggles */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPersonal}
                onChange={e => setIsPersonal(e.target.checked)}
                className="w-4 h-4 rounded-xs text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Khoản chi cá nhân
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRefund}
                onChange={e => setIsRefund(e.target.checked)}
                className="w-4 h-4 rounded-xs text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Hoàn tiền (Refund)
              </span>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Gắn Tags (Phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="Food, Date, Coffee, Shopee..."
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Ghi chú thêm
            </label>
            <input
              type="text"
              placeholder="Nhập ghi chú hoặc địa điểm..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? "Lưu thay đổi" : "Thêm khoản chi"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
