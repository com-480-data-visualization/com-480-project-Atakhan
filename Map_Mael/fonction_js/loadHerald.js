
function loadHeraldChart() {
  fetch("Map_Mael/json/herald.json")
    .then(res => res.json())
    .then(data => {
      const labels = ["Description", "PV", "Armure + Résistance Magique", "Gold", "Corrélation Victoire"];
      const values = [1, 1, 1, 1, 1];
      const hoverTexts = [
        data.description || "-",
        `PV : ${data.HP}`,
        `Armure : ${data.Armor}, RM : ${data.MagicResist}`,
        `Gold : ${data.Gold}`,
        `Taux de victoire : ${data.VictoryCorrelation}%`
      ];
      const colors = ["#F67250", "#1B2B34", "#45B8AC", "#F4C95D", "#66BB6A"];

      Plotly.newPlot("chart-herald", [{
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
          family: "Rubik, sans-serif",
          size: [16, 16, 16, 16, 16],
          color: "white"
        }
      }], {
        title: {
          text: `Statistiques : ${data.name}`,
          font: { family: "Rubik, sans-serif", size: 22, color: "#fff" }
        },
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
      });
    });
}
