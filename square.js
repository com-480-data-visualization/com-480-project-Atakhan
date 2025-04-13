const pages = document.querySelectorAll('.page');
const indicatorBar = document.getElementById('indicatorBar');
let currentPage = 0;

function showPage(index) {
    pages.forEach((page, i) => {
        page.style.display = (i === index) ? 'flex' : 'none';
        indicatorBar.children[i].classList.toggle('active', i === index);
    });
}

function createIndicators() {
    for (let i = 0; i < pages.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('indicator');
        dot.addEventListener('click', () => {
            currentPage = i;
            showPage(currentPage);
        });
        indicatorBar.appendChild(dot);
    }
}

// Clavier
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && currentPage > 0) {
        currentPage--;
        showPage(currentPage);
    } else if (event.key === 'ArrowDown' && currentPage < pages.length - 1) {
        currentPage++;
        showPage(currentPage);
    }
});

// Molette
let scrollTimeout = false;
document.addEventListener('wheel', (event) => {
    if (scrollTimeout) return;
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

    if (delta > 0 && currentPage < pages.length - 1) {
        currentPage++;
        showPage(currentPage);
    } else if (delta < 0 && currentPage > 0) {
        currentPage--;
        showPage(currentPage);
    }

    scrollTimeout = true;
    setTimeout(() => {
        scrollTimeout = false;
    }, 500);
});

createIndicators();
showPage(currentPage);
