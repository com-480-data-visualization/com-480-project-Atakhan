// Fonction pour changer la position des cercles
function moveCircles() {
  const circles = document.querySelectorAll('.circle');
  
  circles.forEach(circle => {
    // Change la couleur aléatoirement
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    circle.style.backgroundColor = randomColor;
    
    // Déplace le cercle de manière aléatoire
    const randomX = Math.floor(Math.random() * 200) - 100; // Déplacement horizontal aléatoire
    const randomY = Math.floor(Math.random() * 200) - 100; // Déplacement vertical aléatoire
    circle.style.transform = `translate(${randomX}px, ${randomY}px)`;
  });
}

// Appel de la fonction toutes les 2 secondes
setInterval(moveCircles, 2000);
