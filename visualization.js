let winChart, loseChart;

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
          grid: { color: '#333' }
        },
        x: {
          grid: { color: '#333' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#ccc' }
        }
      }
    }
  });
}

window.addEventListener('load', () => {
  for (let i = 1; i <= 7; i++) {
    createChart(`chart${i}`);
  }
});

function renderCorrelationMatrix() {
  fetch('./figures/correlation_matrix.json')
    .then(response => response.json())
    .then(data => {
      const labels = Object.keys(data);
      const matrixData = [];
      labels.forEach((rowLabel) => {
        labels.forEach((colLabel) => {
          matrixData.push({
            x: colLabel,
            y: rowLabel,
            v: data[rowLabel][colLabel]
          });
        });
      });

      const ctx = document.getElementById('correlationMatrixChart').getContext('2d');

      new Chart(ctx, {
        type: 'matrix',
        data: {
          datasets: [{
            label: 'Correlation Matrix',
            data: matrixData,
            width: ({ chart }) => (chart.chartArea || {}).width / labels.length - 2,
            height: ({ chart }) => (chart.chartArea || {}).height / labels.length - 2,
            backgroundColor: ctx => {
              const value = ctx.dataset.data[ctx.dataIndex].v;
              if (value > 0) return `rgba(33, 150, 243, ${value})`;
              if (value < 0) return `rgba(244, 67, 54, ${-value})`;
              return 'rgba(200,200,200,0.5)';
            },
            borderColor: 'rgba(80,80,80,0.2)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Features'
              },
              grid: { color: '#333' }
            },
            y: {
              type: 'category',
              title: {
                display: true,
                text: 'Features'
              },
              grid: { color: '#333' }
            }
          },
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (tooltipItem) {
                  return `Correlation: ${tooltipItem.raw.v}`;
                }
              }
            },
            legend: {
              labels: { color: '#ccc' }
            }
          },
          elements: {
            rectangle: { borderWidth: 1 }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching correlation matrix data:', error));
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('correlationMatrixChart')) {
    renderCorrelationMatrix();
  }
});

function renderWinLoseComparison() {
  fetch('./comparison_data.json')
    .then(response => response.json())
    .then(data => {
      const labels = data.labels;
      const winData = data.win;
      const loseData = data.lose;

      const winCtx = document.getElementById('winChart').getContext('2d');
      const loseCtx = document.getElementById('loseChart').getContext('2d');

      const sharedOptions = {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: [],
            backgroundColor: '',
            borderColor: '',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: { left: 0, right: 0, top: 10, bottom: 10 }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              external: (context) => {
                const index = context.tooltip?.dataPoints?.[0]?.dataIndex;
                if (index == null) return;

                const position = context.tooltip?.position || { x: 0, y: 0 };

                winChart.setActiveElements([{ datasetIndex: 0, index }]);
                loseChart.setActiveElements([{ datasetIndex: 0, index }]);
                winChart.tooltip.setActiveElements([{ datasetIndex: 0, index }], position);
                loseChart.tooltip.setActiveElements([{ datasetIndex: 0, index }], position);
                winChart.update();
                loseChart.update();
              }
            },
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: '#ccc' },
              grid: { color: '#333' }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#ccc',
                padding: 4
              },
              grid: { color: '#333' }
            }
          }
        }
      };

      const winConfig = JSON.parse(JSON.stringify(sharedOptions));
      const loseConfig = JSON.parse(JSON.stringify(sharedOptions));

      winConfig.data.datasets[0].label = 'Win';
      winConfig.data.datasets[0].data = winData;
      winConfig.data.datasets[0].backgroundColor = 'rgba(0, 172, 193, 0.5)';
      winConfig.data.datasets[0].borderColor = 'rgba(0, 172, 193, 1)';

      loseConfig.data.datasets[0].label = 'Lose';
      loseConfig.data.datasets[0].data = loseData;
      loseConfig.data.datasets[0].backgroundColor = 'rgba(255, 99, 132, 0.5)';
      loseConfig.data.datasets[0].borderColor = 'rgba(255, 99, 132, 1)';

      winChart = new Chart(winCtx, winConfig);
      loseChart = new Chart(loseCtx, loseConfig);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('winChart') && document.getElementById('loseChart')) {
    renderWinLoseComparison();
  }
});