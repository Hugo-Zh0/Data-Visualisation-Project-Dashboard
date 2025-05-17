// js/donutChart.js

d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  const yearDropdown = d3.select("#yearFilter");
  const jurisdictionDropdown = d3.select("#jurisdictionFilter");

  const years = Array.from(new Set(data.map(d => d.YEAR))).sort();
  const jurisdictions = Array.from(new Set(data.map(d => d.JURISDICTION))).sort();

  if (yearDropdown.selectAll("option").size() <= 1) {
    years.forEach(y => {
      yearDropdown.append("option").attr("value", y).text(y);
    });
  }

  if (jurisdictionDropdown.selectAll("option").size() <= 1) {
    jurisdictions.forEach(j => {
      jurisdictionDropdown.append("option").attr("value", j).text(j);
    });
  }

  updateDonut("All", "All");

  yearDropdown.on("change", () => {
    updateDonut(yearDropdown.property("value"), jurisdictionDropdown.property("value"));
  });

  jurisdictionDropdown.on("change", () => {
    updateDonut(yearDropdown.property("value"), jurisdictionDropdown.property("value"));
  });

  function updateDonut(selectedYear, selectedJurisdiction) {
    let filtered = data;

    if (selectedYear !== "All") {
      filtered = filtered.filter(d => d.YEAR == +selectedYear);
    }

    if (selectedJurisdiction !== "All") {
      filtered = filtered.filter(d => d.JURISDICTION === selectedJurisdiction);
    }

    const totals = d3.rollups(
      filtered,
      v => d3.sum(v, d => d.FINES),
      d => d.DETECTION_METHOD
    );

    const pieData = Object.fromEntries(totals);
    d3.select("#donutChartContainer").selectAll("*").remove();

    const width = 800, height = 300, radius = Math.min(width, height) / 2;

    const svg = d3.select("#donutChartContainer")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(Object.keys(pieData))
      .range(d3.schemeTableau10);

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);

    const arcs = svg.selectAll("arc")
      .data(pie(Object.entries(pieData)))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]));

    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#fff")
      .text(d => d.data[0]);
  }
});
