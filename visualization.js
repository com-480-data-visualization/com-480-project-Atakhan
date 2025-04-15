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


// Function to render the correlation matrix
// Function to render the correlation matrix
function renderCorrelationMatrix() {
    fetch('figures/correlation_matrix.json') // Adjust the path if necessary
        .then(response => response.json())
        .then(data => {
            const labels = Object.keys(data);
            const matrixData = labels.map(label => labels.map(innerLabel => data[label][innerLabel]));

            const ctx = document.getElementById('correlationMatrixChart').getContext('2d');

            // Create a heatmap using Chart.js
            const correlationMatrixChart = new Chart(ctx, {
                type: 'matrix', // Use a matrix chart type
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Correlation Matrix',
                        data: matrixData.flat().map((value, index) => ({
                            x: labels[index % labels.length],
                            y: labels[Math.floor(index / labels.length)],
                            v: value
                        })),
                        backgroundColor: (context) => {
                            const value = context.dataset.data[context.dataIndex].v;
                            // Create a color gradient based on the correlation value
                            const color = value > 0 ? `rgba(75, 192, 192, ${value})` : `rgba(255, 99, 132, ${-value})`;
                            return color;
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return `Correlation: ${tooltipItem.raw.v}`;
                                }
                            }
                        }
                    }]
                },
                options: {
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Features'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Features'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching correlation matrix data:', error));
}

// Call the function to render the correlation matrix when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('correlationMatrixChart')) {
        renderCorrelationMatrix();
    }
});