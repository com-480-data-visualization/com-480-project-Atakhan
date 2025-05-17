// Function to render the SHAP beeswarm plot
function renderSHAPBeeswarm() {
    console.log('Starting to render SHAP beeswarm plot...');
    
    fetch('../Beeswarm/processed_data/shap_beeswarm_data.json')
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
            const margin = {top: 120, right: 220, bottom: 60, left: 220};
            const width = 1200 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;
            
            // Clear any existing SVG
            d3.select("#beeswarm").selectAll("*").remove();
            
            const svg = d3.select("#beeswarm")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Add background for better contrast
            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "#1a1a1a")
                .attr("rx", 10)
                .attr("ry", 10);
            
            // Add title and explanation with enhanced styling
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -80)
                .attr("text-anchor", "middle")
                .style("font-size", "24px")
                .style("font-weight", "bold")
                .style("fill", "#4dd0e1")
                .text("Impact of Key Features on Game Outcome");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#e0e0e0")
                .text("SHAP values show how each feature changes win probability from the baseline (0.0)");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#e0e0e0")
                .text("Example: A SHAP value of +0.1 means that feature increases win probability by 10 percentage points");
            
            // Create scales with more padding
            const yScale = d3.scaleBand()
                .domain(features.map(d => d.name))
                .range([0, height])
                .padding(0.6);
            
            // Find min and max SHAP values across all features
            const minShap = d3.min(features, d => d3.min(d.shap_values));
            const maxShap = d3.max(features, d => d3.max(d.shap_values));
            const absMax = Math.max(Math.abs(minShap), Math.abs(maxShap));
            
            const xScale = d3.scaleLinear()
                .domain([-absMax, absMax])
                .range([0, width]);
            
            // Add Y axis with enhanced styling
            svg.append("g")
                .call(d3.axisLeft(yScale))
                .style("transform", "translateX(-10px)")
                .call(g => g.select(".domain").remove())
                .selectAll("text")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .style("fill", "#e0e0e0");
            
            // Add X axis with enhanced styling
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale)
                    .ticks(10)
                    .tickFormat(d => d.toFixed(2)))
                .selectAll("text")
                .style("font-size", "12px")
                .style("fill", "#e0e0e0");
            
            // Add X axis label
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 45)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#e0e0e0")
                .text("SHAP Value (Impact on Win Probability)");
            
            // Create enhanced color scale
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
                
                // Add mirrored violin shape with enhanced styling
                violinG.append("path")
                    .datum(densityPoints)
                    .attr("d", violinPath)
                    .style("fill", "rgba(255, 255, 255, 0.05)")
                    .style("stroke", "#666")
                    .style("stroke-width", 1);
                
                // Add individual points with enhanced styling
                const points = feature.shap_values.map((shap, i) => ({
                    shap: shap,
                    value: feature.feature_values[i],
                    y: 0
                }));
                
                // Create force simulation for better point distribution
                const simulation = d3.forceSimulation(points)
                    .force("y", d3.forceY(0).strength(0.1))
                    .force("x", d3.forceX(d => xScale(d.shap)).strength(0.2))
                    .force("collide", d3.forceCollide(2))
                    .stop();
                
                // Run the simulation
                for (let i = 0; i < 150; ++i) simulation.tick();
                
                // Add points with enhanced styling
                violinG.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 2)
                    .style("fill", d => colorScale(d.value))
                    .style("opacity", feature.name === 'Dragons' ? 0.6 : 0.85)
                    .style("stroke", "rgba(255, 255, 255, 0.2)")
                    .style("stroke-width", 0.5)
                    .on("mouseover", function(event, d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 4)
                            .style("stroke-width", 1);
                        
                        // Show tooltip
                        const tooltip = d3.select("#beeswarm")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("position", "absolute")
                            .style("background", "rgba(0, 0, 0, 0.8)")
                            .style("color", "#fff")
                            .style("padding", "8px")
                            .style("border-radius", "4px")
                            .style("font-size", "12px")
                            .style("pointer-events", "none")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                        
                        tooltip.html(`
                            SHAP value: ${d.shap.toFixed(3)}<br>
                            Feature value: ${d.value.toFixed(3)}
                        `);
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 2)
                            .style("stroke-width", 0.5);
                        
                        d3.selectAll(".tooltip").remove();
                    });
                
                // Add feature explanations
                const explanationText = {
                    'Deaths': 'Higher death counts negatively impact win probability. Red points (high deaths) typically show decreased win chances.',
                    'Gold Difference': 'Gold advantage is crucial for winning. Blue points (positive gold difference) indicate increased win probability.',
                    'Experience Difference': 'XP advantage correlates with win probability. Blue points (XP advantage) show positive impact on winning.',
                    'Dragons': 'Dragon control influences game outcome. Blue points (more dragons) contribute positively to winning.'
                };

                // Add hover area for explanations
                violinG.append("rect")
                    .attr("x", -margin.left)
                    .attr("y", -violinWidth)
                    .attr("width", margin.left - 10)
                    .attr("height", violinWidth * 2)
                    .style("fill", "transparent")
                    .on("mouseover", function(event) {
                        const tooltip = d3.select("#beeswarm")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("position", "absolute")
                            .style("background", "rgba(0, 0, 0, 0.9)")
                            .style("color", "#fff")
                            .style("padding", "12px")
                            .style("border-radius", "6px")
                            .style("font-size", "14px")
                            .style("max-width", "300px")
                            .style("pointer-events", "none")
                            .style("left", (event.pageX - 320) + "px")
                            .style("top", (event.pageY - 40) + "px");
                        
                        tooltip.html(explanationText[feature.name]);
                    })
                    .on("mouseout", function() {
                        d3.selectAll(".tooltip").remove();
                    });
                
                // Add reference line at x=0
                violinG.append("line")
                    .attr("x1", xScale(0))
                    .attr("x2", xScale(0))
                    .attr("y1", -violinWidth / 2)
                    .attr("y2", violinWidth / 2)
                    .style("stroke", "#666")
                    .style("stroke-width", 1)
                    .style("stroke-dasharray", "4,4");
            });
            
            // Add enhanced color legend
            const legendWidth = 30;
            const legendHeight = 180;
            
            const legendScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([legendHeight, 0]);
            
            const legend = svg.append("g")
                .attr("transform", `translate(${width + 60}, ${height/2 - legendHeight/2})`);
            
            // Create gradient
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "colorGradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");
            
            // Add more color stops for smoother transition
            const stops = d3.range(-1, 1.01, 0.05);
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
                .style("fill", "url(#colorGradient)")
                .style("stroke", "#666")
                .style("stroke-width", 1);
            
            // Add legend axis with enhanced styling
            const legendAxis = d3.axisRight(legendScale)
                .ticks(5)
                .tickFormat(d => d.toFixed(1));
            
            legend.append("g")
                .attr("transform", `translate(${legendWidth},0)`)
                .call(legendAxis)
                .selectAll("text")
                .style("font-size", "12px")
                .style("fill", "#e0e0e0");
            
            // Add legend title
            legend.append("text")
                .attr("x", -legendHeight/2)
                .attr("y", -40)
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#e0e0e0")
                .text("Feature Value");
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
        });
}

// Call the render function when the page loads
window.onload = renderSHAPBeeswarm; 