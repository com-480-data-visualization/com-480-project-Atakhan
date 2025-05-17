// Function to render the SHAP beeswarm plot
function renderSHAPBeeswarm() {
    console.log('Starting to render SHAP beeswarm plot...');
    
    // Determine if we're on GitHub Pages or localhost
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/com-480-project-Atakhan' : '';
    const dataPath = `${basePath}/Beeswarm/processed_data/shap_beeswarm_data.json`;
    
    console.log('Attempting to load data from:', dataPath);
    
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                console.error('Failed to load data:', response.status);
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
            const margin = {top: 100, right: 300, bottom: 80, left: 200};
            const width = 1400 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;
            
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
                .padding(0.4);  // Further reduced padding to make swarms wider
            
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
                .style("fill", "#ffffff")  // Make text white for better visibility
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .attr("dy", "0.32em")  // Adjust vertical alignment
                .attr("x", -15);  // Move text slightly away from axis
            
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
            
            // Enhanced color scale with more shades in outer ranges
            const colorScale = d3.scaleSequential()
                .domain([-0.5, 0.5])
                .interpolator(d => {
                    if (d < 0) {
                        // Red gradient with more variation in outer range
                        const t = (-d / 0.5);  // Normalize to [0,1]
                        if (t > 0.5) {  // For values between -1 and -0.5
                            return d3.interpolateRgb(
                                d3.rgb(255, 0, 0),   // Pure red
                                d3.rgb(220, 0, 0)    // Slightly darker red
                            )((t - 0.5) * 2);
                        } else {  // For values between -0.5 and 0
                            return d3.interpolateRgb(
                                d3.rgb(220, 0, 0),   // Slightly darker red
                                d3.rgb(180, 0, 0)    // Medium red
                            )(t * 2);
                        }
                    } else {
                        // Blue gradient with more variation in outer range
                        const t = (d / 0.5);  // Normalize to [0,1]
                        if (t > 0.5) {  // For values between 0.5 and 1
                            return d3.interpolateRgb(
                                d3.rgb(0, 0, 220),   // Slightly darker blue
                                d3.rgb(0, 0, 255)    // Pure blue
                            )((t - 0.5) * 2);
                        } else {  // For values between 0 and 0.5
                            return d3.interpolateRgb(
                                d3.rgb(0, 0, 180),   // Medium blue
                                d3.rgb(0, 0, 220)    // Slightly darker blue
                            )(t * 2);
                        }
                    }
                });
            
            // Create violin plots with enhanced styling
            features.forEach((feature, index) => {
                const violinWidth = yScale.bandwidth() * 1.2;
                
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
                    .style("fill", "rgba(246, 248, 250, 0.6)")
                    .style("stroke", "#d0d7de")
                    .style("stroke-width", 1);
                
                const points = feature.shap_values.map((shap, i) => ({
                    shap: shap,
                    value: (feature.feature_values[i] - 0.3),  // Keep the same offset
                    y: 0
                }));
                
                // Improved force simulation with better spread
                const simulation = d3.forceSimulation(points)
                    .force("x", d3.forceX(d => xScale(d.shap)).strength(2))
                    .force("y", d3.forceY(0).strength(0.1))
                    .force("collide", d3.forceCollide(1.8).strength(0.8))  // Slightly reduced collision radius, increased strength
                    .stop();
                
                for (let i = 0; i < 120; ++i) simulation.tick();
                
                // Add points with enhanced styling
                violinG.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 1.5)  // Slightly smaller points
                    .style("fill", d => colorScale(d.value))
                    .style("opacity", 0.75)
                    .on("mouseover", function(event, d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 5)
                            .style("stroke-width", 1);
                        
                        // Enhanced tooltip with comprehensive feature explanation
                        const tooltip = d3.select("#beeswarm")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("position", "absolute")
                            .style("background", "rgba(0, 0, 0, 0.9)")
                            .style("color", "#ffffff")
                            .style("padding", "15px")
                            .style("border-radius", "8px")
                            .style("font-size", "14px")
                            .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                            .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.4)")
                            .style("border", "1px solid rgba(255, 255, 255, 0.2)")
                            .style("pointer-events", "none")
                            .style("z-index", "1000")
                            .style("max-width", "400px")
                            .style("line-height", "1.5")
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", () => {
                                // If it's the Dragons feature (bottom row), position tooltip above the point
                                if (feature.name === 'Dragons') {
                                    return (event.pageY - 200) + "px"; // Move tooltip above the point
                                }
                                return (event.pageY - 15) + "px"; // Default positioning for other features
                            });

                        // Comprehensive feature explanations
                        const featureExplanations = {
                            'Gold Difference': {
                                title: "Gold Difference Impact",
                                overview: "Gold difference shows the economic gap between teams. Points are colored by the gold difference (red = deficit, blue = advantage).",
                                positive: "• Small gold differences (near center) have variable impact on win probability",
                                negative: "• Large gold deficits (dense red clusters on left) severely compromise winning chances",
                                interpretation: "Notice how beyond a certain gold deficit threshold, the impact becomes consistently negative, suggesting critical points where economic disadvantage becomes hard to overcome."
                            },
                            'Experience Difference': {
                                title: "Experience (XP) Difference Impact",
                                overview: "XP difference indicates level gaps between teams. Points are colored by XP state (red = behind, blue = ahead).",
                                positive: "• Minor XP differences show mixed influence on game outcome",
                                negative: "• Significant XP deficits (concentrated red points left) strongly indicate reduced win probability",
                                interpretation: "The data shows clear thresholds where XP disadvantages become critical barriers to victory, though small differences are less decisive."
                            },
                            'Deaths': {
                                title: "Deaths Impact on Win Probability",
                                overview: "Death count differences between teams, colored by death differential (red = more deaths, blue = fewer deaths).",
                                positive: "• Balanced death counts show varied impact on winning",
                                negative: "• High death deficits (dense red right) dramatically lower win chances",
                                interpretation: "Beyond certain death count thresholds, teams face severely diminished winning prospects, though occasional comebacks are possible."
                            },
                            'Dragons': {
                                title: "Dragon Control Impact (Pre-10 Minutes)",
                                overview: "Early dragon control status: only 0 or 1 dragon possible before 10 minutes (red = no dragon, blue = secured first dragon).",
                                positive: "• Securing the first dragon (blue) often correlates with increased win probability",
                                negative: "• Not securing the first dragon (red) can indicate reduced map control and objective priority",
                                interpretation: "The first dragon's impact is significant not just for its buffs, but as an indicator of early game control and team coordination."
                            }
                        };

                        const explanation = featureExplanations[feature.name];
                        
                        tooltip.html(`
                            <div style="margin-bottom: 12px;">
                                <strong style="font-size: 16px; color: #00b4ff;">${explanation.title}</strong>
                            </div>
                            <div style="margin-bottom: 10px;">
                                ${explanation.overview}
                            </div>
                            <div style="margin-bottom: 8px; color: #66b3ff;">
                                ${explanation.positive}
                            </div>
                            <div style="margin-bottom: 8px; color: #ff6666;">
                                ${explanation.negative}
                            </div>
                            <div style="margin-top: 12px; color: #999;">
                                ${explanation.interpretation}
                            </div>
                        `);
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 1.5)  // Match base size
                            .style("stroke-width", 0);
                        
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

            // Add color bar legend with adjusted positioning
            const legendWidth = 30;
            const legendHeight = height * 0.8;
            const legendX = width + 80;
            const legendY = height * 0.1;

            // Create gradient
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "colorGradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");

            // Update the color bar gradient
            gradient.selectAll("stop").remove();
            
            // Add color stops with more variation in outer ranges
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d3.rgb(255, 0, 0));  // Pure red

            gradient.append("stop")
                .attr("offset", "25%")
                .attr("stop-color", d3.rgb(220, 0, 0));  // Slightly darker red

            gradient.append("stop")
                .attr("offset", "45%")
                .attr("stop-color", d3.rgb(180, 0, 0));  // Medium red

            gradient.append("stop")
                .attr("offset", "55%")
                .attr("stop-color", d3.rgb(0, 0, 180));  // Medium blue

            gradient.append("stop")
                .attr("offset", "75%")
                .attr("stop-color", d3.rgb(0, 0, 220));  // Slightly darker blue

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d3.rgb(0, 0, 255));  // Pure blue

            // Add color bar rectangle
            svg.append("rect")
                .attr("x", legendX)
                .attr("y", legendY)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#colorGradient)")
                .style("stroke", "#d0d7de")
                .style("stroke-width", 1);

            // Add color bar axis
            const legendScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([legendHeight + legendY, legendY]);

            const legendAxis = d3.axisRight(legendScale)
                .ticks(5)
                .tickFormat(d => d.toFixed(1));

            svg.append("g")
                .attr("transform", `translate(${legendX + legendWidth}, 0)`)
                .call(legendAxis)
                .selectAll("text")
                .style("font-size", "12px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif");

            // Update legend title position
            svg.append("text")
                .attr("x", legendX + legendWidth / 2)
                .attr("y", legendY - 15)  // Adjusted position
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("Feature Value");

            // Update legend text position
            svg.append("text")
                .attr("x", legendX + legendWidth / 2)
                .attr("y", legendY + legendHeight + 35)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#57606a")
                .style("font-family", "'Segoe UI', system-ui, -apple-system, sans-serif")
                .text("Low → High");

            // Remove the old legend text
            d3.selectAll("text").filter(function() {
                return this.textContent === "Points are colored by feature value" || 
                       this.textContent === "(red=low, blue=high)";
            }).remove();
        })
        .catch(err => console.error('Failed to load data:', err));
}

// Call the render function when the page loads
window.onload = renderSHAPBeeswarm; 