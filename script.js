//For change currency
function getCurrency() {
  return localStorage.getItem("currency") || "LKR";
}

function formatAmount(amount) {
  const currency = getCurrency();

  const symbols = {
    LKR: "LKR",
    USD: "$",
    EUR: "€",
  };

  return `${symbols[currency]} ${amount.toFixed(2)}`;
}

function getTransactions() {
  let transactions = localStorage.getItem("transactions");
  if (transactions) {
    return JSON.parse(transactions); // returns array
  } else {
    return []; // return empty array if nothing saved
  }
}

function saveTransactions(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addTransaction(newTransaction) {
  let transactions = getTransactions(); //Get transactions
  transactions.push(newTransaction); //Add new transaction
  saveTransactions(transactions); //Save updated array
}

function deleteTransaction(id) {
  let transactions = getTransactions();
  const update = transactions.filter((t) => t.id !== id);

  saveTransactions(update);
  applyFiltersAndSort(); // Refresh UI with filters
  updateDashboard(); // update totals after deletion
  updateQuickOverview();
  //updateSmartTip();
  updateAITips();

  // **Update monthly summary**
  if (monthSelect.value) {
    calculateMonthlySummary(monthSelect.value);
  }
}

//Render Transactions
function renderTransactions(transactions = getTransactions()) {
  const container = document.getElementById("transactionList");
  container.innerHTML = ""; //doesn't duplicate when you refresh

  if (transactions.length === 0) {
    container.innerHTML = "<p class='empty-msg'>No transactions yet</p>";
    return;
  }

  transactions.forEach((transaction) => {
    //Create a Card Elements
    const card = document.createElement("div"); //create a div
    card.classList.add("transaction-card"); //add main class

    //Add type class(for color)
    if (transaction.type === "Income") {
      card.classList.add("income"); //green color
    } else {
      card.classList.add("expense"); //red color
    }

    // Create inner divs
    const typeDiv = document.createElement("div");
    typeDiv.textContent = transaction.type;
    typeDiv.classList.add("type"); // <-- Add class here

    const categoryDiv = document.createElement("div");
    categoryDiv.textContent = transaction.category;
    categoryDiv.classList.add("category"); // <-- Add class here

    const amountDiv = document.createElement("div");
    // Add + or - based on type
    const sign = transaction.type === "Income" ? "+" : "-";
    // Format amount
    amountDiv.textContent = `${sign} ${formatAmount(transaction.amount)}`; //For update currecny
    amountDiv.classList.add("amount"); // <-- Add class here

    amountDiv.classList.add(
      transaction.type === "Income" ? "income-text" : "expense-text"
    );

    /*if (transaction.type === "Income") {
      amountDiv.classList.add("income-text");
    } else {
      amountDiv.classList.add("expense-text");
    }*/

    const dateDiv = document.createElement("div");
    dateDiv.textContent = transaction.date;
    dateDiv.classList.add("date"); // <-- Add class here

    // 🔥 CREATE DELETE BUTTON HERE
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");

    // 🔥 DELETE LOGIC HERE
    deleteBtn.addEventListener("click", () => {
      deleteTransaction(transaction.id);
    });

    //Append inner divs to card
    card.appendChild(typeDiv);
    card.appendChild(categoryDiv);
    card.appendChild(amountDiv);
    card.appendChild(dateDiv);
    card.appendChild(deleteBtn);

    //Append card to container
    container.appendChild(card);
  });
}

//Add transaction from HTML
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const addBtn = document.getElementById("addBtn");

// Quick Overview Elements
const todayIncomeEl = document.getElementById("todayIncome");
const todayExpenseEl = document.getElementById("todayExpense");
const monthlyBalanceEl = document.getElementById("monthlyBalance");

// Smart AI Tip Element
const aiTipEl = document.getElementById("aiTip");

// Filter elements
const filterType = document.getElementById("filterType");
const searchCategory = document.getElementById("searchCategory");
const filterDate = document.getElementById("filterDate");

filterType.addEventListener("change", applyFiltersAndSort);
searchCategory.addEventListener("input", applyFiltersAndSort);
filterDate.addEventListener("change", applyFiltersAndSort);

//Sort Dropdown
const sortBy = document.getElementById("sortBy");
sortBy.addEventListener("change", applyFiltersAndSort);

function applyFiltersAndSort() {
  let filtered = getTransactions();
  // FILTER: Type
  if (filterType.value !== "All") {
    filtered = filtered.filter((t) => t.type === filterType.value);
  }
  //FILTER: Category
  if (searchCategory.value.trim() !== "") {
    filtered = filtered.filter((t) =>
      t.category.toLowerCase().includes(searchCategory.value.toLowerCase())
    );
  }
  // FILTER: Date
  if (filterDate.value !== "") {
    filtered = filtered.filter((t) => t.date === filterDate.value);
  }

  // SORTING
  switch (sortBy.value) {
    case "date-new":
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "date-old":
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "amount-high":
      filtered.sort((a, b) => b.amount - a.amount);
      break;
    case "amount-low":
      filtered.sort((a, b) => a.amount - b.amount);
      break;
  }
  renderTransactions(filtered);
}

addBtn.addEventListener("click", () => {
  //Validations
  if (typeInput.value === "") {
    alert("Please select a transaction type.");
    return; //Stop execution
  }

  if (categoryInput.value.trim() === "") {
    alert("Please enter a category.");
    return;
  }

  if (amountInput.value === "" || Number(amountInput.value) <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }

  if (dateInput.value === "") {
    alert("Please select a date.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    type: typeInput.value,
    category: categoryInput.value,
    amount: Number(amountInput.value),
    date: dateInput.value,
    note: "",
  };

  addTransaction(newTransaction); // save transaction
  applyFiltersAndSort(); // refresh UI with filters/sort applied
  updateDashboard();
  renderCharts();
  updateQuickOverview();
  //updateSmartTip();
  updateAITips();

  // **Update monthly summary**
  if (monthSelect.value) {
    calculateMonthlySummary(monthSelect.value);
  }

  // clear form

  /*typeInput.value = "";
  categoryInput.value = "";
  amountInput.value = "";
  dateInput.value = "";*/ //This is correct also

  const form = document.querySelector(".add-transaction");
  form.reset(); //This is clear all
});

// Calculate total Income, Expenses, and Balance
function calculateTotals() {
  const transactions = getTransactions();

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    //t is just a variable name ONE transaction object from the transactions array.
    if (t.type === "Income") {
      totalIncome += t.amount;
    } else if (t.type === "Expense") {
      totalExpense += t.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  return {
    income: totalIncome,
    expense: totalExpense,
    balance: balance,
  };
}

// Update the Dashboard cards
function updateDashboard() {
  const totals = calculateTotals();

  const incomeCard = document.querySelector(".card.income-card");
  const expenseCard = document.querySelector(".card.expense-card");
  const balanceCard = document.querySelector(".card.balance-card");

  incomeCard.innerHTML = `Income: <span class="amount-value">${formatAmount(
    totals.income
  )}</span>`;
  expenseCard.innerHTML = `Expenses: <span class="amount-value">${formatAmount(
    totals.expense
  )}</span>`;
  balanceCard.innerHTML = `Balance: <span class="amount-value">${formatAmount(
    totals.balance
  )}</span>`;
}

//Quick Overview
function updateQuickOverview() {
  const transactions = getTransactions();

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  let todayIncome = 0;
  let todayExpense = 0;
  let monthlyBalance = 0;

  transactions.forEach((t) => {
    if (t.date === today) {
      if (t.type === "Income") todayIncome += t.amount;
      else if (t.type === "Expense") todayExpense += t.amount;
    }

    if (t.date.startsWith(currentMonth)) {
      if (t.type === "Income") monthlyBalance += t.amount;
      else if (t.type === "Expense") monthlyBalance -= t.amount;
    }
  });

  todayIncomeEl.textContent = formatAmount(todayIncome);
  todayExpenseEl.textContent = formatAmount(todayExpense);
  monthlyBalanceEl.textContent = formatAmount(monthlyBalance);
}

//Smart AI Tip logic
/*function updateSmartTip() {
  const transactions = getTransactions();

  if (transactions.length === 0) {
    aiTipEl.textContent = "Add transactions to unlock insights 📊";
    return;
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.date.startsWith(currentMonth)) {
      if (t.type === "Income") income += t.amount;
      else if (t.type === "Expense") expense += t.amount;
    }
  });

  if (income === 0 && expense === 0) {
    aiTipEl.textContent =
      "No transactions this month yet. Start tracking today 📅";
    return;
  }

  if (expense > income) {
    aiTipEl.textContent =
      "⚠️ This month you're spending more than earning. Review your expenses.";
  } else if (income > expense) {
    aiTipEl.textContent = "✅ Good job! You're saving money this month.";
  } else {
    aiTipEl.textContent = "📊 Income and expenses are equal this month.";
  }
}*/

// Monthly Summary Elements
const monthSelect = document.getElementById("monthSelect");
const incomeSummary = document.querySelector(".income-summary");
const expenseSummary = document.querySelector(".expense-summary");
const balanceSummary = document.querySelector(".balance-summary");

// Function to calculate monthly totals
function calculateMonthlySummary(monthYear) {
  const transactions = getTransactions();
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.date.startsWith(monthYear)) {
      if (t.type === "Income") totalIncome += t.amount;
      else if (t.type === "Expense") totalExpense += t.amount;
    }
  });

  const balance = totalIncome - totalExpense;
  incomeSummary.textContent = `Income: ${formatAmount(totalIncome)}`;
  expenseSummary.textContent = `Expenses: ${formatAmount(totalExpense)}`;
  balanceSummary.textContent = `Balance: ${formatAmount(balance)}`;
}

monthSelect.addEventListener("change", () => {
  if (monthSelect.value) {
    calculateMonthlySummary(monthSelect.value); // format: YYYY-MM
  }
});

//JS for Charts
let barChartInstance, pieChartInstance;
function renderCharts() {
  const transactions = getTransactions();

  // Prepare data for bar chart
  const monthMap = {};

  transactions.forEach((t) => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };

    if (t.type === "Income") monthMap[month].income += t.amount;
    else if (t.type === "Expense") monthMap[month].expense += t.amount;
  });

  const months = Object.keys(monthMap).sort(); //Sorted month
  const incomeData = months.map((m) => monthMap[m].income);
  const expenseData = months.map((m) => monthMap[m].expense);

  // Destroy previous charts if exist
  if (barChartInstance) barChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();

  // Bar Chart
  const barCtx = document.getElementById("barChart").getContext("2d");
  barChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "#4CAF50",
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: "#F44336",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Monthly Income vs Expense" },
      },
    },
  });

  // Pie Chart
  const totalIncome = incomeData.reduce((a, b) => a + b, 0);
  const totalExpense = expenseData.reduce((a, b) => a + b, 0);

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  pieChartInstance = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [totalIncome, totalExpense],
          backgroundColor: ["#4CAF50", "#F44336"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Income vs Expense Distribution" },
      },
    },
  });
}

// AI part
function updateAITips() {
  const transactions = getTransactions();
  const tipElement = document.getElementById("aiTip");

  // Safety check
  if (!tipElement) return;

  // Loading state (AI thinking)
  tipElement.textContent = "Analyzing your finances 🤖...";

  setTimeout(() => {
    const insight = generateSmartInsights(transactions);
    const prediction = generateMonthlyPrediction(transactions);

    // Combine output safely
    tipElement.innerHTML = prediction
      ? `${insight}<br><br>${prediction}`
      : insight;
  }, 600);
}

// Load saved transactions when page loads
window.addEventListener("DOMContentLoaded", () => {
  //For top-bar date
  const today = new Date();
  const options = { day: "2-digit", month: "short", year: "numeric" };
  document.querySelector(".top-bar .date").textContent =
    today.toLocaleDateString("en-US", options);

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  monthSelect.value = currentMonth;
  calculateMonthlySummary(currentMonth);
  renderTransactions();
  updateDashboard();
  updateQuickOverview();
  //updateSmartTip();
  renderCharts();
  updateAITips();
});

// Export Button (CSV)
const exportBtn = document.getElementById("exportCSV");
exportBtn.addEventListener("click", exportToCSV);

function exportToCSV() {
  const transactions = getTransactions();

  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  // CSV Header
  const currency = getCurrency();
  let csv = `Type,Category,Amount (${currency}),Date\n`;

  //CSV Rows
  transactions.forEach((t) => {
    csv += `${t.type},${t.category},${t.amount},${t.date}\n`;
  });

  //Create File
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Auto download
  const a = document.createElement("a");
  a.href = url;
  a.download = "finance-transactions.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
