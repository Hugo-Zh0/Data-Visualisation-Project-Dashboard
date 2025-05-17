// js/barChart.js

d3.csv("data/mobile_fines_by_detection_year.csv").then(data => {
  // Step 1: Parse numbers
  data.forEach(d => {
    d.YEAR = +d.YEAR;
    d.FINES = +d.FINES;
  });

  // Step 2: Setup
  const margin = { top: 40, right: 30, bottom: 60, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#barChartContainer")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Step 3: Get detection methods and years
  const methods = Array.from(new Set(data.map(d => d.DETECTION_METHOD)));
  const years = Array.from(new Set(data.map(d => d.YEAR)));

  // Step 4: Scales
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
    .range(["#007acc", "#f39c12"]);

  // Step 5: Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Step 6: Group bars by year
  const dataGrouped = d3.groups(data, d => d.YEAR);

  svg.selectAll("g.year")
    .data(dataGrouped)
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

  // Step 7: Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 0)`);

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

  // Step 8: Axis Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .text("Number of Fines");
});
