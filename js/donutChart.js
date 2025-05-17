// js/donutChart.js

let updateDonut;
let fullData;
let filteredData;

d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  fullData = data;

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

  yearDropdown.on("change", () => {
    updateDonut(yearDropdown.property("value"), jurisdictionDropdown.property("value"));
  });

  jurisdictionDropdown.on("change", () => {
    updateDonut(yearDropdown.property("value"), jurisdictionDropdown.property("value"));
  });

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

  updateDonut = function (selectedYear = "All", selectedJurisdiction = "All") {
    filteredData = fullData;

    if (selectedYear !== "All") {
      filteredData = filteredData.filter(d => d.YEAR == +selectedYear);
    }

    if (selectedJurisdiction !== "All") {
      filteredData = filteredData.filter(d => d.JURISDICTION === selectedJurisdiction);
    }

    const totals = d3.rollups(
      filteredData,
      v => d3.sum(v, d => d.FINES),
      d => d.DETECTION_METHOD
    );

    const pieData = Object.fromEntries(totals);
    d3.select("#donutChartContainer").select("svg")?.remove();

    const width = 800;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#donutChartContainer")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height + 40}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${(height + 40) / 2})`);

    const color = d3.scaleOrdinal()
      .domain(Object.keys(pieData))
      .range(d3.schemeTableau10);

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);
    const outerArc = d3.arc().innerRadius(radius * 1.05).outerRadius(radius * 1.05);

    const arcs = svg.selectAll("g")
      .data(pie(Object.entries(pieData)))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .on("mouseover", function (event, d) {
        const method = d.data[0];
        const totalFines = d.data[1];

        const breakdown = d3.rollups(
          filteredData.filter(row => row.DETECTION_METHOD === method),
          v => d3.sum(v, d => d.FINES),
          d => d.JURISDICTION
        ).map(([jur, fine]) => `• ${jur}: ${fine.toLocaleString()}`).join("<br>");

        tooltip
          .html(
            `<strong>Method:</strong> ${method}<br>
             <strong>Total Fines:</strong> ${totalFines.toLocaleString()}<br><br>
             <strong>Jurisdictions:</strong><br>${breakdown}`
          )
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 40) + "px")
          .transition().duration(100)
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // Vertical spacing logic for outside labels
    const labelOffset = 15;
    let upperLabels = 0;
    let lowerLabels = 0;

    // Adjusted label positioning with horizontal spread
    arcs.append("text")
      .each(function (d, i) {
        const base = outerArc.centroid(d);

        // Alternate left/right by index
        const isLeft = i % 2 === 0;
        const offsetX = isLeft ? -60 : 60;

        d.labelPos = [base[0] + offsetX, base[1]];
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

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${-(width / 2) + 20},${-(height / 2) + 10})`);

    Object.keys(pieData).forEach((key, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(key));

      legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 10)
        .text(key)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });
  };

  updateDonut("All", "All");
});
