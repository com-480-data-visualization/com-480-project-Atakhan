
let currentPage = 0;
const pages = document.querySelectorAll(".page");

function showPage(index) {
    pages.forEach((page, i) => {
        page.style.display = i === index ? "block" : "none";
    });
    updateIndicators(index);
}

function nextPage() {
    currentPage = (currentPage + 1) % pages.length;
    showPage(currentPage);
}

function prevPage() {
    currentPage = (currentPage - 1 + pages.length) % pages.length;
    showPage(currentPage);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowRight") {
        nextPage();
    } else if (event.key === "ArrowLeft") {
        prevPage();
    }
});

window.addEventListener("wheel", function(event) {
    if (event.deltaY > 0) {
        nextPage();
    } else if (event.deltaY < 0) {
        prevPage();
    }
});

function createIndicators() {
    const container = document.getElementById("indicators");
    for (let i = 0; i < document.querySelectorAll(".page").length; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dot.addEventListener("click", () => {
            currentPage = i;
            showPage(currentPage);
        });
        container.appendChild(dot);
    }
    updateIndicators(0);
}

function updateIndicators(index) {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

createIndicators();
showPage(0);
