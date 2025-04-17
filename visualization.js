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

      labels.forEach(rowLabel => {
        labels.forEach(colLabel => {
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
                label: tooltipItem => `Correlation: ${tooltipItem.raw.v}`
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
      const { shap_values, features, feature_names } = data;

      const traces = feature_names.map((name, i) => {
        const x = shap_values.map(row => row[i]);
        const y = Array(x.length).fill(name);
        const color = features.map(row => row[i]);

        return {
          x: x,
          y: y,
          mode: 'markers',
          type: 'scatter',
          name: name,
          text: color.map(v => `Feature value: ${v.toFixed(2)}`),
          hoverinfo: 'x+text',
          marker: {
            size: 6,
            color: color,
            colorscale: 'RdBu',
            showscale: i === feature_names.length - 1,
            colorbar: i === feature_names.length - 1 ? {
              title: 'Feature value',
              thickness: 15
            } : undefined
          },
          showlegend: false
        };
      });

      Plotly.newPlot('chart3', traces, {
        title: 'Grouped SHAP Beeswarm (Page 3)',
        xaxis: {
          title: 'SHAP value (impact on model output)',
          zeroline: true,
          gridcolor: '#444'
        },
        yaxis: {
          type: 'category',
          gridcolor: '#444'
        },
        margin: { l: 120, r: 30, t: 50, b: 40 },
        plot_bgcolor: '#111',
        paper_bgcolor: '#111',
        font: { color: '#eee' },
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

