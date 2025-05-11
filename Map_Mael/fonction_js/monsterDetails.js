function showMonsterDetails(id) {
  // Cacher toutes les pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

  // Afficher la page correspondante
  const pageId = 'page-' + id;
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'flex';
  }

  // Appeler la fonction de chargement du bon graphique
  const loaderMap = {
    dragon: loadDragonChart,
    herald: loadHeraldChart,
    minion: loadMinionChart,
    tower: loadTowerChart
  };

  const loader = loaderMap[id];
  if (typeof loader === 'function') {
    loader();
  } else {
    console.warn(`Aucune fonction de chargement pour : ${id}`);
  }
}

function returnToMap() {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById('page8').style.display = 'flex';
}
