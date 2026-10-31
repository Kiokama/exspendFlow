import React, { useState } from "react";
import { AIChatMessage, SharedSpace } from "../types";
import { Bot, Send, User, Sparkles, X, MessageSquare, ArrowRight } from "lucide-react";
import { formatVND } from "../utils/formatters";

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSpace: SharedSpace;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose, activeSpace }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "msg_init",
      sender: "ai",
      text: `Xin chào! Tôi là Trợ lý Tài chính AI của không gian "${activeSpace.name}". Bạn muốn tôi phân tích hoặc tra cứu điều gì hôm nay?`,
      timestamp: "Vừa xong"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Tháng này ai chi nhiều hơn?",
    "Chúng ta đã tốn bao nhiêu tiền cho ăn uống?",
    "Dự đoán cuối tháng sẽ chi hết bao nhiêu?",
    "Lọc các khoản chi trên 500k"
  ];

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: "Vừa xong"
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          spaceId: activeSpace.id
        })
      });
      const data = await res.json();

      const aiMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.reply || "Tôi đã xử lý xong yêu cầu của bạn.",
        timestamp: "Vừa xong"
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "Có lỗi khi kết nối với máy chủ AI. Vui lòng thử lại sau!",
          timestamp: "Vừa xong"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl border-l border-gray-200 dark:border-gray-800 animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-rose-600 to-pink-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Trợ Lý Tài Chính AI</h3>
              <p className="text-xs text-rose-100">{activeSpace.name} • Đang hoạt động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">Gợi ý:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 text-gray-700 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-600 transition whitespace-nowrap cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === "user" ? "bg-rose-600 text-white" : "bg-pink-600 text-white"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                msg.sender === "user"
                  ? "bg-rose-600 text-white rounded-tr-none"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
              }`}>
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div className={`text-[10px] mt-1 text-right ${msg.sender === "user" ? "text-rose-200" : "text-gray-400"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 animate-pulse p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI đang tính toán dữ liệu tài chính...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 pb-20 md:pb-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI về chi tiêu, ngân sách, ai nợ ai..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition shadow-md shadow-rose-500/20 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
