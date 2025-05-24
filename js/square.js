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

  // Add hashchange event listener for hash-based navigation
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    let found = false;
    allPages.forEach(page => {
      if (page.id === hash) {
        page.style.display = 'flex';
        found = true;
      } else {
        page.style.display = 'none';
      }
    });
    // If hash is not found, show the first page
    if (!found && allPages.length > 0) {
      allPages[0].style.display = 'flex';
    }
  });

  createIndicators();
  showPage(currentPage);
});
