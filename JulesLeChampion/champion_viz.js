document.addEventListener('DOMContentLoaded', () => {
    // Utilisation des nouveaux IDs pour les éléments de la page principale
    const vizContainer = d3.select('#champion-visualization-container');
    const classFilter = d3.select('#champ-class-filter');
    const difficultyFilter = d3.select('#champ-difficulty-filter');
    const roleFilter = d3.select('#champ-role-filter');
    const rangeTypeFilter = d3.select('#champ-range-type-filter');
    const resetFiltersButton = d3.select('#champ-reset-filters');
    const searchBar = d3.select('#champ-search-bar');

    let allChampions = [];
    let uniqueClasses = new Set();
    let uniqueDifficulties = new Set();
    let uniqueRoles = new Set();
    let uniqueRangeTypes = new Set();
    let currentSearchTerm = '';

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
        // Classes (sera maintenant single-select avec option "all" statique)
        const sortedClasses = Array.from(uniqueClasses).sort();
        // L'option "all" est dans le HTML, on ajoute seulement les classes dynamiques
        classFilter.selectAll('option.dynamic-option').data(sortedClasses).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);

        // Difficulty (single with 'all')
        const difficultyOrder = ['Beginner', 'Intermediate', 'Intermediate_Plus', 'Advanced', 'Expert'];
        const sortedDifficulties = Array.from(uniqueDifficulties).sort((a,b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b));
        difficultyFilter.selectAll('option.dynamic-option').data(sortedDifficulties).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);
        
        // Role (sera maintenant single-select avec option "all" statique)
        const sortedRoles = Array.from(uniqueRoles).sort();
        // L'option "all" est dans le HTML, on ajoute seulement les rôles dynamiques
        roleFilter.selectAll('option.dynamic-option').data(sortedRoles).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);

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

        if (searchBar.node()) {
            searchBar.on('input', function() {
                currentSearchTerm = this.value.toLowerCase();
                applyFilters();
            });
        }
    }

    function applyFilters() {
        const selectedClass = classFilter.property('value'); // Modifié pour single-select
        const selectedDifficulty = difficultyFilter.property('value');
        const selectedRole = roleFilter.property('value'); // Modifié pour single-select
        const selectedRangeType = rangeTypeFilter.property('value');

        let filteredChampions = allChampions.filter(champ => {
            const classMatch = selectedClass === 'all' || (champ.ParsedClasses && champ.ParsedClasses.includes(selectedClass)); // Logique adaptée
            const difficultyMatch = selectedDifficulty === 'all' || (champ.Difficulty && champ.Difficulty.trim() === selectedDifficulty);
            const roleMatch = selectedRole === 'all' || (champ.ParsedRoles && champ.ParsedRoles.includes(selectedRole)); // Logique adaptée
            const rangeTypeMatch = selectedRangeType === 'all' || (champ['Range type'] && champ['Range type'].trim() === selectedRangeType);
            const searchMatch = !currentSearchTerm || (champ.Name && champ.Name.toLowerCase().includes(currentSearchTerm));
            return classMatch && difficultyMatch && roleMatch && rangeTypeMatch && searchMatch;
        });
        renderChampions(filteredChampions);
    }
    
    function resetAllFilters() {
        classFilter.property('value', 'all'); // Modifié pour single-select
        difficultyFilter.property('value', 'all');
        roleFilter.property('value', 'all'); // Modifié pour single-select
        rangeTypeFilter.property('value', 'all');
        applyFilters();
    }

    function renderChampions(championsToRender) {
        vizContainer.selectAll('.champion-card-wrapper').remove(); // Supprime les wrappers existants

        const cardWrappers = vizContainer.selectAll('.champion-card-wrapper')
            .data(championsToRender, d => d.Name)
            .enter()
            .append('div') // Crée le wrapper extérieur
            .attr('class', 'champion-card-wrapper')
            .style('--card-glow-color', d => d.DominantColor || '#444444')
            .style('animation-delay', () => `${Math.random() * 2}s`);

        // Ajoute la carte intérieure (.champion-card) à l'intérieur du wrapper
        const cards = cardWrappers.append('div')
            .attr('class', 'champion-card')
            // Applique la couleur dominante comme fond de la carte intérieure elle-même
            .style('background-color', d => d.DominantColor || '#303050') 
            // Les gestionnaires de survol sont sur la carte intérieure pour le flip
            .on('mouseenter', function() {
                d3.interrupt(this); 
                d3.select(this).classed('is-flipped', true);
            })
            .on('mouseleave', function() {
                d3.interrupt(this); 
                d3.select(this).classed('is-flipped', false);
            });

        const cardFront = cards.append('div')
            .attr('class', 'card-face card-face--front');

        cardFront.append('img')
            .attr('src', d => `JulesLeChampion/img_champions/${d.ImageName}`)
            .attr('alt', d => d.Name)
            .attr('class', 'champion-image')
            .on('error', function() {
                d3.select(this).attr('src', 'JulesLeChampion/img_champions/default.png');
            });

        const cardBack = cards.append('div')
            .attr('class', 'card-face card-face--back');
        
        cardBack.append('h3').text(d => d.Name);
        cardBack.append('p').html(d => `<strong>Class:</strong> ${d.Classes || 'N/A'}`);
        cardBack.append('p').html(d => `<strong>Difficulty:</strong> ${d.Difficulty || 'N/A'}`);
        cardBack.append('p').html(d => `<strong>Role:</strong> ${d.Role || 'N/A'}`);
        cardBack.append('p').html(d => `<strong>Range:</strong> ${d['Range type'] || 'N/A'}`);
        
        // L'animation d'apparition initiale s'applique au wrapper pour un positionnement correct
        cardWrappers.style('opacity', 0)
             .style('transform', 'translateY(20px)') // Seule la translation Y pour l'apparition du wrapper
             .transition()
             .duration(500)
             .delay((d, i) => i * 50)
             .style('opacity', 1)
             .style('transform', 'translateY(0px)')
             .on('end', function() {
                 d3.select(this).style('transform', null); // Important pour l'animation de flottement CSS
             });
    }
}); 