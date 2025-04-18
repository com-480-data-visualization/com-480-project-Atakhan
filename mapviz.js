const tooltip = document.createElement("div");
tooltip.className = "map-tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

const stats = {
    dragon: "Dragon\nHP: 3500\nRespawn: 5 min\nBuff: Elemental Soul",
    herald: "Rift Herald\nHP: 8000\nFirst spawn: 8:00\nDrops: Eye of Herald",
    minion: "Minion\nHP: 450–1000\nGold: 14–60\nSpawns every 30s"
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.monster').forEach(monster => {
        monster.addEventListener('mousemove', (e) => {
            const id = monster.id;
            tooltip.textContent = stats[id];
            tooltip.style.top = (e.pageY - 60) + "px";
            tooltip.style.left = (e.pageX + 15) + "px";
            tooltip.style.display = "block";
        });

        monster.addEventListener('mouseleave', () => {
            tooltip.style.display = "none";
        });
    });
});
