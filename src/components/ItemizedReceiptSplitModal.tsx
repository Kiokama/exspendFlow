import React, { useState, useEffect } from "react";
import { SharedSpace, User, ReceiptLineItem, CategoryKey } from "../types";
import { formatVND } from "../utils/formatters";
import { 
  Receipt, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Percent, 
  Calculator,
  ArrowRight
} from "lucide-react";

interface ItemizedReceiptSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSpace: SharedSpace;
  currentUser: User;
  initialItems?: Array<{ name: string; price: number; quantity?: number }>;
  initialTitle?: string;
  onSaveSplitExpense: (expenseData: {
    title: string;
    amount: number;
    category: CategoryKey;
    date: string;
    paidById: string;
    splitType: "EXACT";
    splitDetails: {
      userAId: string;
      userAAmount: number;
      userBId: string;
      userBAmount: number;
    };
    note: string;
  }) => void;
}

export const ItemizedReceiptSplitModal: React.FC<ItemizedReceiptSplitModalProps> = ({
  isOpen,
  onClose,
  activeSpace,
  currentUser,
  initialItems = [],
  initialTitle,
  onSaveSplitExpense
}) => {
  const memberA = activeSpace.members[0] || currentUser;
  const memberB = activeSpace.members[1] || currentUser;

  const [title, setTitle] = useState(initialTitle || "Hóa đơn chia từng món");
  const [paidById, setPaidById] = useState<string>(currentUser.id);
  const [items, setItems] = useState<ReceiptLineItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number | "">("");

  // Tip or Tax percentage (e.g. 8% or 10% VAT)
  const [taxPercent, setTaxPercent] = useState<number>(0);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(
        initialItems.map((item, idx) => ({
          id: `item_${Date.now()}_${idx}`,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price,
          total: (item.quantity || 1) * item.price,
          assignedUserIds: [memberA.id, memberB.id] // default shared 50/50
        }))
      );
    } else if (items.length === 0) {
      // Default sample dishes if opened empty
      setItems([
        {
          id: "item_1",
          name: "Phở Bò Tái Lăn",
          quantity: 1,
          price: 65000,
          total: 65000,
          assignedUserIds: [memberA.id]
        },
        {
          id: "item_2",
          name: "Bún Bò Huế Đặc Biệt",
          quantity: 1,
          price: 75000,
          total: 75000,
          assignedUserIds: [memberB.id]
        },
        {
          id: "item_3",
          name: "Trà Đào Cam Sả (2 ly)",
          quantity: 2,
          price: 35000,
          total: 70000,
          assignedUserIds: [memberA.id, memberB.id]
        }
      ]);
    }
  }, [initialItems, isOpen]);

  if (!isOpen) return null;

  // Toggle user assignment for a specific item
  const toggleUserForItem = (itemId: string, userId: string) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id !== itemId) return it;
        const exists = it.assignedUserIds.includes(userId);
        let updated: string[];
        if (exists) {
          // Do not allow empty selection (keep at least one)
          if (it.assignedUserIds.length === 1) return it;
          updated = it.assignedUserIds.filter(id => id !== userId);
        } else {
          updated = [...it.assignedUserIds, userId];
        }
        return { ...it, assignedUserIds: updated };
      })
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || newItemPrice <= 0) return;

    const priceNum = Number(newItemPrice);
    const newItem: ReceiptLineItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      quantity: 1,
      price: priceNum,
      total: priceNum,
      assignedUserIds: [memberA.id, memberB.id]
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  // Calculations
  const rawSubtotal = items.reduce((sum, it) => sum + it.total, 0);
  const taxAmount = Math.round(rawSubtotal * (taxPercent / 100));
  const finalTotal = rawSubtotal + taxAmount;

  // Calculate per user
  let userASubtotal = 0;
  let userBSubtotal = 0;

  items.forEach(it => {
    const splitCount = it.assignedUserIds.length || 1;
    const perPersonCost = it.total / splitCount;
    if (it.assignedUserIds.includes(memberA.id)) {
      userASubtotal += perPersonCost;
    }
    if (it.assignedUserIds.includes(memberB.id)) {
      userBSubtotal += perPersonCost;
    }
  });

  // Distribute tax proportionally
  const userATax = rawSubtotal > 0 ? (userASubtotal / rawSubtotal) * taxAmount : 0;
  const userBTax = rawSubtotal > 0 ? (userBSubtotal / rawSubtotal) * taxAmount : 0;

  const userAFinal = Math.round(userASubtotal + userATax);
  const userBFinal = Math.round(userBSubtotal + userBTax);

  const handleSave = () => {
    if (items.length === 0 || finalTotal <= 0) return;

    const breakdownNote = items
      .map(it => {
        const assignees = it.assignedUserIds.map(uid => uid === memberA.id ? memberA.name : memberB.name).join("+");
        return `• ${it.name} (${formatVND(it.total)}): [${assignees}]`;
      })
      .join("\n");

    onSaveSplitExpense({
      title: title.trim() || "Chia từng món",
      amount: finalTotal,
      category: "Dating",
      date: new Date().toISOString().split("T")[0],
      paidById,
      splitType: "EXACT",
      splitDetails: {
        userAId: memberA.id,
        userAAmount: userAFinal,
        userBId: memberB.id,
        userBAmount: userBFinal
      },
      note: `Chi tiết chia món:\n${breakdownNote}`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] sm:pb-0">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Chia Từng Món & Hóa Đơn
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Gán từng món ăn cho người ăn hoặc chia đôi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 min-h-0">
          
          {/* Bill Title & Who Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Tên hóa đơn / Quán ăn:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Ai đã thanh toán hóa đơn?
              </label>
              <select
                value={paidById}
                onChange={e => setPaidById(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={memberA.id}>{memberA.name} thanh toán</option>
                {memberB && <option value={memberB.id}>{memberB.name} thanh toán</option>}
              </select>
            </div>
          </div>

          {/* Dishes & Line Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Danh sách món ăn & mặt hàng ({items.length}):
              </span>
              <span className="text-[11px] text-slate-400">
                Chạm tên người để gắn món
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {items.map(item => {
                const isUserA = item.assignedUserIds.includes(memberA.id);
                const isUserB = item.assignedUserIds.includes(memberB.id);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {formatVND(item.total)}
                      </span>
                    </div>

                    {/* Member Assign Toggles */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleUserForItem(item.id, memberA.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isUserA
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>{memberA.name.split(" ")[0]}</span>
                        {isUserA && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleUserForItem(item.id, memberB.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isUserB
                            ? "bg-pink-600 text-white shadow-xs"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>{memberB.name.split(" ")[0]}</span>
                        {isUserB && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Xóa món"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Add Custom Item Form */}
          <form onSubmit={handleAddItem} className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Thêm món (Ví dụ: Khăn lạnh, Nước suối...)"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="number"
              placeholder="Giá (₫)"
              value={newItemPrice}
              onChange={e => setNewItemPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shrink-0"
              title="Thêm món"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* VAT / Tax Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Thuế VAT / Phí dịch vụ:
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 8, 10].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTaxPercent(pct)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    taxPercent === pct
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Realtime Summary Split Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-rose-500/10 via-pink-500/10 to-rose-500/10 border border-rose-200 dark:border-rose-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Tổng hóa đơn (đã gồm VAT):
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatVND(finalTotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-200/50 dark:border-rose-800/50">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-bold truncate">
                  {memberA.name} cần trả:
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatVND(userAFinal)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({finalTotal > 0 ? Math.round((userAFinal / finalTotal) * 100) : 50}%)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-pink-200 dark:border-pink-900">
                <span className="text-[10px] text-pink-600 dark:text-pink-400 block font-bold truncate">
                  {memberB.name} cần trả:
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatVND(userBFinal)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({finalTotal > 0 ? Math.round((userBFinal / finalTotal) * 100) : 50}%)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={items.length === 0 || finalTotal <= 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Lưu Khoản Chi Đã Chia</span>
          </button>
        </div>

      </div>
    </div>
  );
};
