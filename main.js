
const pages = document.querySelectorAll('.page');
const indicatorBar = document.getElementById('indicatorBar');
let currentPage = 0;

function showPage(index) {
  pages.forEach((page, i) => {
    page.style.display = i === index ? 'flex' : 'none';
    indicatorBar.children[i].classList.toggle('active', i === index);
  });
}

function createIndicators() {
  pages.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('indicator');
    dot.onclick = () => {
      currentPage = i;
      showPage(i);
    };
    indicatorBar.append(dot);
  });
}

function createChart1() {
  const ctx = document.getElementById('chart1').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Kills', 'Deaths', 'Assists'],
      datasets: [{
        label: 'Exemple Données',
        data: [6, 4, 10],
        backgroundColor: 'rgba(0, 172, 193, 0.3)',
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
        legend: { labels: { color: '#ccc' } }
      }
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && currentPage > 0) {
    currentPage--;
    showPage(currentPage);
  } else if (event.key === 'ArrowDown' && currentPage < pages.length - 1) {
    currentPage++;
    showPage(currentPage);
  }
});

window.addEventListener('load', () => {
  createIndicators();
  showPage(0);
  createChart1();
});
