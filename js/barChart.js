// js/barChart.js

let updateBarChart;

d3.csv("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  updateBarChart = function (selectedYear = "All", selectedMethod = "All") {
    let filtered = data;

    if (selectedYear !== "All") {
      filtered = filtered.filter(d => d.YEAR === +selectedYear);
    }

    if (selectedMethod !== "All") {
      filtered = filtered.filter(d => d.DETECTION_METHOD === selectedMethod);
    }

    const grouped = d3.rollups(
      filtered,
      v => d3.sum(v, d => d.FINES),
      d => d.DETECTION_METHOD
    ).map(([method, total]) => ({ DETECTION_METHOD: method, FINES: total }))
     .sort((a, b) => b.FINES - a.FINES);

    d3.select("#barChartContainer").select("svg")?.remove();
    d3.select("#barChartContainer").select("div")?.remove();

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
      .domain(grouped.map(d => d.DETECTION_METHOD))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.FINES)]).nice()
      .range([height, 0]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-20)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    // Axis Labels
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

    // Tooltip
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

    // Bars
    svg.selectAll("rect")
      .data(grouped)
      .enter()
      .append("rect")
      .attr("x", d => x(d.DETECTION_METHOD))
      .attr("y", d => y(d.FINES))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.FINES))
      .attr("fill", "#3498db")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(
          `<strong>Method:</strong> ${d.DETECTION_METHOD}<br>
           <strong>Fines:</strong> ${d.FINES.toLocaleString()}${selectedYear !== "All" ? `<br><strong>Year:</strong> ${selectedYear}` : ""}`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  };

  updateBarChart("All", "All");
});
