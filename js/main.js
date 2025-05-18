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
    updateLineChart(year, jurisdiction, method);
    updateBarChart(year, method);
    updateDonut(year, jurisdiction, method);
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

// Fullscreen modal for charts
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("chartModal");
  const modalContent = document.getElementById("chartModalContent");
  const closeBtn = document.querySelector(".chart-modal-close");

  document.querySelectorAll(".fullscreen-btn").forEach(button => {
    button.addEventListener("click", () => {
      const chartId = button.getAttribute("data-chart");
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        modalContent.innerHTML = "";
        const clone = chartElement.cloneNode(true);
        clone.style.height = "500px";
        clone.style.overflow = "auto";
        modalContent.appendChild(clone);
        modal.style.display = "block";
      }
    });
  });

  closeBtn.onclick = () => {
    modal.style.display = "none";
    modalContent.innerHTML = "";
  };

  window.onclick = (e) => {
    if (e.target == modal) {
      modal.style.display = "none";
      modalContent.innerHTML = "";
    }
  };
});

