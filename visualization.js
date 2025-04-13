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
                    grid: { color: '#333' },
                    ticks: { color: '#ccc' }
                },
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#ccc' }
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

async function loadAndCreateComparisonChart() {
    const response = await fetch('comparison_data.json');
    const data = await response.json();

    const categories = Object.keys(data.win);
    const winValues = Object.values(data.win);
    const loseValues = Object.values(data.lose);

    // Normalisation
    const allValues = winValues.map((v, i) => [v, loseValues[i]]).flat();
    const maxVal = Math.max(...allValues);
    const minVal = Math.min(...allValues);

    const norm = (v) => (v - minVal) / (maxVal - minVal);
    const normalizedWin = winValues.map(norm);
    const normalizedLose = loseValues.map(norm);

    const ctx = document.getElementById('chart8').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Win',
                    data: normalizedWin,
                    backgroundColor: 'rgba(0, 172, 193, 0.8)'
                },
                {
                    label: 'Lose',
                    data: normalizedLose,
                    backgroundColor: 'rgba(239, 83, 80, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    grid: { color: '#333' },
                    ticks: { color: '#ccc', stepSize: 0.25 }
                },
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#ccc' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const raw = context.dataset.label === 'Win'
                                ? winValues[context.dataIndex]
                                : loseValues[context.dataIndex];
                            return `${context.dataset.label}: ${raw}`;
                        }
                    }
                },
                legend: {
                    labels: { color: '#ccc' }
                },
                title: {
                    display: true,
                    text: 'Page 8 : Comparaison Win / Lose',
                    color: '#fff',
                    padding: 20,
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}

// Charger tous les graphiques au chargement
window.addEventListener('load', () => {
    for (let i = 1; i <= 7; i++) {
        createChart(`chart${i}`);
    }
    loadAndCreateComparisonChart();
});
