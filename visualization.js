
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("comparisonChart")) {
        fetch("high_diamond_ranked_10min.csv")
            .then(response => response.text())
            .then(text => {
                const data = Papa.parse(text, { header: true, dynamicTyping: true }).data;

                const stats = [
                    "blueKills", "blueDeaths", "blueAssists", "blueEliteMonsters",
                    "blueDragons", "blueHeralds", "blueTowersDestroyed",
                    "blueTotalGold", "blueAvgLevel", "blueTotalExperience",
                    "blueCSPerMin", "blueGoldPerMin"
                ];

                const winStats = {}, loseStats = {};
                let winCount = 0, loseCount = 0;

                stats.forEach(stat => {
                    winStats[stat] = 0;
                    loseStats[stat] = 0;
                });

                data.forEach(row => {
                    if (row.blueWins === 1) {
                        winCount++;
                        stats.forEach(stat => winStats[stat] += row[stat] || 0);
                    } else if (row.blueWins === 0) {
                        loseCount++;
                        stats.forEach(stat => loseStats[stat] += row[stat] || 0);
                    }
                });

                const winAverages = stats.map(stat => winStats[stat] / winCount);
                const loseAverages = stats.map(stat => loseStats[stat] / loseCount);

                new Chart(document.getElementById("comparisonChart").getContext("2d"), {
                    type: "bar",
                    data: {
                        labels: stats,
                        datasets: [
                            {
                                label: "Gagné",
                                backgroundColor: "rgba(75, 192, 192, 0.7)",
                                data: winAverages
                            },
                            {
                                label: "Perdu",
                                backgroundColor: "rgba(255, 99, 132, 0.7)",
                                data: loseAverages
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
                            tooltip: { enabled: true }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            });
    }
});
