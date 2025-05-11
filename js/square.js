document.addEventListener("DOMContentLoaded", () => {
  const allPages = document.querySelectorAll('.page');
  const scrollablePages = Array.from(document.querySelectorAll('.page:not(.exclude-from-scroll)'));
  const indicatorBar = document.getElementById('indicatorBar');
  let currentPage = 0;

  function showPage(index) {
    scrollablePages.forEach((page, i) => {
      page.style.display = (i === index) ? 'flex' : 'none';
      if (indicatorBar.children[i]) {
        indicatorBar.children[i].classList.toggle('active', i === index);
      }
    });

    // Masquer toutes les pages de détail manuellement
    allPages.forEach(page => {
      if (page.classList.contains('exclude-from-scroll')) {
        page.style.display = 'none';
      }
    });
  }

  function createIndicators() {
    scrollablePages.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator');
      dot.addEventListener('click', () => {
        currentPage = i;
        showPage(currentPage);
      });
      indicatorBar.appendChild(dot);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && currentPage > 0) {
      currentPage--;
      showPage(currentPage);
    } else if (event.key === 'ArrowDown' && currentPage < scrollablePages.length - 1) {
      currentPage++;
      showPage(currentPage);
    }
  });

  createIndicators();
  showPage(currentPage);
});
