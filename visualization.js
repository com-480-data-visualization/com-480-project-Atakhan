function generateRandomData() {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
}

function createChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['A', 'B', 'C', 'D', 'E'],
            datasets: [{
                label: 'Random Data',
                data: generateRandomData(),
                backgroundColor: 'rgba(0, 172, 193, 0.2)',
                borderColor: 'rgba(0, 172, 193, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#333'
                    }
                },
                x: {
                    grid: {
                        color: '#333'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ccc'
                    }
                }
            }
        }
    });
}

window.addEventListener('load', () => {
    for (let i = 1; i <= 7; i++) {
        createChart(`chart${i}`);
    }

    fetch('comparison_data.json')
      .then(response => response.json())
      .then(data => {
        const labels = data.labels;
        const winRaw = data.win;
        const loseRaw = data.lose;
        const allValues = winRaw.concat(loseRaw);
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        const normalize = (arr) => arr.map(v => (v - min) / (max - min));
        const winNorm = normalize(winRaw);
        const loseNorm = normalize(loseRaw);

        const ctx = document.getElementById('comparisonChart').getContext('2d');

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Win',
                data: winNorm,
                raw: winRaw,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              },
              {
                label: 'Lose',
                data: loseNorm,
                raw: loseRaw,
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const raw = context.dataset.raw[context.dataIndex];
                    return `${context.dataset.label}: ${raw.toFixed(1)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                display: false
              },
              x: {
                ticks: { color: '#ccc' },
                grid: { color: '#333' }
              }
            }
          }
        });
      });
});
