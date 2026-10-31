import React, { useState, useEffect } from "react";
import { User } from "../types";
import { User as UserIcon, Mail, Building2, CreditCard, X, Check, Sparkles, RefreshCw, Upload } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveProfile: (updatedUser: User) => void;
}

const POPULAR_BANKS = [
  "MBBank",
  "Vietcombank",
  "Techcombank",
  "VPBank",
  "ACB",
  "VietinBank",
  "BIDV",
  "Agribank",
  "TPBank",
  "VIB",
  "MoMo",
  "ZaloPay"
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
];

// Canvas image compressor helper for fast & light base64 avatars
function compressAvatarImage(file: File, maxDim = 300, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed reading file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed loading image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile
}) => {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [bankName, setBankName] = useState(currentUser.bankName || "MBBank");
  const [accountNumber, setAccountNumber] = useState(currentUser.accountNumber || "");
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setBankName(currentUser.bankName || "MBBank");
      setAccountNumber(currentUser.accountNumber || "");
      setAvatar(currentUser.avatar || PRESET_AVATARS[0]);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleGenerateDicebear = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setAvatar(newAvatar);
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError("Kích thước ảnh quá lớn!", "Vui lòng chọn file hình ảnh nhỏ hơn 10MB.");
      return;
    }

    try {
      const compressedDataUrl = await compressAvatarImage(file);
      setAvatar(compressedDataUrl);
      showSuccess("Tải ảnh đại diện thành công!");
    } catch (err) {
      showError("Không thể đọc ảnh", "Vui lòng chọn file ảnh hợp lệ.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedUser: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      avatar
    };

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();
      const finalUser = (data && data.id) ? data : updatedUser;
      
      onSaveProfile(finalUser);
      showSuccess("Cập nhật thông tin thành công!", "Hồ sơ cá nhân và tài khoản ngân hàng đã được lưu.");
      onClose();
    } catch (err) {
      onSaveProfile(updatedUser);
      showSuccess("Đã cập nhật hồ sơ cá nhân!");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="relative w-[calc(100vw-24px)] max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Chỉnh Sửa Hồ Sơ Cá Nhân
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tùy chỉnh thông tin & tài khoản nhận chuyển khoản</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Avatar Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Ảnh Đại Diện (Avatar):
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt="Selected Avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-rose-500/30 shadow-md"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Đổi ảnh đại diện"
                >
                  <Upload className="w-5 h-5" />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Upload Button */}
                <label
                  htmlFor="avatar-file-input"
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  title="Tải ảnh cá nhân từ máy tính / điện thoại"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải Ảnh Lên</span>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Dicebear AI Generator Button */}
                <button
                  type="button"
                  onClick={handleGenerateDicebear}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  title="Tạo ảnh AI ngẫu nhiên"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tạo Mới AI</span>
                </button>

                {/* Preset Avatars */}
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                      avatar === url ? "border-rose-600 scale-105 shadow-sm" : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Họ & Tên Hiển Thị:
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Hoàng Nam"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Địa Chỉ Email:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nam.hoang@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          {/* Bank Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên Ngân Hàng / Ví Điện Tử (Để VietQR Thanh Toán):
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                {POPULAR_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Số Tài Khoản / Số Điện Thoại Ví:
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Ví dụ: 0988776655"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? "Đang Lưu Dữ Liệu..." : "Lưu Thông Tin Hồ Sơ"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
