// js/barChart.js

d3.csv("data/mobile_fines_by_detection_year.csv").then(data => {
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  const margin = { top: 30, right: 20, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select("#barChartContainer")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
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

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0).tickFormat(d3.format("d")));

  svg.append("g").call(d3.axisLeft(y));

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
    .attr("fill", d => color(d.DETECTION_METHOD));
});
