function createChart(canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ['A', 'B', 'C', 'D', 'E'],
          datasets: [{
              label: 'Random Data',
              data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
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

function renderCorrelationMatrix() {
  fetch('./figures/correlation_matrix.json')
      .then(response => response.json())
      .then(data => {
          const labels = Object.keys(data);
          const matrixData = [];
          labels.forEach((rowLabel, i) => {
              labels.forEach((colLabel, j) => {
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
                      width: ({chart}) => (chart.chartArea || {}).width / labels.length - 2,
                      height: ({chart}) => (chart.chartArea || {}).height / labels.length - 2,
                      backgroundColor: ctx => {
                          const value = ctx.dataset.data[ctx.dataIndex].v;
                          if (value > 0) {
                              return `rgba(33, 150, 243, ${value})`;
                          } else if (value < 0) {
                              return `rgba(244, 67, 54, ${-value})`;
                          }
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
                          title: { display: true, text: 'Features' },
                          grid: { color: '#333' }
                      },
                      y: {
                          type: 'category',
                          title: { display: true, text: 'Features' },
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

function renderGroupedSHAPBeeswarm() {
  fetch('./processed_data/shap_beeswarm_data.json')
      .then(res => res.json())
      .then(data => {
          const shapValues = data.shap_values;
          const featureValues = data.features;
          const featureNames = data.feature_names;

          const traces = featureNames.map((name, i) => {
              const x = shapValues.map(row => row[i]);
              const color = featureValues.map(row => row[i]);

              return {
                  x: x,
                  y: Array(x.length).fill(name),
                  text: color.map(v => `Feature value: ${v.toFixed(2)}`),
                  mode: 'markers',
                  type: 'scatter',
                  marker: {
                      color: color,
                      colorscale: 'RdBu',
                      showscale: i === featureNames.length - 1,
                      colorbar: i === featureNames.length - 1 ? { title: 'Feature value' } : undefined,
                      size: 8,
                      line: { width: 0.5, color: 'black' }
                  },
                  hoverinfo: 'x+text'
              };
          });

          Plotly.newPlot('chart3', traces, {
              title: 'SHAP value (impact on model output)',
              xaxis: { title: 'SHAP value', zeroline: true },
              yaxis: { type: 'category' },
              margin: { l: 120, r: 20, t: 50, b: 40 },
              plot_bgcolor: "#111",
              paper_bgcolor: "#111",
              font: { color: "#eee" },
              showlegend: false
          }, { responsive: true });
      })
      .catch(err => console.error("SHAP beeswarm data load error:", err));
}

document.addEventListener('DOMContentLoaded', function () {
  for (let i = 1; i <= 7; i++) {
      const chart = document.getElementById(`chart${i}`);
      if (chart && chart.tagName === 'CANVAS') {
          createChart(`chart${i}`);
      }
  }

  if (document.getElementById("chart3")) renderGroupedSHAPBeeswarm();
  if (document.getElementById("correlationMatrixChart")) renderCorrelationMatrix();
});
