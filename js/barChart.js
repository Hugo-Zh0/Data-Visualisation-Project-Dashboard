// js/barChart.js

d3.csv("data/mobile_fines_by_detection_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  const margin = { top: 40, right: 20, bottom: 60, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 260 - margin.top - margin.bottom;

  const svg = d3.select("#barChartContainer")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const methods = Array.from(new Set(data.map(d => d.DETECTION_METHOD)));
  const years = Array.from(new Set(data.map(d => d.YEAR)));

  const x0 = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain(methods)
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.FINES)])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(methods)
    .range(d3.schemeTableau10);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Axis Labels
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .text("Year");

  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -height / 2)
    .attr("y", -50)
    .text("Number of Fines");

  // Tooltip container
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

  const grouped = d3.groups(data, d => d.YEAR);

  svg.selectAll("g.year")
    .data(grouped)
    .enter()
    .append("g")
    .attr("class", "year")
    .attr("transform", d => `translate(${x0(d[0])},0)`)
    .selectAll("rect")
    .data(d => d[1])
    .enter()
    .append("rect")
    .attr("x", d => x1(d.DETECTION_METHOD))
    .attr("y", d => y(d.FINES))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.FINES))
    .attr("fill", d => color(d.DETECTION_METHOD))
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(150).style("opacity", 1);
      tooltip.html(
        `<strong>Year:</strong> ${d.YEAR}<br>
         <strong>Method:</strong> ${d.DETECTION_METHOD}<br>
         <strong>Fines:</strong> ${d.FINES.toLocaleString()}`
      )
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 140}, 0)`);

  methods.forEach((method, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(method));

    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 10)
      .text(method)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });
});
