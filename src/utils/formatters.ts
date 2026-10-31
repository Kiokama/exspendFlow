import { Expense, Settlement, User, BalanceSummary } from "../types";

// Format currency into Vietnamese Dong
export function formatVND(amount: number): string {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount).replace("₫", "").trim() + " ₫";
}

export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".0", "")} tỷ ₫`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".0", "")} tr ₫`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k ₫`;
  }
  return `${amount} ₫`;
}

// Format relative/full date
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (diffDays <= 1 && d.getDate() === now.getDate()) {
    return `Hôm nay, ${day}/${month}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth()) {
    return `Hôm qua, ${day}/${month}`;
  }

  return `${day}/${month}/${year}`;
}

// Calculate Net Balance for a pair of users
export function calculateBalance(
  expenses: Expense[],
  settlements: Settlement[],
  members: User[]
): BalanceSummary {
  const userA = members[0] || { id: "user_nam", name: "User A" };
  const userB = members[1] || { id: "user_mai", name: "User B" };

  let totalSpentThisMonth = 0;
  let userATotalPaid = 0;
  let userBTotalPaid = 0;
  let userAShare = 0;
  let userBShare = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  expenses.forEach(exp => {
    let effectiveAmount = exp.amount;
    
    // If it's a refund, treat it as negative amount
    if (exp.isRefund) {
      effectiveAmount = -effectiveAmount;
    }

    const expDate = new Date(exp.date);
    // Include all or active month
    if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
      totalSpentThisMonth += effectiveAmount;
    }

    // Amount paid by
    if (exp.paidById === userA.id) {
      userATotalPaid += effectiveAmount;
    } else if (exp.paidById === userB.id) {
      userBTotalPaid += effectiveAmount;
    }

    // Shares calculation
    let shareA = 0;
    let shareB = 0;

    if (exp.isPersonal) {
      // Personal expense is 100% assigned to the person who paid
      if (exp.paidById === userA.id) {
        shareA = effectiveAmount;
      } else {
        shareB = effectiveAmount;
      }
    } else if (exp.splitType === "50_50") {
      shareA = effectiveAmount / 2;
      shareB = effectiveAmount / 2;
    } else if (exp.splitType === "PERCENTAGE") {
      const pA = exp.splitDetails.userAPercent ?? 50;
      const pB = exp.splitDetails.userBPercent ?? 50;
      shareA = (effectiveAmount * pA) / 100;
      shareB = (effectiveAmount * pB) / 100;
    } else if (exp.splitType === "EXACT") {
      shareA = exp.splitDetails.userAAmount ?? (effectiveAmount / 2);
      shareB = exp.splitDetails.userBAmount ?? (effectiveAmount / 2);
    }

    userAShare += shareA;
    userBShare += shareB;
  });

  // Net Debt from expenses = (userA Share - userA Paid)
  // If userA Paid = 100k, userA Share = 50k -> Net = -50k (User A is owed 50k)
  // If userA Paid = 0k, userA Share = 50k -> Net = +50k (User A owes 50k)
  let rawA_Owes_B = userAShare - userATotalPaid;

  // Account for settlements
  settlements.forEach(set => {
    if (set.fromUserId === userA.id && set.toUserId === userB.id) {
      // User A paid User B, reducing User A's debt
      rawA_Owes_B -= set.amount;
    } else if (set.fromUserId === userB.id && set.toUserId === userA.id) {
      // User B paid User A, reducing User B's debt (increasing A's net)
      rawA_Owes_B += set.amount;
    }
  });

  let creditor: User | null = null;
  let debtor: User | null = null;

  if (rawA_Owes_B > 0) {
    // User A owes User B
    debtor = userA as User;
    creditor = userB as User;
  } else if (rawA_Owes_B < 0) {
    // User B owes User A
    debtor = userB as User;
    creditor = userA as User;
  }

  return {
    totalSpentThisMonth,
    userATotalPaid,
    userBTotalPaid,
    userAShare,
    userBShare,
    netDebt: Math.abs(rawA_Owes_B),
    creditor,
    debtor
  };
}

// Generate VietQR URL for quick banking app scan
export function getVietQRUrl(bankName: string, accountNumber: string, amount: number, memo: string, accountName?: string): string {
  if (!accountNumber || !accountNumber.trim()) return "";

  const bankCodeMap: Record<string, string> = {
    "mbbank": "MB",
    "mb": "MB",
    "vietcombank": "VCB",
    "vcb": "VCB",
    "techcombank": "TCB",
    "tcb": "TCB",
    "bidv": "BIDV",
    "vietinbank": "ICB",
    "ctg": "ICB",
    "icb": "ICB",
    "vpbank": "VPB",
    "vpb": "VPB",
    "acb": "ACB",
    "tpbank": "TPB",
    "tpb": "TPB",
    "agribank": "VBA",
    "vba": "VBA",
    "vib": "VIB",
    "sacombank": "STB",
    "stb": "STB",
    "hdbank": "HDB",
    "hdb": "HDB",
    "shb": "SHB",
    "msb": "MSB",
    "ocb": "OCB",
    "lpbank": "LPB",
    "lpb": "LPB",
    "seabank": "SEAB",
    "eximbank": "EIB",
    "eib": "EIB",
    "momo": "MOMO",
    "zalopay": "ZALOPAY"
  };

  const cleanBankKey = (bankName || "MBBank").trim().toLowerCase().replace(/\s+/g, "");
  let bankCode = bankCodeMap[cleanBankKey];
  if (!bankCode) {
    if (cleanBankKey.includes("zalo")) bankCode = "ZALOPAY";
    else if (cleanBankKey.includes("momo")) bankCode = "MOMO";
    else bankCode = "MB";
  }

  const cleanAccount = accountNumber.replace(/\s+/g, "");
  const roundAmount = Math.round(amount);
  const encodedMemo = encodeURIComponent(memo || "Can tru chi tieu DuoExpense");
  const encodedName = accountName ? encodeURIComponent(accountName.trim()) : "";

  // For ZaloPay, generate dynamic payment QR via reliable QR generator
  if (bankCode === "ZALOPAY" || cleanBankKey.includes("zalo")) {
    const zalopayData = `https://zalopay.vn/pay?phone=${cleanAccount}&amount=${roundAmount}&note=${encodedMemo}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(zalopayData)}`;
  }

  // For MoMo, generate dynamic payment QR via MoMo quick link
  if (bankCode === "MOMO" || cleanBankKey.includes("momo")) {
    const momoData = `https://nhantien.momo.vn/${cleanAccount}/${roundAmount}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(momoData)}`;
  }

  // Standard Napas 247 VietQR Banking image
  const nameQuery = encodedName ? `&accountName=${encodedName}` : "";
  return `https://img.vietqr.io/image/${bankCode}-${cleanAccount}-compact.png?amount=${roundAmount}&addInfo=${encodedMemo}${nameQuery}`;
}
