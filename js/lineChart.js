d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  window.updateLineChart = function (selectedYear = "All", selectedJurisdiction = "All", selectedMethod = "All") {
    let filtered = data;

    if (selectedJurisdiction !== "All") {
      filtered = filtered.filter(d => d.JURISDICTION === selectedJurisdiction);
    }

    let allYears;
    if (selectedYear !== "All") {
      const y = +selectedYear;
      allYears = [y - 1, y, y + 1];
    } else {
      allYears = [...new Set(data.map(d => d.YEAR))].sort((a, b) => a - b);
    }

    let showAll = selectedMethod === "All";

    const totals = showAll
    ? allYears.map(year => {
        const sum = d3.sum(filtered.filter(d => d.YEAR === year), d => d.FINES);
        return { YEAR: year, FINES: sum };
      })
    : [];

    const policeData = allYears.map(year => {
      const sum = d3.sum(filtered.filter(d => d.DETECTION_METHOD === "Police issued" && d.YEAR === year), d => d.FINES);
      return { YEAR: year, FINES: sum };
    });

    const cameraData = allYears.map(year => {
      const sum = d3.sum(filtered.filter(d => d.DETECTION_METHOD === "Mobile camera" && d.YEAR === year), d => d.FINES);
      return { YEAR: year, FINES: sum };
    });

    d3.select("#lineChartContainer").select("svg")?.remove();
    d3.select("#lineChartContainer").select("div")?.remove();
    d3.select("#lineChartContainer").select(".no-data-warning")?.remove();

    const yMax = d3.max([
      ...totals.map(d => d.FINES),
      ...policeData.map(d => d.FINES),
      ...cameraData.map(d => d.FINES)
    ]);

    if (!yMax || yMax === 0) {
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

    const margin = { top: 40, right: 150, bottom: 70, left: 70 };
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

    const x = d3.scalePoint()
      .domain(allYears)
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, yMax]).nice()
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d.YEAR))
      .y(d => y(d.FINES));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(y));

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
      .text("Number of Fines");

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

    const allDots = [];
    if (showAll) allDots.push({ data: totals, color: "#007acc", label: "All" });
    if (selectedMethod === "All" || selectedMethod === "Police issued") allDots.push({ data: policeData, color: "#e74c3c", label: "Police issued" });
    if (selectedMethod === "All" || selectedMethod === "Mobile camera") allDots.push({ data: cameraData, color: "#27ae60", label: "Mobile camera" });

    allDots.forEach(group => {
      svg.append("path")
        .datum(group.data)
        .attr("fill", "none")
        .attr("stroke", group.color)
        .attr("stroke-width", 2)
        .attr("d", line);

      svg.selectAll(`.dot-${group.label.replace(/\s/g, "")}`)
        .data(group.data)
        .enter()
        .append("circle")
        .attr("class", `dot-${group.label.replace(/\s/g, "")}`)
        .attr("cx", d => x(d.YEAR))
        .attr("cy", d => y(d.FINES))
        .attr("r", 5)
        .attr("fill", group.color)
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          window.selectedState = { year: d.YEAR, method: group.label, jurisdiction: "All" };
          if (typeof updateBarChart === "function") updateBarChart(d.YEAR, group.label);
          if (typeof updateSummaryCards === "function") updateSummaryCards(d.YEAR, "All", group.label);
        })
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(150).style("opacity", 1);
          tooltip.html(`<strong>${group.label}</strong><br>Year: ${d.YEAR}<br>Fines: ${d.FINES.toLocaleString()}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));
    });

    const legend = svg.append("g").attr("transform", `translate(${width + 20}, 10)`);
    let yOffset = 0;
    allDots.forEach((group, i) => {
      legend.append("rect").attr("x", 0).attr("y", yOffset).attr("width", 12).attr("height", 12).attr("fill", group.color);
      legend.append("text").attr("x", 20).attr("y", yOffset + 10).text(group.label).style("font-size", "12px");
      yOffset += 20;
    });
  };

  window.updateLineChart("All", "All", "All");
});
