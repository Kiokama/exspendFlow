const fs = require('fs');
let content = fs.readFileSync('src/components/AddExpenseModal.tsx', 'utf-8');
content = content.replace(
  'initialData?: Expense | null;',
  'initialData?: Partial<Expense> | null;'
);
content = content.replace(
  /setUserAPercent\(initialData\.splitDetails\.userAPercent \?\? 50\);/g,
  'setUserAPercent(initialData.splitDetails?.userAPercent ?? 50);'
);
content = content.replace(
  /setUserBPercent\(initialData\.splitDetails\.userBPercent \?\? 50\);/g,
  'setUserBPercent(initialData.splitDetails?.userBPercent ?? 50);'
);
content = content.replace(
  /setUserAAmount\(initialData\.splitDetails\.userAAmount \?\? ""\);/g,
  'setUserAAmount(initialData.splitDetails?.userAAmount ?? "");'
);
content = content.replace(
  /setUserBAmount\(initialData\.splitDetails\.userBAmount \?\? ""\);/g,
  'setUserBAmount(initialData.splitDetails?.userBAmount ?? "");'
);
content = content.replace(
  /setTagsInput\(initialData\.tags \? initialData\.tags\.join\(\", \"\) : \"\"\);/g,
  'setTagsInput(initialData.tags ? initialData.tags.join(", ") : "");'
);

fs.writeFileSync('src/components/AddExpenseModal.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(
  'const [editingExpense, setEditingExpense] = useState<Expense | null>(null);',
  'const [editingExpense, setEditingExpense] = useState<Partial<Expense> | null>(null);'
);
appContent = appContent.replace(
  /const handleAIParsedResult = \(data: any\) => \{\n    setEditingExpense\(null\);\n    setIsAddModalOpen\(true\);\n  \};/g,
  `const handleAIParsedResult = (data: any) => {
    let paidById = currentUser.id;
    if (data.paidBy && activeSpace) {
      const p = data.paidBy.toLowerCase().replace('user_', '');
      const m1 = activeSpace.members[0];
      const m2 = activeSpace.members[1];
      if (m2 && m2.name.toLowerCase().includes(p)) {
        paidById = m2.id;
      } else if (m1 && m1.name.toLowerCase().includes(p)) {
        paidById = m1.id;
      }
    }
    const partialData: Partial<Expense> = {
      title: data.title || "",
      amount: data.amount || 0,
      category: data.category || "Other",
      splitType: data.splitType || "50_50",
      paidById: paidById,
      splitDetails: {
        userAPercent: data.userAPercent || 50,
        userBPercent: data.userBPercent || 50
      },
      note: data.note || ""
    };
    setEditingExpense(partialData);
    setIsAddModalOpen(true);
  };`
);
fs.writeFileSync('src/App.tsx', appContent);
