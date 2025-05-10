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

document.addEventListener("DOMContentLoaded", () => {
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
});
