// Champion Explorer Filters Explanation Visualization (EN)

document.addEventListener('DOMContentLoaded', function () {
  const container = d3.select('#champ-filters-viz');
  if (container.empty()) return;

  // Filters to illustrate (EN)
  const filters = [
    {
      key: 'search',
      label: 'Search',
      icon: '\u{1F50D}', // Magnifier
      color: '#38bdf8',
      desc: "Type a champion's name to find them instantly."
    },
    {
      key: 'class',
      label: 'Class',
      icon: '\u{1F396}', // Medal
      color: '#fbbf24',
      desc: "Filter by the champion's main class (e.g., Marksman, Assassin, Tank, etc.)."
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      icon: '\u{1F3C6}', // Trophy
      color: '#f472b6',
      desc: 'Show champions by their difficulty level.'
    },
    {
      key: 'role',
      label: 'Role',
      icon: '\u{1F464}', // Silhouette
      color: '#34d399',
      desc: 'Select the roles played by the champion (Top, Jungle, Middle, Bottom, Support).'
    },
    {
      key: 'range',
      label: 'Range type',
      icon: '\u{1F52B}', // Gun (for range)
      color: '#818cf8',
      desc: 'Choose between ranged or melee champions.'
    },
    {
      key: 'reset',
      label: 'Reset',
      icon: '\u{1F504}', // Reset arrows
      color: '#e43f5a',
      desc: 'Click to clear all filters and show all champions.'
    }
  ];

  // Responsive SVG dimensions
  const width = Math.min(700, container.node().offsetWidth || 700);
  const height = 320;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2.5;

  // Circular positioning
  const angleStep = (2 * Math.PI) / filters.length;

  // SVG creation
  const svg = container.append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'champ-filter-tooltip')
    .style('position', 'absolute')
    .style('background', '#181e2a')
    .style('color', '#a7f3d0')
    .style('padding', '1em 1.2em')
    .style('border-radius', '0.8em')
    .style('box-shadow', '0 2px 16px #10b98144')
    .style('font-size', '1.08em')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000);

  // Groups for each bubble
  const bubbles = svg.selectAll('g.champ-filter-bubble-group')
    .data(filters)
    .enter()
    .append('g')
    .attr('class', 'champ-filter-bubble-group')
    .attr('transform', (d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.85;
      return `translate(${centerX},${centerY})`;
    })
    .style('opacity', 0);

  // Appearance animation
  bubbles.transition()
    .delay((d, i) => i * 120)
    .duration(700)
    .attr('transform', (d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.85;
      return `translate(${x},${y})`;
    })
    .style('opacity', 1);

  // Colored circles
  bubbles.append('circle')
    .attr('r', 44)
    .attr('fill', d => d.color)
    .attr('class', 'champ-filter-bubble')
    .attr('filter', 'url(#champ-filter-shadow)');

  // Icons (emoji)
  bubbles.append('text')
    .attr('y', 8)
    .attr('text-anchor', 'middle')
    .attr('font-size', '2.2em')
    .attr('font-family', 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif')
    .text(d => d.icon);

  // Labels
  bubbles.append('text')
    .attr('y', 60)
    .attr('text-anchor', 'middle')
    .attr('class', 'champ-filter-label')
    .text(d => d.label);

  // Tooltip interactions
  bubbles.on('mouseenter', function (event, d) {
    d3.select(this).select('circle')
      .transition().duration(150)
      .attr('r', 52);
    tooltip.transition().duration(120).style('opacity', 1);
    tooltip.html(`<b style='color:${d.color}'>${d.label}</b><br><span>${d.desc}</span>`);
  })
  .on('mousemove', function (event) {
    tooltip.style('left', (event.pageX + 18) + 'px')
           .style('top', (event.pageY - 18) + 'px');
  })
  .on('mouseleave', function () {
    d3.select(this).select('circle')
      .transition().duration(150)
      .attr('r', 44);
    tooltip.transition().duration(180).style('opacity', 0);
  });

  // Responsive: resize SVG on window resize
  window.addEventListener('resize', () => {
    const newWidth = Math.min(700, container.node().offsetWidth || 700);
    svg.attr('width', '100%').attr('viewBox', `0 0 ${newWidth} ${height}`);
  });
}); 