# Implementation Plan - ExpenseFlow Feature Upgrade

Transform ExpenseFlow into an indispensable daily personal & shared finance companion with automated Vietnamese banking message ingestion, itemized group receipt dish-splitting, and real-time cashflow velocity forecasting.

---

## User Review Required

> [!IMPORTANT]
> The plan prioritizes three high-impact additions tailored to modern Vietnamese expense tracking habits:
> 1. **Bank SMS & Banking App Notification Auto-Parser**: Supports Vietcombank, Techcombank, MB Bank, ACB, VPBank, TPBank, MoMo, and ZaloPay with instant clipboard paste or text parsing.
> 2. **Itemized Receipt Breakdown & Dish Assignor**: Extends the camera/receipt scanner to extract individual food items and let roommates/couples check off who had what.
> 3. **Cashflow Pace & End-of-Month Predictive Velocity**: Visual pacing indicator comparing daily spend velocity against days remaining in the month.

---

## Proposed Changes

### 1. Vietnamese Bank SMS & Notification Fast-Parser (`/api/parse-bank-notification`)
- **Backend Parser**:
  - Add `/api/parse-bank-notification` in `server.ts` with regex rule matching for top Vietnamese banks and e-wallets:
    - *Techcombank / VCB / MBBank / ACB*: matches patterns like `TK 1903... SD: -45,000VND`, `giao dich: -150,000VND`, `So du: ...`, merchant/content `ND: HIGHLANDS COFFEE`.
    - *MoMo / ZaloPay*: matches transfer and payment notifications.
  - Fallback to Gemini AI natural language parser if regex doesn't match standard patterns.
  - Returns structured `amount`, `type` (expense or income), `merchantOrPayee`, `suggestedCategory`, `date`, and `detectedAccount`.
- **Frontend Integration**:
  - Add a dedicated "Paste Bank SMS / Notification" modal or tab in `AddExpenseModal.tsx`.
  - Add a "Paste from Clipboard" one-tap button that automatically extracts transaction details in under 1 second.

### 2. Itemized Group Receipt Dish-Splitting
- **Multi-Item Extractor**:
  - Enhance `/api/gemini-parse` to return an optional `lineItems: Array<{ id: string, name: string, quantity: number, price: number, assignedToUserIds: string[] }>`.
- **Interactive Dish Assignor UI**:
  - In `ReceiptScannerModal.tsx`, add an "Itemized Split Mode" view.
  - Display extracted items with individual prices and user avatar tags.
  - Allow tapping roommates/couple members to tag who consumed each item (or toggle "Split equally").
  - Automatically calculate subtotal, proportional tax/service charge, and generate the final split transactions directly into the active shared space.

### 3. Quick Action Floating Speed Dial on Mobile
- **Bottom Bar Quick Action**:
  - Enhance `BottomNav.tsx` / `App.tsx` with an ergonomic mobile floating action trigger:
    - ⚡ Quick Expense
    - 📋 Paste Bank SMS
    - 🧾 Scan Receipt
    - 💸 Split a Bill
- Polished micro-animations with haptic-like visual feedback and touch targets ≥ 48px.

### 4. Spending Velocity & Month-End Cashflow Forecast
- **Velocity Tracker Component**:
  - Calculate daily burn rate: `spentSoFar / currentDayOfMonth`.
  - Calculate projected month-end total: `spentSoFar + (dailyBurnRate * remainingDays)`.
  - Color-coded pace indicator: "On Track" (green), "Slightly High" (amber), or "Pacing Over Budget" (rose).
  - Add widget to `DashboardTab.tsx` right under the monthly budget summary.

---

## Verification Plan

### Automated Verification
- Run `lint_applet` (`npm run lint` / `tsc --noEmit`) to ensure clean TypeScript compilation.
- Run `compile_applet` (`npm run build`) to ensure asset bundling and production viability.

### Manual / Functional Verification
1. **SMS Parsing**:
   - Test paste strings:
     - `MB Bank: GD -120,000VND tai HIGHLANDS COFFEE ngay 15/10/2026. So du: 2,450,000VND.`
     - `Techcombank: TK 1903... -55,000VND luc 12:30. ND: Pho bo 24.`
     - `MoMo: Thanh toan thanh cong 85.000d cho Circle K.`
   - Verify category auto-assignment (Dining / Groceries), amount, and date.
2. **Itemized Splitter**:
   - Upload sample bill image or trigger receipt parser with itemized lines.
   - Tag Member A with dish 1, Member B with dish 2, both with shared drinks.
   - Verify total math matches bill total and individual debts update correctly.
3. **Responsive UI**:
   - Verify mobile viewport (375px - 430px) layout, floating speed dial, and swipe/tap responsiveness.
