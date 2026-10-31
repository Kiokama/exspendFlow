import React, { useState } from "react";
import { parseBankSms } from "../utils/bankNotificationParser";
import { BankNotificationParsed, CategoryKey } from "../types";
import { formatVND } from "../utils/formatters";
import { CATEGORY_LIST } from "../data/categories";
import { CategoryIcon } from "./CategoryIcon";
import { 
  Building2, 
  Sparkles, 
  Check, 
  X, 
  Clipboard, 
  ArrowRight, 
  Loader2, 
  Wallet,
  AlertCircle
} from "lucide-react";

interface BankSmsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedExpense: (data: {
    title: string;
    amount: number;
    category: CategoryKey;
    date: string;
    note?: string;
    isPersonal?: boolean;
    isRefund?: boolean;
    merchant?: string;
  }) => void;
}

const SAMPLE_SMS = [
  {
    bank: "Vietcombank",
    text: "SD TK 007100... -120,000VND luc 20/10/2026 18:30:15. So du: 5,430,000VND. Ref LOTTE MART GD 120,000VND"
  },
  {
    bank: "Techcombank",
    text: "Techcombank: TK 1903... -45,000VND vao 12:45 ngay 15/10. So du: 2,340,000VND. ND: CAFE HIGHLANDS"
  },
  {
    bank: "MB Bank",
    text: "GD: -150,000VND tai HIGHLANDS COFFEE ngay 15/10/2026. So du: 2,450,000VND. Ref: MBB20261015"
  },
  {
    bank: "MoMo",
    text: "Ban da thanh toan thanh cong 65.000d cho The Coffee House tu vi MoMo. Ma GD: 987654321"
  }
];

export const BankSmsImportModal: React.FC<BankSmsImportModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedExpense
}) => {
  const [inputText, setInputText] = useState("");
  const [parsedResult, setParsedResult] = useState<BankNotificationParsed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Realtime parse as user types or pastes
  const handleTextChange = (val: string) => {
    setInputText(val);
    setError(null);
    if (!val.trim()) {
      setParsedResult(null);
      return;
    }
    const localParsed = parseBankSms(val);
    if (localParsed) {
      setParsedResult(localParsed);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleTextChange(text);
          return;
        }
      }
    } catch {
      // Clipboard permission denied or unsupported in iframe, fallback prompt
    }
  };

  const handleParseWithServerAI = async () => {
    if (!inputText.trim()) {
      setError("Vui lòng dán nội dung tin nhắn SMS.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-bank-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Không thể phân tích tin nhắn SMS.");
      }

      setParsedResult(json.data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi phân tích. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult || !parsedResult.amount) {
      setError("Chưa nhận diện được số tiền hợp lệ.");
      return;
    }

    onApplyParsedExpense({
      title: parsedResult.title,
      amount: parsedResult.amount,
      category: parsedResult.category,
      date: parsedResult.date,
      note: parsedResult.note,
      isPersonal: false,
      isRefund: parsedResult.type === "INCOME",
      merchant: parsedResult.merchant
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] sm:pb-0">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-600/10 via-pink-600/10 to-rose-500/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Nhập Nhanh Từ SMS Ngân Hàng
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Hỗ trợ Vietcombank, Techcombank, MB, ACB, MoMo, ZaloPay...
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

        {/* Scrollable Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 min-h-0">
          
          {/* Paste Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Dán nội dung tin nhắn SMS biến động số dư:
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Dán từ bộ nhớ</span>
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Ví dụ: GD: -120,000VND tai HIGHLANDS COFFEE ngay 15/10/2026. So du: 2,450,000VND..."
              value={inputText}
              onChange={e => handleTextChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono resize-none"
            />
          </div>

          {/* Sample Chips */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Hoặc bấm mẫu thử nghiệm:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_SMS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTextChange(sample.text)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  {sample.bank}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Result Preview Card */}
          {parsedResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-rose-500/5 border border-rose-200 dark:border-rose-800/80 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Đã nhận diện thành công
                </span>
                {parsedResult.detectedBank && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                    {parsedResult.detectedBank}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">Số tiền trích xuất</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatVND(parsedResult.amount)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">Danh mục gợi ý</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CategoryIcon category={parsedResult.category} size="sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {CATEGORY_LIST.find(c => c.key === parsedResult.category)?.label || parsedResult.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>Tiêu đề giao dịch:</span>
                  <span>Ngày: {parsedResult.date}</span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {parsedResult.title}
                </p>
                {parsedResult.merchant && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Đơn vị: <strong className="text-slate-700 dark:text-slate-300">{parsedResult.merchant}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleParseWithServerAI}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>AI Đọc Nâng Cao</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!parsedResult || !parsedResult.amount}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Điền Vào Khoản Chi</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
