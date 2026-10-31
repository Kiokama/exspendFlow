import React, { useState, useEffect } from "react";
import { SharedSpace, User } from "../types";
import { Users, Copy, Check, Plus, Link, ArrowRight, X } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: SharedSpace[];
  activeSpace: SharedSpace;
  setActiveSpace: (space: SharedSpace) => void;
  onCreateSpace: (name: string, description: string) => void;
  onJoinSpace: (code: string) => void;
  initialTab?: "LIST" | "CREATE" | "JOIN";
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  spaces,
  activeSpace,
  setActiveSpace,
  onCreateSpace,
  onJoinSpace,
  initialTab = "JOIN"
}) => {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE" | "JOIN">(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showSuccess("Đã sao chép mã kết nối!", "Mã mời đã được lưu vào bộ nhớ tạm.");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    onCreateSpace(newSpaceName.trim(), newSpaceDesc.trim());
    setNewSpaceName("");
    setNewSpaceDesc("");
    setActiveTab("LIST");
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinSpace(joinCode.trim());
    setJoinCode("");
    setActiveTab("LIST");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-[calc(100vw-24px)] max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Không gian chung & Mã kết nối (Pairing)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab("LIST")}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === "LIST" 
                ? "border-rose-500 text-rose-600 dark:text-rose-400" 
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Danh sách không gian ({spaces.length})
          </button>

          <button
            onClick={() => setActiveTab("CREATE")}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === "CREATE" 
                ? "border-rose-500 text-rose-600 dark:text-rose-400" 
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Tạo không gian mới
          </button>

          <button
            onClick={() => setActiveTab("JOIN")}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === "JOIN" 
                ? "border-rose-500 text-rose-600 dark:text-rose-400" 
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Nhập mã kết nối
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {activeTab === "LIST" && (
            <div className="space-y-3">
              {spaces.map(sp => {
                const isSelected = sp.id === activeSpace.id;
                return (
                  <div
                    key={sp.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      isSelected 
                        ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20" 
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {sp.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {sp.description || "Thành viên: " + sp.members.map(m => m.name).join(", ")}
                      </p>
                      
                      {/* Invite Code Pill */}
                      <button
                        onClick={() => handleCopyCode(sp.inviteCode)}
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-rose-600 dark:text-rose-400 hover:bg-gray-100"
                      >
                        <span>Mã mời: <strong>{sp.inviteCode}</strong></span>
                        {copiedCode === sp.inviteCode ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {!isSelected && (
                      <button
                        onClick={() => {
                          setActiveSpace(sp);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                      >
                        Chuyển sang
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "CREATE" && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Tên không gian chi tiêu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Căn hộ chung #302, Đi du lịch Đà Lạt, Quỹ hẹn hò..."
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  placeholder="Không gian chia tiền cho..."
                  value={newSpaceDesc}
                  onChange={e => setNewSpaceDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo không gian & Nhận mã mời</span>
              </button>
            </form>
          )}

          {activeTab === "JOIN" && (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Nhập mã mời từ đối tác (Invite Code):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: DUO-8829"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Tham gia không gian</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
