function isAIEnabled() {
  return localStorage.getItem("aiEnabled") !== "false";
} //Control toggle

function generateSmartInsights(transactions) {
  if (transactions.length < 3) {
    return "Add more transactions to unlock AI insights 📊";
  }

  let expenseMap = {};
  let totalExpense = 0;

  const currentMonth = new Date().toISOString().slice(0, 7);

  transactions.forEach((t) => {
    if (t.type === "Expense" && t.date.startsWith(currentMonth)) {
      totalExpense += t.amount;
      expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
    }
  });

  if (totalExpense === 0) {
    return "No expenses yet this month. Great saving habit! 💰";
  }

  let topCategory = "";
  let topAmount = 0;

  for (let cat in expenseMap) {
    if (expenseMap[cat] > topAmount) {
      topAmount = expenseMap[cat];
      topCategory = cat;
    }
  }

  const percentage = ((topAmount / totalExpense) * 100).toFixed(1);

  if (percentage > 40) {
    return `⚠️ You spend ${percentage}% on ${topCategory}. Consider reducing it.`;
  }

  return `👍 Your spending is balanced this month. Top category: ${topCategory} (${percentage}%).`;
}

//MONTHLY PREDICTION AI
function generateMonthlyPrediction(transactions) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const expenses = transactions.filter(
    (t) => t.type === "Expense" && t.date.startsWith(currentMonth)
  );

  if (expenses.length === 0) return "";

  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  const day = now.getDate();
  const totalDays = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  const avgPerDay = totalSpent / day;
  const predicted = Math.round(avgPerDay * totalDays);

  // ✅ ADD HERE (THIS IS THE ANSWER)
  const incomeThisMonth = transactions
    .filter((t) => t.type === "Income" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  if (predicted > incomeThisMonth && incomeThisMonth > 0) {
    return `⚠️ At this pace, your expenses may exceed your income this month.`;
  }

  // existing return
  return `📈 Estimated monthly expenses: LKR ${predicted}`;
}
