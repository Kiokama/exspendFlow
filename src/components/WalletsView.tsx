import React, { useState } from "react";
import { Wallet as WalletType } from "../types";
import { formatVND } from "../utils/formatters";
import { Building2, Banknote, CreditCard, Smartphone, TrendingUp, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw } from "lucide-react";

interface WalletsViewProps {
  wallets: WalletType[];
  onAddWallet?: (wallet: Partial<WalletType>) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({ wallets, onAddWallet }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState<number | "">("");
  const [newWalletType, setNewWalletType] = useState<WalletType["type"]>("BANK");

  // Calculate Net Worth
  const totalAssets = wallets
    .filter(w => w.balance > 0)
    .reduce((acc, w) => acc + w.balance, 0);

  const totalLiabilities = wallets
    .filter(w => w.balance < 0)
    .reduce((acc, w) => acc + Math.abs(w.balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  const getWalletIcon = (type: WalletType["type"]) => {
    switch (type) {
      case "BANK":
        return <Building2 className="w-5 h-5 text-rose-500" />;
      case "CASH":
        return <Banknote className="w-5 h-5 text-emerald-500" />;
      case "CREDIT_CARD":
        return <CreditCard className="w-5 h-5 text-rose-500" />;
      case "E_WALLET":
        return <Smartphone className="w-5 h-5 text-pink-500" />;
      case "INVESTMENT":
        return <TrendingUp className="w-5 h-5 text-cyan-500" />;
      default:
        return <Building2 className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Ví Tiền & Tài Sản (Wallets)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý dòng tiền, thẻ ngân hàng & tổng tài sản ròng
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ví</span>
        </button>
      </div>

      {/* Hero Apple-style Net Worth Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-200/80">
              Tổng Tài Sản Ròng (Net Worth)
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
              {formatVND(netWorth)}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-6 h-6 text-rose-300" />
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-300">Tổng tài sản có</p>
              <p className="text-xs font-bold text-emerald-300">{formatVND(totalAssets)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-300">Dư nợ tín dụng</p>
              <p className="text-xs font-bold text-rose-300">{formatVND(totalLiabilities)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets List Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Danh Sách Ví & Tài Khoản ({wallets.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wallets.map(w => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  {getWalletIcon(w.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {w.name}
                    </h4>
                    {w.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        Chính
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {w.accountNumber || w.type}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold text-sm ${w.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                  {formatVND(w.balance)}
                </p>
                <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                  <RefreshCw className="w-3 h-3 text-emerald-500" /> Tự động đồng bộ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Thêm Ví Mới</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tên ví / Ngân hàng</label>
                <input
                  type="text"
                  placeholder="Ví dụ: MB Bank, Vietcombank, Ví ShopeePay..."
                  value={newWalletName}
                  onChange={e => setNewWalletName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Số dư ban đầu (VND)</label>
                <input
                  type="number"
                  placeholder="0 ₫"
                  value={newWalletBalance}
                  onChange={e => setNewWalletBalance(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Loại ví</label>
                <select
                  value={newWalletType}
                  onChange={e => setNewWalletType(e.target.value as WalletType["type"])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="BANK">Tài khoản Ngân Hàng</option>
                  <option value="CASH">Tiền Mặt</option>
                  <option value="CREDIT_CARD">Thẻ Tín Dụng</option>
                  <option value="E_WALLET">Ví Điện Tử (MoMo/ZaloPay)</option>
                  <option value="INVESTMENT">Khoản Đầu Tư (Chứng khoán/Crypto)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (newWalletName && onAddWallet) {
                    onAddWallet({
                      name: newWalletName,
                      balance: Number(newWalletBalance) || 0,
                      type: newWalletType,
                      icon: "Building2",
                      color: "from-rose-600 to-pink-700"
                    });
                  }
                  setShowAddModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                Lưu Ví
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
