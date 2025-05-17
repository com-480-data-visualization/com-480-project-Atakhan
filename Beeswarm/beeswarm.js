// Function to render the SHAP beeswarm plot
function renderSHAPBeeswarm() {
    console.log('Starting to render SHAP beeswarm plot...');
    
    fetch('http://localhost:8000/processed_data/shap_beeswarm_data.json')
        .then(response => {
            console.log('Data fetch response:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data loaded:', data);
            if (!data || !data.features) {
                throw new Error('Invalid data format');
            }
            
            const margin = {top: 40, right: 120, bottom: 40, left: 200};
            const width = 900 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;
            
            // Clear any existing SVG
            d3.select("#beeswarm").selectAll("*").remove();
            
            const svg = d3.select("#beeswarm")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            
            const features = data.features;
            
            // Create scales
            const yScale = d3.scaleBand()
                .domain(features.map(d => d.name))
                .range([0, height])
                .padding(0.2);
            
            // Find min and max SHAP values across all features
            const minShap = d3.min(features, d => d3.min(d.shap_values));
            const maxShap = d3.max(features, d => d3.max(d.shap_values));
            
            const xScale = d3.scaleLinear()
                .domain([minShap, maxShap])
                .range([0, width]);
            
            // Add Y axis
            svg.append("g")
                .call(d3.axisLeft(yScale))
                .selectAll("text")
                .style("font-size", "12px");
            
            // Add X axis
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("font-size", "12px");
            
            // Create color scale for feature values
            const colorScale = d3.scaleSequential(d3.interpolateRdBu)
                .domain([1, -1]);  // Reversed domain for RdBu
            
            // Create violin plots
            features.forEach(feature => {
                const violinWidth = yScale.bandwidth();
                
                // Create path for violin shape
                const violinPath = d3.area()
                    .x0(d => xScale(d[0]))
                    .x1(d => xScale(d[0]))
                    .y0(d => -d[1] * violinWidth / 2)
                    .y1(d => d[1] * violinWidth / 2)
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
                    .style("fill", "rgba(200, 200, 200, 0.3)")
                    .style("stroke", "#000")
                    .style("stroke-width", 1);
                
                // Add individual points with jittering
                const jitterWidth = violinWidth * 0.4;
                const points = feature.shap_values.map((shap, i) => ({
                    shap: shap,
                    value: feature.feature_values[i]
                }));
                
                violinG.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("cx", d => xScale(d.shap))
                    .attr("cy", d => (Math.random() - 0.5) * jitterWidth)
                    .attr("r", 2)
                    .style("fill", d => colorScale(d.value))
                    .style("opacity", 0.6);
                
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
            
            // Add title
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("SHAP Values Impact on Game Outcome");
            
            // Add X axis label
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text("SHAP Value");
            
            // Add color legend
            const legendWidth = 20;
            const legendHeight = 150;
            
            const legendScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([legendHeight, 0]);
            
            const legend = svg.append("g")
                .attr("transform", `translate(${width + 40}, ${height/2 - legendHeight/2})`);
            
            // Create gradient
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "colorGradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");
            
            gradient.selectAll("stop")
                .data(d3.range(-1, 1.1, 0.1))
                .enter()
                .append("stop")
                .attr("offset", (d, i) => `${i * 10}%`)
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
                .call(legendAxis);
            
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