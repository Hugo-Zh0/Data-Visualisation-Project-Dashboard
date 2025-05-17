// js/main.js

document.addEventListener("DOMContentLoaded", function () {
  const yearSelect = document.getElementById("yearFilter");
  const jurisdictionSelect = document.getElementById("jurisdictionFilter");
  const methodSelect = document.getElementById("methodFilter");
  const resetButton = document.getElementById("resetFilters");

  function getSelectedValues() {
    return {
      year: yearSelect?.value || "All",
      jurisdiction: jurisdictionSelect?.value || "All",
      method: methodSelect?.value || "All"
    };
  }

  function applyFilters() {
    const { year, jurisdiction, method } = getSelectedValues();

    updateSummaryCards(year, jurisdiction, method);
    updateDonut(year, jurisdiction);
    updateLineChart(year, jurisdiction, method);
  }

  function resetFilters() {
    yearSelect.value = "All";
    jurisdictionSelect.value = "All";
    methodSelect.value = "All";
    applyFilters();
  }

  yearSelect?.addEventListener("change", applyFilters);
  jurisdictionSelect?.addEventListener("change", applyFilters);
  methodSelect?.addEventListener("change", applyFilters);
  resetButton?.addEventListener("click", resetFilters);

  // Initial load
  applyFilters();
});
