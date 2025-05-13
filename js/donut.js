document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chart-d3");
  if (!container) return;

  // Responsive dimensions
  const width = container.offsetWidth || 500;
  const height = width; // keep it square
  const radius = Math.min(width, height) / 2;

  // Remove any previous SVG (for re-renders)
  d3.select(container).selectAll("svg").remove();

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("role", "img")
    .attr("aria-label", "Donut chart displaying emoji categories")
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Add chart title above the SVG
  const titleClass = 'donut-title';
  d3.select(container).selectAll('.' + titleClass).remove();
  d3.select(container)
    .insert('div', ':first-child')
    .attr('class', titleClass)
    .style('text-align', 'center')
    .style('font-size', width > 400 ? '2rem' : '1.2rem')
    .style('font-family', 'Orbitron, sans-serif')
    .style('margin-bottom', '8px')
    .style('color', '#00ccff')
    .text('Emoji Category Distribution');

  // Harmonious color palette (ColorBrewer Set2)
  const palette = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
  const data = [
    { label: "📜", value: 1, color: palette[0] },
    { label: "❤️", value: 1, color: palette[1] },
    { label: "🛡️", value: 1, color: palette[2] },
    { label: "💰", value: 1, color: palette[3] },
    { label: "🏆", value: 1, color: palette[4] }
  ];

  // Responsive font size
  const baseFontSize = Math.max(16, Math.round(width / 25));

  // Add drop shadow filter
  d3.select(container).selectAll('svg defs').remove();
  const defs = svg.append('defs');
  const filter = defs.append('filter')
    .attr('id', 'donut-dropshadow')
    .attr('height', '130%');
  filter.append('feDropShadow')
    .attr('dx', 0)
    .attr('dy', 2)
    .attr('stdDeviation', 3)
    .attr('flood-color', '#000')
    .attr('flood-opacity', 0.15);

  const arc = d3.arc()
    .innerRadius(radius - 80)
    .outerRadius(radius - 20);

  const pie = d3.pie().sort(null).value(d => d.value);

  const g = svg.selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc")
    .attr("tabindex", 0)
    .attr("role", "listitem")
    .attr("aria-label", d => `${d.data.label}: ${d.data.value}`);

  // Tooltip div
  let tooltip = d3.select(container).select(".donut-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select(container)
      .append("div")
      .attr("class", "donut-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "6px 12px")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("font-size", "16px")
      .style("opacity", 0);
  }

  // Draw arcs with animation and drop shadow
  g.append("path")
    .attr("fill", d => d.data.color)
    .attr("filter", "url(#donut-dropshadow)")
    .attr("d", d3.arc()
      .innerRadius(radius - 80)
      .outerRadius(radius - 20)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.startAngle)
    )
    .on("mouseover focus", function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("d", d3.arc()
          .innerRadius(radius - 85)
          .outerRadius(radius - 10)
        );
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.data.label}</strong>: ${d.data.value}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout blur", function() {
      d3.select(this)
        .transition().duration(200)
        .attr("d", arc);
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition()
    .delay((d, i) => i * 300)
    .duration(600)
    .ease(d3.easeElastic)
    .attrTween("d", function(d) {
      const interpolate = d3.interpolate(d.startAngle, d.endAngle);
      return t => {
        const newArc = Object.assign({}, d);
        newArc.endAngle = interpolate(t);
        return arc(newArc);
      };
    });

  // Emoji text at arc centroid with responsive font size
  g.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .text(d => d.data.label)
    .style("opacity", 0)
    .style("font-size", `${baseFontSize}px`)
    .style("fill", "#fff")
    .style("font-family", "Orbitron, sans-serif")
    .attr("pointer-events", "none")
    .transition()
    .delay((d, i) => i * 300 + 500)
    .duration(400)
    .style("opacity", 1);

  // Add central label (total)
  svg.selectAll('.donut-center-label').remove();
  svg.append('text')
    .attr('class', 'donut-center-label')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('font-size', width > 400 ? '2.2rem' : '1.2rem')
    .style('font-family', 'Orbitron, sans-serif')
    .style('fill', '#333')
    .text('Total');

  // --- Enhanced Legend Below the Donut Chart ---
  d3.select(container).selectAll('.donut-legend').remove();
  const legend = d3.select(container)
    .append('div')
    .attr('class', 'donut-legend')
    .style('display', 'flex')
    .style('flex-wrap', 'wrap')
    .style('justify-content', 'center')
    .style('gap', '18px')
    .style('margin-top', '24px')
    .style('background', '#fff')
    .style('border', '1px solid #eee')
    .style('border-radius', '12px')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.06)')
    .style('padding', '16px 24px');

  legend.selectAll('div')
    .data(data)
    .enter()
    .append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '8px')
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      // Highlight corresponding arc
      g.selectAll('path')
        .filter(p => p.data.label === d.label)
        .transition().duration(200)
        .attr('d', d3.arc()
          .innerRadius(radius - 85)
          .outerRadius(radius - 10)
        );
    })
    .on('mouseout', function(event, d) {
      g.selectAll('path')
        .filter(p => p.data.label === d.label)
        .transition().duration(200)
        .attr('d', arc);
    })
    .html(d => `
      <span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:${d.color};margin-right:4px;"></span>
      <span style="font-size:22px;">${d.label}</span>
      <span style="font-size:15px;color:#444;">${d.value}</span>
    `);
});
