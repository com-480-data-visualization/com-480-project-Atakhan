function loadDragonChart() {
  fetch("Map_Mael/json/dragon.json")
    .then(res => res.json())
    .then(data => {
      const page = document.getElementById("page-dragon");

      page.innerHTML = `
        <h2 id="dragon-title" style="
          opacity: 0;
          transition: opacity 1s ease;
          font-family: Orbitron, sans-serif;
          font-size: 22px;
          color: #00ccff;
          text-align: center;
          margin-bottom: 20px;
        "></h2>
        <div class="monster-layout">
          <img src="assets/dragon_draw.webp" alt="Dragon" class="monster-image dragon-img"/>
          <div id="chart-dragon" class="monster-chart"></div>
        </div>
        <button onclick="returnToMap()">⬅ Retour</button>
      `;

      // Tooltip flottant
      const tooltip = document.createElement("div");
      tooltip.id = "dragon-tooltip";
      Object.assign(tooltip.style, {
        position: "absolute",
        padding: "8px 12px",
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        borderRadius: "8px",
        fontFamily: "Orbitron, sans-serif",
        fontSize: "14px",
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.2s ease"
      });
      document.body.appendChild(tooltip);

      const stats = [
        { label: "📜", value: 1, color: "#F67250", key: "description", name: "Description" },
        { label: "❤️", value: 1, color: "#1B2B34", key: "HP", name: "Points de vie" },
        { label: "🛡️", value: 1, color: "#45B8AC", key: "Armor", name: "Défense", format: () => `${data.Armor} / ${data.MagicResist}` },
        { label: "💰", value: 1, color: "#F4C95D", key: "Gold", name: "Gold" },
        { label: "🏆", value: 1, color: "#66BB6A", key: "VictoryCorrelation", name: "Taux de victoire", format: () => `${data.VictoryCorrelation}%` }
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

      // Animation effet horloge
      g.append("path")
        .attr("fill", d => d.data.color)
        .attr("d", d3.arc()
          .innerRadius(radius - 80)
          .outerRadius(radius - 20)
          .startAngle(d => d.startAngle)
          .endAngle(d => d.startAngle))
        .transition()
        .delay((d, i) => i * 300)
        .duration(700)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate(d.startAngle, d.endAngle);
          return t => arc({ ...d, endAngle: interpolate(t) });
        })
        .on("end", function(_, i) {
          if (i === stats.length - 1) {
            const titleEl = document.getElementById("dragon-title");
            titleEl.textContent = `Statistiques : ${data.name}`;
            titleEl.style.opacity = 1;
          }
        });

      // Texte émojis au centre
      g.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .text(d => d.data.label)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("opacity", 0)
        .style("font-size", "32px")
        .style("fill", "#fff")
        .style("font-family", "Orbitron, sans-serif")
        .transition()
        .delay((d, i) => i * 300 + 500)
        .duration(400)
        .style("opacity", 1);

      // Interactions : agrandissement et tooltip
      g.on("mouseenter", function(event, d) {
        d3.select(this).select("path")
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)");

        d3.select(this).select("text")
          .transition()
          .duration(200)
          .style("font-size", "40px");

        const val = d.data.format ? d.data.format() : data[d.data.key];
        tooltip.textContent = `${d.data.name} : ${val}`;
        tooltip.style.opacity = 1;
      });

      g.on("mousemove", function(event) {
        tooltip.style.left = (event.pageX + 10) + "px";
        tooltip.style.top = (event.pageY - 20) + "px";
      });

      g.on("mouseleave", function() {
        d3.select(this).select("path")
          .transition()
          .duration(200)
          .attr("transform", "scale(1)");

        d3.select(this).select("text")
          .transition()
          .duration(200)
          .style("font-size", "32px");

        tooltip.style.opacity = 0;
      });
    });
}
