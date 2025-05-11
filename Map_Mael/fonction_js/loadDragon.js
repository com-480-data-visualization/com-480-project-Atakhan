function loadDragon() {
  fetch("Map_Mael/json/monster_stats.json")
    .then(res => res.json())
    .then(data => {
      const dragon = data.dragon;
      const plotDiv = document.getElementById("plotlyCycleChart");

      const values = [1, 1, 1, 1, 1];
      const labels = [
        "Description",
        "PV",
        "Armure + Résistance Magique",
        "Gold",
        "Corrélation Victoire"
      ];
      const hoverTexts = [
        "Buffs élémentaires. Clé pour l'Âme du Dragon.",
        `PV : ${dragon.HP}`,
        `Armure : ${dragon.Armor}, RM : ${dragon.MagicResist}`,
        `Gold : ${dragon.Gold}`,
        `Taux de victoire : ${dragon.VictoryCorrelation}%`
      ];
      const colors = ["#F67250", "#1B2B34", "#45B8AC", "#F4C95D", "#66BB6A"];
      const initialFontSize = 16;
      const hoverFontSize = 22;

      const dataPlot = [{
        type: "pie",
        values: values,
        labels: labels,
        textinfo: "label",
        textposition: "inside",
        hole: 0.5,
        pull: [0, 0, 0, 0, 0],
        marker: {
          colors: colors,
          line: { color: "black", width: 2 }
        },
        hoverinfo: "text",
        hovertext: hoverTexts,
        insidetextfont: {
          family: "Rubik, sans-serif",
          size: Array(5).fill(initialFontSize),
          color: "white"
        }
      }];

      const layout = {
        title: {
          text: "Statistiques du Dragon",
          font: {
            family: "Rubik, sans-serif",
            size: 24,
            color: "#ffffff"
          }
        },
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          family: "Rubik, sans-serif",
          size: 14,
          color: "#ffffff"
        },
        hoverlabel: {
          font: {
            family: "Rubik, sans-serif",
            size: 16,
            color: "#000000"
          }
        }
      };

      Plotly.newPlot("plotlyCycleChart", dataPlot, layout, { responsive: true });

      const state = {
        currentHoveredIndex: null
      };

      plotDiv.on("plotly_hover", function(eventData) {
        const index = eventData.points[0].pointNumber;
        if (state.currentHoveredIndex === index) return;

        const pulls = Array(5).fill(0);
        const sizes = Array(5).fill(initialFontSize);
        pulls[index] = 0.15;
        sizes[index] = hoverFontSize;

        state.currentHoveredIndex = index;

        Plotly.animate(plotDiv, {
          data: [{
            pull: pulls,
            "insidetextfont.size": sizes
          }]
        }, {
          transition: {
            duration: 100,
            easing: "linear"
          },
          frame: {
            duration: 100
          }
        });

        plotDiv.classList.add("zoomed");
      });

      plotDiv.on("plotly_unhover", function() {
        state.currentHoveredIndex = null;

        Plotly.animate(plotDiv, {
          data: [{
            pull: [0, 0, 0, 0, 0],
            "insidetextfont.size": Array(5).fill(initialFontSize)
          }]
        }, {
          transition: {
            duration: 100,
            easing: "linear"
          },
          frame: {
            duration: 100
          }
        });

        plotDiv.classList.remove("zoomed");
      });
    })
    .catch(err => {
      console.error("Erreur de chargement JSON :", err);
    });
}
