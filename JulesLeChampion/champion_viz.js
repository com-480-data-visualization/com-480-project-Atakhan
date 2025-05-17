document.addEventListener('DOMContentLoaded', () => {
    // Utilisation des nouveaux IDs pour les éléments de la page principale
    const vizContainer = d3.select('#champion-visualization-container');
    const classFilter = d3.select('#champ-class-filter');
    const difficultyFilter = d3.select('#champ-difficulty-filter');
    const roleFilter = d3.select('#champ-role-filter');
    const rangeTypeFilter = d3.select('#champ-range-type-filter');
    const resetFiltersButton = d3.select('#champ-reset-filters');

    let allChampions = [];
    let uniqueClasses = new Set();
    let uniqueDifficulties = new Set();
    let uniqueRoles = new Set();
    let uniqueRangeTypes = new Set();

    // Charger les données CSV depuis le dossier JulesLeChampion
    d3.csv("JulesLeChampion/champions.csv").then(data => {
        if (!data || data.length === 0) {
            console.error("Aucune donnée chargée depuis champions.csv ou le fichier est vide.");
            vizContainer.html("<p style='color:red;'>Aucune donnée de champion n'a été trouvée. Vérifiez le fichier 'JulesLeChampion/champions.csv'.</p>");
            return;
        }
        allChampions = data;
        data.forEach(champ => {
            champ.Name = champ.Name ? champ.Name.trim() : 'N/A';
            // Générer un nom de fichier sûr pour l'image et le mettre en minuscule
            champ.ImageName = champ.Name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '.png'; // Exemple: Kai'Sa -> kaisa.png
            
            const champClasses = champ.Classes ? champ.Classes.split(',').map(c => c.trim()).filter(c => c) : [];
            champClasses.forEach(c => uniqueClasses.add(c));
            champ.ParsedClasses = champClasses;

            if (champ.Difficulty) uniqueDifficulties.add(champ.Difficulty.trim());

            const champRoles = champ.Role ? champ.Role.split(',').map(r => r.trim()).filter(r => r) : [];
            champRoles.forEach(r => uniqueRoles.add(r));
            champ.ParsedRoles = champRoles;

            if (champ['Range type']) uniqueRangeTypes.add(champ['Range type'].trim());
        });

        populateFilters();
        renderChampions(allChampions);

    }).catch(error => {
        console.error("Erreur lors du chargement du fichier CSV:", error);
        vizContainer.html("<p style='color:red;'>Erreur de chargement des données. Vérifiez le chemin et l'existence du fichier 'JulesLeChampion/champions.csv'.</p>");
    });

    function populateFilters() {
        // Classes (multiple)
        const sortedClasses = Array.from(uniqueClasses).sort();
        classFilter.selectAll('option').data(sortedClasses).enter().append('option').attr('value', d => d).text(d => d);

        // Difficulty (single with 'all')
        const difficultyOrder = ['Beginner', 'Intermediate', 'Intermediate_Plus', 'Advanced', 'Expert'];
        const sortedDifficulties = Array.from(uniqueDifficulties).sort((a,b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b));
        difficultyFilter.selectAll('option.dynamic-option').data(sortedDifficulties).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);
        
        // Role (multiple)
        const sortedRoles = Array.from(uniqueRoles).sort();
        roleFilter.selectAll('option').data(sortedRoles).enter().append('option').attr('value', d => d).text(d => d);

        // Range Type (single with 'all')
        const sortedRangeTypes = Array.from(uniqueRangeTypes).sort();
        rangeTypeFilter.selectAll('option.dynamic-option').data(sortedRangeTypes).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);

        // Event listeners
        classFilter.on('change', applyFilters);
        difficultyFilter.on('change', applyFilters);
        roleFilter.on('change', applyFilters);
        rangeTypeFilter.on('change', applyFilters);
        if (resetFiltersButton.node()) {
            resetFiltersButton.on('click', resetAllFilters);
        }
    }

    function applyFilters() {
        const selectedClasses = Array.from(classFilter.node().selectedOptions).map(opt => opt.value);
        const selectedDifficulty = difficultyFilter.property('value');
        const selectedRoles = Array.from(roleFilter.node().selectedOptions).map(opt => opt.value);
        const selectedRangeType = rangeTypeFilter.property('value');

        let filteredChampions = allChampions.filter(champ => {
            const classMatch = selectedClasses.length === 0 || (champ.ParsedClasses && champ.ParsedClasses.some(c => selectedClasses.includes(c)));
            const difficultyMatch = selectedDifficulty === 'all' || (champ.Difficulty && champ.Difficulty.trim() === selectedDifficulty);
            const roleMatch = selectedRoles.length === 0 || (champ.ParsedRoles && champ.ParsedRoles.some(r => selectedRoles.includes(r)));
            const rangeTypeMatch = selectedRangeType === 'all' || (champ['Range type'] && champ['Range type'].trim() === selectedRangeType);
            return classMatch && difficultyMatch && roleMatch && rangeTypeMatch;
        });
        renderChampions(filteredChampions);
    }
    
    function resetAllFilters() {
        // Pour les select multiples, désélectionner toutes les options
        classFilter.selectAll('option').property('selected', false);
        // Si vous utilisez une librairie pour styliser les selects multiples, elle peut avoir sa propre API de reset.
        // Pour un select multiple standard, il faut manuellement mettre à jour son affichage si besoin.
        // Alternative: déclencher un événement change pour que la logique de style de la librairie s'applique.
        // classFilter.dispatch('change'); // Décommentez si votre select multiple stylé le nécessite.

        difficultyFilter.property('value', 'all');
        
        roleFilter.selectAll('option').property('selected', false);
        // roleFilter.dispatch('change'); // Si besoin pour select multiple stylé

        rangeTypeFilter.property('value', 'all');
        applyFilters();
    }

    function renderChampions(championsToRender) {
        vizContainer.selectAll('.champion-card').remove();

        const cards = vizContainer.selectAll('.champion-card')
            .data(championsToRender, d => d.Name)
            .enter()
            .append('div')
            .attr('class', 'champion-card')
            .on('mouseenter', function() {
                d3.select(this).classed('is-flipped', true);
            })
            .on('mouseleave', function() {
                d3.select(this).classed('is-flipped', false);
            });

        // Recto de la carte (Image)
        const cardFront = cards.append('div')
            .attr('class', 'card-face card-face--front');

        cardFront.append('img')
            .attr('src', d => `JulesLeChampion/img_champions/${d.ImageName}`)
            .attr('alt', d => d.Name)
            .attr('class', 'champion-image')
            .on('error', function() {
                d3.select(this).attr('src', 'JulesLeChampion/img_champions/default.png'); // Fallback en minuscule
            });

        // Verso de la carte (Texte)
        const cardBack = cards.append('div')
            .attr('class', 'card-face card-face--back');
        
        // Si vous ajoutez une colonne 'DominantColor' à votre CSV (ex: "#RRGGBB")
        // cardBack.style('background-color', d => d.DominantColor || '#303050');

        cardBack.append('h3').text(d => d.Name);
        cardBack.append('p').html(d => `<strong>Classe(s):</strong> ${d.Classes || 'N/A'}`);
        cardBack.append('p').html(d => `<strong>Difficulté:</strong> ${d.Difficulty || 'N/A'}`);
        cardBack.append('p').html(d => `<strong>Rôle(s):</strong> ${d.Role || 'N/A'}`);
        cardBack.append('p').html(d => `<strong>Portée:</strong> ${d['Range type'] || 'N/A'}`);
        
        // L'animation d'apparition initiale s'applique à la carte entière
        cards.style('opacity', 0)
             .style('transform', 'translateY(20px) rotateY(0deg)') // Commence sans être retournée
             .transition()
             .duration(500)
             .delay((d, i) => i * 50) // Délai échelonné pour un effet cascade
             .style('opacity', 1)
             .style('transform', 'translateY(0px) rotateY(0deg)');
    }
}); 