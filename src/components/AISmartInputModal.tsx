import React, { useState } from "react";
import { Sparkles, Upload, Loader2, X, Check, FileText, Receipt } from "lucide-react";

interface AISmartInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedResult: (data: any) => void;
  onOpenItemizedSplit?: (items: any[], title: string) => void;
}

export const AISmartInputModal: React.FC<AISmartInputModalProps> = ({
  isOpen,
  onClose,
  onParsedResult,
  onOpenItemizedSplit
}) => {
  const [promptText, setPromptText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    if (!promptText.trim() && !imageBase64) {
      setError("Vui lòng nhập mô tả hoặc đính kèm ảnh hóa đơn.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gemini-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          imageBase64
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Không thể phân tích dữ liệu bằng AI.");
      }

      if (json.data.lineItems && json.data.lineItems.length > 0 && onOpenItemizedSplit) {
        onOpenItemizedSplit(json.data.lineItems, json.data.title || "Hóa đơn chia món");
        onClose();
        return;
      }

      onParsedResult(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi khi gọi AI Gemini. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] sm:pb-0">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Fixed Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Gemini AI Quét & Phân Tích
              </h2>
              <p className="text-[11px] text-gray-500 truncate">Tự động trích xuất số tiền, người trả & quy tắc chia</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0 ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 min-h-0">
          
          {/* Prompt input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Nhập mô tả tự nhiên (tiếng Việt):
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Hôm qua Nam trả 450.000đ tiền ăn lẩu Haidilao cho cả 2 chia 60/40..."
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Image Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Hoặc tải lên hóa đơn / ảnh chụp:
            </label>
            {imageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 h-32 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <img src={imageBase64} alt="Bill Preview" className="h-full object-contain" />
                <button
                  onClick={() => setImageBase64(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <Upload className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Tải hóa đơn (PNG, JPG)
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">Gemini AI sẽ đọc tổng tiền & danh mục</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Example triggers */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Mẫu thử nghiệm nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Nam trả 1.250k siêu thị chia 50/50",
                "Mai vừa trả tiền điện 680k tháng 7",
                "Ăn tối Pizza 850k Nam trả 70%"
              ].map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptText(ex)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer text-left truncate max-w-full"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Fixed Action Footer */}
        <div className="shrink-0 p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            type="button"
            disabled={loading}
            onClick={handleParse}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích dữ liệu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Phân tích & Tự điền form</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
