function highlightTeam(team) {
  const chart = window.myRadarChart;
  chart.data.datasets.forEach(ds => ds.order = (ds.label === team ? 1 : 0));
  chart.update();

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
    const labels = norm.labels;
    const ctx = document.getElementById('radarChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Win',
            data: norm.winning_team,
            backgroundColor: 'rgba(0,255,0,0.2)',
            borderColor: 'rgba(0,255,0,0.9)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0,255,0,1)',
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: 'Lose',
            data: norm.losing_team,
            backgroundColor: 'rgba(255,0,0,0.2)',
            borderColor: 'rgba(255,0,0,0.9)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(255,0,0,1)',
            pointRadius: 5,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: '#333' },
            angleLines: { color: '#333' },
            ticks: { color: '#ccc' },
            pointLabels: {
              color: '#ccc',
              font: { size: 14, family: 'Segoe UI', weight: '500' }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const arr = ctx.dataset.label === 'Win'
                  ? raw.winning_team
                  : raw.losing_team;
                return `${ctx.dataset.label}: ${arr[ctx.dataIndex].toFixed(2)}`;
              }
            }
          },
          legend: {
            labels: { color: '#ccc' }
          }
        }
      }
    });

    window.myRadarChart = chart;
  });
}

window.addEventListener('load', () => {
  if (document.getElementById("radarChart")) renderRadarChart();
});