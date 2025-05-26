let updateBarChart;

const methodColors = {
  "Police issued": "#e74c3c",
  "Mobile camera": "#27ae60",
  "All": "#007acc",
  "Other": "#999"
};;

d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  function applyFilterSelections() {
    const year = document.getElementById("yearFilter")?.value || "All";
    const jurisdiction = document.getElementById("jurisdictionFilter")?.value || "All";
    const method = document.getElementById("methodFilter")?.value || "All";
    if (typeof updateLineChart === "function") updateLineChart(year, jurisdiction, method);
    if (typeof updateBarChart === "function") updateBarChart(year, method);
    if (typeof updateDonut === "function") updateDonut(year, jurisdiction, method);
    if (typeof updateSummaryCards === "function") updateSummaryCards(year, jurisdiction, method);
  }

  document.getElementById("yearFilter")?.addEventListener("change", applyFilterSelections);
  document.getElementById("jurisdictionFilter")?.addEventListener("change", applyFilterSelections);
  document.getElementById("methodFilter")?.addEventListener("change", applyFilterSelections);

  updateBarChart = function (selectedYear = "All", selectedMethod = "All") {
    let filtered = data;

    if (selectedYear !== "All") {
      filtered = filtered.filter(d => d.YEAR === +selectedYear);
    }

    if (selectedMethod !== "All") {
      filtered = filtered.filter(d => d.DETECTION_METHOD === selectedMethod);
    }

    const total = d3.sum(filtered, d => d.FINES);
    const barLabel = selectedMethod === "All" ? `All Fines (${selectedYear})` : `${selectedMethod} (${selectedYear})`;

    const grouped = [{
      label: barLabel,
      FINES: total,
      DETECTION_METHOD: selectedMethod
    }];

    d3.select("#barChartContainer").select("svg")?.remove();
    d3.select("#barChartContainer").select("div")?.remove();
    d3.select("#barChartContainer").select(".no-data-warning")?.remove();

    if (!grouped.length || total === 0) {
      d3.select("#barChartContainer")
        .append("div")
        .attr("class", "no-data-warning")
        .style("color", "red")
        .style("font-weight", "bold")
        .style("padding", "1rem")
        .style("text-align", "center")
        .text("⚠ No data found for this selection.");
      return;
    }

    const margin = { top: 40, right: 30, bottom: 70, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#barChartContainer")
      .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(grouped.map(d => d.label))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.FINES)]).nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-20)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .text("Detection Method");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .text("Number of Fines");

    const tooltip = d3.select("#barChartContainer")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "6px 10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg.selectAll("rect")
      .data(grouped)
      .enter()
      .append("rect")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.FINES))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.FINES))
      .attr("fill", d => methodColors[d.DETECTION_METHOD] || methodColors["All"] || "#007acc")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        const { year = "All" } = window.selectedState || {};
        window.selectedState.jurisdiction = "All";
        if (typeof updateDonut === "function") updateDonut(year, "All", d.DETECTION_METHOD);
        if (typeof updateSummaryCards === "function") updateSummaryCards(year, "All", d.DETECTION_METHOD);
      })
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`<strong>${d.label}</strong><br>Fines: ${d.FINES.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));
  };

  updateBarChart("All", "All");
});
