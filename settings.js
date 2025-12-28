// =====================
// SETTINGS MODAL
// =====================

const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const settingsBtn = document.getElementById("settingsBtn");

// Open modal
settingsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  settingsModal.style.display = "flex";
});

// Close modal
closeSettings.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

// Close on outside click
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = "none";
  }
});

// =====================
// CURRENCY
// =====================
const currencySelect = document.getElementById("currencySelect");

currencySelect.value = localStorage.getItem("currency") || "LKR";

currencySelect.addEventListener("change", () => {
  localStorage.setItem("currency", currencySelect.value);
});

// =====================
// THEME
// =====================
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
});

// =====================
// AI TOGGLE
// =====================
const aiToggle = document.getElementById("aiToggle");

aiToggle.checked = localStorage.getItem("aiEnabled") !== "false";

aiToggle.addEventListener("change", () => {
  localStorage.setItem("aiEnabled", aiToggle.checked);
});

// =====================
// CLEAR TRANSACTIONS
// =====================
document.getElementById("clearTransactions").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all transactions?")) {
    localStorage.removeItem("transactions");
    location.reload();
  }
});
