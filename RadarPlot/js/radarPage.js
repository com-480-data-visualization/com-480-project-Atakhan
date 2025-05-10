function renderRadarChart() {
  Promise.all([
    fetch("RadarPlot/json/radar_x2_norm.json").then(r => r.json()),
    fetch("RadarPlot/json/radar_raw.json").then(r => r.json())
  ])
  .then(([norm, raw]) => {
    const labels = norm.labels;
    const ctx = document.getElementById("radarChart").getContext("2d");

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Win',
            data: norm.winning_team,
            backgroundColor: 'rgba(0,255,0,0.25)',
            borderColor: 'rgba(0,255,0,0.8)',
            pointBackgroundColor: 'rgba(0,255,0,0.8)',
            borderWidth: 2
          },
          {
            label: 'Lose',
            data: norm.losing_team,
            backgroundColor: 'rgba(255,0,0,0.25)',
            borderColor: 'rgba(255,0,0,0.8)',
            pointBackgroundColor: 'rgba(255,0,0,0.8)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: '#444' },
            angleLines: { color: '#444' },
            ticks: { color: '#ccc' },
            pointLabels: { color: '#ccc', font: { size: 12 } }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const dataset = ctx.dataset.label === 'Win' ? raw.winning_team : raw.losing_team;
                return `${ctx.label}: ${dataset[ctx.dataIndex].toFixed(2)}`;
              }
            }
          },
          legend: {
            labels: { color: '#ccc' },
            onClick: (_, item) => {
              const box = document.getElementById("radarExplanation");
              box.textContent = item.text === "Win"
                ? "✅ En victoire : plus de kills, assists, or et vision, moins de deaths."
                : "❌ En défaite : moins d’objectifs, moins d’or, plus de deaths.";
            }
          }
        }
      }
    });
  })
  .catch(err => console.error("Radar load error:", err));
}

document.addEventListener("DOMContentLoaded", renderRadarChart);