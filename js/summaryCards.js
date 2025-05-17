// js/summaryCards.js

d3.csv("data/mobile_fines_summary.csv").then(data => {
  const container = d3.select("#summary-cards");

  data.forEach(d => {
    const card = container.append("div")
      .attr("class", "summary-card");

    card.append("h3").text(d.Metric);
    card.append("p").text(Number(d.Value).toLocaleString());
  });
});
