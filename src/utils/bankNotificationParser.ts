import { CategoryKey, BankNotificationParsed } from "../types";
import { predictCategoryFromTitle } from "./categoryMatcher";

interface BankRule {
  name: string;
  matchPattern: RegExp;
}

const BANK_PATTERNS: BankRule[] = [
  { name: "Techcombank", matchPattern: /techcombank|tcb/i },
  { name: "Vietcombank", matchPattern: /vietcombank|vcb|mbvcb/i },
  { name: "MB Bank", matchPattern: /mb\s*bank|mbbank|mbb/i },
  { name: "ACB", matchPattern: /\bacb\b/i },
  { name: "VPBank", matchPattern: /vpbank|vpb/i },
  { name: "TPBank", matchPattern: /tpbank/i },
  { name: "BIDV", matchPattern: /bidv/i },
  { name: "VietinBank", matchPattern: /vietinbank|vtb/i },
  { name: "MoMo", matchPattern: /momo/i },
  { name: "ZaloPay", matchPattern: /zalopay|zalo\s*pay/i }
];

export function parseBankSms(rawText: string): BankNotificationParsed | null {
  if (!rawText || !rawText.trim()) return null;

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Bank or Wallet
  let detectedBank: string | undefined;
  for (const b of BANK_PATTERNS) {
    if (b.matchPattern.test(text)) {
      detectedBank = b.name;
      break;
    }
  }

  // 2. Detect Type (Income vs Expense)
  let type: "EXPENSE" | "INCOME" = "EXPENSE";
  if (
    text.includes("+") ||
    lower.includes("nhận được") ||
    lower.includes("nhan duoc") ||
    lower.includes("cộng") ||
    lower.includes("cong tien") ||
    lower.includes("hoàn tiền") ||
    lower.includes("hoan tien")
  ) {
    type = "INCOME";
  }

  // 3. Extract Amount
  // Common patterns:
  // -120,000VND, -50.000d, GD: -150,000, 65.000đ, 1.250.000 VND
  let amount = 0;
  const amountRegexes = [
    /([+-]?\s*\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?)\s*(?:vnd|vnđ|d|đ)/i,
    /(?:gd|giao dịch|thanh toán|số tiền|so tien|chuyển|nhận)[:\s]*([+-]?\s*\d{1,3}(?:[.,]\d{3})+)/i,
    /([+-]?\s*\d{1,3}(?:[.,]\d{3})+)\s*(?:tai|tại|cho|luc|lúc|ngay|ngày)/i,
    /([+-]?\s*\d{4,9})\s*(?:vnd|vnđ|d|đ)/i
  ];

  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      // Clean numeric string
      const cleanStr = match[1].replace(/[^\d]/g, "");
      const val = parseInt(cleanStr, 10);
      if (!isNaN(val) && val > 0) {
        amount = val;
        break;
      }
    }
  }

  if (!amount) {
    // Attempt fallback looking for standalone number with 4+ digits
    const fallbackMatch = text.match(/\b(\d{4,8})\b/);
    if (fallbackMatch) {
      amount = parseInt(fallbackMatch[1], 10);
    }
  }

  // 4. Extract Merchant / Note / Content
  let merchant: string | undefined;
  let title = "Chi tiêu qua ngân hàng";

  // Check for ND:, Nội dung:, tại, cho, tai, Ref:
  const contentMatch = text.match(/(?:nd|nội dung|noi dung|tai|tại|cho|ref)[:\s]+([^.\n;]+)/i);
  if (contentMatch && contentMatch[1]) {
    const snippet = contentMatch[1].trim();
    if (snippet.length > 1) {
      merchant = snippet;
      title = snippet;
    }
  }

  // Common merchants in Vietnam
  const famousMerchants = [
    "Highlands Coffee", "Highlands", "The Coffee House", "Phúc Long", "Phuc Long",
    "Katinat", "Starbucks", "Circle K", "WinMart", "Co.opmart", "Lotte Mart",
    "Bách Hóa Xanh", "Shopee", "Grab", "Be", "Gojek", "Haidilao", "Pizza 4P's",
    "McDonald's", "KFC", "CGV", "Golden Gate", "GS25", "7-Eleven"
  ];

  for (const fm of famousMerchants) {
    if (new RegExp(fm, "i").test(text)) {
      merchant = fm;
      title = fm;
      break;
    }
  }

  // 5. Extract Date
  let date = new Date().toISOString().split("T")[0];
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2].padStart(2, "0");
    const year = dateMatch[3] 
      ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) 
      : new Date().getFullYear().toString();
    // Validate date format
    const parsedDate = `${year}-${month}-${day}`;
    if (!isNaN(new Date(parsedDate).getTime())) {
      date = parsedDate;
    }
  }

  // 6. Extract Account Number snippet if any
  let accountNumberSnippet: string | undefined;
  const accMatch = text.match(/(?:tk|tài khoản|tai khoan|so tk|sotaikhoan)[:\s]*([0-9xX*]+)/i);
  if (accMatch && accMatch[1]) {
    accountNumberSnippet = accMatch[1].trim();
  }

  // 7. Predict Category
  let category: CategoryKey = "Other";
  const predicted = predictCategoryFromTitle(title + " " + (merchant || "") + " " + text);
  if (predicted) {
    category = predicted;
  } else if (type === "EXPENSE") {
    category = "Groceries";
  }

  // Final check: if we got at least an amount or merchant, return valid result
  if (amount > 0 || merchant) {
    return {
      title: title || (merchant ? `Thanh toán ${merchant}` : "Chi tiêu ngân hàng"),
      amount: amount || 0,
      category,
      type,
      date,
      merchant,
      note: `Tự động trích xuất từ SMS ${detectedBank || "ngân hàng"}: "${text.slice(0, 100)}${text.length > 100 ? "..." : ""}"`,
      detectedBank,
      rawText: text,
      accountNumberSnippet
    };
  }

  return null;
}
