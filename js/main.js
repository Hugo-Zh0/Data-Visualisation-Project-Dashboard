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

    // These must exist first before calling
    if (typeof updateLineChart === "function") updateLineChart(year, jurisdiction, method);
    if (typeof updateBarChart === "function") updateBarChart(year, method);
    if (typeof updateDonut === "function") updateDonut(year, jurisdiction, method);
    if (typeof updateSummaryCards === "function") updateSummaryCards(year, jurisdiction, method);
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

    d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
    const years = Array.from(new Set(data.map(d => +d.YEAR))).sort((a, b) => a - b);
    const jurisdictions = Array.from(new Set(data.map(d => d.JURISDICTION))).sort();

    // Clear and repopulate yearFilter
    if (yearSelect) {
      yearSelect.innerHTML = '<option value="All">All</option>';
      years.forEach(year => {
        const opt = document.createElement("option");
        opt.value = year;
        opt.textContent = year;
        yearSelect.appendChild(opt);
      });
    }

    // Clear and repopulate jurisdictionFilter
    if (jurisdictionSelect) {
      jurisdictionSelect.innerHTML = '<option value="All">All</option>';
      jurisdictions.forEach(j => {
        const opt = document.createElement("option");
        opt.value = j;
        opt.textContent = j;
        jurisdictionSelect.appendChild(opt);
      });
    }
  });

  setTimeout(applyFilters, 50);
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

// Export charts and Data
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".export-btn").forEach(button => {
    button.addEventListener("click", () => {
      const chartId = button.getAttribute("data-chart");
      const chartType = button.getAttribute("data-type");
      const chartElement = document.getElementById(chartId);
      const svg = chartElement?.querySelector("svg");

      if (!svg) return alert("Chart not found.");

      const svgData = new XMLSerializer().serializeToString(svg);

      const filters = {
        year: document.getElementById("yearFilter")?.value || "All",
        method: document.getElementById("methodFilter")?.value || "All",
        jurisdiction: document.getElementById("jurisdictionFilter")?.value || "All"
      };

      // Save export info to localStorage
      localStorage.setItem("exportChartData", JSON.stringify({
        chartType,
        svg: svgData,
        filters
      }));

      window.open("export.html", "_blank");
    });
  });
});


