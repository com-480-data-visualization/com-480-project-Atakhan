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
    d3.csv("Champion_explorer/champions.csv").then(data => {
        if (!data || data.length === 0) {
            console.error("Aucune donnée chargée depuis champions.csv ou le fichier est vide.");
            vizContainer.html("<p style='color:red;'>Aucune donnée de champion n'a été trouvée. Vérifiez le fichier 'JulesLeChampion/champions.csv'.</p>");
            return;
        }
        allChampions = data;
        data.forEach(champ => {
            champ.Name = champ.Name ? champ.Name.trim() : 'N/A';
            
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
        vizContainer.html("<p style='color:red;'>Erreur de chargement des données. Vérifiez que le fichier 'JulesLeChampion/champions.csv' est bien placé et que la console ne montre pas d'erreurs CORS ou de fichier non trouvé.</p>");
    });

    function populateFilters() {
        const sortedClasses = Array.from(uniqueClasses).sort();
        classFilter.selectAll('option').data(sortedClasses).enter().append('option').attr('value', d => d).text(d => d);

        const difficultyOrder = ['Beginner', 'Intermediate', 'Intermediate_Plus', 'Advanced', 'Expert'];
        const sortedDifficulties = Array.from(uniqueDifficulties).sort((a,b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b));
        difficultyFilter.selectAll('option.dynamic-option').data(sortedDifficulties).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);
        
        const sortedRoles = Array.from(uniqueRoles).sort();
        roleFilter.selectAll('option').data(sortedRoles).enter().append('option').attr('value', d => d).text(d => d);

        const sortedRangeTypes = Array.from(uniqueRangeTypes).sort();
        rangeTypeFilter.selectAll('option.dynamic-option').data(sortedRangeTypes).enter().append('option').attr('class', 'dynamic-option').attr('value', d => d).text(d => d);

        classFilter.on('change', applyFilters);
        difficultyFilter.on('change', applyFilters);
        roleFilter.on('change', applyFilters);
        rangeTypeFilter.on('change', applyFilters);
        resetFiltersButton.on('click', resetAllFilters);
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
        classFilter.selectAll('option').property('selected', false);
        difficultyFilter.property('value', 'all');
        roleFilter.selectAll('option').property('selected', false);
        rangeTypeFilter.property('value', 'all');
        applyFilters();
    }

    function renderChampions(championsToRender) {
        vizContainer.selectAll('.champion-card').remove();

        const cards = vizContainer.selectAll('.champion-card')
            .data(championsToRender, d => d.Name)
            .enter()
            .append('div')
            .attr('class', 'champion-card');

        cards.append('h3').text(d => d.Name);
        cards.append('p').html(d => `<strong>Type:</strong> ${d.Classes || 'N/A'}`);
        cards.append('p').html(d => `<strong>Difficulty:</strong> ${d.Difficulty || 'N/A'}`);
        cards.append('p').html(d => `<strong>Role(s):</strong> ${d.Role || 'N/A'}`);
        cards.append('p').html(d => `<strong>Range:</strong> ${d['Range type'] || 'N/A'}`);
        
        cards.style('opacity', 0)
             .style('transform', 'translateY(20px)')
             .transition()
             .duration(500)
             .delay((d, i) => i * 30) // slightly faster delay
             .style('opacity', 1)
             .style('transform', 'translateY(0px)');
    }
}); 