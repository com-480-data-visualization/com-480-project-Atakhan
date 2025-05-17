// mapviz.js

// Assure-toi d'inclure D3.js dans ton HTML :
// <script src="https://d3js.org/d3.v7.min.js"></script>

const stats = {
  dragon: "Dragon\nHP: 3500\nRespawn: 5 min\nBuff: Elemental Soul",
  herald: "Rift Herald\nHP: 8000\nFirst spawn: 8:00\nDrops: Eye of Herald",
  minion: "Minion\nHP: 450–1000\nGold: 14–60\nSpawns every 30s",
  tower: "Tower\nHP: 5000–5500\nArmor: +40 early\nGold: 250 team gold + 150 local gold\nFirst Tower: +400 bonus gold"
};

const monsters = [
  {
    id: "dragon",
    src: "assets/dragon.png",
    alt: "Dragon",
    x: 505,
    y: 330,
    width: 90
  },
  {
    id: "herald",
    src: "assets/Rift_Herald_Render.webp",
    alt: "Herald",
    x: 300,
    y: 130,
    width: 90
  },
  {
    id: "minion",
    src: "assets/minion.png",
    alt: "Minion",
    x: 412,
    y: 217,
    width: 70
  },
  {
    id: "tower",
    src: "assets/tower.png",
    alt: "Tower",
    x: 335,
    y: 240,
    width: 52
  }
];

function generateInteractiveMapD3() {
  const container = d3.select("#page8");
  container.html("");
  container.append("h1")
    .text("Summoner's Rift : Explore the Interactive Map!")
    .style("font-family", "'Segoe UI', 'Arial', 'sans-serif'")
    .style("font-size", "2.8rem")
    .style("font-weight", "bold")
    .style("background", "linear-gradient(90deg, #00c3ff 0%, #ffff1c 100%)")
    .style("-webkit-background-clip", "text")
    .style("-webkit-text-fill-color", "transparent")
    .style("text-shadow", "2px 2px 8px #2228, 0 2px 20px #00c3ff44")
    .style("margin-bottom", "28px");

  const mapContainer = container.append("div")
    .attr("class", "map-container")
    .style("position", "relative")
    .style("width", "900px")
    .style("height", "600px");

  mapContainer.append("img")
    .attr("src", "assets/Map.webp")
    .attr("class", "map")
    .attr("alt", "Summoner's Rift Map")
    .style("width", "100%")
    .style("height", "100%")
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0);

  // Ajout des monstres
  mapContainer.selectAll(".monster")
    .data(monsters)
    .enter()
    .append("img")
    .attr("class", "monster")
    .attr("id", d => d.id)
    .attr("src", d => d.src)
    .attr("alt", d => d.alt)
    .style("position", "absolute")
    .style("top", d => d.y + "px")
    .style("left", d => d.x + "px")
    .style("width", d => d.width + "px")
    .style("cursor", "pointer")
    .style("box-sizing", "border-box");

  // Tooltip D3
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "map-tooltip")
    .style("position", "absolute")
    .style("display", "none")
    .style("background", "rgba(30,30,40,0.95)")
    .style("color", "#fff")
    .style("padding", "10px 14px")
    .style("border-radius", "8px")
    .style("pointer-events", "none")
    .style("font-family", "monospace")
    .style("font-size", "15px")
    .style("box-shadow", "0 2px 12px #0008");

  mapContainer.selectAll(".monster")
    .on("mousemove", function(event, d) {
      const id = d3.select(this).attr("id");
      tooltip.html(`<pre>${stats[id]}</pre><div style=\"color:#00aaff; font-size: 12px; margin-top: 4px;\">Click for more details</div>`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 60) + "px")
        .style("display", "block");
    })
    .on("mouseleave", function() {
      tooltip.style("display", "none");
    })
    .on("click", function(event, d) {
      const id = d3.select(this).attr("id");
      if (typeof showMonsterDetails === 'function') {
        showMonsterDetails(id);
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  generateInteractiveMapD3();
});
