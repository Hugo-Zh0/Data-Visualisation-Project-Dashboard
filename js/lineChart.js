// js/lineChart.js

d3.csv("data/mobile_fines_by_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  // Slightly smaller height to avoid cutting off chart at bottom
  const margin = { top: 30, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 240 - margin.top - margin.bottom;

  const svg = d3.select("#lineChartContainer")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.YEAR))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.FINES)]).nice()
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.YEAR))
    .y(d => y(d.FINES));

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#007acc")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.YEAR))
    .attr("cy", d => y(d.FINES))
    .attr("r", 3)
    .attr("fill", "#007acc");
});
