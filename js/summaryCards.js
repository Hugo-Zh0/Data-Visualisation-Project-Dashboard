// js/summaryCards.js

function updateSummaryCards(selectedYear = "All", selectedJurisdiction = "All", selectedMethod = "All") {
  d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
    data.forEach(d => {
      d.YEAR = +d.YEAR;
      d.FINES = +d.FINES;
    });

    let filtered = data;

    if (selectedYear !== "All") {
      filtered = filtered.filter(d => d.YEAR === +selectedYear);
    }

    if (selectedJurisdiction !== "All") {
      filtered = filtered.filter(d => d.JURISDICTION === selectedJurisdiction);
    }

    if (selectedMethod !== "All") {
      filtered = filtered.filter(d => d.DETECTION_METHOD === selectedMethod);
    }

    const totalFines = d3.sum(filtered, d => d.FINES);

    const finesByYear = d3.rollup(
      filtered,
      v => d3.sum(v, d => d.FINES),
      d => d.YEAR
    );

    const peakYearEntry = Array.from(finesByYear.entries()).sort((a, b) => b[1] - a[1])[0] || [null, 0];

    const peakYear = peakYearEntry[0];
    const peakFines = peakYearEntry[1];

    // Update DOM
    d3.select("#summary-cards").html(`
      <div class="summary-card">
        <h3>Total Fines</h3>
        <p>${totalFines.toLocaleString()}</p>
      </div>
      <div class="summary-card">
        <h3>Peak Fine Year</h3>
        <p>${peakYear ?? "N/A"}</p>
      </div>
      <div class="summary-card">
        <h3>Fines in Peak Year</h3>
        <p>${peakFines.toLocaleString()}</p>
      </div>
    `);
  });
}
