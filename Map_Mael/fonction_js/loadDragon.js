function loadDragonChart() {
  fetch("Map_Mael/json/dragon.json")
    .then(res => res.json())
    .then(data => {
      const page = document.getElementById("page-dragon");

      // Injecte image + graphique, sans <h1> général
      page.innerHTML = `
        <div class="monster-layout">
          <img src="assets/dragon_draw.webp" alt="Dragon" class="monster-image dragon-img"/>
          <div id="chart-dragon" class="monster-chart"></div>
        </div>
        <button onclick="returnToMap()">⬅ Retour</button>
      `;

      const labels = ["📜", "❤️", "🛡️", "💰", "🏆"];
const values = [1, 1, 1, 1, 1];
const hoverTexts = [
  data.description || "-",
  `PV : ${data.HP}`,
  `Armure : ${data.Armor}, RM : ${data.MagicResist}`,
  `Gold : ${data.Gold}`,
  `Taux de victoire : ${data.VictoryCorrelation}%`
];
      const colors = ["#F67250", "#1B2B34", "#45B8AC", "#F4C95D", "#66BB6A"];

      Plotly.newPlot("chart-dragon", [{
        type: "pie",
        values: values,
        labels: labels,
        textinfo: "label",
        textposition: "inside",
        hole: 0.5,
        marker: {
          colors: colors,
          line: { color: "black", width: 2 }
        },
        hoverinfo: "text",
        hovertext: hoverTexts,
        insidetextfont: {
          family: "Orbitron, sans-serif",
          size: [25, 25, 25, 25, 25],
          color: "white"
        }
      }], {
        title: {
          text: `Pie statistics: ${data.name}`,
          font: { family: "Orbitron, sans-serif", size: 22, color: "#fff" }
        },
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
      });
    });
}
