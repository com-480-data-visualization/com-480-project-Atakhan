function loadHeraldChart() {
  fetch("Map/json/herald.json")
    .then(res => res.json())
    .then(data => {
      const page = document.getElementById("page-herald");

      page.innerHTML = `
        <h2 id="herald-title" style="
          opacity: 0;
          transition: opacity 1s ease;
          font-family: Orbitron, sans-serif;
          font-size: 22px;
          color: #a259f7;
          text-align: center;
          margin-bottom: 20px;
        "></h2>
        <div class="dragon-card monster-layout">
          <img src="Map/assets/herald_draw.webp" alt="Herald" class="monster-image herald-img"/>
          <div id="chart-herald" class="monster-chart"></div>
        </div>
        <button class="return-btn" onclick="returnToMap()">⬅ Return to Map</button>
      `;

      page.style.background = "linear-gradient(135deg, #2c1e4a, #4b3a6a)";

      // Floating tooltip
      const tooltip = document.createElement("div");
      tooltip.id = "herald-tooltip";
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
        transition: "opacity 0.2s ease",
        backdropFilter: "blur(4px)",
        border: "1px solid #a259f7",
        boxShadow: "0 2px 12px #a259f755"
      });
      document.body.appendChild(tooltip);

      const stats = [
        {
          label: "📜", value: 1, color: "#a259f7", name: "Strategic Purpose",
          format: () => "Helps break enemy lines by dealing heavy damage to towers."
        },
        {
          label: "❤️", value: 1, color: "#1B2B34", name: "Health Points",
          format: () => `${data.HP} HP – Slaying the Herald early gives map pressure.`
        },
        {
          label: "⏰", value: 1, color: "#7c3aed", name: "First Spawn",
          format: () => "8:00 (appears in the Baron pit)"
        },
        {
          label: "🎁", value: 1, color: "#f7c259", name: "Drop",
          format: () => "Eye of Herald (allows you to summon the Herald to attack a tower)"
        }
      ];

      const width = 500;
      const height = 500;
      const radius = Math.min(width, height) / 2;

      const svg = d3.select("#chart-herald")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height)
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

      // Add this before drawing arcs
      const defs = svg.append("defs");
      const filter = defs.append("filter")
        .attr("id", "dropshadow-herald")
        .attr("height", "130%");
      filter.append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 2)
        .attr("stdDeviation", 3)
        .attr("flood-color", "#000")
        .attr("flood-opacity", 0.15);

      // Animate arc appearance
      g.append("path")
        .attr("filter", "url(#dropshadow-herald)")
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
            const titleEl = document.getElementById("herald-title");
            titleEl.textContent = `Pie Chart: ${data.name}`;
            titleEl.style.opacity = 1;
          }
        });

      // Emoji labels
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

      // Interactivity
      g.on("mouseenter", function(event, d) {
        d3.select(this).select("path")
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)");

        d3.select(this).select("text")
          .transition()
          .duration(200)
          .style("font-size", "40px");

        tooltip.textContent = `${d.data.name}: ${d.data.format()}`;
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