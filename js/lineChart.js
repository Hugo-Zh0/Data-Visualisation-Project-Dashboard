let updateLineChart;

d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  updateLineChart = function (selectedYear = "All", selectedJurisdiction = "All", selectedMethod = "All") {
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

    let totals;

    if (selectedYear !== "All") {
      const targetYear = +selectedYear;
      const yearsToInclude = [targetYear - 1, targetYear, targetYear + 1];

      let extendedFiltered = data.filter(d =>
        yearsToInclude.includes(+d.YEAR) &&
        (selectedJurisdiction === "All" || d.JURISDICTION === selectedJurisdiction) &&
        (selectedMethod === "All" || d.DETECTION_METHOD === selectedMethod)
      );

      totals = d3.rollups(
        extendedFiltered,
        v => d3.sum(v, d => d.FINES),
        d => d.YEAR
      ).map(([year, total]) => ({ YEAR: +year, FINES: total }));
    } else {
      totals = d3.rollups(
        filtered,
        v => d3.sum(v, d => d.FINES),
        d => d.YEAR
      ).map(([year, total]) => ({ YEAR: +year, FINES: total }));
    }

    totals = totals.sort((a, b) => a.YEAR - b.YEAR);

    // Clear chart and warning
    d3.select("#lineChartContainer").select("svg")?.remove();
    d3.select("#lineChartContainer").select("div")?.remove();
    d3.select("#lineChartContainer").select(".no-data-warning")?.remove();

    // If no data found, show message
    if (!totals || totals.length === 0 || d3.sum(totals.map(d => d.FINES)) === 0) {
      d3.select("#lineChartContainer")
        .append("div")
        .attr("class", "no-data-warning")
        .style("color", "red")
        .style("font-weight", "bold")
        .style("padding", "1rem")
        .style("text-align", "center")
        .text("⚠ No data found for this selection.");
      return;
    }

    const margin = { top: 40, right: 50, bottom: 70, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const svg = d3.select("#lineChartContainer")
      .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xYears = totals.map(d => d.YEAR);
    const yMax = d3.max(totals, d => d.FINES);

    const x = d3.scalePoint()
      .domain(xYears)
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, yMax]).nice()
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d.YEAR))
      .y(d => y(d.FINES));

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Axis Labels
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .text("Year");

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", -50)
      .text("Total Fines (Mobile Phone Use)");

    // Line path
    svg.append("path")
      .datum(totals)
      .attr("fill", "none")
      .attr("stroke", "#007acc")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Tooltip
    const tooltip = d3.select("#lineChartContainer")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "6px 10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Dots
    svg.selectAll("circle")
      .data(totals)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.YEAR))
      .attr("cy", d => y(d.FINES))
      .attr("r", d => (selectedYear !== "All" && +selectedYear === d.YEAR) ? 7 : 5)
      .attr("fill", d => (selectedYear !== "All" && +selectedYear === d.YEAR) ? "#e67e22" : "#007acc")
      .on("mouseover", (event, d) => {
        const isSelected = selectedYear !== "All" && +selectedYear === d.YEAR;
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(
          `<strong>Year:</strong> ${d.YEAR}<br>
           <strong>Fines:</strong> ${d.FINES.toLocaleString()}${isSelected ? "<br><em>(Selected)</em>" : ""}`
        )
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // 🟢 Legend
    svg.append("rect")
      .attr("x", width - 130)
      .attr("y", -10)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#007acc");

    svg.append("text")
      .attr("x", width - 110)
      .attr("y", 2)
      .text("Mobile Phone Fines")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  };

  updateLineChart("All", "All", "All");
});
