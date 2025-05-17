// mapviz.js

const tooltip = document.createElement("div");
tooltip.className = "map-tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

const stats = {
  dragon: "Dragon\nHP: 3500\nRespawn: 5 min\nBuff: Elemental Soul",
  herald: "Rift Herald\nHP: 8000\nFirst spawn: 8:00\nDrops: Eye of Herald",
  minion: "Minion\nHP: 450–1000\nGold: 14–60\nSpawns every 30s",
  tower: "Tower\nHP: 5000–5500\nArmor: +40 early\nGold: 250 team gold + 150 local gold\nFirst Tower: +400 bonus gold"
};

// Fonction qui génère dynamiquement le contenu HTML de la page 8
function generateInteractiveMap() {
  const container = document.getElementById("page8");
  container.innerHTML = `
    <h1>Interactive Summoner's Rift</h1>
    <div class="map-container">
      <img src="assets/Map.webp" class="map" alt="Summoner's Rift Map">
      <img src="assets/dragon.png" class="monster" id="dragon" alt="Dragon" style="top: 350px; left: 540px;">
      <img src="assets/Rift_Herald_Render.webp" class="monster" id="herald" alt="Herald" style="top: 150px; left: 325px;">
      <img src="assets/minion.png" class="monster" id="minion" alt="Minion" style="top: 230px; left: 422px;">
      <img src="assets/tower.png" class="monster" id="tower" alt="Tower" style="top: 280px; left: 335px; width: 40px;">
    </div>
  `;
}

// Fonction qui attache les événements de survol et clic aux monstres
function attachMonsterEvents() {
  document.querySelectorAll('.monster').forEach(monster => {
    const id = monster.id;

    monster.addEventListener('mousemove', (e) => {
      tooltip.innerHTML = `<pre>${stats[id]}</pre><div style="color:#00aaff; font-size: 12px; margin-top: 4px;">Click for more details</div>`;
      tooltip.style.top = (e.pageY - 60) + "px";
      tooltip.style.left = (e.pageX + 15) + "px";
      tooltip.style.display = "block";
    });

    monster.addEventListener('mouseleave', () => {
      tooltip.style.display = "none";
    });

    monster.addEventListener('click', () => {
      showMonsterDetails(id);  // Fonction dans monsterDetails.js
    });
  });
}

// Initialise la page 8 dynamiquement au chargement
document.addEventListener("DOMContentLoaded", () => {
  generateInteractiveMap();
  attachMonsterEvents();
});
