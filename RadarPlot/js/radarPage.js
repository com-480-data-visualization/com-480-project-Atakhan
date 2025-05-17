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

// Textes personnalisés pour chaque point du radar
const customTexts = {
  'WardsPlaced': {
    'Win': "Wards win wars. Ever heard of map awareness, bro?",
    'Lose': "No wards, no clue, no win. GG."
  },
  'WardsDestroyed': {
    'Win': "Sniping enemy wards like a ninja. Stealth mode: ON.",
    'Lose': "Their wards lived longer than your KDA."
  },
  'FirstBlood': {
    'Win': "First Blood? Alpha move. Set the tone, crush the game.",
    'Lose': "Cool First Blood. And then… what happened?"
  },
  'Kills': {
    'Win': "Deleted them all. Ctrl+Alt+Delete style.",
    'Lose': "10 kills, 0 objectives. Classic solo queue tragedy."
  },
  'Deaths': {
    'Win': "You can't lose fights if you're not dead. Easy math.",
    'Lose': "Respawn simulator 2025. Press F."
  },
  'Assists': {
    'Win': "Assist king. You're the reason they got fed.",
    'Lose': "All the help, none of the credit. Life's tough."
  },
  'EliteMonsters': {
    'Win': "Took Baron. Took their base. Took their pride.",
    'Lose': "Let them have Baron? Might as well /ff at 20."
  },
  'Dragons': {
    'Win': "Stacking drakes like Pokémon badges. Gotta catch 'em all.",
    'Lose': "No drakes, no buffs, no hope."
  },
  'Heralds': {
    'Win': "Herald said hello to your gold lead.",
    'Lose': "Enemy used Herald. Your turret said bye."
  },
  'TowersDestroyed': {
    'Win': "Demolition squad reporting in. Next stop: Nexus.",
    'Lose': "Still hitting mid Tier 1 at 25 min?"
  },
  'TotalGold': {
    'Win': "Swimming in gold. Jeff Bezos of Summoner's Rift.",
    'Lose': "Your wallet's as empty as your map control."
  },
  'AvgLevel': {
    'Win': "Level diff = skill diff. It's science.",
    'Lose': "Behind in XP? Might as well play with one hand."
  },
  'TotalExperience': {
    'Win': "XP bar full. You're the boss fight now.",
    'Lose': "You're just cannon fodder at this point."
  },
  'TotalMinionsKilled': {
    'Win': "CS god. Laning phase was your playground.",
    'Lose': "You missed more CS than you landed skillshots."
  },
  'TotalJungleMinionsKilled': {
    'Win': "Jungle cleared, lanes ganked, game over.",
    'Lose': "Jungle diff? Nah, jungle disappeared."
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
    ? '✅ En victoire : plus de kills, assists, or et vision, moins de deaths.'
    : '❌ En défaite : moins de kills, plus de deaths, moins de vision et gold.';
  const box = document.getElementById('radarExplanation');
  box.textContent = text;
  box.classList.add('visible');
}

function renderRadarChart() {
  Promise.all([
    fetch('radar_x2_norm.json').then(r => r.json()),
    fetch('radar_raw.json').then(r => r.json())
  ]).then(([norm, raw]) => {
    const stats = norm.labels;
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
      .style("fill", "rgba(0,255,0,0.15)")
      .style("stroke", "rgba(0,255,0,0.8)")
      .style("stroke-width", "2px");

    // Draw Lose area
    svg.append("path")
      .datum(loseDataD3)
      .attr("class", "radarArea lose lose-element")
      .attr("d", radarLine)
      .style("fill", "rgba(255,0,0,0.15)")
      .style("stroke", "rgba(255,0,0,0.8)")
      .style("stroke-width", "2px");

    const pointRadius = 5;
    const hoverPointRadius = 8;

    // Function to draw points and handle interactions
    function drawPoints(dataset, teamClass) {
      const points = svg.selectAll(`.point-${teamClass}`)
        .data(dataset)
        .enter().append("circle")
        .attr("class", `radarPoint ${teamClass} ${teamClass}-element`)
        .attr("r", pointRadius)
        .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("fill", teamClass === 'Win' ? "rgba(0,255,0,1)" : "rgba(255,0,0,1)")
        .style("stroke", "#fff")
        .style("stroke-width", "1.5px")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          showModal(d.team, d.axis, d.value, d.rawValue);
        })
        .on("mouseover", function(event, d) {
          d3.select(this).transition().duration(100).attr("r", hoverPointRadius);
          // Basic tooltip (can be expanded)
          tooltip.style("opacity", 1)
                 .html(`<strong>${d.team} - ${d.axis}</strong><br/>Value: ${d.rawValue.toFixed(2)}<br/><em>Click for details</em>`)
                 .style("left", (event.pageX + 15) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event,d) {
          d3.select(this).transition().duration(100).attr("r", pointRadius);
          tooltip.style("opacity", 0);
        });
      
      // Pulse animation
      points.each(function pulseAnimation() {
          const point = d3.select(this);
          (function repeat() {
              point.transition()
                  .duration(800)
                  .attr("r", pointRadius * 1.5)
                  .transition()
                  .duration(800)
                  .attr("r", pointRadius)
                  .on("end", repeat);
          })();
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


    globalChartData = { svg, winDataD3, loseDataD3, pointRadius }; // Store for highlightTeam
    highlightTeam('Win'); // Initial highlight

  }).catch(error => console.error("Error loading radar data:", error));
}

window.addEventListener('load', () => {
  if (document.getElementById("radarChartD3Container")) {
    renderRadarChart();
  }
});