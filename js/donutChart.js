// DONUT CHART FIXED TO HANDLE INTERACTIVE FLOW AND SHOW MULTIPLE JURISDICTIONS
let updateDonut;
let fullData;
let filteredData;

d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  fullData = data;

  updateDonut = function (selectedYear = "All", selectedJurisdiction = "All", selectedMethod = "All") {
    window.selectedState = { year: selectedYear, jurisdiction: selectedJurisdiction, method: selectedMethod };

    filteredData = fullData;

    if (selectedYear !== "All") filteredData = filteredData.filter(d => d.YEAR === +selectedYear);
    if (selectedJurisdiction !== "All") filteredData = filteredData.filter(d => d.JURISDICTION === selectedJurisdiction);
    if (selectedMethod !== "All") filteredData = filteredData.filter(d => d.DETECTION_METHOD === selectedMethod);

    d3.select("#donutChartContainer").select("svg")?.remove();
    d3.select("#donutChartContainer").select(".no-data-warning")?.remove();

    const width = 800;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    let pieData;
    let label;

    if (selectedYear !== "All" && selectedMethod !== "All") {
      const grouped = d3.rollups(filteredData, v => d3.sum(v, d => d.FINES), d => d.JURISDICTION);
      pieData = Object.fromEntries(grouped);
      label = `${selectedMethod} – Total Fines by Jurisdiction (${selectedYear})`;
    } else if (selectedYear !== "All") {
      const grouped = d3.rollups(filteredData, v => d3.sum(v, d => d.FINES), d => d.DETECTION_METHOD);
      pieData = Object.fromEntries(grouped);
      label = `Detection Method Breakdown (${selectedYear})`;
    } else {
      const grouped = d3.rollups(filteredData, v => d3.sum(v, d => d.FINES), d => d.DETECTION_METHOD);
      pieData = Object.fromEntries(grouped);
      label = "Detection Method Breakdown (All Years)";
    }

    if (!pieData || Object.keys(pieData).length === 0 || d3.sum(Object.values(pieData)) === 0) {
      d3.select("#donutChartContainer")
        .append("div")
        .attr("class", "no-data-warning")
        .style("color", "red")
        .style("font-weight", "bold")
        .style("padding", "1rem")
        .style("text-align", "center")
        .text("⚠ No data found for this selection.");
      return;
    }

    d3.select("#donut-chart h2").html(`${label}
      <button class="fullscreen-btn" data-chart="donutChartContainer">⛶</button>
      <button class="export-btn" data-chart="donutChartContainer" data-type="donut">Export ⬇</button>
    `);

    const svg = d3.select("#donutChartContainer")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height + 40}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${(height + 40) / 2})`);

    const color = d3.scaleOrdinal().domain(Object.keys(pieData)).range(d3.schemeSet2);
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);
    const outerArc = d3.arc().innerRadius(radius * 1.05).outerRadius(radius * 1.05);

    const arcs = svg.selectAll("g")
      .data(pie(Object.entries(pieData)))
      .enter()
      .append("g")
      .attr("class", "arc");

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "donut-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000);

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .on("mouseover", function (event, d) {
        tooltip.html(`<strong>${d.data[0]}</strong><br>Fines: ${d.data[1].toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px")
          .transition().duration(150).style("opacity", 1);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    arcs.append("text")
      .each(function (d, i) {
        const base = outerArc.centroid(d);
        const offset = i % 2 === 0 ? -60 : 60;
        d.labelPos = [base[0] + offset, base[1]];
      })
      .attr("transform", d => `translate(${d.labelPos})`)
      .attr("text-anchor", d => d.labelPos[0] < 0 ? "end" : "start")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text(d => d.data[0]);

    arcs.append("polyline")
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("points", d => {
        const outer = arc.centroid(d);
        const mid = outerArc.centroid(d);
        return [outer, mid, d.labelPos];
      });

    const legend = svg.append("g").attr("transform", `translate(${-(width / 2) + 20},${-(height / 2) + 10})`);
    Object.keys(pieData).forEach((key, i) => {
      legend.append("rect").attr("x", 0).attr("y", i * 20).attr("width", 12).attr("height", 12).attr("fill", color(key));
      legend.append("text").attr("x", 20).attr("y", i * 20 + 10).text(key).style("font-size", "12px").attr("alignment-baseline", "middle");
    });

    if (typeof updateSummaryCards === "function") {
      updateSummaryCards(selectedYear, selectedJurisdiction, selectedMethod);
    }
  };

  updateDonut("All", "All", "All");
});
