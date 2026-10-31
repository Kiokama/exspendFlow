import { Expense, SharedSpace, User } from "../types";
import { CATEGORIES } from "../data/categories";
import { formatDate, formatVND } from "./formatters";

export function exportToCSV(expenses: Expense[], spaceName: string, members: User[]) {
  const headers = [
    "Mã Giao Dịch",
    "Ngày",
    "Tên Khoản Chi",
    "Danh Mục",
    "Số Tiền (VND)",
    "Người Thanh Toán",
    "Kiểu Chia",
    "Ghi Chú"
  ];

  const rows = expenses.map(e => {
    const categoryLabel = CATEGORIES[e.category]?.label || e.category;
    const payer = members.find(m => m.id === e.paidById)?.name || e.paidById;
    let splitText = "Chia 50/50";
    if (e.splitType === "PERCENTAGE") {
      splitText = `Chia ${e.splitDetails.userAPercent}% / ${e.splitDetails.userBPercent}%`;
    } else if (e.splitType === "EXACT") {
      splitText = "Chia số tiền cụ thể";
    }

    return [
      e.id,
      e.date,
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${categoryLabel}"`,
      e.amount,
      `"${payer}"`,
      `"${splitText}"`,
      `"${(e.note || "").replace(/"/g, '""')}"`
    ];
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Bao_Cao_Chi_Tieu_${spaceName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePrintableReport(expenses: Expense[], space: SharedSpace, totalSpent: number) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rowsHtml = expenses.map((e, index) => {
    const categoryLabel = CATEGORIES[e.category]?.label || e.category;
    const payer = space.members.find(m => m.id === e.paidById)?.name || e.paidById;
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatDate(e.date)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${e.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${categoryLabel}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${payer}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatVND(e.amount)}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Báo Cáo Chi Tiêu - ${space.name}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #111827; }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
          .subtitle { color: #6b7280; font-size: 14px; }
          .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #f3f4f6; text-align: left; padding: 10px 8px; font-size: 12px; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #e5e7eb; }
          .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BÁO CÁO CHI TIÊU CHUNG</div>
          <div class="subtitle">Không gian: ${space.name} • Ngày xuất: ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-card">
          <div><strong>Thành viên:</strong> ${space.members.map(m => m.name).join(" & ")}</div>
          <div><strong>Tổng chi tiêu trong kỳ:</strong> ${formatVND(totalSpent)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">STT</th>
              <th>Ngày</th>
              <th>Tên Khoản Chi</th>
              <th>Danh Mục</th>
              <th>Người Trả</th>
              <th style="text-align: right;">Số Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Báo cáo được tạo bởi DuoExpense - Quản Lý Chi Tiêu Đôi
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
