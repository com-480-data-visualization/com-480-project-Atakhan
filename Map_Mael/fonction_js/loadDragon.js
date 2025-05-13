function loadDragonChart() {
  fetch("Map_Mael/json/dragon.json")
    .then(res => res.json())
    .then(data => {
      const page = document.getElementById("page-dragon");

      // Remplace le contenu de la page
      page.innerHTML = `
        <div class="monster-layout">
          <img src="assets/dragon_draw.webp" alt="Dragon" class="monster-image dragon-img"/>
          <div id="chart-dragon" class="monster-chart"></div>
        </div>
        <button onclick="returnToMap()">⬅ Retour</button>
      `;

      // Données du graphique
      const stats = [
        { label: "📜", value: 1, color: "#F67250" },
        { label: "❤️", value: 1, color: "#1B2B34" },
        { label: "🛡️", value: 1, color: "#45B8AC" },
        { label: "💰", value: 1, color: "#F4C95D" },
        { label: "🏆", value: 1, color: "#66BB6A" }
      ];

      const width = 500;
      const height = 500;
      const radius = Math.min(width, height) / 2;

      const svg = d3.select("#chart-dragon")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const arc = d3.arc()
        .innerRadius(radius - 80)
        .outerRadius(radius - 20);

      const pie = d3.pie().sort(null).value(d => d.value);
      const arcs = pie(stats);

      const g = svg.selectAll(".arc")
        .data(arcs)
        .enter()
        .append("g")
        .attr("class", "arc");

      // Animation progressive : chaque arc s'étend depuis 0
      g.append("path")
        .attr("fill", d => d.data.color)
        .attr("d", d3.arc()
          .innerRadius(radius - 80)
          .outerRadius(radius - 20)
          .startAngle(d => d.startAngle)
          .endAngle(d => d.startAngle)) // démarre à 0
        .transition()
        .delay((d, i) => i * 300)
        .duration(1500)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate(d.startAngle, d.endAngle);
          return t => {
            const newArc = { ...d, endAngle: interpolate(t) };
            return arc(newArc);
          };
        });

      // Émojis au centre des arcs
      g.append("text")
  .attr("transform", d => `translate(${arc.centroid(d)})`)
  .text(d => d.data.label)
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "central") // ✅ centre verticalement
  .style("opacity", 0)
  .style("font-size", "32px") // 🧼 légèrement agrandi pour lisibilité
  .style("fill", "#fff")
  .style("font-family", "Orbitron, sans-serif")

        .transition()
        .delay((d, i) => i * 300 + 500)
        .duration(300)
        .style("opacity", 1);
    });
}
