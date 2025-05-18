// Ajout des éléments HTML pour la modale au début du fichier
document.body.insertAdjacentHTML('beforeend', `
  <div class="radar-modal-overlay"></div>
  <div class="radar-modal">
    <button class="radar-modal-close">×</button>
    <div class="radar-modal-content">
      <div class="radar-modal-title"></div>
      <div class="radar-modal-stats"></div>
    </div>
  </div>
`);

// Configuration de la modale
const modal = document.querySelector('.radar-modal');
const overlay = document.querySelector('.radar-modal-overlay');
const closeBtn = document.querySelector('.radar-modal-close');

// === ENGLISH LABELS ===
const englishLabels = [
  "Wards Placed", "Wards Destroyed", "First Blood", "Kills", "Deaths", "Assists",
  "Elite Monsters", "Dragons", "Heralds", "Towers Destroyed", "Total Gold",
  "Avg Level", "Total Experience", "Total Minions Killed", "Total Jungle Minions Killed"
];

// Textes personnalisés pour chaque point du radar
const customTexts = {
  'Wards Placed': {
    'Win': "Wards win games. Map awareness is key!",
    'Lose': "No wards, no vision, no win. GG."
  },
  'Wards Destroyed': {
    'Win': "Clearing enemy wards like a pro. Stealth mode: ON.",
    'Lose': "Enemy vision outlived your KDA."
  },
  'First Blood': {
    'Win': "First Blood? Set the tone, crush the game.",
    'Lose': "First Blood... but what next?"
  },
  'Kills': {
    'Win': "Dominated the scoreboard. GG!",
    'Lose': "Kills don't win games if you ignore objectives."
  },
  'Deaths': {
    'Win': "Low deaths, high impact. Smart play!",
    'Lose': "Respawn simulator. Press F."
  },
  'Assists': {
    'Win': "Team player! Your assists made the difference.",
    'Lose': "All the help, none of the glory."
  },
  'Elite Monsters': {
    'Win': "Secured Baron/Dragon. Objective control!",
    'Lose': "Lost every major objective. Ouch."
  },
  'Dragons': {
    'Win': "Stacked dragons for the win!",
    'Lose': "No drakes, no buffs, no hope."
  },
  'Heralds': {
    'Win': "Herald gave you the gold lead.",
    'Lose': "Enemy Herald = lost turret."
  },
  'Towers Destroyed': {
    'Win': "Demolition crew! Nexus next.",
    'Lose': "Still stuck on Tier 1 at 25 min?"
  },
  'Total Gold': {
    'Win': "Gold advantage = power spike!",
    'Lose': "Broke and out of options."
  },
  'Avg Level': {
    'Win': "Level lead = stat lead. Well played!",
    'Lose': "Behind in XP? Hard comeback."
  },
  'Total Experience': {
    'Win': "XP bar full. You're the boss now.",
    'Lose': "Just cannon fodder at this point."
  },
  'Total Minions Killed': {
    'Win': "CS king! Laning phase domination.",
    'Lose': "Missed more CS than you hit skillshots."
  },
  'Total Jungle Minions Killed': {
    'Win': "Jungle cleared, lanes ganked, game over.",
    'Lose': "Jungle diff? Or just missing?"
  }
};

function closeModal() {
  modal.style.display = 'none';
  overlay.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

function showModal(datasetLabel, statName, normalizedValue, rawValue) {
  const modalTitle = modal.querySelector('.radar-modal-title');
  const modalStats = modal.querySelector('.radar-modal-stats');
  modal.className = 'radar-modal ' + datasetLabel.toLowerCase();
  modalTitle.textContent = `${datasetLabel} - ${statName}`;
  const customText = customTexts[statName]?.[datasetLabel] || "Texte à personnaliser";
  modalStats.innerHTML = `<div class="radar-modal-explanation">${customText}</div>`;
  modal.style.display = 'block';
  overlay.style.display = 'block';
}

let globalChartData = null; // To store data for highlight function

function highlightTeam(team) {
  if (!globalChartData || !globalChartData.svg) return;
  const { svg, winDataD3, loseDataD3, pointRadius } = globalChartData;

  const winElements = svg.selectAll('.win-element');
  const loseElements = svg.selectAll('.lose-element');

  const winArea = svg.select('.radarArea.win');
  const loseArea = svg.select('.radarArea.lose');
  
  const winPoints = svg.selectAll('circle.win');
  const losePoints = svg.selectAll('circle.lose');

  if (team === 'Win') {
    winArea.style('fill-opacity', 0.4).style('stroke-width', '3px');
    loseArea.style('fill-opacity', 0.1).style('stroke-width', '1px');
    winPoints.style('opacity', 1).attr('r', pointRadius);
    losePoints.style('opacity', 0.5).attr('r', pointRadius * 0.8);
  } else {
    winArea.style('fill-opacity', 0.1).style('stroke-width', '1px');
    loseArea.style('fill-opacity', 0.4).style('stroke-width', '3px');
    winPoints.style('opacity', 0.5).attr('r', pointRadius * 0.8);
    losePoints.style('opacity', 1).attr('r', pointRadius);
  }

  const text = team === 'Win'
    ? '✅ In victory: more kills, assists, gold, and vision, fewer deaths.'
    : '❌ In defeat: fewer kills, more deaths, less vision and gold.';
  const box = document.getElementById('radarExplanation');
  box.textContent = text;
  box.classList.add('visible');
}

function renderRadarChart() {
  Promise.all([
    fetch('radar_x2_norm.json').then(r => r.json()),
    fetch('radar_raw.json').then(r => r.json())
  ]).then(([norm, raw]) => {
    const stats = englishLabels; // Use English labels
    const numAxes = stats.length;
    const angleSlice = Math.PI * 2 / numAxes;

    const winDataNorm = norm.winning_team;
    const loseDataNorm = norm.losing_team;
    const winDataRaw = raw.winning_team;
    const loseDataRaw = raw.losing_team;

    // Format data for D3
    const winDataD3 = winDataNorm.map((value, i) => ({
      axis: stats[i], value: value, rawValue: winDataRaw[i], team: 'Win'
    }));
    const loseDataD3 = loseDataNorm.map((value, i) => ({
      axis: stats[i], value: value, rawValue: loseDataRaw[i], team: 'Lose'
    }));

    const margin = { top: 100, right: 100, bottom: 100, left: 100 };
    const width = 700 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    d3.select("#radarChartD3Container").select("svg").remove();
    const svg = d3.select("#radarChartD3Container")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

    // Background color for the plot area
    svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .style("fill", "rgba(17, 24, 39, 1)"); // bg-gray-900

    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]); // Normalized data

    // Draw grid circles (subtle)
    const gridLevels = 5;
    for (let j = 0; j < gridLevels; j++) {
      const levelFactor = radius * ((j + 1) / gridLevels);
      svg.selectAll(".gridCircle" + j)
        .data([levelFactor])
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", d => d)
        .style("fill", "none")
        .style("stroke", "rgba(255, 255, 255, 0.1)")
        .style("stroke-dasharray", "2,2");
    }
    
    // Draw axes
    const axes = svg.selectAll(".axis")
      .data(stats)
      .enter()
      .append("g")
      .attr("class", "axis");

    axes.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("stroke", "rgba(255, 255, 255, 0.1)")
      .style("stroke-width", "1px");

    axes.append("text")
      .attr("class", "legend")
      .style("font-size", "12px")
      .style("fill", "rgba(255, 255, 255, 0.9)")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(1.25) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(1.25) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d);

    // Path generator
    const radarLine = d3.lineRadial()
      .angle((d, i) => angleSlice * i)
      .radius(d => rScale(d.value))
      .curve(d3.curveLinearClosed);

    // Draw Win area
    svg.append("path")
      .datum(winDataD3)
      .attr("class", "radarArea win win-element")
      .attr("d", radarLine)
      .style("fill", "url(#winGradient)")
      .style("stroke", "rgba(0,255,0,0.8)")
      .style("stroke-width", "2px");

    // Draw Lose area
    svg.append("path")
      .datum(loseDataD3)
      .attr("class", "radarArea lose lose-element")
      .attr("d", radarLine)
      .style("fill", "url(#loseGradient)")
      .style("stroke", "rgba(255,0,0,0.8)")
      .style("stroke-width", "2px");

    const pointRadius = 5;
    const hoverPointRadius = 8;

    // Function to draw points and handle interactions
    function drawPoints(dataset, teamClass) {
      const groups = svg.selectAll(`.point-group-${teamClass}`)
        .data(dataset)
        .enter().append("g")
        .attr("class", `point-group-${teamClass} ${teamClass}-element`)
        .attr("transform", (d, i) => {
          const x = rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
          const y = rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
          return `translate(${x},${y})`;
        });

      groups.append("circle")
        .attr("class", `radarPoint ${teamClass} ${teamClass}-element`)
        .attr("r", pointRadius)
        .style("fill", teamClass === 'Win' ? "rgba(0,255,0,1)" : "rgba(255,0,0,1)")
        .style("stroke", "#fff")
        .style("stroke-width", "1.5px")
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          showModal(d.team, d.axis, d.value, d.rawValue);
        })
        .on("mouseover", function(event, d) {
          d3.select(this).transition().duration(100).attr("r", hoverPointRadius);
          tooltip.style("opacity", 1)
                 .html(`<strong>${d.team} - ${d.axis}</strong><br/>Value: ${d.rawValue.toFixed(2)}<br/><em>Click for details</em>`)
                 .style("left", (event.pageX + 15) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
          d3.select(this).transition().duration(100).attr("r", pointRadius);
          tooltip.style("opacity", 0);
        });
    }

    drawPoints(winDataD3, 'Win');
    drawPoints(loseDataD3, 'Lose');
    
    // Tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "radartooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(26,26,26,0.9)")
        .style("color", "white")
        .style("border", "1px solid #555")
        .style("border-radius", "5px")
        .style("padding", "8px 12px")
        .style("font-size", "12px")
        .style("pointer-events", "none"); // So it doesn't interfere with mouse events on chart

    // Legend
    const legendData = [
        { name: "Win", color: "rgba(0,255,0,1)", areaColor: "rgba(0,255,0,0.4)" },
        { name: "Lose", color: "rgba(255,0,0,1)", areaColor: "rgba(255,0,0,0.4)" }
    ];
    const legend = svg.append("g")
      .attr("class", "chart-legend")
      .attr("transform", `translate(${-(width/2)}, ${-(height/2) - margin.top/2 - 15})`);

    legendData.forEach((item, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * 100}, 0)`);
      
      legendItem.append("circle")
        .attr("cx", 0)
        .attr("cy", -5)
        .attr("r", 6)
        .style("fill", item.color);
      
      legendItem.append("text")
        .attr("x", 15)
        .attr("y", -5)
        .text(item.name)
        .style("font-size", "14px")
        .style("fill", "white")
        .attr("alignment-baseline", "middle");
    });

    // === ADD NEON GRADIENTS ===
    const svgDefs = d3.select("#radarChartD3Container svg").append("defs");
    svgDefs.append("radialGradient")
      .attr("id", "winGradient")
      .attr("cx", "50%").attr("cy", "50%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "rgba(0,255,128,0.25)"},
        {offset: "100%", color: "rgba(0,255,0,0.10)"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    svgDefs.append("radialGradient")
      .attr("id", "loseGradient")
      .attr("cx", "50%").attr("cy", "50%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "rgba(255,64,64,0.25)"},
        {offset: "100%", color: "rgba(255,0,0,0.10)"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    globalChartData = { svg, winDataD3, loseDataD3, pointRadius }; // Store for highlightTeam
    highlightTeam('Win'); // Initial highlight

  }).catch(error => console.error("Error loading radar data:", error));
}

window.addEventListener('load', () => {
  if (document.getElementById("radarChartD3Container")) {
    renderRadarChart();
  }
});