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
});




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
                            // bleu pour positif, rouge pour négatif
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
            labels: {
                color: '#ccc'
            }
        }
    },
    elements: {
        rectangle: {
            borderWidth: 1
        }
    }
}
            });
        })
        .catch(error => console.error('Error fetching correlation matrix data:', error));
}

// Appelle la fonction après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('correlationMatrixChart')) {
        renderCorrelationMatrix();
    }
});


