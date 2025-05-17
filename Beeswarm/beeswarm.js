// Function to render the SHAP beeswarm plot
function renderSHAPBeeswarm() {
    console.log('Starting to render SHAP beeswarm plot...');
    
    fetch('Beeswarm/processed_data/shap_beeswarm_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.features) {
                throw new Error('Invalid data format');
            }
            
            // Filter for specific features
            const targetFeatures = ['Deaths', 'Gold Difference', 'Experience Difference', 'Dragons'];
            const features = data.features.filter(f => targetFeatures.includes(f.name));
            
            // Sort features by mean absolute SHAP value
            features.sort((a, b) => Math.abs(b.mean_shap) - Math.abs(a.mean_shap));
            
            // Adjust margins to center the visualization
            const margin = {top: 100, right: 200, bottom: 40, left: 200};
            const width = 1000 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;  // Increased height from 300 to 400
            
            // Clear any existing SVG
            d3.select("#beeswarm").selectAll("*").remove();
            
            const svg = d3.select("#beeswarm")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            
            // Add title and explanation
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -70)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("Impact of Key Features on Game Outcome");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("SHAP values (x-axis) show how each feature changes win probability from the baseline (0.0)");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -35)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("Example: A SHAP value of +0.1 means that feature increases win probability by 10 percentage points");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("Points are colored by feature value (red=low, blue=high) and spread vertically to show density");
            
            // Create scales
            const yScale = d3.scaleBand()
                .domain(features.map(d => d.name))
                .range([0, height])
                .padding(0.5);  // Increased padding between features from 0.4 to 0.5
            
            // Find min and max SHAP values across all features
            const minShap = d3.min(features, d => d3.min(d.shap_values));
            const maxShap = d3.max(features, d => d3.max(d.shap_values));
            const absMax = Math.max(Math.abs(minShap), Math.abs(maxShap));
            
            const xScale = d3.scaleLinear()
                .domain([-absMax, absMax])
                .range([0, width]);
            
            // Add Y axis with larger font
            svg.append("g")
                .call(d3.axisLeft(yScale))
                .selectAll("text")
                .style("font-size", "14px")
                .style("font-weight", "bold");
            
            // Add X axis
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("font-size", "12px");
            
            // Add X axis label
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text("SHAP Value (Impact on Win Probability)");
            
            // Create color scale for feature values
            const colorScale = d3.scaleSequential()
                .domain([-1, 1])
                .interpolator(d3.interpolateRdBu);
            
            // Create violin plots with enhanced styling
            features.forEach(feature => {
                const violinWidth = yScale.bandwidth();
                
                // Create path for violin shape
                const violinPath = d3.area()
                    .x0(d => xScale(d[0]) - d[1] * violinWidth)
                    .x1(d => xScale(d[0]) + d[1] * violinWidth)
                    .y(d => 0)
                    .curve(d3.curveCatmullRom);
                
                // Combine x and y coordinates for density
                const densityPoints = feature.density.x.map((x, i) => [x, feature.density.y[i]]);
                
                // Create violin shape
                const violinG = svg.append("g")
                    .attr("transform", `translate(0,${yScale(feature.name) + violinWidth / 2})`);
                
                // Add mirrored violin shape
                violinG.append("path")
                    .datum(densityPoints)
                    .attr("d", violinPath)
                    .style("fill", "rgba(200, 200, 200, 0.15)")
                    .style("stroke", "#000")
                    .style("stroke-width", 0.5);
                
                // Add individual points with force-based jittering
                const points = feature.shap_values.map((shap, i) => ({
                    shap: shap,
                    value: feature.feature_values[i],
                    y: 0
                }));
                
                // Create force simulation for point placement
                const simulation = d3.forceSimulation(points)
                    .force("y", d3.forceY(0).strength(0.15))  // Increased y-force for tighter vertical clustering
                    .force("x", d3.forceX(d => xScale(d.shap)).strength(0.3))  // Increased x-force for better separation
                    .force("collide", d3.forceCollide(1.2))  // Reduced collision radius for tighter packing
                    .stop();
                
                // Run the simulation
                for (let i = 0; i < 120; ++i) simulation.tick();  // Increased iterations for better distribution
                
                // Add points with enhanced styling
                violinG.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 1.5)
                    .style("fill", d => colorScale(d.value))
                    .style("opacity", feature.name === 'Dragons' ? 0.4 : 0.8)  // Half opacity for Dragons
                    .style("stroke", "none")
                    .append("title")
                    .text(d => `SHAP value: ${d.shap.toFixed(3)}\nFeature value: ${d.value.toFixed(3)}`);
                
                // Add hover area for violin plot explanation
                const explanationText = {
                    'Deaths': 'Higher death counts negatively impact win probability. Red points (high deaths) typically have negative SHAP values, showing they decrease win chances.',
                    'Gold Difference': 'Gold advantage is crucial for winning. Blue points (positive gold difference) generally have positive SHAP values, indicating increased win probability.',
                    'Experience Difference': 'XP advantage correlates with win probability. Blue points (XP advantage) typically show positive impact on winning.',
                    'Dragons': 'Dragon control influences game outcome. Blue points (more dragons) generally indicate positive contribution to winning.'
                };

                // Add invisible hover area
                violinG.append("rect")
                    .attr("x", xScale.range()[0])
                    .attr("y", -violinWidth)
                    .attr("width", xScale.range()[1] - xScale.range()[0])
                    .attr("height", violinWidth * 2)
                    .style("fill", "transparent")
                    .append("title")
                    .text(d => explanationText[feature.name]);
                
                // Add a line at x=0
                violinG.append("line")
                    .attr("x1", xScale(0))
                    .attr("x2", xScale(0))
                    .attr("y1", -violinWidth / 2)
                    .attr("y2", violinWidth / 2)
                    .style("stroke", "#000")
                    .style("stroke-width", 1)
                    .style("stroke-dasharray", "2,2");
            });
            
            // Add color legend with better positioning and styling
            const legendWidth = 20;
            const legendHeight = 150;
            
            const legendScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([legendHeight, 0]);
            
            const legend = svg.append("g")
                .attr("transform", `translate(${width + 40}, ${height/2 - legendHeight/2})`);
            
            // Create gradient with more color stops
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "colorGradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");
            
            // Add more color stops for smoother transition
            const stops = d3.range(-1, 1.01, 0.1);
            gradient.selectAll("stop")
                .data(stops)
                .enter()
                .append("stop")
                .attr("offset", (d, i) => `${(i / (stops.length - 1)) * 100}%`)
                .attr("stop-color", d => colorScale(d));
            
            // Add gradient rectangle
            legend.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#colorGradient)");
            
            // Add legend axis
            const legendAxis = d3.axisRight(legendScale)
                .ticks(5)
                .tickFormat(d => d.toFixed(1));
            
            legend.append("g")
                .attr("transform", `translate(${legendWidth},0)`)
                .call(legendAxis)
                .selectAll("text")
                .style("font-size", "12px");
            
            // Add legend title
            legend.append("text")
                .attr("x", -legendHeight/2)
                .attr("y", -30)
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Feature Value");
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
        });
}

// Call the render function when the page loads
window.onload = renderSHAPBeeswarm; 