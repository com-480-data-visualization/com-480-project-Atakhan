document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chart-d3");
  if (!container) return;

  const width = 500;
  const height = 500;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const data = [
    { label: "📜", value: 1, color: "#F67250" },
    { label: "❤️", value: 1, color: "#1B2B34" },
    { label: "🛡️", value: 1, color: "#45B8AC" },
    { label: "💰", value: 1, color: "#F4C95D" },
    { label: "🏆", value: 1, color: "#66BB6A" }
  ];

  const arc = d3.arc()
    .innerRadius(radius - 80)
    .outerRadius(radius - 20);

  const pie = d3.pie().sort(null).value(d => d.value);

  const g = svg.selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Applique l'effet "aiguille" sur chaque arc
  g.append("path")
    .attr("fill", d => d.data.color)
    .attr("d", d3.arc()
      .innerRadius(radius - 80)
      .outerRadius(radius - 20)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.startAngle) // démarre fermé
    )
    .transition()
    .delay((d, i) => i * 300)
    .duration(600)
    .attrTween("d", function(d) {
      const interpolate = d3.interpolate(d.startAngle, d.endAngle);
      return t => {
        const newArc = Object.assign({}, d);
        newArc.endAngle = interpolate(t);
        return arc(newArc);
      };
    });

  // Texte (emoji) au centre de chaque arc
  g.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .text(d => d.data.label)
    .style("opacity", 0)
    .style("font-size", "26px")
    .style("fill", "#fff")
    .style("font-family", "Orbitron, sans-serif")
    .transition()
    .delay((d, i) => i * 300 + 500)
    .duration(400)
    .style("opacity", 1);
});
