// Ajout des éléments HTML pour la modale au début du fichier
document.body.insertAdjacentHTML('beforeend', `
  <div class="radar-modal-overlay"></div>
  <div class="radar-modal">
    <button class="radar-modal-close">×</button>
    <div class="radar-modal-content">
      <div class="radar-modal-title"></div>
      <div class="radar-modal-stats"></div>
    </div>
  </div>
`);

// Configuration de la modale
const modal = document.querySelector('.radar-modal');
const overlay = document.querySelector('.radar-modal-overlay');
const closeBtn = document.querySelector('.radar-modal-close');

// Textes personnalisés pour chaque point du radar
const customTexts = {
  'WardsPlaced': {
    'Win': "Texte personnalisé pour les Wards placés en victoire",
    'Lose': "Texte personnalisé pour les Wards placés en défaite"
  },
  'WardsDestroyed': {
    'Win': "Texte personnalisé pour les Wards détruits en victoire",
    'Lose': "Texte personnalisé pour les Wards détruits en défaite"
  },
  'FirstBlood': {
    'Win': "Texte personnalisé pour le First Blood en victoire",
    'Lose': "Texte personnalisé pour le First Blood en défaite"
  },
  'Kills': {
    'Win': "Texte personnalisé pour les Kills en victoire",
    'Lose': "Texte personnalisé pour les Kills en défaite"
  },
  'Deaths': {
    'Win': "Texte personnalisé pour les Deaths en victoire",
    'Lose': "Texte personnalisé pour les Deaths en défaite"
  },
  'Assists': {
    'Win': "Texte personnalisé pour les Assists en victoire",
    'Lose': "Texte personnalisé pour les Assists en défaite"
  },
  'EliteMonsters': {
    'Win': "Texte personnalisé pour les Monstres d'élite en victoire",
    'Lose': "Texte personnalisé pour les Monstres d'élite en défaite"
  },
  'Dragons': {
    'Win': "Texte personnalisé pour les Dragons en victoire",
    'Lose': "Texte personnalisé pour les Dragons en défaite"
  },
  'Heralds': {
    'Win': "Texte personnalisé pour les Hérauts en victoire",
    'Lose': "Texte personnalisé pour les Hérauts en défaite"
  },
  'TowersDestroyed': {
    'Win': "Texte personnalisé pour les Tours détruites en victoire",
    'Lose': "Texte personnalisé pour les Tours détruites en défaite"
  },
  'TotalGold': {
    'Win': "Texte personnalisé pour l'Or total en victoire",
    'Lose': "Texte personnalisé pour l'Or total en défaite"
  },
  'AvgLevel': {
    'Win': "Texte personnalisé pour le Niveau moyen en victoire",
    'Lose': "Texte personnalisé pour le Niveau moyen en défaite"
  },
  'TotalExperience': {
    'Win': "Texte personnalisé pour l'Expérience totale en victoire",
    'Lose': "Texte personnalisé pour l'Expérience totale en défaite"
  },
  'TotalMinionsKilled': {
    'Win': "Texte personnalisé pour les Sbires tués en victoire",
    'Lose': "Texte personnalisé pour les Sbires tués en défaite"
  },
  'TotalJungleMinionsKilled': {
    'Win': "Texte personnalisé pour les Monstres de la jungle tués en victoire",
    'Lose': "Texte personnalisé pour les Monstres de la jungle tués en défaite"
  }
};

function closeModal() {
  modal.style.display = 'none';
  overlay.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

function showModal(label, statName, value, rawData) {
  const modalTitle = modal.querySelector('.radar-modal-title');
  const modalStats = modal.querySelector('.radar-modal-stats');
  
  // Mise à jour de la classe pour la couleur de bordure
  modal.className = 'radar-modal ' + label.toLowerCase();
  
  // Titre de la modale
  modalTitle.textContent = `${label} - ${statName}`;
  
  // Récupération du texte personnalisé
  const customText = customTexts[statName]?.[label] || "Texte à personnaliser";
  
  // Affichage du texte personnalisé
  modalStats.innerHTML = `<div class="radar-modal-explanation">${customText}</div>`;
  
  // Affichage de la modale
  modal.style.display = 'block';
  overlay.style.display = 'block';
}

function highlightTeam(team) {
  const chart = window.myRadarChart;
  chart.data.datasets.forEach(ds => {
    if (ds.label === team) {
      ds.order = 1;
      ds.backgroundColor = ds.label === 'Win' 
        ? 'rgba(0,255,0,0.4)' 
        : 'rgba(255,0,0,0.4)';
      ds.borderWidth = 3;
    } else {
      ds.order = 0;
      ds.backgroundColor = ds.label === 'Win' 
        ? 'rgba(0,255,0,0.1)' 
        : 'rgba(255,0,0,0.1)';
      ds.borderWidth = 1;
    }
  });
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

    // Animation pour les points avec un effet plus prononcé
    const pulseAnimation = {
      id: 'pulseAnimation',
      beforeDraw: (chart) => {
        const points = chart.getDatasetMeta(0).data.concat(chart.getDatasetMeta(1).data);
        points.forEach(point => {
          const angle = performance.now() / 800;
          const scale = 1 + Math.sin(angle * 2) * 0.25;
          point.options.radius = 5 * scale;
        });
      }
    };

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Win',
            data: norm.winning_team,
            backgroundColor: 'rgba(0,255,0,0.15)',
            borderColor: 'rgba(0,255,0,0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0,255,0,1)',
            pointRadius: 5,
            pointHoverRadius: 10,
            pointStyle: 'circle',
            pointBorderWidth: 2,
            pointBorderColor: '#fff',
            tension: 0.1,
            pointHoverBackgroundColor: '#00ff00',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            fill: true
          },
          {
            label: 'Lose',
            data: norm.losing_team,
            backgroundColor: 'rgba(255,0,0,0.15)',
            borderColor: 'rgba(255,0,0,0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(255,0,0,1)',
            pointRadius: 5,
            pointHoverRadius: 10,
            pointStyle: 'circle',
            pointBorderWidth: 2,
            pointBorderColor: '#fff',
            tension: 0.1,
            pointHoverBackgroundColor: '#ff0000',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400,
          easing: 'easeInOutQuart'
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetLabel = chart.data.datasets[element.datasetIndex].label;
            const label = chart.data.labels[element.index];
            const normalizedValue = chart.data.datasets[element.datasetIndex].data[element.index];
            const rawValue = datasetLabel === 'Win' ? raw.winning_team[element.index] : raw.losing_team[element.index];
            showModal(datasetLabel, label, normalizedValue, rawValue);
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            backgroundColor: 'rgba(17, 24, 39, 1)',
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              circular: true
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              display: false,
              backdropColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              z: 1
            },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.9)',
              font: {
                size: 14,
                family: 'Segoe UI',
                weight: '500'
              }
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: '#1a1a1a',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            titleFont: {
              size: 16,
              weight: 'bold',
              family: 'Segoe UI'
            },
            bodyFont: {
              size: 14,
              weight: '600',
              family: 'Segoe UI'
            },
            padding: {
              top: 12,
              right: 16,
              bottom: 12,
              left: 16
            },
            cornerRadius: 8,
            displayColors: false,
            borderColor: '#ffffff',
            borderWidth: 2,
            caretSize: 8,
            caretPadding: 6,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            callbacks: {
              title: (tooltipItems) => {
                return tooltipItems[0].label.toUpperCase();
              },
              label: ctx => {
                const arr = ctx.dataset.label === 'Win'
                  ? raw.winning_team
                  : raw.losing_team;
                const value = arr[ctx.dataIndex].toFixed(2);
                const label = ctx.dataset.label;
                const color = label === 'Win' ? '🟢' : '🔴';
                return [`${color}  ${label}`, `Value: ${value}`, 'Click for more details'];
              }
            }
          },
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.9)',
              font: {
                size: 12,
                weight: '500'
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 10,
            radius: 5,
            borderWidth: 2,
            hitRadius: 12
          }
        },
        interaction: {
          intersect: true,
          mode: 'point'
        }
      },
      plugins: [pulseAnimation]
    });

    window.myRadarChart = chart;

    function animate() {
      chart.update('none');
      requestAnimationFrame(animate);
    }
    animate();
  });
}

window.addEventListener('load', () => {
  if (document.getElementById("radarChart")) renderRadarChart();
});