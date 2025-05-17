// Function to render the SHAP beeswarm plot
function renderSHAPBeeswarm() {
    console.log('Starting to render SHAP beeswarm plot...');
    
    // Use the full GitHub Pages URL
    fetch('https://com-480-data-visualization.github.io/com-480-project-Atakhan/Beeswarm/processed_data/shap_beeswarm_data.json')
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
            
            // Adjust margins and dimensions for better fit
            const margin = {top: 100, right: 180, bottom: 80, left: 180};
            const width = 1000 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;  // Reduced height
            
            // Clear any existing SVG
            d3.select("#beeswarm").selectAll("*").remove();
            
            const svg = d3.select("#beeswarm")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Add title and explanation with enhanced styling
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -60)
                .attr("text-anchor", "middle")
                .attr("class", "visualization-title")
                .style("font-size", "28px")
                .style("font-weight", "600")
                .style("fill", "#0969da")  // GitHub blue
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("Impact of Key Features on Game Outcome");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#57606a")  // GitHub muted text
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("SHAP values (x-axis) show how each feature changes win probability from the baseline (0.0)");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("Example: A SHAP value of +0.1 means that feature increases win probability by 10 percentage points");
            
            // Create scales with improved padding
            const yScale = d3.scaleBand()
                .domain(features.map(d => d.name))
                .range([0, height])
                .padding(0.85);  // Reduced padding to make swarms thinner
            
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
                .style("font-size", "14px")
                .style("font-weight", "500")
                .style("fill", "#24292f")  // GitHub default text color
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif");
            
            // Add X axis with enhanced styling
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale)
                    .ticks(10)
                    .tickFormat(d => d.toFixed(2)))
                .selectAll("text")
                .style("font-size", "12px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif");
            
            // Add X axis label with improved styling
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 45)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("SHAP Value (Impact on Win Probability)");
            
            // Enhanced color scale with GitHub-like colors
            const colorScale = d3.scaleSequential()
                .domain([-1, 1])
                .interpolator(d3.interpolateRdBu);
            
            // Create violin plots with enhanced styling
            features.forEach((feature, index) => {
                const violinWidth = yScale.bandwidth() * 0.7;  // Reduced to 70% of band width
                
                const violinPath = d3.area()
                    .x0(d => xScale(d[0]) - d[1] * violinWidth)
                    .x1(d => xScale(d[0]) + d[1] * violinWidth)
                    .y(d => 0)
                    .curve(d3.curveCatmullRom);
                
                const densityPoints = feature.density.x.map((x, i) => [x, feature.density.y[i]]);
                
                const violinG = svg.append("g")
                    .attr("transform", `translate(0,${yScale(feature.name) + violinWidth / 2})`);
                
                // Add violin shape with improved styling
                violinG.append("path")
                    .datum(densityPoints)
                    .attr("d", violinPath)
                    .style("fill", "rgba(246, 248, 250, 0.6)")  // Light GitHub background color
                    .style("stroke", "#d0d7de")  // GitHub border color
                    .style("stroke-width", 1);
                
                const points = feature.shap_values.map((shap, i) => ({
                    shap: shap,
                    value: feature.feature_values[i],
                    y: 0
                }));
                
                // Improved force simulation with better separation
                const simulation = d3.forceSimulation(points)
                    .force("x", d3.forceX(d => xScale(d.shap)).strength(1))
                    .force("y", d3.forceY(0).strength(0.1))
                    .force("collide", d3.forceCollide(2).strength(0.7))
                    .stop();
                
                for (let i = 0; i < 150; ++i) simulation.tick();
                
                // Add points with enhanced styling
                violinG.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 2)
                    .style("fill", d => {
                        // Darken first three swarms
                        if (index < 3) {
                            const color = d3.color(colorScale(d.value));
                            color.opacity = 0.9;  // More opaque
                            return color.darker(0.5);  // Darker color
                        }
                        return colorScale(d.value);
                    })
                    .style("opacity", index < 3 ? 0.9 : 0.7)  // More opaque for first three
                    .style("stroke", "#d0d7de")
                    .style("stroke-width", 0.5)
                    .on("mouseover", function(event, d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 4)
                            .style("stroke-width", 1.5);
                        
                        // Enhanced tooltip with interpretation
                        const tooltip = d3.select("#beeswarm")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("position", "absolute")
                            .style("background", "white")
                            .style("color", "#24292f")
                            .style("padding", "12px")
                            .style("border-radius", "6px")
                            .style("font-size", "14px")
                            .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                            .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
                            .style("border", "1px solid #d0d7de")
                            .style("pointer-events", "none")
                            .style("z-index", "1000")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");

                        // Interpretive tooltip text based on feature
                        let interpretation = '';
                        if (feature.name === 'Deaths') {
                            interpretation = d.shap > 0 ? 
                                'High death count reduces win probability' :
                                'Low death count increases win probability';
                        } else if (feature.name === 'Gold Difference') {
                            interpretation = d.shap > 0 ? 
                                'Gold advantage increases win probability' :
                                'Gold disadvantage decreases win probability';
                        } else if (feature.name === 'Experience Difference') {
                            interpretation = d.shap > 0 ? 
                                'XP advantage increases win probability' :
                                'XP disadvantage decreases win probability';
                        } else if (feature.name === 'Dragons') {
                            interpretation = d.shap > 0 ? 
                                'More dragons secured increases win probability' :
                                'Fewer dragons secured decreases win probability';
                        }
                        
                        tooltip.html(`
                            <strong>${feature.name}</strong><br>
                            Impact: ${(d.shap * 100).toFixed(1)}% ${d.shap > 0 ? 'increase' : 'decrease'} in win probability<br>
                            ${interpretation}<br>
                            Feature value: ${d.value.toFixed(2)}
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
                
                // Add reference line with improved styling
                violinG.append("line")
                    .attr("x1", xScale(0))
                    .attr("x2", xScale(0))
                    .attr("y1", -violinWidth / 2)
                    .attr("y2", violinWidth / 2)
                    .style("stroke", "#d0d7de")
                    .style("stroke-width", 1)
                    .style("stroke-dasharray", "4,4");
            });

            // Add legend text for point colors
            svg.append("text")
                .attr("x", width + 10)
                .attr("y", 0)
                .style("font-size", "14px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("Points are colored by feature value");

            svg.append("text")
                .attr("x", width + 10)
                .attr("y", 20)
                .style("font-size", "14px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("(red=low, blue=high)");
        })
        .catch(err => console.error("SHAP beeswarm data load error:", err));
}

// Call the render function when the page loads
window.onload = renderSHAPBeeswarm; 