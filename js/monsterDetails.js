// Gère le passage à la page détail au clic
function showMonsterDetails(id) {
  // Masquer toutes les pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

  // Afficher la page de détails
  const detailPage = document.getElementById('monsterDetailsPage');
  detailPage.style.display = 'flex';

  // Mettre à jour le titre avec le nom du monstre cliqué
  const nameMap = {
    dragon: "Dragon",
    herald: "Rift Herald",
    tower: "Tower",
    minion: "Minion"
  };
  document.getElementById('monsterTitle').textContent = nameMap[id] || id;
}

// Bouton retour
function hideMonsterDetails() {
  document.getElementById('monsterDetailsPage').style.display = 'none';
  document.getElementById('page8').style.display = 'flex';
}
